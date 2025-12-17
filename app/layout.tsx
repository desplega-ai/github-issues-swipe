import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://swipe.desplega.sh'),
  title: "GitHub Issues Swipe - Triage Issues Fast",
  description: "Triage your GitHub issues with swipe gestures. A fast and fun way to manage your repository issues.",
  openGraph: {
    title: "GitHub Issues Swipe",
    description: "Triage your GitHub issues with swipe gestures",
    url: 'https://swipe.desplega.sh',
    siteName: 'GitHub Issues Swipe',
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}

        {/* Footer with Linear and Jira icons - Desktop only */}
        <div className="hidden md:block fixed bottom-4 right-4 z-50">
          <div className="flex gap-3">
            <a
              href="https://github.com/desplega-ai/github-issues-swipe/issues/1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border-2 border-gray-700 bg-gray-900/90 px-4 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all hover:border-blue-500 hover:text-blue-400 hover:shadow-lg"
              title="Vote for Linear Integration"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="images/linear-light-logo.svg" alt="Linear Logo" className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/desplega-ai/github-issues-swipe/issues/2"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border-2 border-gray-700 bg-gray-900/90 px-4 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all hover:border-blue-500 hover:text-blue-400 hover:shadow-lg"
              title="Vote for Jira Integration"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="images/jira.png" alt="Jira Logo" className="h-5 w-5" />
            </a>
            <a
              href="https://github.com/desplega-ai/github-issues-swipe"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border-2 border-gray-700 bg-gray-900/90 px-4 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all hover:border-blue-500 hover:text-blue-400 hover:shadow-lg"
              title="View on GitHub"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="images/github-mark-white.png" alt="GitHub Logo" className="h-5 w-5" />
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
