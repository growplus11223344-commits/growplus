import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GROWPLUS — Premium Digital Rewards & Shopping Ecosystem",
  description:
    "Discover a connected rewards, referral and shopping experience with GrowPlus. Explore opportunities, track eligible rewards and enjoy shopping through one connected ecosystem.",
  keywords: [
    "GrowPlus",
    "Digital Rewards",
    "Shopping Ecosystem",
    "Loyalty Program",
    "Referral Rewards",
    "E-commerce Shopping",
    "Fintech Rewards",
  ],
  authors: [{ name: "GrowPlus Ecosystem" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#070611] text-white selection:bg-[#8B35FF]/30 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
