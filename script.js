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
    
    // Function to detect iOS devices
    const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // Function to center the video in its container
    const centerVideo = () => {
        if (isIOS()) {
            const container = video.parentElement;
            const containerRect = container.getBoundingClientRect();
            const videoRect = video.getBoundingClientRect();
            
            // Center the video horizontally and vertically
            video.style.position = 'absolute';
            video.style.top = `${(containerRect.height - videoRect.height) / 2}px`;
            video.style.left = `${(containerRect.width - videoRect.width) / 2}px`;
            video.style.height = 'auto'; // Reset height to auto
            video.style.width = '100%'; // Set width to 100% to cover container
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
                centerVideo();
            };

            // Apply a horizontal flip if the front-facing camera is active
            video.style.transform = currentFacingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)';
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
        context.save();
        if (currentFacingMode === 'user') {
            context.scale(-1, 1); // Flip horizontally
            context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        } else {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        context.restore();

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

    // Update flash dimensions and video centering on window resize
    window.addEventListener('resize', () => {
        updateFlashDimensions();
        centerVideo();
    });

    // Handle exiting fullscreen on iOS
    document.addEventListener('webkitendfullscreen', () => {
        if (video.paused) {
            video.play(); // Restart the video stream when exiting fullscreen on iOS
        }
    });
});
