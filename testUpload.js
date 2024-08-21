const fs = require('fs');
const path = require('path');

const testFilePath = path.join(__dirname, 'uploads', 'test_photo.jpg');
const base64Data = 'data:image/jpeg;base64,' + '...'; // Use a small base64 string

fs.writeFile(testFilePath, base64Data.replace(/^data:image\/jpeg;base64,/, ''), 'base64', (err) => {
    if (err) {
        console.error('Error writing test file:', err);
    } else {
        console.log('Test file written successfully:', testFilePath);
    }
});
