/**
 * Action Buttons Client Module
 * Handles action button interactions with proper cleanup
 */

import type { ProjectAction } from '@/types';

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
/**
 * GitHub Stats Client Module
 * Handles GitHub repository statistics fetching with proper cleanup
 */

import type { GitHubStats } from '@/types';
import { GitHubRepoSchema } from '@/types';

class GitHubStatsManager {
  private static cache = new Map<
    string,
    { data: GitHubStats; timestamp: number }
  >();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static async fetchGitHubStats(
    owner: string,
    repo: string,
    enableRealTime: boolean = true
  ): Promise<GitHubStats> {
    const cacheKey = `${owner}/${repo}`;
    const now = Date.now();

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    if (!enableRealTime) {
      // Return deterministic placeholder data
      return {
        stars: 42,
        forks: 7,
        language: 'TypeScript',
        isLoading: false,
      };
    }

    try {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const response = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          // Add GitHub token if available
          ...(import.meta.env['GITHUB_TOKEN'] && {
            Authorization: `token ${import.meta.env['GITHUB_TOKEN']}`,
          }),
        },
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const data = await response.json();
      const validation = GitHubRepoSchema.safeParse(data);

      if (!validation.success) {
        throw new Error('Invalid GitHub API response format');
      }

      const stats: GitHubStats = {
        stars: validation.data.stargazers_count,
        forks: validation.data.forks_count,
        language: validation.data.language || 'Mixed',
        isLoading: false,
      };

      // Cache the result
      this.cache.set(cacheKey, { data: stats, timestamp: now });

      return stats;
    } catch (error) {
      console.warn('GitHub API request failed:', error);

      // Return deterministic fallback data
      const fallbackStats: GitHubStats = {
        stars: 42,
        forks: 7,
        language: 'TypeScript',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      return fallbackStats;
    }
  }

  static updateStatsDisplay(element: Element, stats: GitHubStats): void {
    const statItems = element.querySelectorAll('.stat-item');
    const showLanguage = element.getAttribute('data-show-language') === 'true';

    if (statItems.length >= 2) {
      statItems[0]!.innerHTML = `<span>★ ${stats.stars}</span>`;
      statItems[1]!.innerHTML = `<span>⑃ ${stats.forks}</span>`;

      if (showLanguage && statItems[2]) {
        statItems[2]!.innerHTML = `<span>⚡ ${stats.language}</span>`;
      }
    }

    // Update element classes
    element.classList.remove('loading');
    element.classList.add(stats.error ? 'error' : 'loaded');
  }
}

/**
 * Initialize GitHub stats for a given root element
 * @param root - The root element to search for GitHub stats elements
 * @returns Cleanup function (no-op since no event listeners)
 */
export function initGitHubStats(
  root: Document | Element = document
): () => void {
  const githubStatsElements = root.querySelectorAll<HTMLElement>(
    '.github-stats[data-repo]'
  );

  for (const element of githubStatsElements) {
    const repoUrl = element.dataset['repo'];
    const enableRealTime = element.dataset['enableRealtime'] !== 'false';

    if (!repoUrl) continue;

    try {
      // Extract owner/repo from URL
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!match) continue;

      const [, owner, repo] = match as [string, string, string];

      // Fetch and display stats
      GitHubStatsManager.fetchGitHubStats(owner, repo, enableRealTime)
        .then((stats) => GitHubStatsManager.updateStatsDisplay(element, stats))
        .catch((error) => {
          console.error('Failed to load GitHub stats:', error);
          element.classList.add('error');
        });
    } catch (error) {
      console.error('Failed to load GitHub stats:', error);
      element.classList.add('error');
    }
  }

  // No event listeners to clean up
  return () => {};
}

// Export for potential external use
export { GitHubStatsManager };
