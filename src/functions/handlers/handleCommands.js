const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandFolders = fs.readdirSync("src/commands");
    for (const folder of commandFolders) {
      const commandFiles = fs
        .readdirSync(`src/commands/${folder}`)
        .filter((file) => file.endsWith(".js"));

      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
      }
    }

    const clientId = process.env.CLIENT_ID;
    const guildId = process.env.GUILD_ID;
    const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN);
    try {
      console.log("Started refreshing application (/) commmands.");

      await rest.put(Routes.applicationCommands(clientId, guildId), {
        body: client.commandArray,
      });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  };
};
