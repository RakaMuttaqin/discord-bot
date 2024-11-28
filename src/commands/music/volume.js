const { SlashCommandBuilder } = require("discord.js");
const { getQueue, updateQueue } = require("./queue");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Mengatur volume musik.")
    .addNumberOption((option) =>
      option
        .setName("level")
        .setDescription("Tingkat volume (1-100).")
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply(); // Menunggu agar bisa memperbarui balasan nanti

    const guildId = interaction.guild.id;
    const serverQueue = getQueue(guildId);

    if (!serverQueue) {
      return interaction.editReply("❌ Tidak ada musik yang sedang diputar.");
    }

    const volumeLevel = interaction.options.getNumber("level");

    if (volumeLevel < 1 || volumeLevel > 100) {
      return interaction.editReply(
        "❌ Volume harus berada dalam rentang 1-100."
      );
    }

    // Update volume di queue dan resource audio
    serverQueue.volume = volumeLevel / 100;
    if (serverQueue.player.state.resource.volume) {
      serverQueue.player.state.resource.volume.setVolume(serverQueue.volume);
    }
    updateQueue(guildId, "volume", serverQueue.volume);

    return interaction.editReply(
      `🔊 Volume berhasil diatur ke ${volumeLevel}%`
    );
  },
};
