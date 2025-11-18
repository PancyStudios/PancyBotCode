import {Command} from "../../../../Structure/CommandSlash";
import {ApplicationCommandOptionType, Collection, EmbedBuilder, Message, TextChannel} from "discord.js";
import moment from "moment/moment";

// Función auxiliar para introducir una pausa
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default new Command({
    name: `clear`,
    description: 'Elimina mensajes en un canal (funciona con mensajes de cualquier antigüedad)',
    category: 'mod',
    userPermissions: ['ManageMessages'],
    botPermissions: ['ManageMessages', 'EmbedLinks'],
    options: [
        {
            name: 'cantidad',
            description: 'Cantidad de mensajes a eliminar (hasta 99999)',
            type: ApplicationCommandOptionType.Number,
            required: true
        }
    ],

    run: async ({ interaction, args }) => {
        const cantidadDeseada = args.getNumber('cantidad', true);
        const canal = interaction.channel as TextChannel;
        let eliminadosTotal = 0;

        // 1. Validaciones iniciales
        if (cantidadDeseada <= 0 || cantidadDeseada > 99999) {
            return interaction.reply({
                content: '🛑 Por favor, ingresa una cantidad entre 1 y 99999.',

            });
        }

        // Manda una respuesta para evitar que la interacción expire
        await interaction.deferReply({ flags: ['Ephemeral'] });

        // 2. Proceso de eliminación
        try {
            const ms = Date.now()
            let lastId: string | undefined;

            while (eliminadosTotal < cantidadDeseada) {
                // Cantidad a intentar eliminar en esta iteración
                const limit = Math.min(cantidadDeseada - eliminadosTotal, 100);

                // Obtener los mensajes del canal
                const fetchedMessages: Collection<string, Message> = await canal.messages.fetch({
                    limit: limit,
                    before: lastId 
                });

                if (fetchedMessages.size === 0) {
                    break;
                }

                lastId = fetchedMessages.last()?.id;

                const ahora = Date.now();
                const CATORCE_DIAS = 1000 * 60 * 60 * 24 * 14;

                const mensajesNuevos = fetchedMessages.filter(m => ahora - m.createdTimestamp < CATORCE_DIAS);
                const mensajesAntiguos = fetchedMessages.filter(m => ahora - m.createdTimestamp >= CATORCE_DIAS);

                // A) Eliminar mensajes NUEVOS (bulkDelete - rápido)
                if (mensajesNuevos.size > 0) {
                    const eliminadosBulk = await canal.bulkDelete(mensajesNuevos, true);
                    eliminadosTotal += eliminadosBulk.size;
                }

                // B) Eliminar mensajes ANTIGUOS (uno por uno - lento)
                for (const mensaje of mensajesAntiguos.values()) {
                    await mensaje.delete().catch(console.error); // Usar catch para manejar errores (p. ej., si el mensaje ya fue borrado)
                    eliminadosTotal++;

                    // Pausa para evitar Rate Limits al borrar muchos mensajes antiguos (ajusta si es necesario)
                    await sleep(100);

                    if (eliminadosTotal >= cantidadDeseada) break; // Detener si ya alcanzamos la meta
                }

                if (eliminadosTotal >= cantidadDeseada) break;
            }

            const duration = moment.duration(Date.now() - ms).format("h [horas], m [minutos] y s [segundos]");
            const embed = new EmbedBuilder()
                .setTitle('')



            await interaction.editReply({
                content: `✅ Se eliminaron **${eliminadosTotal}** mensajes (incluidos mensajes antiguos) del canal.`
            });

        } catch (error) {
            console.error('Error al intentar eliminar mensajes:', error);
            await interaction.editReply({
                content: `❌ Ocurrió un error al intentar eliminar los mensajes. Se eliminaron ${eliminadosTotal} mensajes antes del fallo.`
            });
        }
    }
})