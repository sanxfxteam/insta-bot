const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function authenticateGoogle() {
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
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive'],
  });

  return auth;
}

async function uploadToGoogleDrive(filePath) {
  const auth = await authenticateGoogle();

  console.log('Creating Google Drive instance');
  const drive = google.drive({ version: 'v3', auth });

  console.log('Setting up file metadata');
  const fileMetadata = {
    name: path.basename(filePath),
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
  };

  console.log('Setting up media');
  const media = {
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

async function findOrCreateFolder(parentFolderId, folderName) {
  const auth = await authenticateGoogle();

  console.log('Creating Google Drive instance');
  const drive = google.drive({ version: 'v3', auth });

  // Search for existing folder
  const response = await drive.files.list({
    q: `name='${folderName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
    spaces: 'drive',
    supportsAllDrives: true,
    supportsTeamDrives: true,
  });

  // If folder exists, return its ID
  if (response.data.files.length > 0) {
    return response.data.files[0].id;
  }

  // If folder doesn't exist, create it
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId],
  };

  const folder = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
    supportsAllDrives: true,
    supportsTeamDrives: true,
  });

  return folder.data.id;
}

module.exports = { uploadToGoogleDrive, findOrCreateFolder };