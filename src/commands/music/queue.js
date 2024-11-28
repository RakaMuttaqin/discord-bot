const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const queue = new Map(); // Key: guildId, Value: { songs: [], player, connection, volume }

module.exports = {
  // Queue management functions
  getQueue(guildId) {
    return queue.get(guildId);
  },
  setQueue(guildId, queueData) {
    queue.set(guildId, queueData);
  },
  deleteQueue(guildId) {
    queue.delete(guildId);
  },
  hasQueue(guildId) {
    return queue.has(guildId);
  },
  updateQueue(guildId, key, value) {
    if (queue.has(guildId)) {
      const currentQueue = queue.get(guildId);
      currentQueue[key] = value;
      queue.set(guildId, currentQueue);
    }
  },

  // Slash command for viewing the queue
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Menampilkan daftar antrean musik saat ini."),

  // Execute function for the 'queue' slash command
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const serverQueue = this.getQueue(guildId); // Get the queue for the current guild

    if (!serverQueue || serverQueue.songs.length === 0) {
      return interaction.reply("❌ Tidak ada lagu dalam antrean.");
    }

    // Membuat daftar lagu yang ada dalam antrean
    const queueList = serverQueue.songs
      .map(
        (song, index) =>
          `${index + 1}. **${song.title}** (diminta oleh ${song.requestedBy})`
      )
      .join("\n");

    // Membuat embed untuk menampilkan antrean
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("🎶 Daftar Antrean Musik")
      .setDescription(queueList) // Tampilkan daftar lagu yang ada dalam antrean
      .setFooter({
        text: `Total: ${serverQueue.songs.length} lagu | Volume: ${
          Math.round(serverQueue.volume * 100) || 100
        }%`,
      });

    return interaction.reply({ embeds: [embed] });
  },
};
