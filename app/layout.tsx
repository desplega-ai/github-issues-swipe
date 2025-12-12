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
      </body>
    </html>
  );
}
