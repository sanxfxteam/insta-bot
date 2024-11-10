const { uploadToGoogleDrive } = require('../src/utils/googledrive');
const { isValidUrl } = require('../src/commands/dl');
const assert = require('assert');

test('upload to Google Drive', async () => {
    const result = await uploadToGoogleDrive('tmp/videos/video_Video by klsr.av.mp4');
    assert.equal(isValidUrl(result), true);
});
