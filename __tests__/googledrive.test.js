const { uploadToGoogleDrive } = require('../src/utils/googledrive');
const { isValidUrl } = require('../src/commands/dl');
const assert = require('assert');
const fs = require('fs');

test('upload to Google Drive', async () => {
    const filePath = 'tmp/test.txt';
    fs.writeFileSync(filePath, 'hello world');
    const result = await uploadToGoogleDrive(filePath);
    assert.equal(isValidUrl(result), true);
});

const { findOrCreateFolder } = require('../src/utils/googledrive');

test('find or create folder', async () => {
    const folderName = 'test folder';
    const result = await findOrCreateFolder(process.env.GOOGLE_DRIVE_FOLDER_ID, folderName);
    assert.equal(result != '', true);
});