import handleHeader from '../js/header';
import handleMenu from '../js/menu';
import placeholderImg from '../assets/placeholder.png';
import createPlaceholderImage from '../js/image';
import { initToast, createToast } from '../js/toast';

// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
const firebaseConfig = {
    apiKey: 'AIzaSyAqd1aWe500bQab_vPBLkno-9T03RG2AWM',
    authDomain: 'photostore-fee86.firebaseapp.com',
    projectId: 'photostore-fee86',
    storageBucket: 'photostore-fee86.appspot.com',
    messagingSenderId: '385710637523',
    appId: '1:385710637523:web:2dd00fbba32599f355ef26',
    measurementId: 'G-TK6PWW0RR7',
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

handleMenu();
handleHeader(app);
createPlaceholderImage('img:not(.img-preview)');
initToast();

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

function checkImage(url, timeoutT) {
    return new Promise(function (resolve, reject) {
        var timeout = timeoutT || 5000;
        var timer,
            img = new Image();
        img.onerror = img.onabort = function () {
            clearTimeout(timer);
            reject('error');
        };
        img.onload = function () {
            clearTimeout(timer);
            resolve();
        };
        img.src = url;
        timer = setTimeout(function () {
            reject('timeout');
        }, timeout);
    });
}

const toBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

// ======================
let userState = null;
let typeChoosePhotoState = 'url';
const tabTypePhoto = document.getElementById('tab-type-photo');
const tabTypePhotoBtns = tabTypePhoto.querySelectorAll('#tab-type-photo > button[value]');

const imgInputGroups = document.querySelectorAll('.-img-input-group');
const urlInput = document.getElementById('url-input');
const urlPreview = document.getElementById('url-preview');

const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');

const titleInput = document.getElementById('title-input');
const descriptionInput = document.getElementById('description-input');
const submitBtn = document.getElementById('submit-create-photo-btn');
const audiences = document.querySelectorAll('input[name="audience"]');

onAuthStateChanged(auth, (user) => {
    if (user) {
        userState = user;
    } else {
        userState = null;
    }
    handleAudicence(user);
});
function handleAudicence(user) {
    if (user) {
        audiences.forEach((elem) => {
            elem.disabled = false;
        });
    } else {
        audiences.forEach((elem) => {
            if (elem.value === 'public') {
                elem.disabled = false;
                elem.checked = true;
            } else {
                elem.disabled = true;
            }
        });
    }
}

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

    // Load photo preview url
    const loader = document.getElementById('url-input-loader');
    loader.classList.add('opacity-100');
    checkImage(urlInput.value, 5000)
        .then(() => {
            urlPreview.src = urlInput.value;
            urlInput.classList.remove('invalid');
        })
        .catch((msg) => {
            urlPreview.src = placeholderImg;
            urlInput.classList.add('invalid');
            if (msg === 'timeout') {
                createToast('warning', 'Lỗi kiểm tra ảnh', 'Không thể kiểm tra ảnh', 5000);
            }
        })
        .finally(() => {
            loader.classList.remove('opacity-100');
            checkCanSubmit();
        });

    // Load photo preview file
    filePreview.src = placeholderImg;
};
initUI();

