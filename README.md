# GitHub Issues Swipe 🎯

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

> **Triage GitHub issues 10x faster. Swipe your way to Inbox Zero.**

👉 **[Use it for free at swipe.desplega.sh](https://swipe.desplega.sh)**


![GitHub Issues Swipe Demo](./demo.gif)

## Why do I need this?

Managing GitHub issues can be tedious. Endless lists, clicking into details, switching contexts... it slows you down.

**GitHub Issues Swipe** turns triage into a game. It's built for maintainers who want to clear their backlog fast without losing context.

- ⚡️ **Speed**: Triage an issue in seconds, not minutes.
- 🧠 **Focus**: See one issue at a time. No distractions.
- ⌨️ **Flow**: Keyboard shortcuts for power users.
- 🔒 **Privacy & Security**: **Zero server-side storage.** Everything lives in your browser. Your token is stored locally and never sent to our servers.


## Features

- **Swipe Left** (←) → Audit later (adds "later" label)
- **Swipe Up** (↑) → Close as "wontfix"
- **Swipe Right** (→) → Assign to yourself
- **Undo** (Ctrl/Cmd + Z) → Made a mistake? Undo it instantly.
- **Real-time Sync**: Actions are reflected on GitHub immediately.

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Connect GitHub

The app will ask for a **Personal Access Token** on first load.
1. Generate a token with `repo` scope.
2. Paste it in.
3. Start swiping.

> Note: The token is stored in `localStorage`.

## Tech Stack

Built with the modern web stack for maximum performance and DX:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State**: [Zustand](https://github.com/pmndrs/zustand)
- **API**: [Octokit](https://github.com/octokit/octokit.js)

## Contributing

We love contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

## License

[MIT](LICENSE)
