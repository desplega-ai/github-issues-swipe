# CLAUDE.md

This file provides guidance to Claude Code when working with the github-issues-swipe repository.

## What is GitHub Issues Swipe?

GitHub Issues Swipe is a Tinder-style interface for triaging GitHub issues with swipe gestures. It allows you to quickly process your open issues across all repositories by:

1. **Swiping Left** (←) - Mark issue for later (adds "later" label)
2. **Swiping Up** (↑) - Close issue with "wontfix" label
3. **Swiping Right** (→) - Assign issue to yourself
4. **Undoing** (Ctrl/Cmd+Z) - Reverse last action (local only)

## Project Structure

```
github-issues-swipe/
├── app/                  # Next.js App Router
│   ├── page.tsx         # Main application with swipe logic
│   ├── layout.tsx       # Root layout and metadata
│   └── globals.css      # Tailwind global styles
├── components/          # React components
│   ├── IssueCard.tsx    # Draggable issue card with swipe detection
│   └── SwipeControls.tsx # Button controls UI
├── lib/                 # Utilities
│   └── github.ts        # GitHub API integration (Octokit)
├── store/               # State management
│   └── useIssuesStore.ts # Zustand store for issues & swipe history
├── types/               # TypeScript definitions
│   └── index.ts         # GitHubIssue, SwipeAction, AppState types
├── README.md            # Full documentation
└── SETUP.md             # Step-by-step setup guide
```

## Development Commands

```bash
# Install dependencies (use pnpm)
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start

# Run linting
pnpm lint
```

## Architecture Overview

This is a Next.js 15 application using:

- **Next.js App Router** - All pages in `/app` directory
- **TypeScript** - Strict mode enabled with path alias `@/*`
- **Framer Motion** - Smooth drag/swipe animations
- **Zustand** - Lightweight state management
- **Octokit** - GitHub REST API client
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

Key architectural patterns:

- Client-side only (no backend required)
- Direct GitHub API integration via personal access token
- Real-time state updates with optimistic UI
- Swipe gesture detection via Framer Motion drag handlers
- Keyboard shortcuts for power users

## Important Context

