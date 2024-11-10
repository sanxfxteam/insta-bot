const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function uploadToGoogleDrive(filePath, folderId) {
  // Validate credentials file
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
  }
  
  if (!fs.existsSync(credentialsPath)) {
    throw new Error(`Credentials file not found at: ${credentialsPath}`);
  }

  console.log('Initializing Google Auth');
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive'],
  });

  console.log('Creating Google Drive instance');
  const drive = google.drive({ version: 'v3', auth });
  
  console.log('Setting up file metadata');
  const fileMetadata = {
    name: path.basename(filePath),
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], 
  };
  
  console.log('Setting up media');
  const media = {
    mimeType: 'video/mp4',
    body: fs.createReadStream(filePath)
  };

  try {
    console.log('Uploading file to Google Drive');
    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
      supportsAllDrives: true,
      supportsTeamDrives: true,
    });
    console.log('File uploaded successfully', file.data);
    return file.data.webViewLink;
  } catch (err) {
    console.error('Error uploading to Google Drive:', err);
    throw err;
  }
}

module.exports = { uploadToGoogleDrive };