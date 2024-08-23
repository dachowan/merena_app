document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('capture');
    const flipButton = document.getElementById('flip');
    const photo = document.getElementById('photo'); // Ensure this ID matches the HTML

    const constraints = {
        video: {
            facingMode: 'environment' // Default to rear camera
        }
    };
    let currentFacingMode = 'environment';

    // Start video stream
    const startVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
            };
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

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg');

        console.log('Captured image data URL:', dataURL); // Debug log

        if (photo) { // Check if photo element exists
            photo.src = dataURL;
        } else {
            console.error('Photo element is not found.');
        }

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

        console.log('Flipping camera to:', currentFacingMode); // Debug log

        // Stop the current video stream
        const stream = video.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
        }

        // Start the video stream with the new facing mode
        startVideoStream();
    });
});
