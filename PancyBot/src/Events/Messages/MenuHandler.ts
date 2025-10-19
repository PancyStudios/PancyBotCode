import {Event} from "../../Structure/Events";
import {BaseInteraction, Collection, DiscordAPIError, DiscordErrorData, GuildMember, Interaction} from "discord.js";

// --- CLASE PARA MANEJAR LA COLA CON RATE LIMITS ---
class RateLimitQueue {
    private queue: (() => Promise<any>)[] = [];
    private isRunning = false;
    private interaction: BaseInteraction;
    private rateLimitWarningSent = false;

    constructor(interaction: BaseInteraction) {
        this.interaction = interaction;
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Añade una tarea a la cola
    add(task: () => Promise<any>) {
        this.queue.push(task);
        if (!this.isRunning) {
            this.process();
        }
    }

    // Procesa las tareas de la cola una por una
    private async process() {
        this.isRunning = true;
        while (this.queue.length > 0) {
            const task = this.queue[0];
            try {
                await task(); // Ejecuta la tarea
                this.queue.shift(); // Elimina la tarea completada de la cola
                await this.sleep(200); // Pausa proactiva para no saturar la API
            } catch (error) {
                if (error instanceof DiscordAPIError && error.status === 429) {
                    const retryAfter = ((error.rawError as DiscordErrorData).errors[0]?.retryAfter ?? 5) * 1000;
                    console.warn(`[RateLimitQueue] Límite de velocidad alcanzado. Pausando por ${retryAfter / 1000}s.`);

                    if (!this.rateLimitWarningSent && this.interaction.isRepliable()) {
                        console.warn('[RateLimitQueue] El rate limit fue alcanzado, esperando un momento.');
                    }
                    await this.sleep(retryAfter);
                    // No eliminamos la tarea, para que se reintente en la siguiente iteración del bucle
                } else {
                    console.error('[RateLimitQueue] Error en una tarea, saltando:', error);
                    this.queue.shift(); // Saltamos la tarea que falló por una razón diferente al rate limit
                }
            }
        }
        this.isRunning = false;
    }
}


export default new Event("interactionCreate", async (interaction: Interaction) => {
    // --- MANEJO DE MENÚ DE ASIGNACIÓN CON COLA DE TAREAS ---
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId.startsWith('role_assign_menu_')) {
            await interaction.update({ content: '⚙️ Recibiendo solicitud...', embeds: [], components: [] });

            const [_, __, type, targetId, executorId] = interaction.customId.split('_');
            const executor = await interaction.guild.members.fetch(executorId);

            let targetMembers: Collection<string, GuildMember>;
            try {
                if (type === 'self') targetMembers = new Collection([[executorId, executor]]);
                else if (type === 'user') targetMembers = new Collection([[targetId, await interaction.guild.members.fetch(targetId)]]);
                else if (type === 'role') {
                    const role = await interaction.guild.roles.fetch(targetId);
                    if (!role) throw new Error("Rol objetivo no encontrado.");
                    if (role.id === interaction.guild.id) {
                        await interaction.guild.members.fetch();
                        targetMembers = interaction.guild.members.cache;
                    } else {
                        targetMembers = role.members;
                    }
                } else throw new Error("Tipo de objetivo no reconocido.");
            } catch (error) {
                console.error(error);
                return interaction.editReply({ content: '❌ No se pudo encontrar el objetivo (usuario o rol).' });
            }

            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            const assignableRoles = interaction.guild.roles.cache.filter(r =>
                r.name !== '@everyone' && !r.managed &&
                r.position < botMember.roles.highest.position && r.position < executor.roles.highest.position
            );

            const rolesToModify = interaction.values.includes('__ALL__')
                ? assignableRoles
                : assignableRoles.filter(r => interaction.values.includes(r.id));

            if (rolesToModify.size === 0 || targetMembers.size === 0) {
                return interaction.editReply({ content: '❌ No hay roles válidos para asignar o no se encontraron miembros en el objetivo.' });
            }

            const queue = new RateLimitQueue(interaction);
            let membersProcessed = 0;

            await interaction.editReply(`⚙️ **Preparando ${targetMembers.size} tareas...**\n*Progreso: 0 / ${targetMembers.size}*`);

            // Llenamos la cola con todas las tareas
            for (const [memberId, member] of targetMembers) {
                if (member.id === interaction.guild.ownerId || (member.roles.highest.position >= executor.roles.highest.position && member.id !== executor.id)) {
                    membersProcessed++;
                    continue;
                }

                const task = async () => {
                    const rolesToAdd = rolesToModify.filter(r => !member.roles.cache.has(r.id));
                    const rolesToRemove = rolesToModify.filter(r => member.roles.cache.has(r.id));

                    if (rolesToAdd.size > 0) await member.roles.add(rolesToAdd, `Acción masiva por ${executor.user.tag}`);
                    if (rolesToRemove.size > 0) await member.roles.remove(rolesToRemove, `Acción masiva por ${executor.user.tag}`);

                    membersProcessed++;
                    // Actualiza el progreso cada 10 miembros o en el último miembro
                    if (membersProcessed % 10 === 0 || membersProcessed === targetMembers.size) {
                        await interaction.editReply(`⚙️ **Procesando...**\n*Progreso: ${membersProcessed} / ${targetMembers.size}*`);
                    }
                };
                queue.add(task);
            }

            // Una vez que todas las tareas se hayan añadido, esperamos a que la cola termine.
            // Para esto, podemos revisar periódicamente si la cola está vacía.
            const checkQueueInterval = setInterval(async () => {
                // @ts-ignore - Accediendo a propiedad privada para la comprobación final
                if (!queue.isRunning) {
                    clearInterval(checkQueueInterval);
                    await interaction.editReply(`✅ **Proceso completado**\n*Miembros procesados: ${membersProcessed} / ${targetMembers.size}*`);
                }
            }, 1000); // Revisa cada segundo si la cola ha terminado.
        }
    }
});