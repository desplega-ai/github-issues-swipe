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

- **Swipe Interface**: Triage issues with intuitive swipe gestures
- **Local Storage**: Your token and preferences are stored securely in your browser
- **Dynamic Fetching**: Loads your actual GitHub issues in real-time
- **Use keyboard shortcuts** for faster triage:
  - `←` Left Arrow: Later
  - `↑` Up Arrow: Close with wontfix
  - `→` Right Arrow: Assign to me
  - `Ctrl/Cmd + Z`: Undo

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)
5. **Onboarding**: The app will ask for your GitHub Personal Access Token on the first load. This token is stored **locally** in your browser and is never sent to our servers.

## Environment Variables

The app previously required `.env.local` for tokens. This is no longer needed for the core functionality.
You may still use `.env.local` for other configurations if needed.

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
