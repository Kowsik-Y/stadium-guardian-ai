const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex >= 0,
  );
}

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
