const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite me to your server"),
  async execute(interaction, client) {
    // Tunda balasan untuk memberikan waktu
    const message = await interaction.deferReply({
      fetchReply: true,
    });

    // Membuat link undangan bot
    const inviteLink = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot+applications.commands`;

    // Membuat embed dengan informasi undangan
    const inviteEmbed = new EmbedBuilder()
      .setTitle("Invite Me to Your Server!")
      .setDescription("Click the link below to invite the bot to your Discord server.")
      .setColor("#00FF00") // Warna hijau
      .setTimestamp()
      .setFooter({
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setURL(inviteLink);

    // Mengirim balasan dengan embed dan link undangan
    await interaction.editReply({
      content: `Here is the invite link for the bot:`,
      embeds: [inviteEmbed],
    });
  },
};
