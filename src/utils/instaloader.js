const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function downloadInstagramProfile(profile) {
  const outputDir = `/tmp/${profile}`;
  
  return new Promise((resolve, reject) => {
    const instaloader = exec(`instaloader --no-videos --no-metadata-json ${profile} --dirname-pattern ${outputDir}`);

    let output = '';

    instaloader.stdout.on('data', (data) => {
      output += data.toString();
      console.log(`Instaloader stdout: ${data}`);
    });

    instaloader.stderr.on('data', (data) => {
      output += data.toString();
      console.error(`Instaloader stderr: ${data}`);
    });

    instaloader.on('close', async (code) => {
      console.log(`Instaloader process exited with code ${code}`);
      console.log('Full Instaloader output:');
      console.log(output);

      if (code !== 0) {
        reject(new Error(`Instaloader process exited with code ${code}`));
        return;
      }

      try {
        const files = await fs.readdir(outputDir);
        const images = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'));
        const imagePaths = images.map(image => path.join(outputDir, image));
        
        resolve({ imagePaths, output });
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