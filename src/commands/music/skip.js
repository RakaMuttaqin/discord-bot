const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getQueue, setQueue } = require("./queue"); // Import queue functions
const { playMusic } = require("./play"); // Import playMusic function

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription(
      "Skip lagu yang sedang diputar dan lanjutkan ke lagu berikutnya."
    ),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const serverQueue = getQueue(guildId); // Get the queue for the current guild

    if (!serverQueue || serverQueue.songs.length === 0) {
      return interaction.reply("❌ Tidak ada lagu yang sedang diputar.");
    }

    // Stop the current song and play the next one
    const currentSong = serverQueue.songs[0];
    serverQueue.player.stop(); // Stops the current song
    serverQueue.songs.shift(); // Remove the current song from the queue

    // If there are more songs in the queue, play the next one
    if (serverQueue.songs.length > 0) {
      playMusic(guildId); // Call playMusic to play the next song
    } else {
      // If no more songs, clean up and disconnect
      // serverQueue.connection.destroy();
      setQueue(guildId, null);
    }

    // Create an embed to notify that the song has been skipped
    const embed = new EmbedBuilder()
      .setTitle("⏭️ Lagu Dilewati")
      .setDescription(
        `**${currentSong.title}** telah dilewati.\nLagu berikutnya sedang diputar!`
      )
      .setColor("#18e1ee")
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
