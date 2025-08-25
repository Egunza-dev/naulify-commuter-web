import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // Switched to Inter for a clean, modern look
import "./globals.css";

// Configure the Inter font
const inter = Inter({ subsets: ["latin"] });

// --- NEW: Define viewport settings for a mobile-app feel ---
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents users from accidentally zooming in on the app
  themeColor: '#1A1A1A', // Sets the browser chrome color to match our background
};

// --- UPDATED: More descriptive metadata for the app ---
export const metadata: Metadata = {
  title: "Naulify Commuter",
  description: "Pay your fare quickly and easily with Naulify.",
  // Add metadata for a better mobile 'Add to Home Screen' experience
  applicationName: 'Naulify',
  appleWebApp: {
    capable: true,
    title: 'Naulify',
    statusBarStyle: 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="en">
      {/* Use the Inter font class */}
      <body className={inter.className}>
        {/* 
          --- NEW: Main container for the mobile-first layout ---
          This div creates the centered, max-width container for all pages.
        */}
        <div className="mx-auto max-w-md min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
