const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Create a custom embed")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Set the title of the embed")
        .setRequired(true)
    ) // Tambahkan input untuk title
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Set the description of the embed")
        .setRequired(true)
    ) // Tambahkan input untuk description
    .addStringOption((option) =>
      option
        .setName("image")
        .setDescription("Set an image URL for the embed")
        .setRequired(false)
    ) // Opsi input untuk image
    .addStringOption((option) =>
      option
        .setName("thumbnail")
        .setDescription("Set a thumbnail URL for the embed")
        .setRequired(false)
    ) // Opsi input untuk thumbnail
    .addStringOption((option) =>
      option
        .setName("color")
        .setDescription("Set the color of the embed in hexadecimal (e.g., #ff0000)")
        .setRequired(false)
    ) // Opsi input untuk color
    .addStringOption((option) =>
      option
        .setName("footer")
        .setDescription("Set the footer text of the embed")
        .setRequired(false)
    ) // Opsi input untuk footer
    .addStringOption((option) =>
      option
        .setName("author")
        .setDescription("Set the author text of the embed")
        .setRequired(false)
    ), // Opsi input untuk author
  async execute(interaction, client) {
    // Ambil input dari user
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const imageUrl = interaction.options.getString("image");
    const thumbnailUrl = interaction.options.getString("thumbnail");
    const color = interaction.options.getString("color") || "#18e1ee"; // Default color
    const footerText = interaction.options.getString("footer");
    const authorText = interaction.options.getString("author");

    // Buat Embed
    const embed = new EmbedBuilder()
      .setTitle(title) // Judul embed
      .setDescription(description) // Deskripsi embed
      .setColor(color) // Warna embed, jika tidak ada, default
      .setTimestamp(Date.now()) // Menambahkan timestamp
      .setAuthor({
        name: authorText || interaction.user.tag, // Penulis, default ke nama pengguna jika tidak ada input
        iconURL: interaction.user.displayAvatarURL(), // Foto profil pengguna
      })
      .setFooter({
        text: footerText || client.user.tag, // Footer, default ke nama bot jika tidak ada input
      });

    // Menambahkan gambar dan thumbnail jika diberikan
    if (imageUrl) embed.setImage(imageUrl);
    if (thumbnailUrl) embed.setThumbnail(thumbnailUrl);

    await interaction.reply({
      embeds: [embed], // Mengirim embed ke Discord
    });
  },
};
