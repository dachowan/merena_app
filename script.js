// script.js

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('capture');
    const flipButton = document.getElementById('flip');
    const flash = document.querySelector('.flash'); // Select the flash element

    let currentFacingMode = 'environment';

    const constraints = {
        video: {
            facingMode: currentFacingMode,
            width: { ideal: 1280 },  // Ideal width
            height: { ideal: 720 }   // Ideal height
        }
    };
    

    // Start video stream
    const startVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                updateFlashDimensions();
            };

            // Apply a horizontal flip if the front-facing camera is active
            if (currentFacingMode === 'user') {
                video.style.transform = 'scaleX(-1)';
            } else {
                video.style.transform = 'scaleX(1)'; // Reset to normal for rear camera
            }
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    };

    // Function to update flash dimensions to match video
    const updateFlashDimensions = () => {
        const videoRect = video.getBoundingClientRect();
        flash.style.width = `${videoRect.width}px`;
        flash.style.height = `${videoRect.height}px`;
    };

    // Initialize video
    startVideoStream();

    // Capture button event listener
    captureButton.addEventListener('click', () => {
        if (!video.srcObject) {
            console.error('Video source is not available.');
            return;
        }

        // Show flash effect
        flash.style.opacity = '1';
        setTimeout(() => {
            flash.style.opacity = '0';
        }, 100); // Duration of flash effect

        // Flip the canvas back before drawing the image
        if (currentFacingMode === 'user') {
            context.save();
            context.scale(-1, 1); // Flip horizontally
            context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            context.restore();
        } else {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        const dataURL = canvas.toDataURL('image/jpeg');

        console.log('Captured image data URL:', dataURL); // Debug log

        // Replace the fetch URL with your deployed app URL on Render
        fetch('https://bemarena.onrender.com/upload', {
            method: 'POST',
            body: JSON.stringify({ image: dataURL }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => console.log('Photo uploaded successfully:', data))
        .catch(error => console.error('Error uploading photo:', error));
    });

    // Flip camera button event listener
    flipButton.addEventListener('click', () => {
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        constraints.video.facingMode = currentFacingMode;

        // Stop the current video stream
        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }

        // Start the video stream with the new facing mode
        startVideoStream();
    });

    // Update flash dimensions on window resize
    window.addEventListener('resize', updateFlashDimensions);

    // Handle exiting fullscreen on iOS
    document.addEventListener('webkitendfullscreen', () => {
        if (video.paused) {
            video.play(); // Restart the video stream when exiting fullscreen on iOS
        }
    });
});
