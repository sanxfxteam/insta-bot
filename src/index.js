// index.js
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const instaCommand = require('./commands/insta');
const instUpdateCommand = require('./commands/instupdate');
const dlCommand = require('./commands/dl');
const { updateProfiles } = require('./utils/instaUpdater');
const schedule = require('node-schedule');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

async function updateDownloadedProfiles() {
  const updateChannel = client.channels.cache.get(process.env.UPDATE_CHANNEL_ID);
  if (!updateChannel) {
    console.error('Update channel not found');
    return;
  }

  const sendUpdate = async (content, files = []) => {
    if (files.length > 0) {
      await updateChannel.send({ content, files: files.map(file => ({ attachment: file })) });
    } else {
      await updateChannel.send(content);
    }
  };

  try {
    await updateProfiles(sendUpdate);
    console.log('Profile updates completed successfully');
  } catch (error) {
    console.error('Error during profile updates:', error);
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  // Schedule daily updates at 7 AM PST
  schedule.scheduleJob('0 7 * * *', 'America/Los_Angeles', updateDownloadedProfiles);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'insta') {
    await instaCommand.execute(interaction);
  } else if (interaction.commandName === 'instupdate') {
    await instUpdateCommand.execute(interaction);
  } else if (interaction.commandName === 'dl') {
    await dlCommand.execute(interaction);
  }
});

client.login(process.env.DISCORD_TOKEN);