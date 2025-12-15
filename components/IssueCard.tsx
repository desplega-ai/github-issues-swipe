'use client';

import { useState, ComponentPropsWithoutRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, useAnimation } from 'framer-motion';
import { ExternalLink, Calendar, Tag, MessageSquare, ThumbsUp, ListTodo, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { GitHubIssue } from '@/types';

interface IssueCardProps {
  issue: GitHubIssue;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export function IssueCard({ issue, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, style, disabled = false }: IssueCardProps) {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  const rotateZ = useTransform(x, [-200, 200], [-15, 15]);

  // Background color interpolation for visual cues
  const cardBg = useTransform(
    [x, y],
    ([currentX, currentY]: number[]) => {
      const threshold = 50;
      if (currentY < -threshold) return '#7f1d1d'; // Red-900 (Up)
      if (currentY > threshold) return '#1e3a8a'; // Blue-900 (Down - Skip)
      if (currentX < -threshold) return '#ca8a04'; // Yellow-600 (Left)
      if (currentX > threshold) return '#14532d'; // Green-900 (Right)
      return '#1f2937'; // Gray-800
    }
  );

  const glowColor = useTransform(
    [x, y],
    ([currentX, currentY]: number[]) => {
      const threshold = 50;
      if (currentY < -threshold) return 'rgba(239, 68, 68, 0.4)'; // Red
      if (currentY > threshold) return 'rgba(59, 130, 246, 0.4)'; // Blue
      if (currentX < -threshold) return 'rgba(234, 179, 8, 0.4)'; // Yellow
      if (currentX > threshold) return 'rgba(34, 197, 94, 0.4)'; // Green
      return 'rgba(0,0,0,0)';
    }
  );

  const handleDragEnd = async (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 100;
    const swipeVerticalThreshold = 100;

    if (info.offset.y < -swipeVerticalThreshold) {
      setExitDirection('up');
      await controls.start({ y: -1000, transition: { duration: 0.4 } });
      onSwipeUp();
    } else if (info.offset.y > swipeVerticalThreshold) {
      setExitDirection('down');
      await controls.start({ y: 1000, transition: { duration: 0.4 } });
      onSwipeDown();
    } else if (info.offset.x > swipeThreshold) {
      setExitDirection('right');
      await controls.start({ x: 1000, transition: { duration: 0.4 } });
      onSwipeRight();
    } else if (info.offset.x < -swipeThreshold) {
      setExitDirection('left');
      await controls.start({ x: -1000, transition: { duration: 0.4 } });
      onSwipeLeft();
    }
  };

  const subIssuesCount = (issue.body?.match(/- \[[x ]\]/g) || []).length;
  const reactionsCount = issue.reactions?.total_count || 0;

  return (
    <>
      <motion.div
        drag={exitDirection || disabled ? false : true} // Disable drag once exiting or when disabled
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, y, rotateZ, zIndex: exitDirection ? 0 : 1, ...style }}
        // Simple exit animation for when component unmounts (e.g. undo)
        exit={{ scale: 0.9, opacity: 0 }}
        className={`absolute inset-0 ${disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
      >
        {/* Dynamic colored glow moves with card */}
        <motion.div
          className="absolute -inset-4 rounded-3xl opacity-75 blur-xl transition-colors duration-200"
          style={{ backgroundColor: glowColor }}
        />

        {/* Card Content with Dynamic Background */}
        <motion.div
          className="relative flex h-full flex-col rounded-2xl border-2 border-gray-700 p-6 shadow-2xl overflow-hidden transition-colors duration-200"
          style={{ backgroundColor: cardBg }}
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between flex-shrink-0">
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
          <h2 className="mb-4 text-2xl font-bold text-white line-clamp-2 flex-shrink-0">
            {issue.title}
          </h2>

          {/* Body */}
          <div className="mb-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent"
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="prose prose-invert max-w-none text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: (props: ComponentPropsWithoutRef<'img'>) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      {...props}
                      className="cursor-zoom-in rounded-lg border border-gray-700 bg-black/20 hover:opacity-90 max-h-60 object-contain w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedImage((props.src as string) || null);
                      }}
                      alt={props.alt || 'Issue image'}
                    />
                  ),
                  a: (props: ComponentPropsWithoutRef<'a'>) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )
                }}
              >
                {issue.body || '*No description provided.*'}
              </ReactMarkdown>
            </div>
          </div>

          {/* Labels & Footer Container */}
          <div className="flex-shrink-0 space-y-4">
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

            {/* Stats Footer */}
            <div className="flex items-center justify-between border-t border-gray-700 pt-3 text-gray-400">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5" title="Comments">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm font-medium">{issue.comments}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Reactions">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm font-medium">{reactionsCount}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Sub-issues / Tasks">
                  <ListTodo className="h-4 w-4" />
                  <span className="text-sm font-medium">{subIssuesCount}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200"
          onClick={() => setZoomedImage(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700 transition-colors"
            onClick={() => setZoomedImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoomedImage}
            alt="Zoomed issue content"
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
