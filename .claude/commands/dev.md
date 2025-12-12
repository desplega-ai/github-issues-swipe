# Start Development Server

Start the Next.js development server and provide helpful context.

## What This Does

1. Starts the development server on http://localhost:3000
2. Enables hot reload for instant updates
3. Shows helpful reminders about setup

## Before Running

Make sure you have:
- ✅ Installed dependencies: `pnpm install`
- ✅ Created `.env.local` with your GitHub token and username
- ✅ GitHub token has `repo` scope

## Starting the Server

```bash
pnpm dev
```

The app will be available at: **http://localhost:3000**

## First Time Setup?

If you haven't set up your environment yet:

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add:
   - Your GitHub personal access token (from https://github.com/settings/tokens)
   - Your GitHub username

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Then run this command again!

## Helpful Commands While Developing

- **View logs**: Check the terminal where `pnpm dev` is running
- **Stop server**: Press `Ctrl+C` in the terminal
- **Restart server**: Stop it, then run `pnpm dev` again
- **Check for errors**: Look at the terminal output and browser console

## Common Issues

**Port 3000 already in use?**
```bash
# Use a different port
pnpm dev -p 3001
```

**Environment variables not loading?**
- Restart the dev server after editing `.env.local`
- Make sure file is named exactly `.env.local` (not `.env`)

**GitHub API errors?**
- Check your token in `.env.local`
- Verify token has `repo` scope
- Test token: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user`

## What to Test

Once the server is running:

1. **Load Issues**: Open http://localhost:3000 - should fetch your open issues
2. **Swipe Left**: Try marking an issue for later
3. **Swipe Right**: Try assigning an issue to yourself
4. **Swipe Up**: Try closing an issue with wontfix
5. **Keyboard**: Test arrow keys (←, →, ↑) and Ctrl+Z for undo

Check your actual GitHub issues to verify actions worked!

## Ready?

Let me start the development server for you now.
