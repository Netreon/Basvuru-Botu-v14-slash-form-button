const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require(`discord.js`);

const falseembed = new EmbedBuilder()
.setColor(0xFF0000)
.setDescription('Aşağıdan, istediğiniz başvuru yapabilirsiniz!')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('basvurpanel')
		.setDescription(`Panel oluşturur.`)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(client, interaction) {
        const add = new ButtonBuilder()
        .setCustomId('basvurIntereaction')
        .setLabel('Başvur')
        .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder()
            .addComponents(add);

        await interaction.reply({
            embeds: [falseembed],
            components: [row],
        });
	},
};