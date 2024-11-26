const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
  NoSubscriberBehavior,
} = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");
const axios = require("axios");
const { getQueue, setQueue, hasQueue } = require("./queue"); // Import queue functions
const API_KEY = process.env.YOUTUBE_API_KEY;

async function searchYouTube(query) {
  const url = `https://www.googleapis.com/youtube/v3/search`;
  const params = {
    part: "snippet",
    q: query,
    type: "video",
    maxResults: 1,
    key: API_KEY,
  };

  try {
    const response = await axios.get(url, { params });
    const video = response.data.items[0];
    return video ? `https://www.youtube.com/watch?v=${video.id.videoId}` : null;
  } catch (error) {
    console.error("❌ Error searching YouTube:", error.message);
    throw new Error("❌ Tidak dapat mencari lagu di YouTube.");
  }
}

async function fetchStreamWithRetry(url, retries = 3) {
  while (retries > 0) {
    try {
      return ytdl(url, {
        filter: "audioonly",
        highWaterMark: 1 << 25,
        quality: "highestaudio",
      });
    } catch (error) {
      console.warn(`⚠️ Error fetching stream (attempt ${4 - retries}):`, error.message);
      retries--;
      if (retries === 0) {
        throw new Error("❌ Tidak dapat memuat stream dari YouTube.");
      }
    }
  }
}

async function playMusic(guildId) {
  const serverQueue = getQueue(guildId);
  if (!serverQueue || serverQueue.songs.length === 0) {
    setQueue(guildId, null);
    return;
  }

  const currentSong = serverQueue.songs[0];
  console.log(`🎶 Memutar: ${currentSong.title}`);

  try {
    const stream = await fetchStreamWithRetry(currentSong.url);
    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });
    serverQueue.player.play(resource);

    serverQueue.player.once(AudioPlayerStatus.Idle, () => {
      serverQueue.songs.shift(); // Hapus lagu pertama
      playMusic(guildId); // Putar lagu berikutnya
    });

    serverQueue.player.once("error", (error) => {
      console.error("❌ Error pada player:", error.message);
      serverQueue.songs.shift(); // Skip lagu saat error
      playMusic(guildId);
    });
  } catch (error) {
    console.error("❌ Error memutar lagu:", error.message);
    serverQueue.songs.shift(); // Skip lagu saat error
    playMusic(guildId);
  }
}

module.exports = {
  playMusic,
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Putar musik dari judul atau URL YouTube.")
    .addStringOption((option) =>
      option
        .setName("song")
        .setDescription("Judul lagu atau URL")
        .setRequired(true)
    ),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply("❌ Kamu harus berada di voice channel!");
    }

    const songInput = interaction.options.getString("song");
    let url;

    try {
      await interaction.deferReply();

      if (ytdl.validateURL(songInput)) {
        url = songInput;
      } else {
        await interaction.editReply(`🔎 Mencari lagu: "${songInput}"...`);
        url = await searchYouTube(songInput);
        if (!url) {
          return interaction.editReply("❌ Lagu tidak ditemukan.");
        }
      }

      const videoInfo = await ytdl.getInfo(url);
      const songData = {
        title: videoInfo.videoDetails.title,
        url: url,
        requestedBy: interaction.user.username,
      };

      if (!hasQueue(guildId)) {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer({
          behaviors: { noSubscriber: NoSubscriberBehavior.Pause },
        });

        setQueue(guildId, {
          connection,
          player,
          songs: [songData],
        });

        connection.subscribe(player);
        playMusic(guildId);

        const embed = new EmbedBuilder()
          .setTitle("🎶 Memutar sekarang")
          .setDescription(
            `**${songData.title}**\n(Diminta oleh ${songData.requestedBy})`
          )
          .setColor("#18e1ee")
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } else {
        const serverQueue = getQueue(guildId);
        serverQueue.songs.push(songData);

        const embed = new EmbedBuilder()
          .setTitle("🎶 Ditambahkan ke antrian")
          .setDescription(
            `**${songData.title}**\n(Posisi: ${serverQueue.songs.length})`
          )
          .setColor("#18e1ee")
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      return interaction.editReply(
        "❌ Terjadi kesalahan saat mencoba memutar musik."
      );
    }
  },
};
