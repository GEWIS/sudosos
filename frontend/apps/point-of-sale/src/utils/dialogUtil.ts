export function addListenerOnDialogueOverlay(ref: any) {
    ref.mask.addEventListener('click', function (event: any) {
        if (event.target === ref.mask) ref.close();
    });
}
