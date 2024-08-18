import { Command } from "../../../../Structure/CommandSlash";
import { database } from "../../../..";
import { 
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ActionRowBuilder,
    ComponentType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    resolveColor,
    ColorResolvable,
} from "discord.js";
import { EmbedDb } from "../../../../Database/Type/Embeds";

export default new Command({
    name: "create",
    description: "Crea un embed",
    category: 'embeds',
    userPermissions: ['ManageMessages'],
    
    run: async ({ interaction, client }) => {
        const statusDb = database.getStatusDB()
        if(statusDb.isOnline) {
            const { guild, member } = interaction
            const { embeds } = database

            let tempData: EmbedDb = {
                userId: member.id,
                guildId: guild.id,
                name: undefined,
                embed: {},
                isPublic: false,
                isGlobal: false,
            }

            const firstEmbed = new EmbedBuilder()
            .setTitle(`${guild.name} | Embeds`)
            .setDescription(`A continuacion se te pedira que ingreses los datos del embed, si deseas cancelar la creacion del embed selecciona la opcion cancelar (No se guardara ningun dato)\n
                # Embed Data
                > Nombre: ${tempData.name ?? 'No definido'} [Obligatorio]
                > Titulo: ${tempData.embed?.title ?? 'No definido'} [Opcional*]
                > Author Name: ${tempData.embed?.author?.name ?? 'No definido'} [Opcional*]
                > Author Icon: ${tempData.embed?.author?.icon_url ?? 'No definido'} [Opcional]
                > Descripcion: ${tempData.embed?.description ?? 'No definido'} [Opcional*]
                > Color: ${tempData.embed?.color ?? 'No definido'} [Opcional]
                > Footer Text: ${tempData.embed?.footer?.text ?? 'No definido'} [Opcional*]
                > Footer Icon: ${tempData.embed?.footer?.icon_url ?? 'No definido'} [Opcional]
                > Imagen: ${tempData.embed?.image?.url ?? 'No definido'} [Opcional*]
                > Thumbnail: ${tempData.embed?.thumbnail?.url ?? 'No definido'} [Opcional*]
                 
                \`\`\`\n* Almenos se debe definir uno de estos campos\`\`\``)
            .setColor('Blurple')
            .setTimestamp()
            .setFooter({ text: member.displayName ?? member.user.tag, iconURL: client.user.displayAvatarURL() })

            await interaction.reply({ embeds: [firstEmbed], ephemeral: true })

            const MenuSelectFirst = new StringSelectMenuBuilder()
            .setCustomId('select_embed')
            .setPlaceholder('Selecciona una opcion')
            .setMaxValues(1)
            .setOptions(
                [
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Nombre')
                    .setValue('name')
                    .setDescription('Edita el nombre del embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Titulo')
                    .setValue('title')
                    .setDescription('Edita el titulo del embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Author Name')
                    .setValue('author_name')
                    .setDescription('Edita el nombre del autor del embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Author Icon')
                    .setValue('author_icon')
                    .setDescription('Edita el icono del autor del embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Descripcion')
                    .setValue('description')
                    .setDescription('Edita la descripcion del embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Color')
                    .setValue('color')
                    .setDescription('Edita el color del embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Footer Text')
                    .setValue('footer_text')
                    .setDescription('Edita el texto del footer del embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Footer Icon')
                    .setValue('footer_icon')
                    .setDescription('Edita el icono del footer del embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Imagen')
                    .setValue('image')
                    .setDescription('Edita la imagen del embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Thumbnail')
                    .setValue('thumbnail')
                    .setDescription('Edita el thumbnail del embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Establecer embed publico')
                    .setValue('public')
                    .setDescription('El embed puede ser manejable por cualquier usuario con ManageMessages'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Establecer embed global')
                    .setValue('global')
                    .setDescription('El embed sera disponible para todos los servidores (Solo tu)'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Previsualizar')
                    .setValue('preview')
                    .setDescription('Previsualiza el embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Cancelar')
                    .setValue('cancel')
                    .setDescription('Cancela la creacion del embed'),
                    new StringSelectMenuOptionBuilder()
                    .setLabel('Crear')
                    .setValue('save')
                    .setDescription('Crear el nuevo embed'),
                ]
            )

            let firstWhile = true
            do { 
                const firstEmbed = new EmbedBuilder()
                .setTitle(`${guild.name} | Embeds`)
                .setDescription(`A continuacion se te pedira que ingreses los datos del embed, si deseas cancelar la creacion del embed selecciona la opcion cancelar (No se guardara ningun dato)\n
                    # Embed Data
                    > Nombre: ${tempData.name ?? 'No definido'} [Obligatorio']
                    > Titulo: ${tempData.embed?.title ?? 'No definido'} [Opcional*']
                    > Author Name: ${tempData.embed?.author?.name ?? 'No definido'} [Opcional*']
                    > Author Icon: ${tempData.embed?.author?.icon_url ?? 'No definido'} [Opcional']
                    > Descripcion: ${tempData.embed?.description ?? 'No definido'} [Opcional*']
                    > Color: ${tempData.embed?.color ?? 'No definido'} [Opcional]
                    > Footer Text: ${tempData.embed?.footer?.text ?? 'No definido'} [Opcional*']
                    > Footer Icon: ${tempData.embed?.footer?.icon_url ?? 'No definido'} [Opcional']
                    > Imagen: ${tempData.embed?.image?.url ?? 'No definido'} [Opcional*']
                    > Thumbnail: ${tempData.embed?.thumbnail?.url ?? 'No definido'} [Opcional*']

                    > ⌚ | Tiempo restante para responder: <t:${Math.floor(Date.now() / 1000) + 120}:R>
                    
                    \`\`\`\n* Almenos se debe definir uno de estos campos\n' En caso de precionar cancelar en el formulario favor de esperar 2 minutos a que acabe el tiempo de espera (8 mins en caso de la descripcion)\`\`\``)
                .setColor('Blurple')
                .setTimestamp()
                .setFooter({ text: member.displayName ?? member.user.tag, iconURL: client.user.displayAvatarURL() })
                const reply1 = await interaction.editReply({ embeds: [firstEmbed], components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(MenuSelectFirst)] })
                const menuReply1 = await reply1.awaitMessageComponent({ componentType: ComponentType.StringSelect, time: 120_000, })
                if(!menuReply1) {
                    await interaction.editReply({ embeds: [
                        new EmbedBuilder()
                        .setTitle(`${guild.name} | Embeds`)
                        .setDescription(`El tiempo de espera fue excedido, la creacion del embed fue cancelada\n\nSe enviara un mensaje privado con los datos del embed, en caso de que desees continuar la creacion del embed\n\n\`\`\`Importante: Si tienes el MD desactivado la informacion sera eliminada en su totalidad sin posibilidad de recuperacion\`\`\``)
                        .setColor(`Orange`)
                    ], components: [] })
                    
                    await member.send({ embeds: [
                        new EmbedBuilder()
                        .setTitle(`Embeds | ${guild.name}`)
                        .setDescription(`La creacion del embed fue cancelada por exceder el tiempo de espera
                            
                            A continuacion se te mostrara los datos del embed que se iba a crear
                            \`\`\`json\n${JSON.stringify(tempData, null, 2)}\`\`\``)
                        .setColor('Red')
                    ] }).catch(() => {})
                    firstWhile = false
                    return;
                }

                const menuReplyValue = menuReply1.values[0]
                switch (menuReplyValue) {
                    case 'name': 
                        const nameModalField = new TextInputBuilder()
                        .setCustomId('name')
                        .setPlaceholder('Nombre del embed')
                        .setMinLength(3)
                        .setMaxLength(50)
                        .setRequired(true)
                        .setLabel('Nombre del embed')
                        .setStyle(TextInputStyle.Short)

                        const nameModal = new ModalBuilder()
                        .setTitle(`Embeds | ${guild.name}`)
                        .setCustomId('name_modal' + member.id)
                        .setComponents([new ActionRowBuilder<TextInputBuilder>().setComponents(nameModalField)])
                        
                        await menuReply1.showModal(nameModal)
                        const modalName = await menuReply1.awaitModalSubmit({ time: 120_000, filter: (x) => x.customId === `name_modal${member.id}` }).catch(() => {})
                        if(!modalName) return;
                        tempData.name = modalName.fields.getField('name').value
                        await modalName.deferUpdate()
                        break;
                    case 'title':
                        const titleModalField = new TextInputBuilder()
                        .setCustomId('title')
                        .setPlaceholder('Titulo del embed')
                        .setMinLength(3)
                        .setMaxLength(50)
                        .setRequired(true)
                        .setLabel('Titulo del embed')
                        .setStyle(TextInputStyle.Short)

                        const titleModal = new ModalBuilder()
                        .setTitle(`Embeds | ${guild.name}`)
                        .setCustomId('name_modal' + member.id)
                        .setComponents([new ActionRowBuilder<TextInputBuilder>().setComponents(titleModalField)])
                        
                        await menuReply1.showModal(titleModal)
                        const modalTitle = await menuReply1.awaitModalSubmit({ time: 120_000, filter: (x) => x.customId === `name_modal${member.id}` }).catch(() => {})
                        if(!modalTitle) return;
                        tempData.name = modalTitle.fields.getField('title').value
                        await modalTitle.deferUpdate()
                        break;
                    case 'author_name':
                        const authorNameModalField = new TextInputBuilder()
                        .setCustomId('author_name')
                        .setPlaceholder('Nombre del autor del embed')
                        .setMinLength(3)
                        .setMaxLength(50)
                        .setRequired(true)
                        .setLabel('Nombre del autor del embed')
                        .setStyle(TextInputStyle.Short)

                        const authorNameModal = new ModalBuilder()
                        .setTitle(`Embeds | ${guild.name}`)
                        .setCustomId('name_modal' + member.id)
                        .setComponents([new ActionRowBuilder<TextInputBuilder>().setComponents(authorNameModalField)])

                        await menuReply1.showModal(authorNameModal)
                        const modalAuthorName = await menuReply1.awaitModalSubmit({ time: 120_000, filter: (x) => x.customId === `name_modal${member.id}` }).catch(() => {})
                        if(!modalAuthorName) return;

                        if(tempData.embed.author) {
                            tempData.embed.author.name = modalAuthorName.fields.getField('author_name').value
                        } else {
                            tempData.embed.author = {
                                icon_url: null,
                                name: modalAuthorName.fields.getField('author_name').value
                            }
                        }
                        await modalAuthorName.deferUpdate()
                        break;
                    case 'author_icon':
                        const authorIconModalField = new TextInputBuilder()
                        .setCustomId('author_icon')
                        .setPlaceholder('Icono del autor del embed')
                        .setMinLength(10)
                        //En todos los que sean URL no se debe de poner un maximo de caracteres
                        .setRequired(true)
                        .setLabel('Icono del autor del embed')
                        .setStyle(TextInputStyle.Short)

                        const authorIconModal = new ModalBuilder()
                        .setTitle(`Embeds | ${guild.name}`)
                        .setCustomId('name_modal' + member.id)
                        .setComponents([new ActionRowBuilder<TextInputBuilder>().setComponents(authorIconModalField)])

                        await menuReply1.showModal(authorIconModal)
                        const modalAuthorIcon = await menuReply1.awaitModalSubmit({ time: 120_000, filter: (x) => x.customId === `name_modal${member.id}` }).catch(() => {})
                        if(!modalAuthorIcon) return;

                        if(tempData.embed.author) {
                            tempData.embed.author.icon_url = modalAuthorIcon.fields.getField('author_icon').value
                        } else {
                            tempData.embed.author = {
                                name: null,
                                icon_url: modalAuthorIcon.fields.getField('author_icon').value
                            }
                        }
                        break;
                    case 'description':
                        const descriptionModalField = new TextInputBuilder()
                        .setCustomId('description')
                        .setPlaceholder('Descripcion del embed')
                        .setMinLength(10)
                        .setMaxLength(3500)
                        .setRequired(true)
                        .setLabel('Descripcion del embed')
                        .setStyle(TextInputStyle.Paragraph)

                        const descriptionModal = new ModalBuilder()
                        .setTitle(`Embeds | ${guild.name}`)
                        .setCustomId('name_modal' + member.id)
                        .setComponents([new ActionRowBuilder<TextInputBuilder>().setComponents(descriptionModalField)])

                        await menuReply1.showModal(descriptionModal)
                        const modalDescription = await menuReply1.awaitModalSubmit({ time: 480_000, filter: (x) => x.customId === `name_modal${member.id}` }).catch(() => {})
                        if(!modalDescription) return;

                        tempData.embed.description = modalDescription.fields.getField('description').value
                        await modalDescription.deferUpdate()
                        break;  
                    case 'color':
                        await menuReply1.deferUpdate()
                        const colorSelect = new StringSelectMenuBuilder()
                        .setCustomId('color')
                        .setPlaceholder('Selecciona un color')
                        .setMaxValues(1)
                        .addOptions([
                            new StringSelectMenuOptionBuilder()
                            .setLabel('HexColor')
                            .setValue('Hexcode')
                            .setDescription('Selecciona un color por medio de un hexcode'),
                            new StringSelectMenuOptionBuilder()
                            .setLabel('Rojo')
                            .setValue('Red')
                            .setDescription('Selecciona el color rojo')
                            .setEmoji('🔴'),
                            new StringSelectMenuOptionBuilder()
                            .setLabel('Azul')
                            .setValue('Blue')
                            .setDescription('Selecciona el color azul')
                            .setEmoji('🔵'),
                            new StringSelectMenuOptionBuilder()
                            .setLabel('Verde')
                            .setValue('Green')
                            .setDescription('Selecciona el color verde')
                            .setEmoji('🟢'),
                            new StringSelectMenuOptionBuilder()
                            .setLabel('Amarillo')
                            .setValue('Yellow')
                            .setDescription('Selecciona el color amarillo')
                            .setEmoji('🟡'),
                            new StringSelectMenuOptionBuilder()
                            .setLabel('Morado')
                            .setValue('Purple')
                            .setDescription('Selecciona el color morado')
                            .setEmoji('🟣'),
                            new StringSelectMenuOptionBuilder()
                            .setLabel('Rosa')
                            .setValue('LuminousVividPink')
                            .setDescription('Selecciona el color rosa')
                            .setEmoji('💖'),
                            new StringSelectMenuOptionBuilder()
                            .setLabel('Naranja')
                            .setValue('Orange')
                            .setDescription('Selecciona el color naranja')
                            .setEmoji('🟠'),
                            new StringSelectMenuOptionBuilder()
                            .setLabel('Blanco')
                            .setValue('White')
                            .setDescription('Selecciona el color blanco')
                            .setEmoji('⚪'),
                        ])

                        const colorEmbed = new EmbedBuilder()
                        .setTitle(`Embeds | ${guild.name}`)
                        .setDescription(`Selecciona un color para el embed`)
                        .setColor('Blurple')
                        .setTimestamp()
                        .setFooter({ text: member.displayName ?? member.user.tag, iconURL: client.user.displayAvatarURL() })

                        const colorActionRow = new ActionRowBuilder<StringSelectMenuBuilder>()

                        const reply2 = await interaction.editReply({ embeds: [colorEmbed], components: [colorActionRow.addComponents(colorSelect)] })
                        const menuReply2 = await reply2.awaitMessageComponent({ componentType: ComponentType.StringSelect, time: 120_000, })
                        if(!menuReply2) return;

                        const colorValue = menuReply2.values[0]
                        if(colorValue === 'Hexcode') {
                            const colorModalField = new TextInputBuilder()
                            .setCustomId('color_hex')
                            .setPlaceholder('Hexcode del color')
                            .setMinLength(6)
                            .setMaxLength(7)
                            .setRequired(true)
                            .setLabel('Hexcode del color')
                            .setStyle(TextInputStyle.Short)

                            const colorModal = new ModalBuilder()
                            .setTitle(`Embeds | ${guild.name}`)
                            .setCustomId('name_modal' + member.id)
                            .setComponents([new ActionRowBuilder<TextInputBuilder>().setComponents(colorModalField)])

                            await menuReply2.showModal(colorModal)
                            const modalColor = await menuReply2.awaitModalSubmit({ time: 120_000, filter: (x) => x.customId === `name_modal${member.id}` }).catch(() => {})
                            if(!modalColor) return;
                            let noError: boolean = true
                            let color: ColorResolvable | number
                            const isHex = /^#[0-9A-F]{6}$/i.test(modalColor.fields.getField('color_hex').value)
                            if(isHex) {
                                color = modalColor.fields.getField('color_hex').value as ColorResolvable
                                try {   
                                    color = resolveColor(color)
                                } catch {
                                    noError = false
                                }
                            } else {
                                noError = false
                            }
                            if(!noError) return modalColor.reply({ content: `El hexcode ingresado no es valido, intenta de nuevo`, ephemeral: true })
                            
                            tempData.embed.color = color as number 
                            await modalColor.deferUpdate()
                        } else {
                            const color = resolveColor(colorValue as ColorResolvable)
                            tempData.embed.color = color
                        }
                        break;
                    case 'footer_text':
                                
                        break;
                    case 'footer_icon':

                        break;
                    case 'image':
                            
                        break;
                    case 'thumbnail':

                        break;
                    case 'public':

                        break;
                    case 'global':

                        break;
                    case 'preview':

                        break;
                    case 'cancel':

                        break;
                    case 'save':

                        break;
                }
            } while (firstWhile)
        } else {
            await interaction.reply({ content: `En este momento la base de datos no se encuentra activa, intenta de nuevo mas tarde`, ephemeral: true })
        }
    }
})