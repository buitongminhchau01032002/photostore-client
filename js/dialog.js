let dialogContainerElem;

function initDialog() {
    dialogContainerElem = document.getElementById('dialog-container');
    if (dialogContainerElem) {
        return;
    }
    dialogContainerElem = document.createElement('div');
    dialogContainerElem.id = 'dialog-container';
    dialogContainerElem.className =
        'invisible opacity-0 fixed inset-0 z-dialog flex items-center justify-center bg-black/20 transition-opacity';
    document.body.append(dialogContainerElem);
}

function createDialog(innerHTML, closeWhenClickOutside = true) {
    dialogContainerElem.innerHTML = innerHTML;
    const childs = dialogContainerElem.childNodes;
    childs.forEach((element) => {
        element.addEventListener('click', (e) => e.stopPropagation());
    });
    if (closeWhenClickOutside) {
        dialogContainerElem.onclick = closeDialog;
    } else {
        dialogContainerElem.onclick = () => {};
    }
}

function closeDialog() {
    if (dialogContainerElem) {
        dialogContainerElem.classList.add('invisible');
        dialogContainerElem.classList.add('opacity-0');
    }
}
function openDialog() {
    if (dialogContainerElem) {
        dialogContainerElem.classList.remove('invisible');
        dialogContainerElem.classList.remove('opacity-0');
    }
}

export { initDialog, createDialog, closeDialog, openDialog };
