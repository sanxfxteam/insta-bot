const { SlashCommandBuilder } = require('@discordjs/builders');
const { downloadInstagramProfile } = require('../utils/instaloader');
const fs = require('fs').promises;
const path = require('path');
const config = require('../instabotconfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('instupdate')
    .setDescription('Update all Instagram profiles in the output directory'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const directories = await fs.readdir(config.outputDir, { withFileTypes: true });
      const profiles = directories
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      if (profiles.length === 0) {
        await interaction.editReply('No profiles found in the output directory.');
        return;
      }

      await interaction.editReply(`Updating ${profiles.length} profiles: ${profiles.join(', ')}`);

      for (const profile of profiles) {
        let totalImagesSent = 0;

        const onImagesReady = async (imagePaths) => {
          const files = imagePaths.map(image => ({ attachment: image }));
          await interaction.followUp({ content: `New images for ${profile}:`, files });
          totalImagesSent += imagePaths.length;
        };

        try {
          const imagesDetected = await downloadInstagramProfile(profile, onImagesReady);
          const profileUrl = `${config.profileUrlPrefix}${profile}`;
          if (imagesDetected > 0)
            await interaction.followUp(`Updated ${profile}: ${imagesDetected} new images detected, ${totalImagesSent} images sent.\nView full profile: ${profileUrl}`);
        } catch (error) {
          console.error(`Error updating ${profile}:`, error);
          await interaction.followUp(`Error updating ${profile}: ${error.message}`);
        }
      }

      await interaction.followUp('Finished updating all profiles.');
    } catch (error) {
      console.error('Error in instupdate command:', error);
      await interaction.editReply(`An error occurred while processing the request: ${error.message}`);
    }
  },
};