const { SlashCommandBuilder } = require('@discordjs/builders');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../instabotconfig');
const { uploadToGoogleDrive } = require('../utils/googledrive');
const { hyperlink, hideLinkEmbed, Embed } = require('discord.js');

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  isValidUrl,
  
  data: new SlashCommandBuilder()
    .setName('dl')
    .setDescription('Download a video from a URL')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('URL of the video to download')
        .setRequired(true)),

  async execute(interaction) {
    const url = interaction.options.getString('url');
    
    if (!isValidUrl(url)) {
      await interaction.reply({ content: 'Please provide a valid URL', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const outputDir = process.env.OUTPUT_VIDEO_DIR;
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'video_%(title)s.%(ext)s');
    const command = `pipx run yt-dlp -o "${outputPath}" "${url}"`;
    console.log(`Executing command: ${command}`);

    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        await interaction.editReply(`An error occurred. yt-dlp is unable to download the video. Please make sure this is a valid video URL ` 
          + `from one of the ${hyperlink("supported sites", hideLinkEmbed("https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md"))}`);
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
        
        // Extract video title from filename (remove extension)
        const videoTitle = downloadedFile
          .replace(/\.[^/.]+$/, "")  // remove file extension
          .replace("video_", "")     // remove "video_" prefix
          .replace(/&amp;/g, '&')    // decode common HTML entities
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#039;/g, "'")
          .replace(/<[^>]*>/g, '')   // remove any HTML tags
          .replace(/[&<>'"]/g, '');  // remove any remaining special characters
        // Use original URL for the post link
        const postUrl = url;
        
        console.log(`Downloaded video: ${filePath} (${fileSizeInMB}MB)`);

        try {
          if (fileSizeInMB <= 25) {
            await interaction.editReply({ content: `${videoTitle} ([link](${postUrl}))`, files: [filePath] });
            const driveLink = await uploadToGoogleDrive(filePath);
          } else {
            const driveLink = await uploadToGoogleDrive(filePath);
            await interaction.editReply(`The downloaded video is larger than 25MB and cannot be posted on Discord. See video here: ${driveLink}`);
          }
        } catch (error) {
          console.error('Error uploading to Google Drive:', error);
          await interaction.editReply('Error uploading to Google Drive: ' + error.message);
        }
      } else {
        await interaction.editReply('No video was downloaded.');
      }
    });
  },
};