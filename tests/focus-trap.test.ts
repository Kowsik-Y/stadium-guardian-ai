import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getFocusableElements, trapFocusWithinContainer } from '@/lib/focusTrap';

describe('Focus trap helpers', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <button type="button" id="first">First</button>
      <a href="#" id="middle">Middle</a>
      <button type="button" id="last">Last</button>
    `;
    document.body.append(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns the focusable elements in DOM order', () => {
    const focusableElements = getFocusableElements(container);

    expect(focusableElements).toHaveLength(3);
    expect(focusableElements.map((element) => element.id)).toEqual(['first', 'middle', 'last']);
  });

  it('wraps tab navigation from the last element to the first', () => {
    const focusableElements = getFocusableElements(container);
    const lastElement = focusableElements[focusableElements.length - 1];
    const firstElement = focusableElements[0];

    lastElement.focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
    const handled = trapFocusWithinContainer(container, event);

    expect(handled).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(firstElement);
  });

  it('wraps shift+tab navigation from the first element to the last', () => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      cancelable: true,
    });
    const handled = trapFocusWithinContainer(container, event);

    expect(handled).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(lastElement);
  });
});
