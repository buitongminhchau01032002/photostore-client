let toastContainerElem;

function initToast() {
    toastContainerElem = document.getElementById('toast-container');
    if (toastContainerElem) {
        return;
    }
    toastContainerElem = document.createElement('div');
    toastContainerElem.id = 'toast-container';
    toastContainerElem.className =
        'fixed flex flex-col-reverse sm:flex-col left-0 sm:left-auto bottom-0 sm:bottom-auto sm:top-0 right-0 z-toast sm:m-6 sm:[&>div]:mb-2';
    document.body.append(toastContainerElem);
}

function createToast(type = 'success', title = '', description = '', duration = 5000) {
    const delayExit = 400;
    let iconHtml;
    let colorClass;
    let colorMobile;
    switch (type) {
        case 'error':
            iconHtml = '<i class="fa-solid fa-circle-xmark"></i>';
            colorClass = 'bg-red-400';
            colorMobile = 'bg-red-600';
            break;
        case 'warning':
            iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
            colorClass = 'bg-yellow-400';
            colorMobile = 'bg-yellow-600';

            break;
        case 'success':
            iconHtml = '<i class="fa-solid fa-circle-check"></i>';
            colorClass = 'bg-green-400';
            colorMobile = 'bg-green-600';
        case 'info':
            iconHtml = '<i class="fa-solid fa-circle-info"></i>';
            colorClass = 'bg-blue-400';
            colorMobile = 'bg-blue-600';

            break;
        default:
            return;
    }

    const toastInnerHtml = /*html*/ `
        <div
            class="hidden sm:flex h-full w-9 items-center justify-center ${colorClass} text-xl text-white"
        >
            ${iconHtml}
        </div>
        <div class="hidden sm:stack flex-1 justify-center px-3 relative">
            <div class="font-bold text-clr-text-dark">${title}</div>
            <div class="leading-4">${description}</div>
            <div
                class="absolute h-0.5 ${colorClass} bottom-0 right-0 left-0 origin-left" 
                style="animation: timeline-toast ${duration}ms linear forwards"
            ></div>
        </div>
        <button class="hidden sm:inline-block close-btn absolute right-2 text-lg hover:opacity-60">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- Mobile obly -->
        <div class="w-full h-full px-4 text-center flex justify-center items-center sm:hidden text-white text-[0.8125rem] ${colorMobile}">
            ${title + ': ' + description}
        </div>
    `;
    const toastElem = document.createElement('div');
    toastElem.className =
        'toast-init-anim relative flex h-h-toast w-full sm:w-80 overflow-hidden sm:rounded-md bg-white text-sm shadow-lg';
    toastElem.innerHTML = toastInnerHtml;
    toastContainerElem.append(toastElem);

    const exitToast = () => {
        if (toastElem) {
            toastElem.classList.add('toast-exit-anim');
        }
        setTimeout(() => {
            if (toastElem) {
                toastElem.remove();
            }
            console.log('remove');
        }, delayExit);
    };

    const closeBtn = toastElem.querySelector('.close-btn');
    const handleCloseBtn = () => {
        closeBtn.removeEventListener('click', handleCloseBtn);
        console.log('click close');
        exitToast();
    };
    closeBtn.addEventListener('click', handleCloseBtn);

    setTimeout(exitToast, duration);
}

export { initToast, createToast };
