document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('capture');
    const flipButton = document.getElementById('flip');
    const flashButton = document.getElementById('flashButton');
    const flash = document.getElementById('flash');

    let currentFacingMode = 'environment';
    let flashEnabled = false;

    const constraints = {
        video: {
            facingMode: currentFacingMode // Default to rear camera
        }
    };

    const startVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                if (currentFacingMode === 'user') {
                    video.style.transform = 'scaleX(-1)';
                } else {
                    video.style.transform = 'scaleX(1)';
                }
            };
        } catch (error) {
            console.error('Error accessing webcam:', error);
        }
    };

    startVideoStream();

    captureButton.addEventListener('click', () => {
        if (!video.srcObject) {
            console.error('Video source is not available.');
            return;
        }

        // Show flash effect if enabled and using rear camera
        if (currentFacingMode === 'environment' && flashEnabled) {
            flash.style.opacity = '1';
            setTimeout(() => {
                flash.style.opacity = '0';
            }, 100); // Flash duration
        }

        // Ensure canvas size is correct
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        if (currentFacingMode === 'user') {
            context.save();
            context.scale(-1, 1);
            context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            context.restore();
        } else {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

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

    flipButton.addEventListener('click', () => {
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
        constraints.video.facingMode = currentFacingMode;

        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }

        startVideoStream();
    });

    flashButton.addEventListener('click', () => {
        flashEnabled = !flashEnabled;
        flashButton.classList.toggle('active', flashEnabled); // Toggle active class
    });
});
