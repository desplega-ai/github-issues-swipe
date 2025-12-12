'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useIssuesStore } from '@/store/useIssuesStore';
import { IssueCard } from '@/components/IssueCard';
import { SwipeControls } from '@/components/SwipeControls';
import {
  fetchUserIssues,
  assignIssueToMe,
  closeIssueWithWontfix,
  markIssueForLater,
  parseRepositoryUrl,
} from '@/lib/github';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const {
    issues,
    currentIndex,
    swipeHistory,
    loading,
    error,
    setIssues,
    setLoading,
    setError,
    recordSwipe,
    nextIssue,
    undo,
    getCurrentIssue,
  } = useIssuesStore();

  const [initialized, setInitialized] = useState(false);
  const [processing, setProcessing] = useState(false);

  const currentIssue = getCurrentIssue();
  const isComplete = currentIndex >= issues.length && issues.length > 0;

  // Load issues on mount
  useEffect(() => {
    if (!initialized) {
      loadIssues();
      setInitialized(true);
    }
  }, [initialized]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (processing || !currentIssue) return;

      switch (e.key) {
        case 'ArrowLeft':
          handleSwipeLeft();
          break;
        case 'ArrowRight':
          handleSwipeRight();
          break;
        case 'ArrowUp':
          e.preventDefault(); // Prevent page scroll
          handleSwipeUp();
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIssue, processing]);

  async function loadIssues() {
    setLoading(true);
    setError(null);
    try {
      const fetchedIssues = await fetchUserIssues();
      setIssues(fetchedIssues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }

  async function handleSwipeLeft() {
    if (!currentIssue || processing) return;

    setProcessing(true);
    try {
      const { owner, repo } = parseRepositoryUrl(currentIssue.repository_url);
      await markIssueForLater(owner, repo, currentIssue.number);
      recordSwipe('left', currentIssue);
      nextIssue();
    } catch (err) {
      console.error('Error marking issue for later:', err);
      alert('Failed to mark issue for later. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  async function handleSwipeRight() {
    if (!currentIssue || processing) return;

    setProcessing(true);
    try {
      const { owner, repo } = parseRepositoryUrl(currentIssue.repository_url);
      await assignIssueToMe(owner, repo, currentIssue.number);
      recordSwipe('right', currentIssue);
      nextIssue();
    } catch (err) {
      console.error('Error assigning issue:', err);
      alert('Failed to assign issue. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  async function handleSwipeUp() {
    if (!currentIssue || processing) return;

    setProcessing(true);
    try {
      const { owner, repo } = parseRepositoryUrl(currentIssue.repository_url);
      await closeIssueWithWontfix(owner, repo, currentIssue.number);
      recordSwipe('up', currentIssue);
      nextIssue();
    } catch (err) {
      console.error('Error closing issue:', err);
      alert('Failed to close issue. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  function handleUndo() {
    if (swipeHistory.length === 0) return;
    undo();
    // Note: This doesn't reverse the GitHub API action, just the local state
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
          <p className="text-lg text-gray-300">Loading your GitHub issues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
        <div className="max-w-md rounded-lg border-2 border-red-500 bg-red-500/10 p-6 text-center">
          <h2 className="mb-2 text-xl font-bold text-red-400">Error Loading Issues</h2>
          <p className="mb-4 text-gray-300">{error}</p>
          <button
            onClick={loadIssues}
            className="rounded-lg bg-red-500 px-6 py-2 font-medium text-white transition-colors hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-2 text-2xl font-bold text-white">No Open Issues!</h2>
          <p className="text-gray-400">You&apos;re all caught up. Great job! 🎉</p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4">
        <div className="text-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="mb-2 text-3xl font-bold text-white">All Done!</h2>
          <p className="mb-6 text-gray-400">
            You&apos;ve triaged {swipeHistory.length} issue{swipeHistory.length !== 1 ? 's' : ''}.
          </p>

          <div className="mb-6 rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h3 className="mb-4 text-xl font-semibold text-white">Summary</h3>
            <div className="grid gap-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Later:</span>
                <span className="font-medium text-yellow-400">
                  {swipeHistory.filter(h => h.direction === 'left').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Assigned to me:</span>
                <span className="font-medium text-green-400">
                  {swipeHistory.filter(h => h.direction === 'right').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Closed (wontfix):</span>
                <span className="font-medium text-red-400">
                  {swipeHistory.filter(h => h.direction === 'up').length}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Reload Issues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">GitHub Issues Swipe</h1>
            <div className="text-sm text-gray-400">
              {currentIndex + 1} / {issues.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        {/* Card Stack */}
        <div className="relative mb-8 h-[500px] w-full max-w-2xl">
          <AnimatePresence>
            {currentIssue && (
              <IssueCard
                key={currentIssue.id}
                issue={currentIssue}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeUp={handleSwipeUp}
              />
            )}
          </AnimatePresence>

          {/* Processing Overlay */}
          {processing && (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            </div>
          )}
        </div>

        {/* Controls */}
        <SwipeControls
          onSwipeLeft={handleSwipeLeft}
          onSwipeUp={handleSwipeUp}
          onSwipeRight={handleSwipeRight}
          onUndo={handleUndo}
          canUndo={swipeHistory.length > 0}
        />

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">
            ← Later • ↑ Close (wontfix) • → Assign to me • Ctrl+Z Undo
          </p>
          <p>Drag cards or use keyboard shortcuts</p>
        </div>
      </main>
    </div>
  );
}
