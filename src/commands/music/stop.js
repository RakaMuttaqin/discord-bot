const { SlashCommandBuilder } = require("discord.js");
const { getQueue, deleteQueue } = require("./queue");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Hentikan musik dan kosongkan antrian."),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const serverQueue = getQueue(guildId);

    if (!serverQueue) {
      return interaction.reply("❌ Tidak ada musik yang sedang diputar.");
    }

    // Stop the player and destroy the connection
    serverQueue.player.stop(); // Stop playing the current song
    deleteQueue(guildId); // Delete the queue for the guild

    return interaction.reply(
      "🛑 Musik dihentikan dan antrian telah dikosongkan."
    );
  },
};
