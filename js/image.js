const placeholderImages = () => {
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => {
        img.addEventListener('error', () => {
            img.src = '../assets/placeholder.png';
        });
    });
};

export default placeholderImages;
