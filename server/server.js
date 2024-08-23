const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Configure AWS SDK with credentials and region
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'eu-north-1' // Ensure this matches the bucket region
});

const app = express();
const PORT = process.env.PORT || 3001;

const s3 = new AWS.S3();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../')));

// Handle photo uploads
app.post('/upload', (req, res) => {
    const dataURL = req.body.image;

    if (!dataURL) {
        console.error('No image data received');
        return res.status(400).send('No image data received');
    }

    const base64Data = Buffer.from(dataURL.replace(/^data:image\/jpeg;base64,/, ''), 'base64');
    const fileName = `photo_${uuidv4()}.jpg`;

    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: base64Data,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
        ACL: 'public-read'
    };

    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Error saving photo to S3:', err);
            return res.status(500).send('Error saving photo');
        }
        res.json({ message: 'Photo uploaded successfully!', url: data.Location });
    });
});

// Serve photo URLs
app.get('/photos', (req, res) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: ''
    };

    s3.listObjectsV2(params, (err, data) => {
        if (err) {
            console.error('Error reading S3 bucket:', err);
            return res.status(500).send('Error reading photos');
        }
        const photoUrls = data.Contents.map(item => s3.getSignedUrl('getObject', {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: item.Key,
            Expires: 60 * 60 * 24
        }));
        res.json(photoUrls);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});