'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ExternalLink, Calendar, Tag } from 'lucide-react';
import type { GitHubIssue } from '@/types';

interface IssueCardProps {
  issue: GitHubIssue;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  style?: React.CSSProperties;
}

export function IssueCard({ issue, onSwipeLeft, onSwipeRight, onSwipeUp, style }: IssueCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateZ = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    const swipeUpThreshold = -150;

    if (info.offset.y < swipeUpThreshold) {
      // Swipe up - Close with wontfix
      onSwipeUp();
    } else if (info.offset.x > swipeThreshold) {
      // Swipe right - Assign to me
      onSwipeRight();
    } else if (info.offset.x < -swipeThreshold) {
      // Swipe left - Later
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      style={{
        x,
        y,
        rotateZ,
        opacity,
        ...style,
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <div className="h-full w-full rounded-2xl border-2 border-gray-700 bg-gray-800 p-6 shadow-2xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={issue.user.avatar_url}
                alt={issue.user.login}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <div className="text-sm text-gray-400">
                  #{issue.number} by {issue.user.login}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(issue.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>

          {/* Title */}
          <h2 className="mb-4 text-2xl font-bold text-white line-clamp-2">
            {issue.title}
          </h2>

          {/* Body */}
          <div className="mb-4 flex-1 overflow-auto">
            <p className="whitespace-pre-wrap text-gray-300 line-clamp-6">
              {issue.body || 'No description provided.'}
            </p>
          </div>

          {/* Labels */}
          {issue.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Tag className="h-4 w-4 text-gray-400" />
              {issue.labels.slice(0, 5).map((label, idx) => (
                <span
                  key={idx}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    backgroundColor: `#${label.color}30`,
                    color: `#${label.color}`,
                    borderColor: `#${label.color}`,
                    borderWidth: '1px',
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
