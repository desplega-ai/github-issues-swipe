'use client';

import { ChevronLeft, ChevronUp, ChevronRight, Undo2, ChevronDown } from 'lucide-react';

interface SwipeControlsProps {
  onSwipeLeft: () => void;
  onSwipeUp: () => void;
  onSwipeRight: () => void;
  onSwipeDown: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function SwipeControls({ onSwipeLeft, onSwipeUp, onSwipeRight, onSwipeDown, onUndo, canUndo }: SwipeControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Undo - Moved to start for better balance if we have 5 items */}
      <div className="relative group">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-600 bg-gray-700/50 text-gray-400 transition-all hover:scale-110 hover:border-gray-500 hover:bg-gray-700 hover:text-gray-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Undo"
        >
          <Undo2 className="h-6 w-6" />
        </button>
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl">
          Undo
        </span>
      </div>

      {/* Swipe Left - Later */}
      <div className="relative group">
        <button
          onClick={onSwipeLeft}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-yellow-500 bg-yellow-500/20 text-yellow-400 transition-all hover:scale-110 hover:bg-yellow-500/30 active:scale-95"
          aria-label="Later"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl">
          Later
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {/* Swipe Up - Close with Wontfix */}
        <div className="relative group">
          <button
            onClick={onSwipeUp}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-500 bg-red-500/20 text-red-400 transition-all hover:scale-110 hover:bg-red-500/30 active:scale-95"
            aria-label="Close"
          >
            <ChevronUp className="h-8 w-8" />
          </button>
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl">
            Close
          </span>
        </div>

        {/* Swipe Down - Skip */}
        <div className="relative group">
          <button
            onClick={onSwipeDown}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-500/20 text-blue-400 transition-all hover:scale-110 hover:bg-blue-500/30 active:scale-95"
            aria-label="Skip"
          >
            <ChevronDown className="h-8 w-8" />
          </button>
          <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl">
            Skip
          </span>
        </div>
      </div>

      {/* Swipe Right - Assign to Me */}
      <div className="relative group">
        <button
          onClick={onSwipeRight}
          className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/20 text-green-400 transition-all hover:scale-110 hover:bg-green-500/30 active:scale-95"
          aria-label="Assign to Me"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-gray-700 shadow-xl">
          Assign
        </span>
      </div>
    </div>
  );
}
