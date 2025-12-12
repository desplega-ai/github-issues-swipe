# Setup Guide

## Step-by-Step Setup

### 1. Get Your GitHub Token

1. Visit https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name like "Issues Swipe App"
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your info
nano .env.local  # or use your favorite editor
```

Add your credentials:
```env
NEXT_PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_GITHUB_USERNAME=your-github-username
```

### 3. Install and Run

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open http://localhost:3000 and start swiping!

## First Time Running?

The app will:
1. Load all your open issues across all repositories
2. Display them one at a time as swipeable cards
3. Wait for you to swipe or use keyboard shortcuts

## Creating Required Labels

The app uses two labels that might not exist in your repos:
- `later` (for swipe left)
- `wontfix` (for swipe up)

**Option 1: Let it fail first**
- Try swiping, the API call will fail if label doesn't exist
- Go to that repo → Issues → Labels → Create them manually

**Option 2: Pre-create labels**
1. Go to each repository
2. Navigate to Issues → Labels
3. Create:
   - Label: `later`, Color: `#fbca04` (yellow)
   - Label: `wontfix`, Color: `#e11d21` (red)

## Keyboard Shortcuts

Once running, you can use:
- `←` Left: Later
- `↑` Up: Close with wontfix
- `→` Right: Assign to me
- `Ctrl+Z` / `Cmd+Z`: Undo (local only, doesn't reverse API call)

## Troubleshooting

### Token Issues

If you see "Failed to fetch issues":
```bash
# Check your token is in .env.local
cat .env.local

# Make sure it starts with ghp_ or ghp_classic_
# and has the repo scope
```

### Username Issues

If you see "Failed to assign":
```bash
# Verify your username
echo $NEXT_PUBLIC_GITHUB_USERNAME

# Test it matches your GitHub profile
curl https://api.github.com/users/YOUR_USERNAME
```

### Port Already in Use

If port 3000 is busy:
```bash
# Use a different port
pnpm dev -p 3001
```

## Security Notes

- Never commit `.env.local` to git (it's in `.gitignore`)
- Don't share your GitHub token
- Token expires based on your settings (regenerate if needed)
- This app runs entirely client-side (no backend)

## What's Next?

After setup, the app is ready to use! Some tips:

- **Start small**: Triage 5-10 issues first to get the feel
- **Use keyboard**: Much faster than mouse dragging
- **Check labels**: Make sure "later" and "wontfix" labels exist
- **Refresh**: Click "Reload Issues" when done to get fresh list

---

Need help? Check the main [README.md](./README.md) for more details.
