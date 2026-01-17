import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Lexip - AI Thumbnail Generator",
    template: "%s | Lexip",
  },
  description: "Create high-converting YouTube thumbnails with AI in seconds. Premium thumbnail generation for content creators.",
  keywords: ["AI", "thumbnail generator", "YouTube", "content creation", "thumbnail maker"],
  authors: [{ name: "Lexip" }],
  creator: "Lexip",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lexip.app",
    title: "Lexip - AI Thumbnail Generator",
    description: "Create high-converting YouTube thumbnails with AI in seconds.",
    siteName: "Lexip",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lexip - AI Thumbnail Generator",
    description: "Create high-converting YouTube thumbnails with AI in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}

