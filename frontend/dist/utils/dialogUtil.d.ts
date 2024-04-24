/**
 * Modifies the default behavior of a PrimeVue dialog to allow closing the dialog by clicking on the overlay.
 * This function attaches a click event listener to the mask of the dialog which triggers the dialog's `close` method when the mask itself is clicked.
 *
 * @param {any} ref - The reference to the PrimeVue dialog component. This reference must provide access to both the mask element via `ref.mask` and the close method via `ref.close`.
 *
 * @example
 * ```html
 * <!-- PrimeVue Dialog with external overlay click listener for closing -->
 * <Dialog modal ref="dialog" @show="addListenerOnDialogueOverlay(dialog)">
 * </Dialog>
 * ```
 */
export declare function addListenerOnDialogueOverlay(ref: any): void;
