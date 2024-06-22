const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const config = require('../instabotconfig');

async function downloadInstagramProfile(profile) {
  const outputDir = path.join(config.outputDir, profile);
  
  return new Promise((resolve, reject) => {
    const command = `instaloader --no-videos --count=${config.maxImages} ${profile} --dirname-pattern ${outputDir}`;
    
    console.log(`Executing command: ${command}`);

    const instaloader = exec(command);

    instaloader.stdout.on('data', (data) => {
      console.log(`Instaloader stdout: ${data}`);
    });

    instaloader.stderr.on('data', (data) => {
      console.error(`Instaloader stderr: ${data}`);
    });

    instaloader.on('close', async (code) => {
      console.log(`Instaloader process exited with code ${code}`);

      if (code !== 0) {
        reject(new Error(`Instaloader process exited with code ${code}`));
        return;
      }

      try {
        const files = await fs.readdir(outputDir);
        const images = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
        
        // Sort images by creation time (most recent first)
        const sortedImages = await Promise.all(images.map(async (image) => {
          const stats = await fs.stat(path.join(outputDir, image));
          return { name: image, time: stats.mtime.getTime() };
        }));
        sortedImages.sort((a, b) => b.time - a.time);
        
        const imagePaths = sortedImages.map(image => path.join(outputDir, image.name));
        
        resolve({ imagePaths });
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