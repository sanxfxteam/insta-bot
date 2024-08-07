const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('insta')
    .setDescription('Download and post Instagram profile images')
    .addStringOption(option =>
      option.setName('profile')
        .setDescription('Instagram profile name')
        .setRequired(true)),
  new SlashCommandBuilder()
    .setName('instupdate')
    .setDescription('Update all Instagram profiles already downloaded'),
  new SlashCommandBuilder()
    .setName('dl')
    .setDescription('Download a video from a URL')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL of the video to download')
        .setRequired(true)),
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
