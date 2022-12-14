import handleHeader from '../js/header';
import handleMenu from '../js/menu';
import placeholderImg from '../assets/placeholder.png';
import createPlaceholderImage from '../js/image';
import { initToast, createToast } from '../js/toast';
import { initDialog, createDialog, openDialog, closeDialog } from '../js/dialog';

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
initDialog();

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

const deleteBtn = document.getElementById('delete-btn');
const editImgBtn = document.getElementById('edit-img-btn');
const cancelEditImgBtn = document.getElementById('cancel-edit-img-btn');

let typeChoosePhotoState = 'url';
let currentPhotoState = true;
let photoState = {};
const currentImgSectionElem = document.getElementById('current-img-section');
const editImgSectionElem = document.getElementById('edit-img-section');
const cancelBtn = document.getElementById('cancel-btn');
const currentImgElem = document.getElementById('current-img');
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

onAuthStateChanged(auth, (user) => {
    if (user) {
        userState = user;
    } else {
        userState = null;
    }
    initUI();
});

const initUI = () => {
    tabTypePhotoBtns.forEach((tabTypePhotoBtn) => {
        tabTypePhotoBtn.classList.remove('active');
        if (tabTypePhotoBtn['value'] === typeChoosePhotoState) {
            tabTypePhotoBtn.classList.add('active');
        }
    });
    // Change section ui
    imgInputGroups.forEach((elem) => {
        elem.classList.add('!!hidden');
        if (elem.classList.contains(typeChoosePhotoState)) {
            elem.classList.remove('!!hidden');
        }
    });

    // Load photo preview url
    const loader = document.getElementById('url-input-loader');
    if (loader) {
        loader.classList.add('opacity-100');
    }
    checkImage(urlInput.value, 5000)
        .then(() => {
            urlPreview.src = urlInput.value;
            urlInput.classList.remove('invalid');
        })
        .catch((msg) => {
            urlPreview.src = placeholderImg;
            urlInput.classList.add('invalid');
            if (msg === 'timeout') {
                createToast('warning', 'L???i ki???m tra ???nh', 'Kh??ng th??? ki???m tra ???nh', 5000);
            }
        })
        .finally(() => {
            if (loader) {
                loader.classList.remove('opacity-100');
            }
            checkCanSubmit();
        });

    // Load photo preview file
    filePreview.src = placeholderImg;

    //* Call api

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const headers = {};
    if (userState) {
        const token = userState.accessToken;
        headers.Authorization = 'Bearer ' + token;
    }

    fetch(`${import.meta.env.VITE_API_URL}/photo/${id}`, { headers })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                if (!data.photo.user || (userState && data.photo.user.uid === userState.uid)) {
                    photoState = data.photo;
                    document.getElementById('edit-photo-grid').classList.remove('!hidden');
                    document.getElementById('error-section').classList.add('!hidden');

                    changePhotoStateUI();
                } else {
                    createToast('error', 'L???i truy c???p', 'Kh??ng th??? ch???nh s???a ???nh n??y', 4000);
                    document.getElementById('edit-photo-grid').classList.add('!hidden');
                    document.getElementById('error-section').classList.remove('!hidden');
                }
            } else {
                switch (data.error.code) {
                    case 'INVALID_ID':
                        createToast(
                            'error',
                            'Sai ???????ng d???n',
                            '???????ng d???n kh??ng ????ng, vui l??ng ki???m tra l???i.',
                            5000
                        );
                        break;
                    case 'PHOTO_ID_NOT_FOUND':
                        createToast(
                            'error',
                            'L???i ???nh',
                            'Kh??ng t??m th???y ???nh, vui l??ng ki???m tra l???i.',
                            5000
                        );
                        break;
                    case 'PHOTO_NOT_PUBLIC':
                        createToast(
                            'error',
                            'L???i truy c???p',
                            '???nh kh??ng c??ng khai, vui l??ng d??ng t??i kho???n ch??nh ch???.',
                            5000
                        );
                        break;
                    case 'PHOTO_CAN_NOT_ACCESS':
                        createToast(
                            'error',
                            'L???i truy c???p',
                            '???nh kh??ng c??ng khai, kh??ng th??? truy c???p ???nh b???ng t??i kho???n n??y.',
                            5000
                        );
                        break;
                    case 'INTERNAL_SERVER_ERROR':
                        createToast('error', 'L???i', 'C?? l???i x???y ra.', 5000);
                        break;
                    default:
                        break;
                }
                document.getElementById('edit-photo-grid').classList.add('!hidden');
                document.getElementById('error-section').classList.remove('!hidden');
            }
        })
        .catch((e) => {
            console.log(e);
            createToast('error', 'L???i', 'Vui l??ng ki???m tra k???t n???i m???ng.', 5000);
            document.getElementById('edit-photo-grid').classList.add('!hidden');
            document.getElementById('error-section').classList.remove('!hidden');
        })
        .finally(() => {
            checkCanSubmit();
        });
};

