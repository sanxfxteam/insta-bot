const { SlashCommandBuilder } = require('@discordjs/builders');
const { downloadInstagramProfile } = require('../utils/instaloader');
const config = require('../instabotconfig');

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
      let totalImagesSent = 0;

      const onImagesReady = async (imagePaths) => {
        console.log(`Sending ${imagePaths.length} images...`);
        const files = imagePaths.map(image => ({ attachment: image }));
        await interaction.followUp({ files });
        totalImagesSent += imagePaths.length;
      };

      await interaction.editReply(`Downloading images from ${profile}'s profile...`);

      await downloadInstagramProfile(profile, onImagesReady);

      const profilePageUrl = config.profileUrlPrefix + profile;
      await interaction.followUp(`Finished posting ${totalImagesSent} images from ${profile}'s profile.\nView the full gallery at: ${profilePageUrl}`);
    } catch (error) {
      console.error(error);
      await interaction.editReply(`An error occurred while processing the request: ${error.message}`);
    }
  },
};