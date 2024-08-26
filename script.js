document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('capture');
    const flipButton = document.getElementById('flip');
    const triangleWrapper = document.querySelector('.triangle-wrapper'); // Select the wrapper element
    const flash = document.querySelector('.flash');

    let currentFacingMode = 'environment';
    let isRotated = false;

    const constraints = {
        video: {
            facingMode: currentFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    // Function to detect iOS devices
    const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

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
        }, 100);

        context.save();
        if (currentFacingMode === 'user') {
            context.scale(-1, 1); 
            context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        } else {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
        context.restore();

        const dataURL = canvas.toDataURL('image/jpeg');

        console.log('Captured image data URL:', dataURL);

        fetch('https://bemarena.onrender.com/upload', {
            method: 'POST',
            body: JSON.stringify({ image: dataURL }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => console.log('Photo uploaded successfully:', data))
        .catch(error => console.error('Error uploading photo:', error));
    });

    // Function to flip the camera
    const flipCamera = () => {
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

        // Rotate the triangle wrapper 180°
        isRotated = !isRotated;
        triangleWrapper.classList.toggle('rotated', isRotated);
    };

    // Flip camera button event listener
    flipButton.addEventListener('click', flipCamera);

    // Triangle wrapper event listener for flipping the camera
    triangleWrapper.addEventListener('click', flipCamera);

    // Update flash dimensions and video centering on window resize
    window.addEventListener('resize', () => {
        updateFlashDimensions();
        centerVideo();
    });

    document.addEventListener('webkitendfullscreen', () => {
        if (video.paused) {
            video.play();
        }
    });
});
