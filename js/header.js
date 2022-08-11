const handleHeader = () => {
    const header = document.getElementById('header');
    header.classList.remove('fixed-header');
    const headerDefaultTop = header.offsetTop;

    const handleChangeHeader = () => {
        const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
        const headerRect = header.getBoundingClientRect();
        if (header.classList.contains('fixed-header')) {
            if (scrollTop < headerDefaultTop) {
                header.classList.remove('fixed-header');
            }
        } else {
            if (headerRect.top <= 0) {
                header.classList.add('fixed-header');
            }
        }
    };

    handleChangeHeader();
    window.addEventListener('scroll', handleChangeHeader);
};

export default handleHeader;
