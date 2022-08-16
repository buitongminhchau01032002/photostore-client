import handleHeader from '../js/header';
import handleMenu from '../js/menu';
import createPlaceholderImage from '../js/image';
import { initToast, createToast } from '../js/toast';
import { initDialog, createDialog, openDialog, closeDialog } from '../js/dialog';
import avatarNoneUser from '../assets/avatar_none_user.png';

createPlaceholderImage('img');
handleMenu();
handleHeader();
initToast();
initDialog();

let photoState = {};
let idPhoto;
const photoSectionElem = document.getElementById('photo-section');

function init() {
    const params = new URLSearchParams(window.location.search);
    idPhoto = params.get('id');

    fetch(`${import.meta.env.VITE_API_URL}/photo/${idPhoto}`)
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                const photoGridElem = createHtml(data.photo);
                photoSectionElem.innerHTML = photoGridElem;
                createPlaceholderImage('img');
                handleDeleteBtn();
            } else {
                console.log(data);
                switch (data.error.code) {
                    case 'INVALID_ID':
                        createToast(
                            'error',
                            'Sai đường dẫn',
                            'Đường dẫn không đúng, vui lòng kiểm tra lại.',
                            5000
                        );
                        break;
                    case 'PHOTO_ID_NOT_FOUND':
                        createToast(
                            'error',
                            'Lỗi ảnh',
                            'Không tìm thấy ảnh, vui lòng kiểm tra lại.',
                            5000
                        );
                        break;
                    case 'PHOTO_NOT_PUBLIC':
                        createToast(
                            'error',
                            'Lỗi truy cập',
                            'Ảnh không công khai, vui lòng dùng tài khoản chính chủ.',
                            5000
                        );
                        break;
                    case 'PHOTO_CAN_NOT_ACCESS':
                        createToast(
                            'error',
                            'Lỗi truy cập',
                            'Ảnh không công khai, không thể truy cập ảnh bằng tài khoản này.',
                            5000
                        );
                        break;
                    case 'INTERNAL_SERVER_ERROR':
                        createToast('error', 'Lỗi', 'Có lỗi xảy ra.', 5000);
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
            createToast('error', 'Lỗi', 'Vui lòng kiểm tra kết nối mạng.', 5000);
            const errorHtml = createErrorHtml();
            photoSectionElem.innerHTML = errorHtml;
        });
}
init();

function handleDeleteBtn() {
    //* HANDLE DELETE IMG BTN
    const deleteBtn = document.getElementById('delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            //* CREATE DIALOG
            createDialog(/*html*/ `
                <div class="p-body">
                    <div class="max-w-[28rem] min-w-[19rem] rounded-lg bg-white p-6">
                        <div class="font-bold text-clr-text-dark">Bạn có chắc chắn muốn xoá không?</div>
                        <p class="mt-4 text-sm">Lưu ý: Bạn không thể không phục lại ảnh sau khi xoá!</p>
                        <div class="mt-4 sm:flex">
                            <button id="cancel-delete-btn" class="btn btn-outline btn-md w-full sm:w-auto">Không</button>
                            <button
                                id="confirm-delete-btn"
                                class="btn btn-fill btn-md mt-2 w-full bg-red-500 hover:bg-red-600 sm:mt-0 sm:ml-2 sm:w-auto"
                            >
                                <div class="loading left-2 mr-2 hidden animate-spin text-lg">
                                    <i class="fa-solid fa-spinner"></i>
                                </div>
                                <span class="whitespace-nowrap">Xoá</span>
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
                console.log('xoa');
                loader.classList.remove('hidden');
                confirmDeleteBtn.disabled = true;
                //todo: call api
                fetch(`${import.meta.env.VITE_API_URL}/photo/${idPhoto}`, {
                    method: 'DELETE',
                })
                    .then((res) => res.json())
                    .then((data) => {
                        if (data.success) {
                            console.log('Xoá thành công');
                            createDialogAfterDelete();
                        } else {
                            closeDialog();
                            createToast('error', 'Lỗi xoá ảnh', 'Xoá ảnh không thành công.', 5000);
                        }
                    })
                    .catch((e) => {
                        console.log(e);
                        closeDialog();
                        createToast('error', 'Lỗi', 'Không thể xoá ảnh', 5000);
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
                            <div class="font-bold text-clr-text-dark">Đã xoá ảnh</div>
                            <p class="mt-4 text-sm">Bạn có thể về trang chủ!</p>
                            <div class="mt-4 sm:flex">
                                <a href="/" class="btn btn-fill btn-md w-full sm:w-auto">Về trang chủ</a>
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
                <div class="text-sm font-semibold text-clr-text">Cộng đồng</div>
            </div>
        </div> 
        `;

    let privateActionHtml;
    if (!photo.user) {
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
                        class="btn btn-md btn-fill sm:btn-lg flex-1 sm:w-52 sm:flex-initial"
                    >
                        Tải xuống
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
            <h2 class="text-primary font-light text-2xl">Ồ, có gì đó không đúng!</h2>
            <p class="mt-5 max-w-2xl text-center p-body">Không thể hiển thị ảnh. Có thể do kết nối, đường dẫn không đúng, ảnh đã bị xoá hoặc bạn không có quyền truy cập ảnh này!</p>
            <div class="p-body mt-6">
                <a href="/" class="btn btn-md btn-fill w-full sm:w-auto">Về trang chủ</a>
            </div>
        </div>
    `;
}
