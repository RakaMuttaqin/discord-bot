const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Clear messages from the channel")
    .addIntegerOption(option => 
      option.setName("amount")
        .setDescription("Number of messages to delete")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100) // Membatasi hingga 1000 pesan yang bisa dihapus
    )
    .addUserOption(option => 
      option.setName("user")
        .setDescription("Filter messages by user")
        .setRequired(false)
    )
    .addBooleanOption(option => 
      option.setName("embeds")
        .setDescription("Delete only embedded messages")
        .setRequired(false)
    )
    .addBooleanOption(option => 
      option.setName("bots")
        .setDescription("Delete only messages from bots")
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    const user = interaction.options.getUser("user");
    const isEmbedOnly = interaction.options.getBoolean("embeds");
    const isBotOnly = interaction.options.getBoolean("bots");

    // Memastikan bot memiliki izin untuk menghapus pesan
    if (!interaction.guild.members.me.permissions.has("MANAGE_MESSAGES")) {
      return interaction.reply({
        content: "I need the 'Manage Messages' permission to clear messages.",
        ephemeral: true
      });
    }

    // Mendapatkan pesan yang akan dihapus
    try {
      const messages = await interaction.channel.messages.fetch({ limit: amount });
      let filteredMessages = messages;

      // Filter pesan berdasarkan user
      if (user) {
        filteredMessages = filteredMessages.filter(msg => msg.author.id === user.id);
      }

      // Filter pesan berdasarkan tipe embed
      if (isEmbedOnly) {
        filteredMessages = filteredMessages.filter(msg => msg.embeds.length > 0);
      }

      // Filter pesan dari bot
      if (isBotOnly) {
        filteredMessages = filteredMessages.filter(msg => msg.author.bot);
      }

      // Menghapus pesan setelah disaring
      await interaction.channel.bulkDelete(filteredMessages, true);
      
      return interaction.reply({
        content: `${filteredMessages.size} messages have been cleared.`,
        ephemeral: true
      });

    } catch (error) {
      console.error(error);
      return interaction.reply({
        content: "There was an error trying to clear messages.",
        ephemeral: true
      });
    }
  },
};
