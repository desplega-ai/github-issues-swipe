import { Octokit } from '@octokit/rest';
import type { GitHubIssue } from '@/types';

const octokit = new Octokit({
  auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN,
});

/**
 * Fetches all open issues across all repositories for the authenticated user
 */
export async function fetchUserIssues(): Promise<GitHubIssue[]> {
  try {
    const response = await octokit.rest.issues.listForAuthenticatedUser({
      filter: 'all',
      state: 'open',
      sort: 'updated',
      direction: 'desc',
      per_page: 100,
    });

    return response.data as GitHubIssue[];
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw new Error('Failed to fetch issues from GitHub');
  }
}

/**
 * Assigns an issue to the authenticated user
 */
export async function assignIssueToMe(owner: string, repo: string, issueNumber: number): Promise<void> {
  try {
    const username = process.env.NEXT_PUBLIC_GITHUB_USERNAME;
    if (!username) {
      throw new Error('NEXT_PUBLIC_GITHUB_USERNAME not set');
    }

    await octokit.rest.issues.addAssignees({
      owner,
      repo,
      issue_number: issueNumber,
      assignees: [username],
    });
  } catch (error) {
    console.error('Error assigning issue:', error);
    throw new Error('Failed to assign issue');
  }
}

/**
 * Closes an issue with the "wontfix" label
 */
export async function closeIssueWithWontfix(owner: string, repo: string, issueNumber: number): Promise<void> {
  try {
    // Add wontfix label
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: ['wontfix'],
    });

    // Close the issue
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      state: 'closed',
    });
  } catch (error) {
    console.error('Error closing issue:', error);
    throw new Error('Failed to close issue with wontfix label');
  }
}

/**
 * Adds a "later" label to an issue (for swipe left)
 */
export async function markIssueForLater(owner: string, repo: string, issueNumber: number): Promise<void> {
  try {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: ['later'],
    });
  } catch (error) {
    console.error('Error marking issue for later:', error);
    throw new Error('Failed to mark issue for later');
  }
}

/**
 * Extracts owner and repo name from repository URL
 */
export function parseRepositoryUrl(repoUrl: string): { owner: string; repo: string } {
  // Example: https://api.github.com/repos/owner/repo
  const match = repoUrl.match(/repos\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error('Invalid repository URL');
  }
  return {
    owner: match[1],
    repo: match[2],
  };
}
