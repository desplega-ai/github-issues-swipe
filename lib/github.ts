import { Octokit } from '@octokit/rest';
import type { GitHubIssue } from '@/types';

export interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string | null;
}

function getOctokit(token: string) {
  if (typeof window === 'undefined') {
    throw new Error('GitHub API calls must be made from the client side');
  }
  return new Octokit({
    auth: token,
    request: {
      fetch: (url: string, options: RequestInit) => {
        return fetch(url, {
          ...options,
          cache: 'no-store',
        });
      },
    },
  });
}

/**
 * Fetches all open issues for a specific repository
 */
export async function fetchRepoIssues(token: string, owner: string, repo: string): Promise<GitHubIssue[]> {
  try {
    const octokit = getOctokit(token);
    const response = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'open',
      sort: 'updated',
      direction: 'desc',
      assignee: 'none',
      per_page: 100,
    });

    return response.data as GitHubIssue[];
  } catch (error) {
    console.error('Error fetching issues:', error);
    throw new Error('Failed to fetch issues from GitHub');
  }
}


export interface Repo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  owner: {
    login: string;
  }
}

/**
 * Fetches all labels for a specific repository
 */
export async function fetchRepoLabels(token: string, owner: string, repo: string): Promise<Label[]> {
  try {
    const octokit = getOctokit(token);
    const response = await octokit.rest.issues.listLabelsForRepo({
      owner,
      repo,
      per_page: 100, // Fetch up to 100 labels
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching labels:', error);
    return [];
  }
}

/**
 * Fetches repositories for the authenticated user
 */
export async function fetchUserRepos(token: string): Promise<Repo[]> {
  try {
    const octokit = getOctokit(token);
    const response = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      direction: 'desc',
      per_page: 100,
      type: 'all' // owner, collaborator, member
    });
    return response.data as Repo[];
  } catch (error) {
    console.error('Error fetching repos:', error);
    return [];
  }
}


/**
 * Assigns an issue to the authenticated user and optionally adds a label
 */
export async function assignIssueToMe(token: string, owner: string, repo: string, issueNumber: number, label?: string | null): Promise<void> {
  try {
    const octokit = getOctokit(token);
    const { data: { login } } = await octokit.rest.users.getAuthenticated();

    await Promise.all([
      octokit.rest.issues.addAssignees({
        owner,
        repo,
        issue_number: issueNumber,
        assignees: [login],
      }),
      label ? octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: issueNumber,
        labels: [label],
      }) : Promise.resolve()
    ]);

  } catch (error) {
    console.error('Error assigning issue:', error);
    throw new Error('Failed to assign issue');
  }
}

/**
 * Closes an issue with a specified label (default: "wontfix")
 */
export async function closeIssueWithWontfix(token: string, owner: string, repo: string, issueNumber: number, label: string = 'wontfix'): Promise<void> {
  try {
    const octokit = getOctokit(token);
    // Add label if provided (check if it's not empty string/null, though we have a default "wontfix")
    if (label) {
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: issueNumber,
        labels: [label],
      });
    }

    // Close the issue
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      state: 'closed',
    });
  } catch (error) {
    console.error('Error closing issue:', error);
    throw new Error('Failed to close issue');
  }
}

/**
 * Adds a label to an issue (for swipe left, default "later")
 */
export async function markIssueForLater(token: string, owner: string, repo: string, issueNumber: number, label: string = 'later'): Promise<void> {
  try {
    const octokit = getOctokit(token);
    if (label) {
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: issueNumber,
        labels: [label],
      });
    }
  } catch (error) {
    console.error('Error marking issue for later:', error);
    throw new Error('Failed to mark issue for later');
  }
}

/**
 * Extracts owner and repo name from repository URL
 */
export function parseRepositoryUrl(repoUrl: string): { owner: string; repo: string } {
  // Handle standard "https://github.com/owner/repo" and "https://api.github.com/repos/owner/repo"
  // Also handle simple "owner/repo"
  let match = repoUrl.match(/github.com\/([^/]+)\/([^/]+)/);

  if (!match) {
    match = repoUrl.match(/repos\/([^/]+)\/([^/]+)/);
  }

  if (!match) {
    // Check for "owner/repo" format that doesn't start with http/https/github.com
    // but isn't just a random string
    const simpleMatch = repoUrl.match(/^([^/]+)\/([^/]+)$/);
    if (simpleMatch) {
      match = simpleMatch;
    }
  }

  if (!match) {
    throw new Error('Invalid repository URL');
  }
  return {
    owner: match[1],
    repo: match[2],
  };
}

/**
 * Remove assignee from issue
 */
export async function unassignIssue(token: string, owner: string, repo: string, issueNumber: number, label?: string | null): Promise<void> {
  try {
    const octokit = getOctokit(token);
    const { data: { login } } = await octokit.rest.users.getAuthenticated();

    await Promise.all([
      octokit.rest.issues.removeAssignees({
        owner,
        repo,
        issue_number: issueNumber,
        assignees: [login],
      }),
      label ? octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: issueNumber,
        name: label,
      }).catch(() => { /* label might not exist or already removed */ }) : Promise.resolve()
    ]);
  } catch (error) {
    console.error('Error unassigning issue:', error);
    throw new Error('Failed to unassign issue');
  }
}

/**
 * Reopens an issue and optionally removes the label
 */
export async function reopenIssue(token: string, owner: string, repo: string, issueNumber: number, label: string = 'wontfix'): Promise<void> {
  try {
    const octokit = getOctokit(token);

    // Reopen the issue
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issueNumber,
      state: 'open',
    });

    // Remove label if provided
    if (label) {
      await octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: issueNumber,
        name: label,
      }).catch(() => { });
    }
  } catch (error) {
    console.error('Error reopening issue:', error);
    throw new Error('Failed to reopen issue');
  }
}

/**
 * Removes a label from an issue
 */
export async function removeIssueLabel(token: string, owner: string, repo: string, issueNumber: number, label: string = 'later'): Promise<void> {
  try {
    const octokit = getOctokit(token);
    if (label) {
      await octokit.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: issueNumber,
        name: label,
      });
    }
  } catch (error) {
    console.error('Error removing label:', error);
    throw new Error('Failed to remove label');
  }
}
