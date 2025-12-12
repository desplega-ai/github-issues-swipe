'use client';

import { ChevronLeft, ChevronUp, ChevronRight, Undo2 } from 'lucide-react';

interface SwipeControlsProps {
  onSwipeLeft: () => void;
  onSwipeUp: () => void;
  onSwipeRight: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export function SwipeControls({ onSwipeLeft, onSwipeUp, onSwipeRight, onUndo, canUndo }: SwipeControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Swipe Left - Later */}
      <button
        onClick={onSwipeLeft}
        className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-yellow-500 bg-yellow-500/20 text-yellow-400 transition-all hover:scale-110 hover:bg-yellow-500/30 active:scale-95"
        title="Later (Left Arrow)"
      >
        <ChevronLeft className="h-8 w-8" />
      </button>

      {/* Swipe Up - Close with Wontfix */}
      <button
        onClick={onSwipeUp}
        className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500 bg-red-500/20 text-red-400 transition-all hover:scale-110 hover:bg-red-500/30 active:scale-95"
        title="Close with Wontfix (Up Arrow)"
      >
        <ChevronUp className="h-10 w-10" />
      </button>

      {/* Swipe Right - Assign to Me */}
      <button
        onClick={onSwipeRight}
        className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-green-500 bg-green-500/20 text-green-400 transition-all hover:scale-110 hover:bg-green-500/30 active:scale-95"
        title="Assign to Me (Right Arrow)"
      >
        <ChevronRight className="h-8 w-8" />
      </button>

      {/* Undo */}
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray-600 bg-gray-700/50 text-gray-400 transition-all hover:scale-110 hover:border-gray-500 hover:bg-gray-700 hover:text-gray-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        title="Undo (Z key)"
      >
        <Undo2 className="h-6 w-6" />
      </button>
    </div>
  );
}
