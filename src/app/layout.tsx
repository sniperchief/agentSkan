import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "agentSkan - AI Agent Risk Scanner",
  description: "Scan AI agent GitHub repositories for risk signals. Built for the Base ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#09090b]`}
      >
        <div className="grid-overlay" />
        <Navbar />
        <div className="relative z-10 pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
