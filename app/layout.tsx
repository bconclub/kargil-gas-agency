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
  metadataBase: new URL("http://localhost:4100"),
  title: {
    default: "Kargil Gas Agencies · Operations",
    template: "%s · Kargil Gas Agencies",
  },
  description: "Data entry & reporting system for Kargil Gas Agencies",
  openGraph: {
    title: "Kargil Gas Agencies · Operations",
    description: "Daily entry, calendar, and reports for Kargil Gas Agencies.",
    siteName: "Kargil Gas Agencies",
    images: ["/logo-full.png"],
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
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
