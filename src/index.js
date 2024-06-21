require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const instaCommand = require('./commands/insta');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'insta') {
    await instaCommand.execute(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
