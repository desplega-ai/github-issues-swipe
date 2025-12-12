# GitHub Issues Swipe 🎯

Triage your GitHub issues with Tinder-style swipe gestures. Built with Next.js, TypeScript, Framer Motion, and the GitHub API.

![GitHub Issues Swipe Demo](./demo.gif)

## Features

- **Swipe Left** (←) → Mark for later (adds "later" label)
- **Swipe Up** (↑) → Close with "wontfix" label
- **Swipe Right** (→) → Assign issue to yourself
- **Undo** (Ctrl/Cmd + Z) → Reverse last action (local only)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up GitHub Token

1. Go to [GitHub Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Create a new token (classic) with the following scopes:
   - `repo` (Full control of private repositories)
3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. Edit `.env.local` and add your credentials:

```env
NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_token_here
NEXT_PUBLIC_GITHUB_USERNAME=your-username
```

### 3. Run the App

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start triaging!

## How It Works

### Swipe Gestures

- **Drag cards** with your mouse/finger
- **Use keyboard shortcuts** for faster triage:
  - `←` Left Arrow: Later
  - `↑` Up Arrow: Close with wontfix
  - `→` Right Arrow: Assign to me
  - `Ctrl/Cmd + Z`: Undo

### What Happens on Each Swipe

| Direction | Action | GitHub API Call |
|-----------|--------|----------------|
| Left | Later | Adds "later" label to issue |
| Up | Wontfix | Adds "wontfix" label + closes issue |
| Right | Assign | Assigns issue to you |

## Architecture

```
github-issues-swipe/
├── app/
│   ├── page.tsx          # Main app logic
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── IssueCard.tsx     # Swipeable card component
│   └── SwipeControls.tsx # Button controls
├── lib/
│   └── github.ts         # GitHub API utilities
├── store/
│   └── useIssuesStore.ts # Zustand state management
├── types/
│   └── index.ts          # TypeScript types
└── .env.example          # Environment variables template
```

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **Octokit** - GitHub API client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Development

### Project Structure

- **app/page.tsx**: Main application logic, loads issues, handles swipes
- **components/IssueCard.tsx**: Draggable card with swipe detection
- **lib/github.ts**: GitHub API functions (fetch, assign, close, label)
- **store/useIssuesStore.ts**: Global state for issues and swipe history

### Adding Features

1. **New swipe directions**: Modify `SwipeDirection` type and add handlers
2. **Custom labels**: Edit `lib/github.ts` functions
3. **Filters**: Add issue filtering in `fetchUserIssues()`
4. **Animations**: Customize Framer Motion configs in components

## Troubleshooting

### "Failed to fetch issues"

- Check your GitHub token has `repo` scope
- Verify token in `.env.local`
- Check token hasn't expired

### "Failed to assign issue"

- Ensure `NEXT_PUBLIC_GITHUB_USERNAME` is correct
- Check you have write access to the repository

### Labels not created automatically

GitHub won't auto-create labels. You need to:
1. Go to repository → Issues → Labels
2. Create "later" and "wontfix" labels manually

Or the API calls will fail silently.

## License

MIT

## Contributing

PRs welcome! Some ideas:

- [ ] Add issue filtering by repo/label
- [ ] Batch operations
- [ ] Keyboard navigation for next/prev
- [ ] Dark/light mode toggle
- [ ] Issue preview modal
- [ ] Analytics dashboard

---

Made with ❤️ for productive issue triage
