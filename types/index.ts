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
  comments: number;
  reactions: {
    total_count: number;
    '+1': number;
    '-1': number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  };
}

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

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
