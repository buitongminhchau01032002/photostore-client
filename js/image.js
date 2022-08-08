const placeholderImages = () => {
    const imgs = document.querySelectorAll('img');
    imgs.forEach((img) => {
        img.addEventListener('error', () => {
            img.src =
                'https://res.cloudinary.com/dbxfq9usa/image/upload/v1659961165/placeholder_qeff7x.png';
        });
    });
};

export default placeholderImages;
