"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import {
  ShieldAlert,
  Send,
  MessageCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { TwitterIcon, InstagramIcon, LinkedinIcon } from "./SocialIcons";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="relative bg-[#05040C] border-t border-[#8B35FF]/20 text-[#AAA2C1] text-sm overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8B35FF]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#287CFF]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand & Ecosystem Column (2 spans on desktop) */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Logo size="lg" showTagline={true} />
            <p className="text-[#AAA2C1] text-sm leading-relaxed max-w-sm">
              GROWPLUS is a next-generation digital rewards and shopping ecosystem.
              Explore opportunities, track eligible rewards, build your community network, and enjoy shopping with your credits through one connected platform.
            </p>

            {/* Newsletter / Early Access */}
            <div className="mt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#35E6A2]" />
                Get VIP Early Access Alerts
              </span>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-[#100D20] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/60 focus:outline-none focus:border-[#8B35FF] transition-all"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Join</span>
                </button>
              </form>
              {subscribed && (
                <div className="flex items-center gap-1.5 text-xs text-[#35E6A2] mt-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thank you! You are on the VIP Early Access list.</span>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#100D20] border border-white/10 flex items-center justify-center hover:border-[#8B35FF] hover:text-white transition-all hover:scale-105"
                aria-label="Twitter / X"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#100D20] border border-white/10 flex items-center justify-center hover:border-[#8B35FF] hover:text-white transition-all hover:scale-105"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#100D20] border border-white/10 flex items-center justify-center hover:border-[#8B35FF] hover:text-white transition-all hover:scale-105"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#100D20] border border-white/10 flex items-center justify-center hover:border-[#8B35FF] hover:text-white transition-all hover:scale-105"
                aria-label="Community Telegram"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-1">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/rewards" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Rewards Program
                </Link>
              </li>
              <li>
                <Link href="/download-apps" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Download Mobile Apps
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Ecosystem & Applications */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-1">
              Ecosystem
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/download-apps" className="hover:text-white flex items-center gap-1.5">
                  <span>GrowPlus Rewards App (Android &amp; iOS)</span>
                  <span className="text-[10px] text-[#35E6A2] bg-[#35E6A2]/10 px-1.5 py-0.5 rounded font-mono">
                    Coming Soon
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/download-apps#waitlist" className="hover:text-white flex items-center gap-1.5">
                  <span>Join App Beta Waitlist</span>
                  <span className="text-[10px] text-[#8B35FF] bg-[#8B35FF]/10 px-1.5 py-0.5 rounded font-mono">
                    VIP Early Access
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/rewards#referral" className="hover:text-white">
                  Referral Network
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#shopping-credits" className="hover:text-white">
                  Shopping Credits Redemption
                </Link>
              </li>
              <li>
                <Link href="/contact#partners" className="hover:text-white">
                  Merchant Partnership Inquiries
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Member Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Support */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-1">
              Support & Security
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-white/90">
                <Lock className="w-4 h-4 text-[#35E6A2]" />
                <span>256-bit SSL Data Encryption</span>
              </div>
              <p className="text-[#AAA2C1] text-xs leading-relaxed">
                Dedicated help desk & community concierge available Monday – Saturday, 9:00 AM – 7:00 PM IST.
              </p>
              <div className="pt-2">
                <span className="block text-white text-xs font-semibold">Official Helpline:</span>
                <span className="text-white/80 font-mono text-xs">+91 8000 476 975</span>
              </div>
              <div>
                <span className="block text-white text-xs font-semibold">Inquiries:</span>
                <span className="text-[#8B35FF] font-mono text-xs">support@growplus.eco</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regulatory & Legal Compliance Advisory Box */}
        <div className="mb-10 p-5 rounded-2xl bg-[#100D20]/90 border border-amber-500/30 text-xs leading-relaxed text-[#AAA2C1] flex flex-col sm:flex-row gap-4 items-start">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-semibold text-amber-300">
              Regulatory Advisory & Program Terms Notice:
            </p>
            <p>
              GROWPLUS provides a digital community rewards, referral loyalty, and merchant shopping ecosystem. All figures, percentage rates (including educational previews of up to 10% monthly reward tiers), and balance models shown across this website are illustrative conceptual placeholders for Phase 1 presentation and do not constitute guaranteed financial returns, collective investment schemes, banking deposits, or SEBI/RBI-regulated financial products. GrowPlus does not collect unauthorized investment deposits. Final loyalty and reward mechanisms are subject to formal regulatory review under applicable Indian law before public launch.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policy Links */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © 2026 GROWPLUS Ecosystem Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[#AAA2C1]">
            <Link href="/faqs" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/faqs" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/rewards#legal" className="hover:text-white transition-colors">
              Rewards Policy
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Grievance Officer
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
