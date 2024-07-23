// commands/instupdate.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { updateProfiles } = require('../utils/instaupdater');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('instupdate')
    .setDescription('Update all Instagram profiles in the output directory'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const sendUpdate = async (content, files = []) => {
        if (files.length > 0) {
          await interaction.followUp({ content, files: files.map(file => ({ attachment: file })) });
        } else {
          await interaction.followUp(content);
        }
      };

      await updateProfiles(sendUpdate);
    } catch (error) {
      console.error('Error in instupdate command:', error);
      await interaction.editReply(`An error occurred while processing the request: ${error.message}`);
    }
  },
};