//* CHECK VALID AND DISABLE SUBMIT BTN
function checkCanSubmit() {
    if (typeChoosePhotoState === 'file') {
        if (fileInput.classList.contains('invalid') || fileInput.files.length === 0) {
            submitBtn.disabled = true;
            return false;
        }
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

    if (titleInput.value === '') {
        submitBtn.disabled = true;
        return false;
    }

    submitBtn.disabled = false;
    return true;
}
checkCanSubmit();

//* HANDLE TAB
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

//* HANDLE CHANGE URL
function handleChangeUrl(e) {
    const loader = document.getElementById('url-input-loader');
    loader.classList.add('opacity-100');
    checkImage(e.target.value, 5000)
        .then(() => {
            urlPreview.src = e.target.value;
            urlInput.classList.remove('invalid');
        })
        .catch((msg) => {
            urlPreview.src = placeholderImg;
            urlInput.classList.add('invalid');
            if (msg === 'timeout') {
                createToast(
                    'warning',
                    'Không thể kiểm tra ảnh',
                    'Vui lòng kiểm tra đường dẫn hoặc kết nối mạng.',
                    8000
                );
            }
        })
        .finally(() => {
            loader.classList.remove('opacity-100');
            checkCanSubmit();
        });
}
urlInput.addEventListener('input', debouceFunc(handleChangeUrl, 500));
urlInput.addEventListener('blur', handleChangeUrl);

//* HANDLE ANOTHER INPUT
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

//* HANDLE CHANGE FILE INPUT
fileInput.addEventListener('change', (e) => {
    // const loader = document.getElementById('url-input-loader');
    // loader.classList.add('opacity-100');

    const files = fileInput.files;
    if (!files.length) {
        const fileNameElem = document.querySelector('#file-input ~ * .file-name');
        fileNameElem && (fileNameElem.innerHTML = 'Không có ảnh được chọn');
        filePreview.src = placeholderImg;
        fileInput.classList.add('invalid');
        checkCanSubmit();
        return;
    }
    const blob = URL.createObjectURL(files[0]);
    let name = files[0].name;
    if (name.length > 45) {
        name = name.slice(0, 20) + '...' + name.slice(name.length - 20);
    }
    const fileNameElem = document.querySelector('#file-input ~ * .file-name');
    fileNameElem && (fileNameElem.innerHTML = name);

    checkImage(blob, 5000)
        .then(() => {
            filePreview.src = blob;
            fileInput.classList.remove('invalid');
        })
        .catch((msg) => {
            filePreview.src = placeholderImg;
            fileInput.classList.add('invalid');
            if (msg === 'timeout') {
                createToast(
                    'warning',
                    'Không thể kiểm tra ảnh',
                    'Vui lòng kiểm tra file hoặc kết nối mạng.',
                    8000
                );
            }
        })
        .finally(() => {
            // loader.classList.remove('opacity-100');
            checkCanSubmit();
        });
});

//* HANDLE CLICK SUBMIT
submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;
    const loader = submitBtn.querySelector('.loading-submit');
    if (loader) {
        loader.classList.remove('hidden');
    }
    const dataForm = {};
    const check = checkCanSubmit();
    if (!check) {
        submitBtn.disabled = false;
        if (loader) {
            loader.classList.add('hidden');
        }
        return;
    }

    // Photo
    if (typeChoosePhotoState === 'file') {
        if (!fileInput.files.length === 0) {
            createToast('error', 'Lỗi ảnh', 'Có lỗi từ file ảnh!', 5000);

            submitBtn.disabled = false;
            if (loader) {
                loader.classList.add('hidden');
            }
            return;
        }

        try {
            dataForm.photo = await toBase64(fileInput.files[0]);
        } catch (error) {
            createToast('error', 'Lỗi ảnh', 'Có lỗi từ file ảnh!', 5000);

            submitBtn.disabled = false;
            if (loader) {
                loader.classList.add('hidden');
            }
            return;
        }
    } else {
        dataForm.photo = urlInput.value;
    }

    // Title
    dataForm.title = titleInput.value;

    // Description
    dataForm.description = descriptionInput.value;

    // Audience
    const audience = document.querySelector('input[name="audience"]:checked');
    if (audience) {
        if (audience === 'public') {
            dataForm.public = true;
        } else {
            dataForm.public = false;
        }
    } else {
        console.log('no audience');
        return;
    }

    // Call api
    submitBtn.disabled = true;

    const headers = {
        'Content-Type': 'application/json',
    };
    if (userState) {
        const token = userState.accessToken;
        headers.Authorization = 'Bearer ' + token;
    }

    fetch(`${import.meta.env.VITE_API_URL}/photo`, {
        method: 'POST',
        headers,
        body: JSON.stringify(dataForm),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                createToast('success', 'Thành công', 'Tạo ảnh thành công.', 5000);
                titleInput.value = '';
                descriptionInput.value = '';
            } else {
                createToast('error', 'Lỗi tạo ảnh', 'Tạo ảnh không thành công.', 5000);
            }
        })
        .catch((e) => {
            console.log(e);
            createToast('error', 'Lỗi', 'Không thể tạo ảnh', 5000);
        })
        .finally(() => {
            submitBtn.disabled = false;
            if (loader) {
                loader.classList.add('hidden');
            }
        });
});
