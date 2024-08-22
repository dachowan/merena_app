document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('capture');
    const photo = document.getElementById('photo');

    // Start video stream
    const startVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
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

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL('image/jpeg');

        console.log('Captured image data URL:', dataURL); // Debug log

        photo.src = dataURL;

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
});
