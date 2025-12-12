import { create } from 'zustand';
import type { GitHubIssue, SwipeAction, SwipeDirection } from '@/types';

interface IssuesState {
  issues: GitHubIssue[];
  currentIndex: number;
  swipeHistory: SwipeAction[];
  loading: boolean;
  error: string | null;

  // Actions
  setIssues: (issues: GitHubIssue[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  recordSwipe: (direction: SwipeDirection, issue: GitHubIssue) => void;
  nextIssue: () => void;
  undo: () => void;
  reset: () => void;
  getCurrentIssue: () => GitHubIssue | null;
}

export const useIssuesStore = create<IssuesState>((set, get) => ({
  issues: [],
  currentIndex: 0,
  swipeHistory: [],
  loading: false,
  error: null,

  setIssues: (issues) => set({ issues, currentIndex: 0 }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  recordSwipe: (direction, issue) => {
    const { swipeHistory } = get();
    set({
      swipeHistory: [...swipeHistory, {
        direction,
        issue,
        timestamp: Date.now(),
      }],
    });
  },

  nextIssue: () => set((state) => ({
    currentIndex: state.currentIndex + 1,
  })),

  undo: () => {
    const { swipeHistory, currentIndex } = get();
    if (swipeHistory.length > 0) {
      const newHistory = swipeHistory.slice(0, -1);
      set({
        swipeHistory: newHistory,
        currentIndex: Math.max(0, currentIndex - 1),
      });
    }
  },

  reset: () => set({
    issues: [],
    currentIndex: 0,
    swipeHistory: [],
    loading: false,
    error: null,
  }),

  getCurrentIssue: () => {
    const { issues, currentIndex } = get();
    return issues[currentIndex] || null;
  },
}));
