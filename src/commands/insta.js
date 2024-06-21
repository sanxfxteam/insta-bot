const { SlashCommandBuilder } = require('@discordjs/builders');
const { downloadInstagramProfile } = require('../utils/instaloader');

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
      const images = await downloadInstagramProfile(profile);
      
      if (images.length === 0) {
        await interaction.editReply('No images found for this profile.');
        return;
      }
      
      await interaction.editReply(`Downloading ${images.length} images from ${profile}'s profile...`);
      
      for (const image of images) {
        await interaction.channel.send({ files: [image] });
      }
      
      await interaction.followUp(`Finished posting ${images.length} images from ${profile}'s profile.`);
    } catch (error) {
      console.error(error);
      await interaction.editReply('An error occurred while processing the request.');
    }
  },
};