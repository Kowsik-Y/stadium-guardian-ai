import type React from 'react';
import { useEffect } from 'react';
import { getFocusableElements, trapFocusWithinContainer } from '@/lib/focusTrap';

export function useFocusTrap(
  isActive: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = getFocusableElements(container);
    const initialFocusTarget = focusableElements[0] ?? container;

    const animationFrameId = window.requestAnimationFrame(() => {
      initialFocusTarget.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      trapFocusWithinContainer(container, event);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, containerRef, onClose]);
}
