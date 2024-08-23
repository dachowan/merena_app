document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('capture');
    const flipButton = document.getElementById('flip');
    const flashButton = document.getElementById('flashButton');

    let currentFacingMode = 'environment';
    let flashActive = false; // Track the flash state

    const constraints = {
        video: {
            facingMode: currentFacingMode // Default to rear camera
        }
    };

    // Start video stream
    const startVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
            };

            // Apply a horizontal flip if the front-facing camera is active
            video.style.transform = currentFacingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)';
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    };

    // Initialize video
    startVideoStream();

    // Capture button event listener
    captureButton.addEventListener('click', () => {
        if (!video.srcObject) {
            console.error('Video source is not available.');
            return;
        }

        // Remove existing flash elements before adding a new one
        const existingFlashElements = document.querySelectorAll('.flash');
        existingFlashElements.forEach(element => element.remove());

        // Flash effect
        if (flashActive && currentFacingMode === 'environment') { // Ensure flash is only active for rear camera
            const flashElement = document.createElement('div');
            flashElement.className = 'flash';
            document.body.appendChild(flashElement);
            flashElement.style.display = 'block'; // Show flash
            setTimeout(() => {
                flashElement.style.opacity = '0'; // Fade out
                setTimeout(() => flashElement.remove(), 100); // Remove flash element after fade out
            }, 100); // Duration of flash effect
        }

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

    // Flash button event listener
    flashButton.addEventListener('click', () => {
        flashActive = !flashActive; // Toggle flash state
        flashButton.classList.toggle('active', flashActive); // Update button appearance if needed

        console.log('Flash state:', flashActive); // Debug log
    });
});
