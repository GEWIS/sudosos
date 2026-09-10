/**
 * Helpers that make the system on-screen keyboard appear on the kiosk.
 */

const TEXTUAL_INPUT_TYPES = new Set(['text', 'number']);

export type EditableElement = HTMLInputElement | HTMLTextAreaElement;

/** Whether this element accepts typed characters right now. */
export function isEditableElement(node: EventTarget | null): node is EditableElement {
  if (node instanceof HTMLTextAreaElement) {
    return !node.readOnly && !node.disabled;
  }
  if (node instanceof HTMLInputElement) {
    return !node.readOnly && !node.disabled && TEXTUAL_INPUT_TYPES.has(node.type);
  }
  return false;
}

/**
 * Focuses an element the way the GNOME on-screen keyboard needs: blur first so
 * Firefox drops its IME, then focus on the next frame so Firefox re-announces an
 * editable field. Use this instead of a bare `element.focus()` everywhere focus
 * is set from code, including after an NFC scan and after a view transition.
 */
export function focusWithKeyboard(element: HTMLElement | null | undefined, options?: FocusOptions): void {
  if (!element) return;

  const active = document.activeElement;

  if (active instanceof HTMLElement) {
    active.blur();
  }

  requestAnimationFrame(() => {
    element.focus(options);
  });
}

/**
 * Blurs the focused input when a tap lands on a *different* input, so the tap
 * itself produces the not-editable to editable flip. Without this, moving
 * between two fields without dismissing the keyboard leaves it hidden.
 */
export function installKeyboardFocusBridge(): () => void {
  const onPointerDown = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const field = target.closest('input, textarea');
    if (!isEditableElement(field)) {
      return;
    }

    const active = document.activeElement;
    if (active === field || !isEditableElement(active)) return;

    active.blur();
  };

  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('touchstart', onPointerDown, true);

  return () => {
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('touchstart', onPointerDown, true);
  };
}
