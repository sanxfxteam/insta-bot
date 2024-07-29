require('dotenv');

module.exports = {
  // Other configuration options can be added here
  maxImages: 10, // Maximum number of images to download
  outputDir: process.env.OUTPUT_DIR, // Base directory for storing downloaded images
  outputVideoDir: process.env.OUTPUT_VIDEO_DIR, // Base directory for storing downloaded videos
  // ... other config options
  profileUrlPrefix: process.env.PROFILE_URL_PREFIX || 'http://www.instagram.com/', // Or your actual domain/IP
};
