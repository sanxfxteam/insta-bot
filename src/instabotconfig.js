require('dotenv');

module.exports = {
  // Other configuration options can be added here
  maxImages: 10, // Maximum number of images to download
  // ... other config options
  profileUrlPrefix: process.env.PROFILE_URL_PREFIX || 'http://www.instagram.com/', // Or your actual domain/IP
};