//* CHANGE PHOTO STATE
function changePhotoStateUI() {
    // Change img
    currentImgElem.src = photoState.url;

    // Change input
    titleInput.value = photoState.title;
    descriptionInput.value = photoState.description;
    const audiences = document.querySelectorAll('input[name="audience"]');
    if (!photoState.user) {
        audiences.forEach((elem) => {
            if (elem.value === 'public') {
                elem.checked = true;
            } else {
                elem.checked = false;
                elem.disabled = true;
            }
        });
    } else {
        audiences.forEach((elem) => {
            elem.disabled = false;
            elem.checked = false;
            const audicenceValue = photoState.public ? 'public' : 'private';
            if (elem.value === audicenceValue) {
                elem.checked = true;
            }
        });
    }
}

//* CHECK VALID AND DISABLE SUBMIT BTN
function checkCanSubmit() {
    if (currentPhotoState === false) {
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
            elem.classList.add('!!hidden');
            if (elem.classList.contains(typeChoosePhotoState)) {
                elem.classList.remove('!!hidden');
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
                    'Kh??ng th??? ki???m tra ???nh',
                    'Vui l??ng ki???m tra ???????ng d???n ho???c k???t n???i m???ng.',
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
        fileNameElem && (fileNameElem.innerHTML = 'Kh??ng c?? ???nh ???????c ch???n');
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
                    'Kh??ng th??? ki???m tra ???nh',
                    'Vui l??ng ki???m tra file ho???c k???t n???i m???ng.',
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
        loader.classList.remove('!hidden');
    }
    const dataForm = {};
    const check = checkCanSubmit();
    if (!check) {
        console.log('invalid');
        submitBtn.disabled = false;
        if (loader) {
            loader.classList.add('!hidden');
        }
        return;
    }

    // Photo
    if (!currentPhotoState) {
        if (typeChoosePhotoState === 'file') {
            if (!fileInput.files.length === 0) {
                createToast('error', 'L???i ???nh', 'C?? l???i t??? file ???nh!', 5000);

                submitBtn.disabled = false;
                if (loader) {
                    loader.classList.add('!hidden');
                }
                return;
            }

            try {
                dataForm.photo = await toBase64(fileInput.files[0]);
            } catch (error) {
                createToast('error', 'L???i ???nh', 'C?? l???i t??? file ???nh!', 5000);

                submitBtn.disabled = false;
                if (loader) {
                    loader.classList.add('!hidden');
                }
                return;
            }
        } else {
            dataForm.photo = urlInput.value;
        }
    }

    // Title
    dataForm.title = titleInput.value;

    // Description
    dataForm.description = descriptionInput.value;

    // Audience
    const audience = document.querySelector('input[name="audience"]:checked');
    if (audience) {
        if (audience.value === 'public') {
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

    fetch(`${import.meta.env.VITE_API_URL}/photo/${photoState._id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(dataForm),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                createToast('success', 'Th??nh c??ng', 'Ch???nh s???a ???nh th??nh c??ng.', 5000);
                photoState = data.photo;
            } else {
                createToast('error', 'L???i ch???nh s???a ???nh', 'Ch???nh s???a ???nh kh??ng th??nh c??ng.', 5000);
            }
        })
        .catch((e) => {
            console.log(e);
            createToast('error', 'L???i', 'Kh??ng th??? ch???nh s???a ???nh', 5000);
        })
        .finally(() => {
            submitBtn.disabled = false;
            if (loader) {
                loader.classList.add('!hidden');
            }
            changePhotoStateUI();
            currentImgSectionElem.classList.remove('!!hidden');
            editImgSectionElem.classList.add('!!hidden');
            currentPhotoState = true;
        });
});

//* HANDLE EDIT IMG BTN
editImgBtn.addEventListener('click', () => {
    currentImgSectionElem.classList.add('!!hidden');
    editImgSectionElem.classList.remove('!!hidden');
    currentPhotoState = false;
    checkCanSubmit();
});
cancelEditImgBtn.addEventListener('click', () => {
    currentImgSectionElem.classList.remove('!!hidden');
    editImgSectionElem.classList.add('!!hidden');
    currentPhotoState = true;
    checkCanSubmit();
});

//* HANDLE CANCLE BTN
cancelBtn.addEventListener('click', () => {
    window.history.back();
});

//* HANDLE DELETE IMG BTN
deleteBtn.addEventListener('click', () => {
    //* CREATE DIALOG
    createDialog(/*html*/ `
        <div class="p-body">
            <div class="max-w-[28rem] min-w-[19rem] rounded-lg bg-white p-6">
                <div class="font-bold text-clr-text-dark">B???n c?? ch???c ch???n mu???n xo?? kh??ng?</div>
                <p class="mt-4 text-sm">L??u ??: B???n kh??ng th??? kh??ng ph???c l???i ???nh sau khi xo??!</p>
                <div class="mt-4 sm:flex">
                    <button id="cancel-delete-btn" class="btn btn-outline btn-md w-full sm:w-auto">Kh??ng</button>
                    <button
                        id="confirm-delete-btn"
                        class="btn btn-fill btn-md mt-2 w-full bg-red-500 hover:bg-red-600 sm:mt-0 sm:ml-2 sm:w-auto"
                    >
                        <div class="loading left-2 mr-2 !hidden animate-spin text-lg">
                            <i class="fa-solid fa-spinner"></i>
                        </div>
                        <span class="whitespace-nowrap">Xo??</span>
                    </button>
                </div>
            </div>
        </div>
    `);
    openDialog();
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const loader = confirmDeleteBtn.querySelector('.loading');
    cancelDeleteBtn.addEventListener('click', () => closeDialog());

    //* HANDLE CONFIRM DELTE
    confirmDeleteBtn.addEventListener('click', () => {
        loader.classList.remove('!hidden');
        confirmDeleteBtn.disabled = true;

        const headers = {};
        if (userState) {
            const token = userState.accessToken;
            headers.Authorization = 'Bearer ' + token;
        }
        fetch(`${import.meta.env.VITE_API_URL}/photo/${photoState._id}`, {
            method: 'DELETE',
            headers,
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    console.log('Xo?? th??nh c??ng');
                    createDialogAfterDelete();
                } else {
                    closeDialog();
                    createToast('error', 'L???i xo?? ???nh', 'Xo?? ???nh kh??ng th??nh c??ng.', 5000);
                }
            })
            .catch((e) => {
                console.log(e);
                closeDialog();
                createToast('error', 'L???i', 'Kh??ng th??? xo?? ???nh', 5000);
            })
            .finally(() => {
                if (loader) {
                    loader.classList.add('!hidden');
                }
                if (confirmDeleteBtn) {
                    confirmDeleteBtn.disabled = false;
                }
            });
    });

    function createDialogAfterDelete() {
        createDialog(
            /*html*/ `
            <div class="p-body">
                <div class="max-w-[28rem] min-w-[19rem] rounded-lg bg-white p-6">
                    <div class="font-bold text-clr-text-dark">???? xo?? ???nh</div>
                    <p class="mt-4 text-sm">B???n c?? th??? v??? trang ch???!</p>
                    <div class="mt-4 sm:flex">
                        <a href="/" class="btn btn-fill btn-md w-full sm:w-auto">V??? trang ch???</a>
                    </div>
                </div>
            </div>
        `,
            false
        );
    }
});
