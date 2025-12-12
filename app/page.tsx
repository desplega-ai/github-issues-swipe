'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useIssuesStore } from '@/store/useIssuesStore';
import { IssueCard } from '@/components/IssueCard';
import { SwipeControls } from '@/components/SwipeControls';
import { Onboarding } from '@/components/Onboarding';
import { SettingsModal } from '@/components/SettingsModal';
import {
  fetchRepoIssues,
  assignIssueToMe,
  closeIssueWithWontfix,
  markIssueForLater,
  parseRepositoryUrl,
  unassignIssue,
  reopenIssue,
  removeIssueLabel,
} from '@/lib/github';
import { Loader2, CheckCircle2, Settings, Sparkles, RefreshCw } from 'lucide-react';

export default function Home() {
  const {
    issues,
    currentIndex,
    swipeHistory,
    loading,
    error,
    userToken,
    repoOwner,
    repoName,
    settings,
    setIssues,
    setLoading,
    setError,
    recordSwipe,
    nextIssue,
    undo,
    getCurrentIssue,
  } = useIssuesStore();

  const [processing, setProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (swipeHistory.length > 0 && swipeHistory.length % 20 === 0) {
      setShowCelebration(true);
    }
  }, [swipeHistory.length]);

  const currentIssue = getCurrentIssue();
  const isComplete = currentIndex >= issues.length && issues.length > 0;

  // Load issues on mount or when token changes
  useEffect(() => {
    if (userToken) {
      loadIssues();
    }
  }, [userToken, repoOwner, repoName]); // reload if repo changes too

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (processing || !currentIssue || !userToken || showSettings || showCelebration) return;

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
  }, [currentIssue, processing, userToken, showSettings, showCelebration]);

  async function loadIssues() {
    if (!userToken || !repoOwner || !repoName) return;

    setLoading(true);
    setError(null);
    try {
      const fetchedIssues = await fetchRepoIssues(userToken, repoOwner, repoName);

      // Filter issues if "Skip issues with [Left Label]" is enabled
      let filteredIssues = fetchedIssues;
      if (settings.skipIssuesWithSwipeLeftLabel && settings.swipeLeftLabel) {
        filteredIssues = fetchedIssues.filter(issue =>
          !issue.labels.some(label =>
            typeof label === 'string'
              ? label === settings.swipeLeftLabel
              : label.name === settings.swipeLeftLabel
          )
        );
      }

      setIssues(filteredIssues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }

  // Refresh issues if settings change
  useEffect(() => {
    if (userToken && !loading && issues.length > 0) {
      // Logic for refreshing if needed
    }
  }, [settings.skipIssuesWithSwipeLeftLabel, settings.swipeLeftLabel]);


  async function handleSwipeLeft() {
    if (!currentIssue || processing || !userToken || !repoOwner || !repoName) return;

    // Optimistic update
    const issueToProcess = currentIssue;
    recordSwipe('left', issueToProcess);
    nextIssue();

    // Background API call
    markIssueForLater(userToken, repoOwner, repoName, issueToProcess.number, settings.swipeLeftLabel || 'later')
      .catch((err) => {
        console.error('Error marking issue for later:', err);
        // TODO: Add toast notification for errors
      });
  }

  async function handleSwipeRight() {
    if (!currentIssue || processing || !userToken || !repoOwner || !repoName) return;

    // Optimistic update
    const issueToProcess = currentIssue;
    recordSwipe('right', issueToProcess);
    nextIssue();

    // Background API call
    assignIssueToMe(userToken, repoOwner, repoName, issueToProcess.number, settings.swipeRightLabel)
      .catch((err) => {
        console.error('Error assigning issue:', err);
      });
  }

  async function handleSwipeUp() {
    if (!currentIssue || processing || !userToken || !repoOwner || !repoName) return;

    // Optimistic update
    const issueToProcess = currentIssue;
    recordSwipe('up', issueToProcess);
    nextIssue();

    // Background API call
    closeIssueWithWontfix(userToken, repoOwner, repoName, issueToProcess.number, settings.swipeUpLabel || 'wontfix')
      .catch((err) => {
        console.error('Error closing issue:', err);
      });
  }

  async function handleSwipeDown() {
    if (!currentIssue || processing) return;

    // Just skip, no GitHub API call needed
    recordSwipe('down', currentIssue);
    nextIssue();
  }

  async function handleUndo() {
    if (swipeHistory.length === 0 || processing || !userToken || !repoOwner || !repoName) return;

    // Get the last action
    const lastAction = swipeHistory[swipeHistory.length - 1];
    setProcessing(true);

    try {
      if (lastAction.direction === 'left') {
        // Was "Later" -> remove label
        await removeIssueLabel(userToken, repoOwner, repoName, lastAction.issue.number, settings.swipeLeftLabel || 'later');
      } else if (lastAction.direction === 'right') {
        // Was "Assign" -> unassign
        await unassignIssue(userToken, repoOwner, repoName, lastAction.issue.number, settings.swipeRightLabel);
      } else if (lastAction.direction === 'up') {
        // Was "Close" -> reopen
        await reopenIssue(userToken, repoOwner, repoName, lastAction.issue.number, settings.swipeUpLabel || 'wontfix');
      }
      // 'down' (skip) requires no API undo action, just move index back which undo() does

      undo();
    } catch (err) {
      console.error('Error undoing action:', err);
      alert('Failed to undo last action.');
    } finally {
      setProcessing(false);
    }
  }

  // Prevent hydration mismatch
  if (!isClient) return null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/desplega-logo.svg" alt="Desplega Logo" className="h-8 w-8" />
              <h1 className="text-2xl font-bold text-white">GitHub Issues Swipe</h1>
            </div>

            <div className="flex items-center gap-4">
              {issues.length > 0 && (
                <div className="text-sm text-gray-400">
                  {currentIndex + 1} / {issues.length}
                </div>
              )}
              <button
                onClick={loadIssues}
                disabled={loading}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-50"
                title="Refresh Issues"
              >
                <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
                title="Settings"
              >
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-4">
        {!userToken || !repoOwner || !repoName ? (
          <Onboarding />
        ) : loading ? (
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-blue-500" />
            <p className="text-lg text-gray-300">Loading your GitHub issues...</p>
          </div>
        ) : error ? (
          <div className="max-w-md rounded-lg border-2 border-red-500 bg-red-500/10 p-6 text-center">
            <h2 className="mb-2 text-xl font-bold text-red-400">Error Loading Issues</h2>
            <p className="mb-4 text-gray-300">{error}</p>
            <button
              onClick={loadIssues}
              className="rounded-lg bg-red-500 px-6 py-2 font-medium text-white transition-colors hover:bg-red-600"
            >
              Try Again
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="mt-4 block w-full text-sm text-red-400 hover:text-red-300 hover:underline"
            >
              Check Settings
            </button>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-2 text-2xl font-bold text-white">No Open Issues!</h2>
            <p className="text-gray-400">You&apos;re all caught up. Great job! 🎉</p>
            <button
              onClick={loadIssues}
              className="mt-6 rounded-lg bg-gray-800 px-6 py-2 font-medium text-white transition-colors hover:bg-gray-700"
            >
              Refresh
            </button>
          </div>
        ) : isComplete ? (
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
                  <span className="text-gray-400">Later ({settings.swipeLeftLabel || 'Default'}):</span>
                  <span className="font-medium text-yellow-400">
                    {swipeHistory.filter(h => h.direction === 'left').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Assigned ({settings.swipeRightLabel || 'None'}):</span>
                  <span className="font-medium text-green-400">
                    {swipeHistory.filter(h => h.direction === 'right').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Closed ({settings.swipeUpLabel || 'Default'}):</span>
                  <span className="font-medium text-red-400">
                    {swipeHistory.filter(h => h.direction === 'up').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Skipped:</span>
                  <span className="font-medium text-blue-400">
                    {swipeHistory.filter(h => h.direction === 'down').length}
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
        ) : (
          <>
            {/* Card Stack */}
            <div className="relative mb-8 h-[500px] w-full max-w-2xl text-left">
              {/* Next Issue (Preloaded in background) */}
              {issues[currentIndex + 1] && (
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                  <IssueCard
                    issue={issues[currentIndex + 1]}
                    onSwipeLeft={() => { }}
                    onSwipeRight={() => { }}
                    onSwipeUp={() => { }}
                    onSwipeDown={() => { }}
                    style={{ scale: 0.95, y: 10, opacity: 0.5 }}
                  />
                </div>
              )}

              <AnimatePresence>
                {currentIssue && (
                  <IssueCard
                    key={currentIssue.id}
                    issue={currentIssue}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    onSwipeUp={handleSwipeUp}
                    onSwipeDown={handleSwipeDown}
                    style={{ zIndex: 10 }}
                  />
                )}
              </AnimatePresence>

              {/* Processing Overlay - Only for non-optimistic actions if any, or initial load */}
              {processing && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 backdrop-blur-sm z-50">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                </div>
              )}
            </div>

            {/* Controls */}
            <SwipeControls
              onSwipeLeft={handleSwipeLeft}
              onSwipeUp={handleSwipeUp}
              onSwipeRight={handleSwipeRight}
              onSwipeDown={handleSwipeDown}
              onUndo={handleUndo}
              canUndo={swipeHistory.length > 0}
            />

            {/* Instructions */}
            <div className="mt-8 text-center text-sm text-gray-500">
              <p className="mb-2">
                ← Later • ↑ Close • → Assign • ↓ Skip
              </p>
              <p>Drag cards or use keyboard shortcuts. Ctrl+Z to Undo.</p>
            </div>
          </>
        )}
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => {
          setShowSettings(false);
          if (userToken) loadIssues();
        }}
      />

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-sm text-center shadow-2xl relative">
            <button
              onClick={() => setShowCelebration(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <Settings className="h-5 w-5 rotate-45" /> {/* Using Settings as cross icon for now or just X */}
            </button>

            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-full">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Wow! 20 Issues!</h2>
            <p className="text-gray-300 mb-6">You&apos;re on fire! You&apos;ve just swiped through 20 issues. Keep up the momentum!</p>

            <button
              onClick={() => setShowCelebration(false)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full transition-all hover:scale-105"
              style={{
                boxShadow: '0 0 20px rgba(37, 99, 235, 0.5)'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
