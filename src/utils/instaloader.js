const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function downloadInstagramProfile(profile) {
  const outputDir = `/tmp/${profile}`;
  
  return new Promise((resolve, reject) => {
    exec(`instaloader --no-videos --no-metadata-json ${profile} -D ${outputDir}`, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Instaloader error: ${error}`);
        reject(error);
        return;
      }
      
      try {
        const files = await fs.readdir(outputDir);
        const images = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
        const imagePaths = images.map(image => path.join(outputDir, image));
        
        resolve(imagePaths);
      } catch (err) {
        console.error(`Error reading directory: ${err}`);
        reject(err);
      }
    });
  });
}

module.exports = {
  downloadInstagramProfile,
};