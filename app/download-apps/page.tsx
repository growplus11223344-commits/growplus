"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  Apple,
  Download,
  Sparkles,
  CheckCircle2,
  Bell,
  Users,
  Gift,
  ShoppingBag,
  CreditCard,
  History,
  ShieldCheck,
  Star,
  Layers,
  Send,
  Zap,
} from "lucide-react";
import { SmartphoneMockup } from "@/components/MobileMockups";

export default function DownloadAppsPage() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistMobile, setWaitlistMobile] = useState("");
  const [waitlistPlatform, setWaitlistPlatform] = useState("Both");
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistEmail && waitlistMobile) {
      setSubmitted(true);
      setTimeout(() => {
        setWaitlistEmail("");
        setWaitlistMobile("");
      }, 3000);
    }
  };

  const rewardsAppFeatures = [
    { title: "Encrypted Member Account", desc: "Biometric authentication & secure 256-bit keys.", icon: ShieldCheck },
    { title: "Real-time Dashboard", desc: "Live balance overview, accumulated points & metrics.", icon: Layers },
    { title: "Rewards Overview Engine", desc: "Track up to 10% monthly loyalty tiers & promo perks.", icon: Gift },
    { title: "1-Click Referral Network", desc: "Personal code generator & multi-level tree tracking.", icon: Users },
    { title: "Shopping Credits Wallet", desc: "Manage 1:1 rupee parity credits with zero decay.", icon: CreditCard },
    { title: "Transaction Ledger History", desc: "Immutable itemized records of accruals & redemptions.", icon: History },
    { title: "In-App Shopping Gateway", desc: "Redeem credits directly for electronics, audio & fashion.", icon: ShoppingBag },
    { title: "Instant Push Notifications", desc: "Real-time alerts for bonus milestones & referral joins.", icon: Bell },
  ];

  return (
    <div className="relative min-h-screen bg-[#070611] text-white py-12 sm:py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#8B35FF]/20 via-[#287CFF]/15 to-transparent blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1235] border border-[#8B35FF]/40 text-xs font-semibold text-white/90">
            <Smartphone className="w-3.5 h-3.5 text-[#35E6A2]" />
            <span>Official Mobile Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5.5xl font-black tracking-tight">
            Download the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B44CFF] via-[#8B35FF] to-[#287CFF]">
              GROWPLUS REWARDS APP
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Your all-in-one digital application for rewards tracking, community referral growth, and in-app shopping credit redemption. Available for Android &amp; iOS.
          </p>
        </div>

        {/* Store Availability & Direct Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          {/* Google Play (Android) */}
          <div className="p-6 rounded-3xl bg-[#110D24] border border-[#8B35FF]/40 hover:border-[#8B35FF] transition-all space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-black/60 flex items-center justify-center text-[#35E6A2]">
                <Smartphone className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-1 rounded-full border border-[#35E6A2]/30">
                Google Play Store
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Android Application</h3>
              <p className="text-xs text-[#AAA2C1] mt-1">
                Optimized for all Android smartphones (Android 8.0+). Direct APK and Play Store release.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs text-[#AAA2C1]">
              <span>Status: Final QA Beta</span>
              <span className="font-mono text-[#35E6A2]">Coming Soon</span>
            </div>
            <a
              href="#waitlist"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-opacity"
            >
              <Download className="w-4 h-4" />
              <span>Get Android Beta Launch Alert</span>
            </a>
          </div>

          {/* Apple App Store (iOS) */}
          <div className="p-6 rounded-3xl bg-[#110D24] border border-[#287CFF]/40 hover:border-[#287CFF] transition-all space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-black/60 flex items-center justify-center text-white">
                <Apple className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-1 rounded-full border border-[#35E6A2]/30">
                Apple App Store
              </span>
            </div>
            <div>
              <h3 className="text-xl font-black text-white">iOS Application</h3>
              <p className="text-xs text-[#AAA2C1] mt-1">
                Designed for iPhone &amp; iPad (iOS 15.0+). High-performance native experience.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs text-[#AAA2C1]">
              <span>Status: Apple TestFlight Beta</span>
              <span className="font-mono text-[#35E6A2]">Coming Soon</span>
            </div>
            <a
              href="#waitlist"
              className="w-full py-3 rounded-xl bg-[#287CFF] hover:bg-[#35E6A2] hover:text-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Get iOS Beta Launch Alert</span>
            </a>
          </div>
        </div>

        {/* ======================================================== */}
        {/* REWARDS APP SHOWCASE & IN-APP SHOPPING NOTICE */}
        {/* ======================================================== */}
        <div id="rewards-app" className="p-8 sm:p-12 rounded-3xl bg-[#100D22] border border-[#8B35FF]/40 shadow-2xl mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Description & Features (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B35FF]/20 border border-[#8B35FF]/40 text-xs font-bold text-[#B44CFF]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Complete Digital Ecosystem Engine</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Everything in One Unified Mobile Application
              </h2>

              <p className="text-sm text-[#AAA2C1] leading-relaxed">
                The GrowPlus Rewards App is your comprehensive command center. Manage your member profile, track monthly reward accruals, view transparent wallet transaction records, share referral links, and seamlessly access the in-app shopping gateway.
              </p>

              {/* Shopping Integration Callout */}
              <div className="p-4 rounded-2xl bg-[#161033] border border-[#35E6A2]/30 flex items-start gap-3">
                <ShoppingBag className="w-5 h-5 text-[#35E6A2] shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-white block">
                    Integrated In-App Shopping Access
                  </span>
                  <p className="text-[#AAA2C1] leading-relaxed">
                    You do not need a separate shopping app. The full merchant catalog and 1-tap credit redemption are accessible directly inside your GrowPlus Rewards App.
                  </p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {rewardsAppFeatures.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#150F2C] border border-white/5 flex items-start gap-3"
                    >
                      <div className="p-2 rounded-xl bg-[#8B35FF]/20 text-[#B44CFF] shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white">{feat.title}</h4>
                        <p className="text-[11px] text-[#AAA2C1] leading-relaxed mt-0.5">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Interactive Mockup (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="text-xs font-semibold text-[#AAA2C1] mb-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#35E6A2] animate-pulse" />
                <span>Interactive GrowPlus Rewards App Preview</span>
              </div>
              <SmartphoneMockup type="rewards" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* VIP BETA EARLY ACCESS WAITLIST SECTION */}
        {/* ======================================================== */}
        <div id="waitlist" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#191035] via-[#24154E] to-[#111C3E] border border-[#8B35FF]/40 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#35E6A2] bg-[#35E6A2]/10 px-3 py-1 rounded-full border border-[#35E6A2]/30">
              Be The First To Install
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Get Notified The Moment The App Drops
            </h3>

            <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
              Early waitlist members receive an exclusive <strong>₹500 Welcome Shopping Credits Voucher</strong> upon app installation and priority invite access to beta builds.
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#35E6A2]/15 border border-[#35E6A2]/40 text-[#35E6A2] space-y-2 animate-fadeIn">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <h4 className="font-bold text-base text-white">You&apos;re On The VIP Waitlist!</h4>
                <p className="text-xs text-white/80">
                  We have registered your details. You will receive an exclusive download link via SMS and email as soon as the GrowPlus Rewards App goes live.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4 max-w-md mx-auto text-left">
                <div>
                  <label className="text-[11px] text-[#AAA2C1] block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-[#0E0A1D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none focus:border-[#8B35FF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#AAA2C1] block mb-1">Mobile Number (for SMS Alert)</label>
                  <input
                    type="tel"
                    required
                    value={waitlistMobile}
                    onChange={(e) => setWaitlistMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#0E0A1D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none focus:border-[#8B35FF]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#AAA2C1] block mb-1">Platform Preference</label>
                  <select
                    value={waitlistPlatform}
                    onChange={(e) => setWaitlistPlatform(e.target.value)}
                    className="w-full bg-[#0E0A1D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#8B35FF]"
                  >
                    <option value="Both">Both Android &amp; iOS</option>
                    <option value="Android">Android (Google Play / APK)</option>
                    <option value="iOS">iOS (Apple App Store)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white font-bold text-xs shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Reserve My VIP Beta Access &amp; ₹500 Bonus</span>
                </button>
              </form>
            )}

            <div className="text-[10px] text-[#AAA2C1]/60">
              We respect your privacy. No spam. You will only receive official launch notifications.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
