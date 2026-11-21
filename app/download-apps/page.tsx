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
  Check,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { SmartphoneMockup } from "@/components/MobileMockups";

export default function DownloadAppsPage() {
  const [downloadModal, setDownloadModal] = useState<string | null>(null);
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

  const appsList = [
    {
      id: "rewards-android",
      os: "Android",
      type: "Wallet & Rewards",
      title: "GrowPlus Rewards & Wallet App",
      osIcon: Smartphone,
      store: "Android APK Direct",
      version: "v1.0.0 Stable",
      size: "59.6 MB",
      badgeColor: "text-[#35E6A2] bg-[#35E6A2]/10 border-[#35E6A2]/30",
      description:
        "Manage your digital wallet balance, instant 10% first deposit bonus, and 10-tier binary referral earnings.",
      downloadUrl: "/GrowPlus_Rewards_v1.0.apk",
      fileName: "GrowPlus_Rewards_v1.0.apk",
      buttonText: "Download Rewards APK",
      isApk: true,
    },
    {
      id: "shopping-android",
      os: "Android",
      type: "E-Mall Shopping",
      title: "GrowPlus E-Mall Shopping App",
      osIcon: ShoppingBag,
      store: "Android APK Direct",
      version: "v1.0.0 Stable",
      size: "60.2 MB",
      badgeColor: "text-[#38BDF8] bg-[#38BDF8]/10 border-[#38BDF8]/30",
      description:
        "Browse the curated GrowPlus Mall, shop at wholesale Distributor Prices, and redeem shopping credits.",
      downloadUrl: "/GrowPlus_Shopping_v1.0.apk",
      fileName: "GrowPlus_Shopping_v1.0.apk",
      buttonText: "Download Shopping APK",
      isApk: true,
    },
    {
      id: "rewards-ios",
      os: "iOS (Apple)",
      type: "Wallet & Rewards",
      title: "GrowPlus Rewards iOS App",
      osIcon: Apple,
      store: "Apple App Store",
      version: "v1.0.0 Verified",
      size: "iOS 15.0+",
      badgeColor: "text-[#B44CFF] bg-[#B44CFF]/10 border-[#B44CFF]/30",
      description:
        "High-performance native Apple iOS app for wallet tracking, binary genealogy view, and daily earnings.",
      downloadUrl: "https://apps.apple.com",
      fileName: "Apple App Store",
      buttonText: "Install on iPhone / iPad",
      isApk: false,
    },
    {
      id: "shopping-ios",
      os: "iOS (Apple)",
      type: "E-Mall Shopping",
      title: "GrowPlus E-Mall iOS App",
      osIcon: Apple,
      store: "Apple App Store",
      version: "v1.0.0 Verified",
      size: "iOS 15.0+",
      badgeColor: "text-amber-300 bg-amber-400/10 border-amber-400/30",
      description:
        "Premium shopping portal on iPhone & iPad with biometric checkout and direct shopping credit redemption.",
      downloadUrl: "https://apps.apple.com",
      fileName: "Apple App Store",
      buttonText: "Install on iPhone / iPad",
      isApk: false,
    },
  ];

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
            <span>Official Mobile Applications</span>
          </div>
          <h1 className="text-4xl sm:text-5.5xl font-black tracking-tight">
            Download the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B44CFF] via-[#8B35FF] to-[#287CFF]">
              GROWPLUS MOBILE APPS
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Download both official applications: <strong className="text-white">GrowPlus Rewards &amp; Wallet App</strong> for earnings &amp; binary network tracking, and <strong className="text-white">GrowPlus E-Mall Shopping App</strong> for direct credit shopping.
          </p>
        </div>

        {/* 4 STORE AVAILABILITY & DIRECT DOWNLOAD CARDS (2 Android + 2 iOS) */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase font-extrabold tracking-wider text-[#35E6A2]">
              Select Your Application &amp; Platform (4 Options)
            </span>
            <span className="text-xs text-[#AAA2C1] font-mono">
              2 Android Apps • 2 iOS Apps
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {appsList.map((app) => {
              const IconComp = app.osIcon;
              return (
                <div
                  key={app.id}
                  className="p-6 rounded-3xl bg-[#110D24] border border-[#8B35FF]/30 hover:border-[#38BDF8] transition-all space-y-4 shadow-xl flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-black/60 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                        <IconComp className="w-6 h-6 text-[#35E6A2]" />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${app.badgeColor}`}>
                        {app.os}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#AAA2C1] block">
                        {app.type}
                      </span>
                      <h3 className="text-lg font-black text-white mt-0.5 group-hover:text-[#38BDF8] transition-colors">
                        {app.title}
                      </h3>
                      <p className="text-xs text-[#AAA2C1] mt-2 leading-relaxed">
                        {app.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs text-[#AAA2C1]">
                      <span>{app.version}</span>
                      <span className="font-mono text-[#35E6A2] font-semibold">{app.size}</span>
                    </div>

                    {app.isApk ? (
                      <a
                        href={app.downloadUrl}
                        download={app.fileName}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all hover:scale-102 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>{app.buttonText}</span>
                      </a>
                    ) : (
                      <a
                        href="/register"
                        onClick={(e) => {
                          e.preventDefault();
                          setDownloadModal(app.title);
                        }}
                        className="w-full py-3 rounded-xl bg-[#287CFF] hover:bg-[#35E6A2] hover:text-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102 cursor-pointer"
                      >
                        <Apple className="w-4 h-4" />
                        <span>{app.buttonText}</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* APPLE IOS MODAL DIALOG */}
        {downloadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="relative w-full max-w-md p-6 rounded-3xl bg-[#141E45] border border-[#38BDF8]/50 shadow-2xl space-y-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto">
                <Apple className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-white">{downloadModal}</h4>
                <p className="text-xs text-[#AAA2C1]">
                  Official iOS App for iPhone and iPad is registered with Apple Developer &amp; App Store.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-left space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#35E6A2]" />
                  <span>Compatible with iOS 15.0 or later</span>
                </div>
                <div className="flex items-center gap-2 text-white font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" />
                  <span>Syncs automatically with your GrowPlus web dashboard</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDownloadModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href="/register"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black text-xs font-black flex items-center justify-center gap-1 shadow-md hover:scale-102 transition-all cursor-pointer"
                >
                  <span>Activate Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

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
                Two Dedicated Mobile Applications
              </h2>

              <p className="text-sm text-[#AAA2C1] leading-relaxed">
                The <strong className="text-white">GrowPlus Rewards App</strong> is your comprehensive earnings command center: manage your member profile, track monthly reward accruals, view transparent wallet transaction records, and monitor your 10-tier binary tree. The <strong className="text-white">GrowPlus E-Mall Shopping App</strong> enables instant wholesale product orders with shopping credit redemptions.
              </p>

              {/* Shopping Integration Callout */}
              <div className="p-4 rounded-2xl bg-[#161033] border border-[#35E6A2]/30 flex items-start gap-3">
                <ShoppingBag className="w-5 h-5 text-[#35E6A2] shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-white block">Dedicated E-Mall Shopping Engine</span>
                  <span className="text-[#AAA2C1]">
                    Shop 100% verified health, wellness, and lifestyle products at discounted Distributor Price (DP). Apply available balance and shopping credits at checkout.
                  </span>
                </div>
              </div>

              {/* 8 Feature Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {rewardsAppFeatures.map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <div key={i} className="p-3 rounded-2xl bg-[#161132] border border-white/5 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center text-[#35E6A2] shrink-0 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{feat.title}</div>
                        <div className="text-[11px] text-[#AAA2C1] leading-tight mt-0.5">{feat.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Mockup Display (5 cols) */}
            <div className="lg:col-span-5 flex justify-center">
              <SmartphoneMockup type="rewards" />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DISTRIBUTOR & SHOPPING ACCESS REGISTRATION */}
        {/* ======================================================== */}
        <div id="waitlist" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#191035] via-[#24154E] to-[#111C3E] border border-[#8B35FF]/40 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#35E6A2] bg-[#35E6A2]/10 px-3 py-1 rounded-full border border-[#35E6A2]/30">
              Official Distributor Access
            </span>

            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Activate Your Partner Account &amp; E-Mall Access
            </h3>

            <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
              New members receive an exclusive <strong>₹500 Welcome Shopping Credits Voucher</strong> and instant 10% cash bonus on first deposit (₹500 - ₹5,000).
            </p>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#35E6A2]/15 border border-[#35E6A2]/40 text-[#35E6A2] space-y-2 animate-fadeIn">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <h4 className="font-bold text-base text-white">Registration Details Received!</h4>
                <p className="text-xs text-white/80">
                  We have registered your details. Your GrowPlus Partner Dashboard is activated with welcome shopping credits.
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white font-bold text-xs shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Register Partner Account &amp; Claim ₹500 Bonus</span>
                </button>
              </form>
            )}

            <div className="text-[10px] text-[#AAA2C1]/60">
              We respect your privacy. No spam. You will only receive official account and order notifications.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
