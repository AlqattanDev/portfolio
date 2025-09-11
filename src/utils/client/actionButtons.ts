/**
 * Action Buttons Client Module
 * Handles action button interactions with proper cleanup
 */

import type { ProjectAction } from '@/types/project.js';

interface ActionButtonManager {
  handleClick: (event: MouseEvent) => void;
  setLoading: (button: HTMLButtonElement, loading: boolean) => void;
  setSuccess: (button: HTMLButtonElement) => void;
  setError: (button: HTMLButtonElement) => void;
}

const ActionButtonManager: ActionButtonManager = {
  handleClick: async (event: MouseEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    const url = button.dataset['url'];
    const type = button.dataset['type'] as ProjectAction['type'];

    if (button.disabled || button.classList.contains('disabled')) {
      return;
    }

    // Set loading state
    ActionButtonManager.setLoading(button, true);

    try {
      switch (type) {
        case 'demo':
        case 'github':
          if (url) {
            // Open in new tab
            const newWindow = window.open(url, '_blank');
            if (newWindow) {
              ActionButtonManager.setSuccess(button);
            } else {
              throw new Error('Popup blocked or failed to open');
            }
          }
          break;

        case 'case-study':
          // TODO: Implement case study modal or navigation
          console.log('Case study functionality not yet implemented');
          ActionButtonManager.setError(button);
          break;

        case 'download':
          if (url) {
            // Create download link
            const link = document.createElement('a');
            link.href = url;
            link.download = '';
            link.click();
            ActionButtonManager.setSuccess(button);
          }
          break;

        default:
          console.warn(`Unknown action type: ${type}`);
          ActionButtonManager.setError(button);
      }
    } catch (error) {
      console.error('Action button error:', error);
      ActionButtonManager.setError(button);
    } finally {
      ActionButtonManager.setLoading(button, false);
    }
  },

  setLoading: (button: HTMLButtonElement, loading: boolean) => {
    if (loading) {
      button.classList.add('loading');
    } else {
      button.classList.remove('loading');
    }
  },

  setSuccess: (button: HTMLButtonElement) => {
    button.classList.remove('error', 'loading');
    button.classList.add('success');

    // Remove success state after 2 seconds
    setTimeout(() => {
      button.classList.remove('success');
    }, 2000);
  },

  setError: (button: HTMLButtonElement) => {
    button.classList.remove('success', 'loading');
    button.classList.add('error');

    // Remove error state after 3 seconds
    setTimeout(() => {
      button.classList.remove('error');
    }, 3000);
  },
};

/**
 * Initialize action buttons for a given root element
 * @param root - The root element to search for action buttons
 * @returns Cleanup function
 */
export function initActionButtons(
  root: Document | Element = document
): () => void {
  const handleClick = (event: Event) => {
    const mouseEvent = event as MouseEvent;
    const target = mouseEvent.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>(
      '.action-btn[data-url], .action-btn[data-type]'
    );

    if (button) {
      // Create a synthetic event with the correct currentTarget
      const syntheticEvent = Object.create(mouseEvent, {
        currentTarget: { value: button, writable: false },
      });
      ActionButtonManager.handleClick(syntheticEvent);
    }
  };

  // Use event delegation for better performance and dynamic content support
  root.addEventListener('click', handleClick);

  // Return cleanup function
  return () => {
    root.removeEventListener('click', handleClick);
  };

  // Use event delegation for better performance and dynamic content support
  root.addEventListener('click', handleClick);

  // Return cleanup function
  return () => {
    root.removeEventListener('click', handleClick);
  };
}

// Export for potential external use
export { ActionButtonManager };
