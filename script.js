document.addEventListener('DOMContentLoaded', () => {
    const MAX_PHOTOS = 10;
    const photoCountKey = 'photoCount';
    const lastResetKey = 'lastResetDate';

    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('capture');
    const flipButton = document.getElementById('flip');
    const triangleWrapper = document.querySelector('.triangle-wrapper');
    const flash = document.querySelector('.flash');
    const photoCountDisplay = document.getElementById('photoCount');

    let currentFacingMode = 'environment';
    let isRotated = false;

    const constraints = {
        video: {
            facingMode: currentFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    // Get stored data
    function getStoredData() {
        return {
            count: parseInt(localStorage.getItem(photoCountKey), 10) || 0,
            lastResetDate: localStorage.getItem(lastResetKey)
        };
    }

    // Update stored data
    function updateStoredData(count, date) {
        localStorage.setItem(photoCountKey, count);
        localStorage.setItem(lastResetKey, date);
    }

    // Reset photo count if it's a new day
    function resetCountIfNeeded() {
        const { lastResetDate } = getStoredData();
        const today = new Date().toISOString().split('T')[0];

        if (lastResetDate !== today) {
            updateStoredData(0, today);
        }
    }

    // Check if the user can take a photo
    function canTakePhoto() {
        const { count } = getStoredData();
        return count < MAX_PHOTOS;
    }

    // Increment the photo count
    function incrementPhotoCount() {
        const { count } = getStoredData();
        const newCount = count + 1;
        updateStoredData(newCount, new Date().toISOString().split('T')[0]);
        updatePhotoCountDisplay(); // Update the UI
    }

    // Update the photo count display
    function updatePhotoCountDisplay() {
        const { count } = getStoredData();
        const remainingPhotos = MAX_PHOTOS - count;
        photoCountDisplay.textContent = `${remainingPhotos}`;
    }

    // Initialize video stream
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

            // Apply horizontal flip if front-facing camera is active
            video.style.transform = currentFacingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)';
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    };

    // Update flash dimensions to match video
    const updateFlashDimensions = () => {
        const videoRect = video.getBoundingClientRect();
        flash.style.width = `${videoRect.width}px`;
        flash.style.height = `${videoRect.height}px`;
    };

    // Capture button event listener
    captureButton.addEventListener('click', () => {
        if (canTakePhoto()) {
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

            incrementPhotoCount(); // Increment the count after taking a photo
        } else {
            alert('Photo limit reached for today. Please come back tomorrow!');
        }
    });

    // Initialize the video stream and UI
    resetCountIfNeeded();
    updatePhotoCountDisplay(); // Display the initial remaining count
    startVideoStream();

    // Other existing event listeners...

    flipButton.addEventListener('click', () => {
        window.location.href = 'info.html';
    });

    triangleWrapper.addEventListener('click', () => {
        flipCamera();
    });

    const flipCamera = () => {
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        constraints.video.facingMode = currentFacingMode;

        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }

        startVideoStream();

        isRotated = !isRotated;
        triangleWrapper.classList.toggle('rotated', isRotated);
    };

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
