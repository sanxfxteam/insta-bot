const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const http = require('http');
const { downloadInstagramProfile } = require('./instaloader');

const profileDataFile = path.join(__dirname, '..', 'profile_data.json');
const profilePagesDir = 'profile_pages';

async function updateProfiles() {
  try {
    const profileData = JSON.parse(await fsPromises.readFile(profileDataFile, 'utf-8'));
    for (const profile in profileData) {
      const { imagePaths } = await downloadInstagramProfile(profile);
      profileData[profile].imagePaths = imagePaths;
      await generateProfilePage(profile, imagePaths);
    }
    await fsPromises.writeFile(profileDataFile, JSON.stringify(profileData, null, 2));
  } catch (error) {
    console.error('Error updating profiles:', error);
  }
}

async function generateProfilePage(profile, imagePaths) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><title>${profile}'s Instagram Images</title></head>
    <body>
      <h1>${profile}'s Instagram Images</h1>
      ${imagePaths.map(imagePath => {
        const relativePath = path.relative(outputDir, imagePath);
        return `<img src="/${relativePath}" alt="${profile} image">`;
      }).join('')}
    </body>
    </html>
  `;
  
  const filePath = path.join(profilePagesDir, `${profile}.html`);
  
  try {
    await fsPromises.writeFile(filePath, html);
    console.log(`Profile page for ${profile} generated successfully.`);
  } catch (error) {
    console.error(`Error generating profile page for ${profile}:`, error);
    throw error;
  }
}



function serveProfilePages() {
  const fs = require('fs');
  const fsPromises = require('fs').promises;
  const path = require('path');
  const http = require('http');

  const profilePagesDir = path.join(__dirname, '..', '..', 'profile_pages');
  const outputDir = '/tmp';
  
  const server = http.createServer(async (req, res) => {
    const urlPath = req.url.split('?')[0]; // Remove query parameters

    if (urlPath === '/') {
      // Serve home page
      try {
        const profiles = await fsPromises.readdir(profilePagesDir);
        const html = `
          <!DOCTYPE html>
          <html>
          <head><title>Instagram Profiles</title></head>
          <body>
            <h1>Instagram Profiles</h1>
            <ul>
              ${profiles.map(profile => `<li><a href="/${profile.replace('.html', '')}">${profile.replace('.html', '')}</a></li>`).join('')}
            </ul>
          </body>
          </html>
        `;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
      } catch (err) {
        console.error('Error serving home page:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else if (urlPath.endsWith('.jpg') || urlPath.endsWith('.png')) {
      // Serve image files
      const imagePath = path.join(outputDir, urlPath);
      try {
        await fsPromises.access(imagePath);
        const contentType = urlPath.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(imagePath).pipe(res);
      } catch (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Image not found');
        } else {
          console.error('Error serving image:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      }
    } else {
      // Serve profile pages
      const profile = urlPath.slice(1);
      const filePath = path.join(profilePagesDir, `${profile}.html`);

      try {
        await fsPromises.access(filePath);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(filePath).pipe(res);
      } catch (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Profile not found');
        } else {
          console.error('Error serving profile page:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      }
    }
  });

  server.listen(8080);
  console.log('HTTP server running on port 8080');
}
module.exports = { updateProfiles, serveProfilePages, generateProfilePage };