- This is a **client-side only** application
- GitHub authentication uses **personal access token** stored in `.env.local`
- All GitHub API calls happen directly from the browser
- The app requires `repo` scope on the GitHub token
- Issues are loaded on mount and cached in Zustand store
- Undo functionality is **local only** (doesn't reverse API calls)

## Component Development

When working with components:

1. **IssueCard.tsx**:
   - Uses Framer Motion's `drag` and `onDragEnd` for swipe detection
   - Thresholds: 100px horizontal, -150px vertical
   - Auto-animates back to center if threshold not met
   - Displays issue metadata, labels, and user info

2. **SwipeControls.tsx**:
   - Button alternatives to drag gestures
   - Visual indicators for each action (colors match swipe feedback)
   - Undo button with disabled state

3. **app/page.tsx**:
   - Main application logic
   - Loads issues from GitHub API on mount
   - Handles swipe callbacks (left/up/right)
   - Manages loading, error, and completion states
   - Keyboard event listeners for shortcuts

## GitHub API Integration

Located in `lib/github.ts`:

- **fetchUserIssues()** - Loads all open issues for authenticated user
- **assignIssueToMe()** - Assigns issue to current user
- **closeIssueWithWontfix()** - Adds "wontfix" label and closes
- **markIssueForLater()** - Adds "later" label
- **parseRepositoryUrl()** - Extracts owner/repo from API URL

All functions use Octokit REST client configured with `NEXT_PUBLIC_GITHUB_TOKEN`.

## State Management

Zustand store in `store/useIssuesStore.ts`:

```typescript
{
  issues: GitHubIssue[];           // All loaded issues
  currentIndex: number;             // Current card index
  swipeHistory: SwipeAction[];      // History of swipes
  loading: boolean;                 // Loading state
  error: string | null;             // Error message

  // Actions
  setIssues, setLoading, setError,
  recordSwipe, nextIssue, undo, reset,
  getCurrentIssue
}
```

## Common Development Tasks

### Adding a New Swipe Direction

1. Update `SwipeDirection` type in `types/index.ts`
2. Add detection logic in `IssueCard.tsx` `handleDragEnd()`
3. Add button in `SwipeControls.tsx`
4. Add keyboard handler in `app/page.tsx`
5. Implement GitHub API action in `lib/github.ts`
6. Add callback handler in `app/page.tsx`

### Modifying Swipe Thresholds

Edit `IssueCard.tsx`:
```typescript
const swipeThreshold = 100;      // Horizontal (left/right)
const swipeUpThreshold = -150;   // Vertical (up)
```

### Adding Issue Filters

Modify `fetchUserIssues()` in `lib/github.ts`:
```typescript
const response = await octokit.rest.issues.listForAuthenticatedUser({
  filter: 'all',           // Change filter
  state: 'open',           // Change state
  labels: 'bug',           // Add label filter
  // ... other filters
});
```

### Customizing Animations

Edit Framer Motion configs in `IssueCard.tsx`:
```typescript
dragElastic={0.7}        // Drag resistance
rotateZ                  // Rotation on drag
opacity                  // Fade on drag
```

## Environment Setup

Required environment variables in `.env.local`:

```env
# GitHub Personal Access Token (classic)
# Scopes required: repo
NEXT_PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Your GitHub username
NEXT_PUBLIC_GITHUB_USERNAME=your-username
```

**Security Notes:**
- Never commit `.env.local` (already in `.gitignore`)
- Token is exposed client-side (use fine-grained tokens in production)
- Rotate tokens regularly
- Use minimal required scopes

## Testing the App

1. **Setup** (first time):
   ```bash
   cp .env.example .env.local
   # Add your GitHub token and username to .env.local
   pnpm install
   ```

2. **Run**:
   ```bash
   pnpm dev
   ```

3. **Test swipe actions**:
   - Load issues (should fetch your open issues)
   - Try drag gestures or keyboard shortcuts
   - Verify GitHub labels/assignments are applied
   - Check undo functionality

4. **Check GitHub**:
   - Go to an issue you swiped
   - Verify label was added or issue was assigned/closed

## Debugging

### Issues Not Loading

1. Check token in `.env.local`:
   ```bash
   cat .env.local | grep GITHUB_TOKEN
   ```

2. Test token manually:
   ```bash
   curl -H "Authorization: token ghp_xxx" https://api.github.com/user/issues
   ```

3. Check browser console for API errors

### Swipe Actions Failing

1. Open browser DevTools → Network tab
2. Attempt a swipe action
3. Look for failed GitHub API calls
4. Check response error message
5. Common issues:
   - Token lacks `repo` scope
   - Label doesn't exist in repository
   - No write access to repository

### Animation Issues

1. Check Framer Motion version: `pnpm list framer-motion`
2. Verify drag handlers in `IssueCard.tsx`
3. Check for console warnings about motion components

## TypeScript Tips

- `GitHubIssue` type matches Octokit's issue response
- `SwipeDirection` is a union type: `'left' | 'right' | 'up'`
- Use `useIssuesStore` hook to access global state
- All components are client components (`'use client'`)

## Performance Considerations

- Issues loaded once on mount (100 per page, paginate if needed)
- No polling or real-time updates
- Swipe actions are optimistic (assumes success)
- Undo is instant (local state only)
- Consider adding loading states for slow API calls

## Related Documentation

- [Octokit REST API](https://octokit.github.io/rest.js/)
- [Framer Motion Drag](https://www.framer.com/motion/gestures/#drag)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Zustand](https://docs.pmnd.rs/zustand)

## Need Help?

Use the `/commit` command to create clean git commits after making changes.

This is a straightforward Next.js app - most changes will be in:
- `app/page.tsx` for logic
- `components/` for UI
- `lib/github.ts` for API calls
