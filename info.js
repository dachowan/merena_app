// info.js
document.addEventListener('DOMContentLoaded', () => {
    const closeButton = document.querySelector('.close-button');

    closeButton.addEventListener('click', () => {
        window.location.href = 'index.html'; // Navigate to index.html
    });
});
