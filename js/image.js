import placeholder from '../assets/placeholder.png';

const placeholderImages = (selector) => {
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => {
        const handleError = () => (img.src = placeholder);
        img.removeEventListener('error', handleError);
        img.addEventListener('error', handleError);
    });
};

export default placeholderImages;
