import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1A1A1A',
};

export const metadata: Metadata = {
  title: "Naulify Commuter",
  description: "Pay your fare quickly and easily with Naulify.",
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
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="mx-auto max-w-md min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
