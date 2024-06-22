require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const instaCommand = require('./commands/insta');
const schedule = require('node-schedule');
const { updateProfiles, serveProfilePages } = require('./utils/profile_manager');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const fs = require('fs').promises;
const path = require('path');
const profilePagesDir = 'profile_pages'; 

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
    // Create the directory if it doesn't exist
    try {
      await fs.access(profilePagesDir);
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.mkdir(profilePagesDir);
      } else {
        console.error('Error creating profile_pages directory:', err); 
      }
    }
  // Schedule daily updates at 7 AM PST
  schedule.scheduleJob('0 7 * * *', 'America/Los_Angeles', updateProfiles);
  // Start the HTTP server
  serveProfilePages();
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'insta') {
    await instaCommand.execute(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);
