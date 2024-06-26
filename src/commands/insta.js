const { SlashCommandBuilder } = require('@discordjs/builders');
const { downloadInstagramProfile } = require('../utils/instaloader');
const { generateProfilePage } = require('../utils/profile_manager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('insta')
    .setDescription('Download and post Instagram profile images')
    .addStringOption(option =>
      option.setName('profile')
        .setDescription('Instagram profile name')
        .setRequired(true)),

  async execute(interaction) {
    const profile = interaction.options.getString('profile');

    await interaction.deferReply();

    try {
      const { imagePaths, output } = await downloadInstagramProfile(profile);

      if (imagePaths.length === 0) {
        await interaction.editReply('No images found for this profile.');
        return;
      }

      await interaction.editReply(`Downloading ${imagePaths.length} images from ${profile}'s profile...`);

      const batchSize = 4;
      const maxImages = 16;
      const imagesToPost = imagePaths.slice(0, maxImages);

      for (let i = 0; i < imagesToPost.length; i += batchSize) {
        const batch = imagesToPost.slice(i, i + batchSize);
        const files = batch.map(image => ({ attachment: image }));
        await interaction.followUp({ files });
      }

      // Save profile data
      await generateProfilePage(profile, imagePaths);
      await saveProfileData(profile, imagePaths);

      const profilePageUrl = `http://${config.serverHost}:${config.serverPort}/${profile}`; // Use your actual host and port
      await interaction.followUp(`Finished posting ${imagePaths.length} images from ${profile}'s profile.\n\nView the full gallery at: ${profilePageUrl}`);
    } catch (error) {
      console.error(error);
      await interaction.editReply(`An error occurred while processing the request: ${error.message}`);
    }
  },
};

const fs = require('fs').promises;
const path = require('path');
const config = require('../instabotconfig');

async function saveProfileData(profile, imagePaths) {
  const profileDataFile = path.join(__dirname, '..', 'profile_data.json');

  try {
    let profileData = {};
    try {
      profileData = JSON.parse(await fs.readFile(profileDataFile, 'utf-8'));
    } catch (err) {
      // If the file doesn't exist, create an empty object
      if (err.code === 'ENOENT') {
        profileData = {};
      } else {
        throw err; 
      }
    }
    
    profileData[profile] = {
      imagePaths,
      lastDownloadTime: new Date().toISOString(),
    };
    
    await fs.writeFile(profileDataFile, JSON.stringify(profileData, null, 2));
  } catch (saveError) {
    console.error('Error saving profile data:', saveError);
    // You might want to handle this error more gracefully in a production setting.
  }
}
