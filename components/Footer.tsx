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
  ShieldCheck,
  Award,
  Smartphone,
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
    <footer className="relative bg-[#050714] border-t border-[#287CFF]/20 text-[#AAA2C1] text-sm overflow-hidden">
      {/* Background ambient glow circles */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#287CFF]/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#35E6A2]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          
          {/* Brand & Mission Column (2 spans on desktop) */}
          <div className="lg:col-span-2 flex flex-col gap-5 text-left">
            <Logo size="lg" showTagline={true} />
            <p className="text-[#AAA2C1] text-xs sm:text-sm leading-relaxed max-w-sm">
              GROWPLUS is India&apos;s direct selling wellness and binary networking platform. 
              Delivering certified AYUSH and FSSAI health formulations, an ethical 1:1 binary compensation plan, flat 10% first-bill direct referral rewards, and a dedicated mobile distributor app.
            </p>

            {/* Newsletter */}
            <div className="mt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[#35E6A2]" />
                Join Distributor Announcement Channel
              </span>
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-[#0E1533] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/60 focus:outline-none focus:border-[#38BDF8] transition-all"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Join</span>
                </button>
              </form>
              {subscribed && (
                <div className="flex items-center gap-1.5 text-xs text-[#35E6A2] mt-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Thank you! You are subscribed to distributor announcements.</span>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0E1533] border border-white/10 flex items-center justify-center hover:border-[#38BDF8] hover:text-white transition-all hover:scale-105"
                aria-label="Twitter / X"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0E1533] border border-white/10 flex items-center justify-center hover:border-[#38BDF8] hover:text-white transition-all hover:scale-105"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0E1533] border border-white/10 flex items-center justify-center hover:border-[#38BDF8] hover:text-white transition-all hover:scale-105"
                aria-label="LinkedIn"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-[#0E1533] border border-white/10 flex items-center justify-center hover:border-[#38BDF8] hover:text-white transition-all hover:scale-105"
                aria-label="Community Telegram"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-1">
              Website Sections
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/#home" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#features" className="hover:text-[#38BDF8] hover:translate-x-1 inline-block transition-transform font-semibold">
                  Features &amp; Binary Plan
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#referral" className="hover:text-amber-300 hover:translate-x-1 inline-block transition-transform font-semibold">
                  Referral (10% First Bill)
                </Link>
              </li>
              <li>
                <Link href="/#download" className="hover:text-[#35E6A2] hover:translate-x-1 inline-block transition-transform font-semibold">
                  Download Mobile App (Shop)
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-white hover:translate-x-1 inline-block transition-transform">
                  Contact Helpdesk
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Mobile App & Products */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-1">
              Distributor App
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="text-[#AAA2C1]">
                Products &amp; orders are exclusively available inside the GrowPlus App:
              </li>
              <li>
                <Link href="/download-apps" className="hover:text-[#35E6A2] flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-[#35E6A2]" />
                  <span>Android APK Direct (v2.4.1)</span>
                </Link>
              </li>
              <li>
                <Link href="/download-apps" className="hover:text-[#38BDF8] flex items-center gap-1.5">
                  <span className="text-xs"></span>
                  <span>Apple iOS App Store Beta</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white">
                  Distributor Web Portal
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-[#35E6A2] font-bold">
                  Free KYC Registration &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trust & Support */}
          <div className="flex flex-col gap-3 text-left">
            <h4 className="text-white font-bold text-sm tracking-wide uppercase mb-1">
              Trust &amp; Direct Selling
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-white/90">
                <ShieldCheck className="w-4 h-4 text-[#35E6A2]" />
                <span>Direct Selling Guidelines 2021</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Award className="w-4 h-4 text-amber-400" />
                <span>AYUSH Premium &amp; FSSAI Licensed</span>
              </div>
              <p className="text-[#AAA2C1] text-xs leading-relaxed">
                Nodal Grievance Redressal officer available Mon–Sat, 9:30 AM – 6:30 PM IST.
              </p>
              <div className="pt-1">
                <span className="block text-white text-xs font-semibold">Toll-Free Helpline:</span>
                <span className="text-[#35E6A2] font-mono text-xs font-bold">+91 1800 890 4765</span>
              </div>
              <div>
                <span className="block text-white text-xs font-semibold">Distributor Desk:</span>
                <span className="text-[#38BDF8] font-mono text-xs">support@growplus.eco</span>
              </div>
            </div>
          </div>

        </div>

        {/* Regulatory & Direct Selling Guidelines Notice */}
        <div className="mb-10 p-5 rounded-2xl bg-[#0E1533]/90 border border-[#35E6A2]/30 text-xs leading-relaxed text-[#AAA2C1] flex flex-col sm:flex-row gap-4 items-start text-left">
          <ShieldCheck className="w-5 h-5 text-[#35E6A2] shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="font-semibold text-white">
              Direct Selling Regulatory Compliance &amp; Consumer Protection Statement:
            </p>
            <p>
              GROWPLUS operates in strict conformity with the Consumer Protection (Direct Selling) Rules, 2021 issued by the Ministry of Consumer Affairs, Food &amp; Public Distribution, Government of India. There is zero joining fee and zero mandatory kit purchase requirement to become a distributor. All products are available to order via our official mobile app at wholesale Distributor Prices (DP).
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Policy Links */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © 2026 GROWPLUS Global Wellness Marketing Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[#AAA2C1]">
            <Link href="/faqs" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/faqs" className="hover:text-white transition-colors">
              Direct Selling Code of Conduct
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Grievance Redressal
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Return &amp; Refund Policy (30 Days)
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
