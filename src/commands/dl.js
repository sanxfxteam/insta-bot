const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../instabotconfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dl')
    .setDescription('Download a video from a URL')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL of the video to download')
        .setRequired(true)),

  async execute(interaction) {
    const url = interaction.options.getString('url');
    await interaction.deferReply();

    const outputDir = config.outputVideoDir;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'video_%(title)s.%(ext)s');
    const command = `yt-dlp -o "${outputPath}" "${url}"`;
    console.log(`Executing command: ${command}`);

    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        await interaction.editReply(`An error occurred while downloading: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }

      const files = fs.readdirSync(outputDir);
      const downloadedFile = files
        .map(file => ({ name: file, ctime: fs.statSync(path.join(outputDir, file)).ctime }))
        .sort((a, b) => b.ctime - a.ctime)[0]?.name;
      if (downloadedFile) {
        const filePath = path.join(outputDir, downloadedFile);
        const stats = fs.statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);
        console.log(`Downloaded video: ${filePath} (${fileSizeInMB}MB)`);

        if (fileSizeInMB <= 25) {
          await interaction.editReply({ content: 'Here\'s your downloaded video:', files: [filePath] });
        } else {
          await interaction.editReply(`The downloaded video is larger than 25MB and cannot be sent on Discord. See video here: ${process.env.VIDEO_URL}`);
        }
      } else {
        await interaction.editReply('No video was downloaded. The file might be larger than 25MB or there was an issue with the download.');
      }
    });
  },
};