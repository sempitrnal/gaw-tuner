import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "gaw tuner",
    template: "%s | gaw tuner",
  },
  description: "tuner para sa mga gaws",
  keywords: [
    "guitar tuner",
    "online guitar tuner",
    "chromatic tuner",
    "pitch detection",
    "web audio tuner",
    "drop D tuner",
    "drop C tuner",
    "open G tuner",
    "acoustic guitar tuner",
    "electric guitar tuner",
  ],
  applicationName: "gaw tuner",
  authors: [{ name: "sempitrnal" }],
  creator: "bo",
  metadataBase: new URL("https://gaw-tuner.vercel.app"),
  manifest: "/manifest.json",
  themeColor: "#09090b",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "gaw tuner",
    description:
      "Free online guitar tuner with real-time pitch detection. Works offline, supports 6+ tunings.",
    url: "/",
    siteName: "gaw tuner",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "gaw tuner",
    description: "tuner para sa mga gaws",
    creator: "@bo",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "gaw tuner",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#09090b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="gaw tuner" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950">{children}</body>
    </html>
  );
}
