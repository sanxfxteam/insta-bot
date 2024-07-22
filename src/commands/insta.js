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

      const profilePageUrl = config.profileUrlPrefix + profile;
      await interaction.followUp(`Finished posting ${imagePaths.length} images from ${profile}'s profile.\nView the full gallery at: ${profilePageUrl}`);
    } catch (error) {
      console.error(error);
      await interaction.editReply(`An error occurred while processing the request: ${error.message}`);
    }
  },
};
