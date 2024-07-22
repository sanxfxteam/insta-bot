require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const instaCommand = require('./commands/insta');
const { updateDownloadedProfiles } = require('./utils/instaloader');
const schedule = require('node-schedule');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  // Schedule daily updates at 7 AM PST
  schedule.scheduleJob('0 7 * * *', 'America/Los_Angeles', async () => {
    try {
      await updateDownloadedProfiles();
      console.log('Profile updates completed successfully');
    } catch (error) {
      console.error('Error during profile updates:', error);
    }
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'insta') {
    await instaCommand.execute(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
