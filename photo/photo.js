import handleHeader from '../js/header';
import handleMenu from '../js/menu';
import createPlaceholderImage from '../js/image';
import { initToast, createToast } from '../js/toast';
import { initDialog, createDialog, openDialog, closeDialog } from '../js/dialog';
import avatarNoneUser from '../assets/avatar_none_user.png';

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

createPlaceholderImage('img');
handleMenu();
handleHeader(app);
initToast();
initDialog();

let photoState = {};
let userState = null;
let idPhoto;
const photoSectionElem = document.getElementById('photo-section');

onAuthStateChanged(auth, (user) => {
    if (user) {
        userState = user;
    } else {
        userState = null;
    }
    loadImg();
});

function loadImg() {
    const params = new URLSearchParams(window.location.search);
    idPhoto = params.get('id');

    const headers = {};
    if (userState) {
        const token = userState.accessToken;
        headers.Authorization = 'Bearer ' + token;
    }

    fetch(`${import.meta.env.VITE_API_URL}/photo/${idPhoto}`, { headers })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                const photoGridElem = createHtml(data.photo);
                photoSectionElem.innerHTML = photoGridElem;
                createPlaceholderImage('img');
                handleDeleteBtn();
                const downloadBtn = document.getElementById('download-btn');
                if (downloadBtn) {
                    downloadBtn.onclick = () => {
                        downloadImage(data.photo.url, data.photo.title);
                    };
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
                const errorHtml = createErrorHtml();
                photoSectionElem.innerHTML = errorHtml;
            }
        })
        .catch((e) => {
            console.log(e);
            createToast('error', 'L???i', 'Vui l??ng ki???m tra k???t n???i m???ng.', 5000);
            const errorHtml = createErrorHtml();
            photoSectionElem.innerHTML = errorHtml;
        });
}

function handleDeleteBtn() {
    //* HANDLE DELETE IMG BTN
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
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
                                <div class="loading left-2 mr-2 hidden animate-spin text-lg">
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
                loader.classList.remove('hidden');
                confirmDeleteBtn.disabled = true;

                const headers = {};
                if (userState) {
                    const token = userState.accessToken;
                    headers.Authorization = 'Bearer ' + token;
                }
                fetch(`${import.meta.env.VITE_API_URL}/photo/${idPhoto}`, {
                    method: 'DELETE',
                    headers,
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.success) {
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
                            loader.classList.add('hidden');
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
    }
}

function createHtml(photo) {
    const userHtml = photo.user
        ? /*html*/ `
        <a href="#/user" class="group flex sm:inline-flex">
            <div class="h-[34px] w-[34px] rounded-full shadow-sm shadow-gray-500">
                <img
                    src="${photo.user.avatar || ''}"
                    alt="avatar"
                    class="h-full w-full rounded-full object-cover border border-light-gray"
                />
            </div>
            <div class="stack ml-2 justify-center">
                <div
                    class="text-sm font-semibold text-primary group-hover:text-primary-hover"
                >
                    ${photo.user.displayName || ''}
                </div>
                <div class="text-xs font-medium text-clr-text">${
                    '@' + (photo.user.username || '')
                }</div>
            </div>
        </a>
        `
        : /*html*/ `
        <div href="#/user" class="flex">
            <div class="h-[34px] w-[34px] rounded-full shadow-sm shadow-gray-500">
                <img
                    src="${avatarNoneUser}"
                    alt="avatar"
                    class="h-full w-full rounded-full object-cover border border-light-gray"
                />
            </div>
            <div class="stack ml-2 justify-center">
                <div class="text-sm font-semibold text-clr-text">C???ng ?????ng</div>
            </div>
        </div> 
        `;

    let privateActionHtml;
    if (!photo.user || (userState && photo.user.uid === userState.uid)) {
        privateActionHtml = /*html*/ `
        <a href="/edit/?id=${photo._id}" class="btn btn-md btn-outline sm:btn-lg btn-square ml-2">
            <i class="fa-solid fa-pen"></i>
        </a>
        <button
            id="delete-btn"
            class="btn btn-md btn-outline sm:btn-lg btn-square ml-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
        >
            <i class="fa-solid fa-trash-can"></i>
        </button>
        `;
    } else {
        privateActionHtml = '';
    }

    return /*html*/ `
        <div class="md:p-body container-grid sm:mt-4 md:mt-6 md:grid-cols-2">
        <!--* LEFT GROUP -->
        <div class="sm:p-body flex w-full justify-center md:px-0">
            <img
                class="max-h-[calc(100vh_-_var(--h-wrap-header))] sm:max-h-[calc(100vh_-_var(--h-wrap-header)_-_16px)] sm:rounded-lg md:max-h-[calc(100vh_-_var(--h-wrap-header)_-_24px)]"
                src="${photo.url || ''}"
                alt="Photo"
            />
        </div>
        <!--* RIGHT GROUP -->
        <div class="p-body md:px-0">
            <h2 class="mt-2 text-lg font-bold text-clr-text-dark md:mt-0">
                ${photo.title || ''}
            </h2>
            <p class="mt-1 mb-4 text-justify text-sm">
                ${photo.description || ''}
            </p>
            ${userHtml}

            <div>
                <div class="mt-7 flex sm:inline-flex">
                    <button
                        id="download-btn"
                        class="btn btn-md btn-fill sm:btn-lg flex-1 sm:w-52 sm:flex-initial"
                    >
                        T???i xu???ng
                    </button>
                    ${privateActionHtml}
                </div>
            </div>
        </div>
    </div>
    `;
}

function createErrorHtml() {
    return /*html*/ `
        <div class="stack items-center pt-11">
            <h2 class="text-primary font-light text-2xl">???, c?? g?? ???? kh??ng ????ng!</h2>
            <p class="mt-5 max-w-2xl text-center p-body">Kh??ng th??? hi???n th??? ???nh. C?? th??? do k???t n???i, ???????ng d???n kh??ng ????ng, ???nh ???? b??? xo?? ho???c b???n kh??ng c?? quy???n truy c???p ???nh n??y!</p>
            <div class="p-body mt-6">
                <a href="/" class="btn btn-md btn-fill w-full sm:w-auto">V??? trang ch???</a>
            </div>
        </div>
    `;
}

async function downloadImage(imageSrc, title) {
    const image = await fetch(imageSrc);
    const imageBlog = await image.blob();
    const imageURL = URL.createObjectURL(imageBlog);

    const link = document.createElement('a');
    link.href = imageURL;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
