import handleHeader from '../js/header';
import handleMenu from '../js/menu';

handleMenu();
handleHeader();

const debouceFunc = (func, delay) => {
    let timeoutId = null;
    return (...agr) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func(...agr);
        }, delay);
    };
};

function checkImage(url, callback) {
    var timeout = 5000;
    var timedOut = false;
    var timer;
    var img = new Image();
    img.onerror = img.onabort = function () {
        if (!timedOut) {
            clearTimeout(timer);
            callback(false);
        }
    };
    img.onload = function () {
        if (!timedOut) {
            clearTimeout(timer);
            callback(true);
        }
    };
    img.src = url;
    timer = setTimeout(function () {
        timedOut = true;
        callback(false);
    }, timeout);
}

// ======================

let typeChoosePhotoState = 'url';
const tabTypePhoto = document.getElementById('tab-type-photo');
const tabTypePhotoBtns = tabTypePhoto.querySelectorAll('button[value]');
const imgInputGroups = document.querySelectorAll('.-img-input-group');
const urlInput = document.getElementById('url-input');
const urlReview = document.getElementById('url-review');

// FIRST CHANGE
const initUI = () => {
    tabTypePhotoBtns.forEach((tabTypePhotoBtn) => {
        tabTypePhotoBtn.classList.remove('active');
        if (tabTypePhotoBtn['value'] === typeChoosePhotoState) {
            tabTypePhotoBtn.classList.add('active');
        }
    });
    // Change section ui
    imgInputGroups.forEach((elem) => {
        elem.classList.add('!hidden');
        if (elem.classList.contains(typeChoosePhotoState)) {
            elem.classList.remove('!hidden');
        }
    });
    urlReview.src =
        'https://res.cloudinary.com/dbxfq9usa/image/upload/v1659961165/placeholder_qeff7x.png';
};
initUI();

const handleChangeTypeChoosePhoto = (e) => {
    const target = e.currentTarget;
    if (!target) {
        return;
    }

    if (typeChoosePhotoState !== target.value) {
        typeChoosePhotoState = target.value;
        // Change btn ui
        tabTypePhotoBtns.forEach((tabTypePhotoBtn) => {
            tabTypePhotoBtn.classList.remove('active');
        });
        target.classList.add('active');
        // Change section ui
        imgInputGroups.forEach((elem) => {
            elem.classList.add('!hidden');
            if (elem.classList.contains(typeChoosePhotoState)) {
                elem.classList.remove('!hidden');
            }
        });
    }
};

tabTypePhotoBtns.forEach((tabTypePhotoBtn) => {
    tabTypePhotoBtn.addEventListener('click', handleChangeTypeChoosePhoto);
});

const handleChangeUrl = (e) => {
    const loader = document.getElementById('url-input-loader');
    loader.classList.add('opacity-100');
    checkImage(e.target.value, (isValid) => {
        if (isValid) {
            urlReview.src = e.target.value;
            urlInput.classList.remove('invalid');
        } else {
            urlReview.src =
                'https://res.cloudinary.com/dbxfq9usa/image/upload/v1659961165/placeholder_qeff7x.png';
            urlInput.classList.add('invalid');
        }
        loader.classList.remove('opacity-100');
    });
};
urlInput.addEventListener('input', debouceFunc(handleChangeUrl, 500));
urlInput.addEventListener('blur', handleChangeUrl);
