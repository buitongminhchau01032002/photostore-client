import handleHeader from '../js/header';
import handleMenu from '../js/menu';
import placeholderImg from '../assets/placeholder.png';

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
let user = null;
let typeChoosePhotoState = 'url';
const tabTypePhoto = document.getElementById('tab-type-photo');
const tabTypePhotoBtns = tabTypePhoto.querySelectorAll('button[value]');

const imgInputGroups = document.querySelectorAll('.-img-input-group');
const urlInput = document.getElementById('url-input');
const urlPreview = document.getElementById('url-preview');

const titleInput = document.getElementById('title-input');
const descriptionInput = document.getElementById('description-input');
const submitBtn = document.getElementById('submit-create-photo-btn');

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

    // Load photo preview
    const loader = document.getElementById('url-input-loader');
    loader.classList.add('opacity-100');
    checkImage(urlInput.value, (isValid) => {
        if (isValid) {
            urlPreview.src = urlInput.value;
            urlInput.classList.remove('invalid');
        } else {
            urlPreview.src = placeholderImg;
            urlInput.classList.add('invalid');
        }
        loader.classList.remove('opacity-100');
        checkCanSubmit();
    });
};
initUI();

const checkCanSubmit = () => {
    if (typeChoosePhotoState !== 'url') {
        submitBtn.disabled = true;
        return false;
    } else {
        if (urlInput.classList.contains('invalid') || urlInput.value == '') {
            submitBtn.disabled = true;
            return false;
        }
        if (titleInput.value == '') {
            submitBtn.disabled = true;
            return false;
        }
    }
    submitBtn.disabled = false;
    return true;
};
checkCanSubmit();

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
    checkCanSubmit();
};

tabTypePhotoBtns.forEach((tabTypePhotoBtn) => {
    tabTypePhotoBtn.addEventListener('click', handleChangeTypeChoosePhoto);
});

function handleChangeUrl(e) {
    const loader = document.getElementById('url-input-loader');
    loader.classList.add('opacity-100');
    checkImage(e.target.value, (isValid) => {
        if (isValid) {
            urlPreview.src = e.target.value;
            urlInput.classList.remove('invalid');
        } else {
            urlPreview.src = placeholderImg;
            urlInput.classList.add('invalid');
        }
        loader.classList.remove('opacity-100');
        checkCanSubmit();
    });
}
urlInput.addEventListener('input', debouceFunc(handleChangeUrl, 500));
urlInput.addEventListener('blur', handleChangeUrl);

titleInput.addEventListener('blur', (e) => {
    if (titleInput.value.length === 0) {
        titleInput.classList.add('invalid');
        titleInput.classList.add('touched');
    }
});

titleInput.addEventListener('input', (e) => {
    if (titleInput.value.length !== 0) {
        // valid
        if (titleInput.classList.contains('invalid')) {
            titleInput.classList.remove('invalid');
        }
    } else {
        // invalid
        if (titleInput.classList.contains('touched')) {
            titleInput.classList.add('invalid');
        }
    }
    checkCanSubmit();
});

submitBtn.addEventListener('click', () => {
    submitBtn.disabled = true;
    const dataForm = {};
    const check = checkCanSubmit();
    if (!check) {
        console.log('invalid');
        submitBtn.disabled = false;
        return;
    }

    // Photo
    if (typeChoosePhotoState !== 'url') {
        console.log('canot use file');
        submitBtn.disabled = false;
        return;
    }
    dataForm.photo = urlInput.value;

    // Title
    dataForm.title = titleInput.value;

    // Description
    dataForm.description = descriptionInput.value;

    // Audience
    const audience = document.querySelector('input[name="audience"]:checked');
    if (audience) {
        dataForm.audience = audience.value;
    } else {
        console.log('no audience');
        return;
    }

    // Call api
    submitBtn.disabled = true;
    console.log(dataForm);

    fetch(`${import.meta.env.VITE_API_URL}/photo`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataForm),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                //todo: handle success
                alert('Tạo ảnh thành công');
                submitBtn.disabled = false;
                titleInput.value = '';
                descriptionInput.value = '';
            } else {
                //todo: handle error
                alert('Lỗi');
            }
        })
        .catch((e) => console.log(e));
});
