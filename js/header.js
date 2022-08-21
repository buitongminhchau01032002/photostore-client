import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from 'firebase/auth';
import tippy from 'tippy.js/headless';
import 'tippy.js/dist/tippy.css'; // optional for styling
import { initDialog, createDialog, openDialog, closeDialog } from '../js/dialog';
import { initToast, createToast } from '../js/toast';

initDialog();
initToast();

const handleHeader = (app) => {
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();

    //* Tippy
    const accountTippy = tippy('#header-account', {
        content: /*html*/ `
            <div class="stack w-full items-center">
                <img
                    src="/assets/placeholder.png"
                    alt="avatar"
                    class="h-14 w-14 rounded-full"
                />
                <div class="font-semibold text-clr-text-dark">Display name</div>
                <div class="text-sm font-medium text-clr-text">@username</div>
                <button class="btn btn-fill btn-md mt-4 w-full">
                    Quản lý tài khoản
                </button>
                <button class="btn btn-outline btn-md mt-2 w-full">Đăng xuất</button>
            </div>
        `,
        trigger: 'click',
        interactive: 'true',
        appendTo: 'parent',
        placement: 'bottom-end',
        render(instance) {
            // The recommended structure is to use the popper as an outer wrapper
            // element, with an inner `box` element
            const popper = document.createElement('div');
            popper.className =
                'sx:!fixed sx:!left-0 sx:!right-0 sx:!translate-y-0 sx:!top-h-header';
            const box = document.createElement('div');

            popper.appendChild(box);

            box.className =
                'stack shadow-popper w-full items-center rounded-lg bg-white p-4 sm:w-80';
            box.innerHTML = instance.props.content;

            function onUpdate(prevProps, nextProps) {
                // DOM diffing
                if (prevProps.content !== nextProps.content) {
                    box.innerHTML = nextProps.content;
                }
            }

            // Return an object with two properties:
            // - `popper` (the root popper element)
            // - `onUpdate` callback whenever .setProps() or .setContent() is called
            return {
                popper,
                onUpdate, // optional
            };
        },
        onMount(instance) {
            const signoutBtn = document.getElementById('header-account-signout-btn');
            console.log(signoutBtn);
            if (signoutBtn) {
                signoutBtn.onclick = () => {
                    instance.hide();
                    signOut(auth)
                        .then(() => {
                            createToast('info', 'Thông báo', 'Đã đăng xuất', 3000);
                        })
                        .catch((error) => {
                            console.log('// An error happened.');
                        });
                };
            }
        },
    })[0];

    //Handle animation header
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

    // ===================
    function handleUser() {
        if (!app) {
            return;
        }
        const loginBtn = document.getElementById('header-login-btn');

        if (!loginBtn) {
            return;
        }

        loginBtn.addEventListener('click', () => {
            createDialog(/*html*/ `
                <div class="p-body w-full max-w-[28rem]">
                    <div class="w-full rounded-lg bg-white p-6 stack items-center">
                        <div class="font-bold text-clr-text-dark">Đăng nhập</div>
                        <p class="mt-4 text-sm">Chọn phương thức đăng nhập</p>
                        <button 
                            id="signin-with-google-btn" 
                            class="btn btn-md btn-fill mt-8 w-full sm:w-auto"
                        >
                            Đăng nhập bằng Google
                        </button>
                    </div>
                </div>
            `);
            openDialog();

            const signinWithGoogleBtn = document.getElementById('signin-with-google-btn');
            signinWithGoogleBtn.addEventListener('click', () => {
                signInWithPopup(auth, googleProvider)
                    .then((result) => {
                        closeDialog();
                        createToast('success', 'Thành công', 'Đăng nhập thành công', 3000);
                    })
                    .catch((error) => {
                        // Handle Errors here.
                        const errorCode = error.code;
                        const errorMessage = error.message;
                        // The email of the user's account used.
                        const email = error.customData.email;
                        // The AuthCredential type that was used.
                        const credential = GoogleAuthProvider.credentialFromError(error);
                        // ...
                        console.log({
                            errorCode,
                            errorMessage,
                            email,
                            credential,
                        });
                        closeDialog();
                        createToast('error', 'Thất bại', 'Đăng nhập không thành công', 3000);
                    });
            });
        });
    }
    handleUser();

    onAuthStateChanged(auth, (user) => {
        const loginBtn = document.getElementById('header-login-btn');
        const accountElem = document.getElementById('header-account');
        const actionPlaceholder = document.getElementById('header-action-placeholder');
        if (actionPlaceholder) {
            actionPlaceholder.classList.add('hidden');
        }
        if (!loginBtn || !accountElem) {
            return;
        }
        if (user) {
            loginBtn.classList.add('hidden');
            accountElem.classList.add('flex');
            accountElem.classList.remove('hidden');

            const token = user.accessToken;

            fetch(`${import.meta.env.VITE_API_URL}/user`, {
                headers: {
                    Authorization: 'Bearer ' + token,
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        accountTippy.setContent(/*html*/ `
                            <div class="stack w-full items-center">
                                <img
                                    src="${data.user.avatar}"
                                    alt="avatar"
                                    class="h-14 w-14 rounded-full"
                                />
                                <div class="font-semibold text-clr-text-dark">${data.user.displayName}</div>
                                <div class="text-sm font-medium text-clr-text">@${data.user.username}</div>
                                <button class="btn btn-fill btn-md mt-4 w-full">
                                    Quản lý tài khoản
                                </button>
                                <button
                                    id="header-account-signout-btn"
                                    class="btn btn-outline btn-md mt-2 w-full"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        `);

                        accountElem.innerHTML = /*html*/ `
                            <div class="mr-2 hidden text-right md:block">
                                <div class="text-sm font-semibold text-clr-text-dark">${data.user.displayName}</div>
                                <div class="text-xs font-medium text-clr-text">@${data.user.username}</div>
                            </div>
                            <div class="h-[38px] w-[38px] rounded-full shadow-sm shadow-gray-500">
                                <img
                                    src="${data.user.avatar}"
                                    alt="avatar"
                                    class="h-full w-full rounded-full object-cover"
                                />
                            </div>
                        `;
                    } else {
                        console.log(data);
                    }
                })
                .catch((e) => {
                    console.log(e);
                });

            // ...
        } else {
            // User is signed out
            // ...
            console.log('State: Logouted');
            loginBtn.classList.remove('hidden');
            accountElem.classList.add('hidden');
            accountElem.classList.remove('flex');
        }
    });
};

export default handleHeader;
