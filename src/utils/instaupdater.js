// utils/instaUpdater.js
const fs = require('fs').promises;
const path = require('path');
const { downloadInstagramProfile } = require('./instaloader');
const config = require('../instabotconfig');

async function updateProfile(profile, sendUpdate) {
  let totalImagesSent = 0;

  const onImagesReady = async (imagePaths) => {
    await sendUpdate(`New images for ${profile}:`, imagePaths);
    totalImagesSent += imagePaths.length;
  };

  try {
    const imagesDetected = await downloadInstagramProfile(profile, onImagesReady);
    const profileUrl = `${config.profileUrlPrefix}${profile}`;
    if (imagesDetected > 0) {
      await sendUpdate(`Updated ${profile}: ${imagesDetected} new images detected, ${totalImagesSent} images sent.\nView full profile: ${profileUrl}`);
    }
    return { success: true, profile, imagesDetected, totalImagesSent };
  } catch (error) {
    console.error(`Error updating ${profile}:`, error);
    await sendUpdate(`Error updating ${profile}: ${error.message}`);
    return { success: false, profile, error: error.message };
  }
}

async function updateProfiles(sendUpdate) {
  try {
    const directories = await fs.readdir(config.outputDir, { withFileTypes: true });
    const profiles = directories
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    if (profiles.length === 0) {
      await sendUpdate('No profiles found in the output directory.');
      return;
    }

    await sendUpdate(`Updating ${profiles.length} profiles: ${profiles.join(', ')}`);

    // const results = await Promise.all(profiles.map(profile => updateProfile(profile, sendUpdate)));
    profiles.forEach(async (profile) => {
      await updateProfile(profile, sendUpdate);
    });

    await sendUpdate('Finished updating all profiles.');
    return results;
  } catch (error) {
    console.error('Error in updateProfiles:', error);
    await sendUpdate(`An error occurred while processing the request: ${error.message}`);
    throw error;
  }
}

module.exports = {
  updateProfiles,
};
