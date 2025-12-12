export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  created_at: string;
  updated_at: string;
  repository_url: string;
}

export type SwipeDirection = 'left' | 'right' | 'up';

export interface SwipeAction {
  direction: SwipeDirection;
  issue: GitHubIssue;
  timestamp: number;
}

export interface AppState {
  issues: GitHubIssue[];
  currentIndex: number;
  swipeHistory: SwipeAction[];
  loading: boolean;
  error: string | null;
}
