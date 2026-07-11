/**
 * CSS selector that matches all standard focusable HTML elements.
 * Excludes elements with tabindex="-1" (programmatically focusable only)
 * and disabled form controls to match browser Tab-key behaviour exactly.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * Returns all keyboard-focusable descendant elements of `container` in
 * DOM order, respecting the browser's natural Tab sequence.
 *
 * Used by the mobile drawer focus-trap to determine the first and last
 * tabbable elements so Tab wrapping can be calculated correctly.
 *
 * @param container - The DOM element to search within.
 * @returns Array of focusable HTMLElements in document order.
 */
export function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex >= 0,
  );
}

/**
 * Traps keyboard Tab/Shift-Tab navigation within `container`.
 *
 * When the user presses Tab on the last focusable element the focus wraps
 * to the first, and vice-versa for Shift-Tab. This keeps assistive-tech
 * users inside modal dialogs (e.g. the mobile navigation drawer) until
 * they explicitly close it via Escape.
 *
 * @param container - The element acting as the modal boundary.
 * @param event - The keydown KeyboardEvent to intercept.
 * @returns `true` if the event was handled (and default prevented), `false` otherwise.
 */
export function trapFocusWithinContainer(container: HTMLElement, event: KeyboardEvent) {
  if (event.key !== 'Tab') {
    return false;
  }

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) {
    return false;
  }

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  if (event.shiftKey) {
    if (!container.contains(activeElement) || activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus();
      return true;
    }

    return false;
  }

  if (!container.contains(activeElement) || activeElement === lastFocusable) {
    event.preventDefault();
    firstFocusable.focus();
    return true;
  }

  return false;
}
