document.addEventListener('DOMContentLoaded', () => {
    // Replace the fetch URL with your deployed app URL on Render
    fetch('https://bemarena.onrender.com/photos')
        .then(response => response.json())
        .then(photoUrls => {
            const gallery = document.getElementById('gallery');
            gallery.innerHTML = ''; // Clear previous content

            photoUrls.forEach(url => {
                const img = document.createElement('img');
                // Ensure the URL points to the correct location on your deployed app
                img.src = `https://bemarena.onrender.com${url}`;
                img.alt = 'Photo';
                img.style.width = '200px'; // Set a size for images
                img.style.margin = '10px'; // Add some space between images
                img.onerror = () => {
                    console.error('Error loading image:', url);
                    img.src = 'path/to/placeholder-image.jpg'; // Optional placeholder image
                };
                gallery.appendChild(img);
            });
        })
        .catch(error => {
            console.error('Error fetching photos:', error);
            document.getElementById('gallery').innerText = 'Error fetching photos';
        });
});
