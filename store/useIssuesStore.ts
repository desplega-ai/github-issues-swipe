import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GitHubIssue, SwipeAction, SwipeDirection } from '@/types';


export interface Settings {
  swipeLeftLabel: string;
  swipeRightLabel: string | null;
  swipeUpLabel: string;
  skipIssuesWithSwipeLeftLabel: boolean;
}

interface IssuesState {
  userToken: string | null;
  repoOwner: string | null;
  repoName: string | null;
  issues: GitHubIssue[];
  currentIndex: number;
  swipeHistory: SwipeAction[];
  loading: boolean;
  error: string | null;
  settings: Settings;

  // Actions
  setUserToken: (token: string) => void;
  setRepo: (owner: string, repo: string) => void;
  setIssues: (issues: GitHubIssue[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  recordSwipe: (direction: SwipeDirection, issue: GitHubIssue) => void;
  nextIssue: () => void;
  undo: () => void;
  reset: () => void;
  getCurrentIssue: () => GitHubIssue | null;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useIssuesStore = create<IssuesState>()(
  persist(
    (set, get) => ({
      userToken: null,
      repoOwner: null,
      repoName: null,
      issues: [],
      currentIndex: 0,
      swipeHistory: [],
      loading: false,
      error: null,
      settings: {
        swipeLeftLabel: 'later',
        swipeRightLabel: null,
        swipeUpLabel: 'wontfix',
        skipIssuesWithSwipeLeftLabel: true,
      },

      setUserToken: (token) => set({
        userToken: token,
        issues: [],
        currentIndex: 0,
        swipeHistory: [],
        loading: false,
        error: null
      }),

      setRepo: (owner, repo) => set({ repoOwner: owner, repoName: repo }),

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

      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
    }),
    {
      name: 'github-issues-storage',
      partialize: (state) => ({
        userToken: state.userToken,
        repoOwner: state.repoOwner,
        repoName: state.repoName,
        swipeHistory: state.swipeHistory,
        // We can persist issues too, but it might be stale. 
        // Given "store everything locally", let's persist it.
        issues: state.issues,
        currentIndex: state.currentIndex,
        settings: state.settings,
      }),
    }
  )
);
