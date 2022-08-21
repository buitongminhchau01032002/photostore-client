import handleMenu from './js/menu';
import handleHeader from './js/header';
import createPlaceholderImage from './js/image';
import { initToast, createToast } from './js/toast';
import avatarNoneUser from './assets/avatar_none_user.png';

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
createPlaceholderImage('img');
initToast();
let imgListState = [];

const imgListElem = document.getElementById('img-list');

const analysisPlaceholder = document.getElementById('banner-analysis-placeholder');
const analysis = document.getElementById('banner-analysis');

function getAnalysis() {
    fetch(`${import.meta.env.VITE_API_URL}/analysis`)
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                analysisPlaceholder.classList.add('!hidden');
                analysis.className = 'mt-2 flex justify-center md:mt-4';
                analysis.innerHTML = /*html*/ `
                    <div class="stack mx-0.5 w-28 items-center">
                        <span class="text-[2rem] font-light text-primary">${data?.analysis?.photoCount}</span>
                        <span class="text-center text-sm">Ảnh đã tải lên</span>
                    </div>
                    <div class="stack mx-0.5 w-28 items-center">
                        <span class="text-[2rem] font-light text-primary">${data?.analysis?.userCount}</span>
                        <span class="text-center text-sm">Người đăng ký</span>
                    </div>
                `;
            }
        })
        .catch((e) => console.log(e));
}
getAnalysis();

onAuthStateChanged(auth, (user) => {
    let headers = {};
    if (user) {
        const token = user.accessToken;
        headers.Authorization = 'Bearer ' + token;
    }
    fetch(`${import.meta.env.VITE_API_URL}/photo`, { headers })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                imgListState = data.photos;
                renderImgs();
                createPlaceholderImage('img');
            } else {
                createToast('error', 'Lỗi', 'Có lỗi xảy ra, vui lòng thử lại.', 5000);
                const errorHtml = createErrorHtml();
                imgListElem.innerHTML = errorHtml;
            }
        })
        .catch((e) => {
            console.log(e);
            createToast(
                'error',
                'Lỗi',
                'Không tải được ảnh, vui lòng kiểm tra kết nối mạng.',
                5000
            );
            const errorHtml = createErrorHtml();
            imgListElem.innerHTML = errorHtml;
        });
});

// Create html
function renderImgs() {
    if (!imgListElem) {
        return;
    }
    const html = imgListState.map((imageDate) => createImgCard(imageDate)).join('');
    imgListElem.innerHTML = html;
}

function createImgCard(imageData) {
    const userHtmlCanHover = imageData.user
        ? /*html*/ `
            <a href="#user" class="group inline-flex cursor-pointer items-center">
                <img
                    src="${imageData.user.avatar || ''}"
                    alt="avatar"
                    class="h-6 w-6 rounded-full bg-white border border-light-gray object-cover"
                />
                <p
                    class="group-hover ml-2 text-sm font-semibold text-primary group-hover:text-primary-hover"
                >
                    ${imageData.user.displayName || ''}
                </p>
            </a>`
        : /*html*/ `
            <div class="inline-flex items-center">
                <img
                    src="${avatarNoneUser}"
                    alt="avatar"
                    class="h-6 w-6 opacity-90 rounded-full bg-white border border-light-gray object-cover"
                />
                <p class="group-hover ml-2 text-sm font-semibold text-white/70">Cộng đồng</p>
            </div>
        `;
    const userHtmlCanNotHover = imageData.user
        ? /*html*/ `
            <a href="#user" class="group inline-flex cursor-pointer items-center">
                <img
                    src="${imageData.user.avatar || ''}"
                    alt="avatar"
                    class="h-6 w-6 rounded-full bg-white border border-light-gray object-cover"
                />
                <p
                    class="group-hover ml-2 text-sm font-semibold text-primary group-hover:text-primary-hover"
                >
                    ${imageData.user.displayName || ''}
                </p>
            </a>`
        : /*html*/ `
            <div class="inline-flex items-center">
                <img
                    src="${avatarNoneUser}"
                    alt="avatar"
                    class="h-6 w-6 rounded-full bg-white border border-light-gray object-cover"
                />
                <p class="group-hover ml-2 text-sm font-semibold text-clr-text">Cộng đồng</p>
            </div>
        `;
    return /*html*/ `
        <div class="img-card">
            <a
                href="/photo/?id=${imageData._id || ''}"
                class="block aspect-[4/3] cursor-pointer overflow-hidden sm:rounded-lg select-none"
            >
                <img
                    src="${imageData.url || ''}"
                    alt="image"
                    class="h-full w-full object-cover object-center"
                />
            </a>

            <!--* Content in screen can not hover  -->
            <div class="not-hover flex items-start p-2 sm:pb-0">
                <div class="stack flex-1">
                    <!--* user  -->
                    ${userHtmlCanNotHover}

                    <a
                        href="/photo/?id=${imageData._id || ''}"
                        class="pt-1 pb-2 text-sm font-bold text-clr-text-dark"
                    >
                        <h3>${imageData.title || ''}</h3>
                    </a>
                </div>
                <button class="btn btn-md btn-fill btn-square ml-1 mt-2 text-base">
                    <i class="fa-solid fa-download"></i>
                </button>
            </div>

            <!--* Content in screen can hover  -->
            <div
                class="overlay stack absolute inset-0 rounded-lg bg-gradient-to-t from-black/80 via-black/20 to-black/0 opacity-0 transition-opacity hover:opacity-100"
            >
                <a href="/photo/?id=${imageData._id || ''}" class="flex-1"></a>
                <div class="flex items-end px-2 pt-2">
                    <div class="stack flex-1">
                        <!--* User -->
                        ${userHtmlCanHover}
                        <a
                            href="/photo/?id=${imageData._id || ''}"
                            class="cursor-pointer pt-1 pb-2 text-sm font-bold text-white hover:text-white/90"
                        >
                            <h3>${imageData.title || ''}</h3>
                        </a>
                    </div>
                    <button class="btn btn-md btn-fill btn-square mb-2 ml-1 text-base">
                        <i class="fa-solid fa-download"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
}

function createErrorHtml() {
    return /*html*/ `
        <div class="stack items-center pt-11 sm:col-span-2 md:col-span-3 lg:col-span-4">
            <h2 class="text-primary font-light text-2xl">Ồ, có gì đó không đúng!</h2>
            <p class="mt-5 max-w-2xl text-center p-body">Không thể hiển thị ảnh. Hãy kiểm tra kết nối và thử lại</p>
        </div>
    `;
}
