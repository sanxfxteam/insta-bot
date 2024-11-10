const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');
const config = require('../instabotconfig');

async function downloadInstagramProfile(profile, onImagesReady) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(process.env.INSTA_OUTPUT_DIR, profile);

    // Create folder
    fs.mkdir(outputDir, { recursive: true })
      .then(() => {
        console.log(`Created directory: ${outputDir}`);
      })
      .catch((error) => {
        console.error(`Error creating directory: ${outputDir}`);
        reject(error);
        return;
      });
    
    const command = `pipx run instaloader --fast-update ${profile} --dirname-pattern="${outputDir}"`;
    
    console.log(`Executing command: ${command}`);

    const instaloader = exec(command);
    let totalImagesDetected = 0;

    // Get the list of existing files before starting the download
    let existingFiles = new Set();
    fs.readdir(outputDir)
      .then(files => {
        existingFiles = new Set(files);
        // console.log(`Existing files: ${[...existingFiles]}`);
      })
      .catch(error => {
        console.error(`Error reading directory: ${error}`);
      });

    instaloader.stdout.on('data', (data) => {
      console.log(`Instaloader stdout: ${data}`);
    });

    instaloader.stderr.on('data', (data) => {
      console.error(`Instaloader stderr: ${data}`);
    });

    // Set up a file watcher
    const watcher = chokidar.watch(outputDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      awaitWriteFinish: true, // Wait until the file has finished being written
      ignoreInitial: true, // Ignore files that already exist
      watchOptions: {
        usePolling: true,
        interval: 1000,
      }
    });

    let newImages = [];

    watcher
      .on('add', async (filePath) => {
        const fileName = path.basename(filePath);
        if (!existingFiles.has(fileName) && (filePath.endsWith('.jpg') || filePath.endsWith('.png'))) {
          console.log(`New file detected: ${filePath}`);
          newImages.push(filePath);
          totalImagesDetected++;
          
          if (newImages.length >= 4) {
            const imagesToSend = newImages.splice(0, 4);
            await onImagesReady(imagesToSend);
          }

          // Check if we've reached the maximum number of images
          if (totalImagesDetected >= config.maxImages) {
            console.log(`Reached maximum number of images (${config.maxImages}). Stopping instaloader.`);
            instaloader.kill('SIGHUP');
          }
        }
      })
      .on('error', error => console.error(`Watcher error: ${error}`));

    instaloader.on('close', async (code) => {
      console.log(`Instaloader process exited with code ${code}`);

      // Send any remaining images
      if (newImages.length > 0) {
        await onImagesReady(newImages);
      }

      watcher.close();
      resolve(totalImagesDetected);
    });
  });
}

module.exports = {
  downloadInstagramProfile,
};