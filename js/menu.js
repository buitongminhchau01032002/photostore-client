const handleMenu = () => {
    const menu = document.getElementById('menu-mobile');
    const menuOverlay = document.getElementById('menu-moblie-overlay');
    const menuOpenBtn = document.getElementById('menu-open-btn');
    const smMenuOpenBtn = document.getElementById('sm-menu-open-btn');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    const openMenu = () => {
        menu?.classList.add('open');
    };
    const closeMenu = () => {
        menu?.classList.remove('open');
    };

    menuOpenBtn?.addEventListener('click', openMenu);
    smMenuOpenBtn?.addEventListener('click', openMenu);
    menuOverlay?.addEventListener('click', closeMenu);
    menuCloseBtn?.addEventListener('click', closeMenu);
};

export default handleMenu;
