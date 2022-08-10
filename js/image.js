import placeholder from '../public/assets/placeholder.png';

const placeholderImages = () => {
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => {
        img.addEventListener('error', () => {
            img.src = placeholder;
        });
    });
};

export default placeholderImages;
