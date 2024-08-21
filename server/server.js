const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors()); // Enable CORS
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle photo uploads
app.post('/upload', (req, res) => {
    const dataURL = req.body.image;

    if (!dataURL) {
        console.error('No image data received');
        return res.status(400).send('No image data received');
    }

    const base64Data = dataURL.replace(/^data:image\/jpeg;base64,/, '');
    const filePath = path.join(__dirname, 'uploads', `photo_${Date.now()}.jpg`);

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
        if (err) {
            console.error('Error saving photo:', err);
            return res.status(500).send('Error saving photo');
        }
        res.json({ message: 'Photo uploaded successfully!' });
    });
});

// Serve photo URLs
app.get('/photos', (req, res) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error('Error reading uploads directory:', err);
            return res.status(500).send('Error reading photos');
        }
        const photoUrls = files.map(file => `/uploads/${file}`);
        res.json(photoUrls);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
