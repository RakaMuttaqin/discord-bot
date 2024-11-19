const {
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("menu")
    .setDescription("Return my menu."),
  async execute(interaction, client) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId(`sub-menu`)
      .setMinValues(1)
      .setMaxValues(1)
      .setOptions(
        new StringSelectMenuOptionBuilder({
          label: `Option #1`,
          value: `https://youtube.com/alwaysraka`,
        })
        // new StringSelectMenuOptionBuilder({
        //   label: `Option #2`,
        //   value: `option 2`,
        // })
      );

    await interaction.reply({
      components: [new ActionRowBuilder().addComponents(menu)],
    });
  },
};
