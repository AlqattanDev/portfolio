/**
 * GitHub Stats Client Module
 * Handles GitHub repository statistics fetching with proper cleanup
 */

import type { GitHubStats } from '@/types/project.js';
import { validateData, GitHubRepoSchema } from '@/utils/validation/schemas.js';

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
      const validation = validateData(GitHubRepoSchema, data);

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
