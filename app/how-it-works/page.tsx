"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  CreditCard,
  TrendingUp,
  Coins,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Zap,
  Users,
  Smartphone,
} from "lucide-react";

export default function HowItWorksPage() {
  const [activeStage, setActiveStage] = useState(0);

  const journeyStages = [
    {
      id: "registration",
      number: "01",
      icon: UserPlus,
      title: "Account Registration",
      tagline: "Instant Onboarding & Digital Identity Setup",
      description:
        "Join in under 60 seconds with your mobile number and email. Every member is assigned an encrypted digital GP identity that connects directly to the GrowPlus platform and companion mobile app.",
      details: [
        "Zero registration fee or hidden setup charges.",
        "Secure OTP and 256-bit encrypted password creation.",
        "Enter a friend's referral code to link your account to their community tree.",
        "Instant generation of your personal Member Portal and secure wallet ledger."
      ],
    },
    {
      id: "deposit",
      number: "02",
      icon: CreditCard,
      title: "Deposit & Wallet Funding",
      tagline: "Instant UPI, QR Code & Bank Top-Up",
      description:
        "Fund your GROWPLUS wallet seamlessly via UPI, QR scanner, IMPS, or Netbanking. All deposits are verified and reflected instantly with zero processing deductions.",
      details: [
        "Supports PhonePe, Google Pay, Paytm, UPI IDs, and direct IMPS transfers.",
        "Minimum initial wallet deposit starting from ₹1,000.",
        "Automated cryptographic payment verification.",
        "Real-time wallet balance update visible on both web portal and mobile app."
      ],
    },
    {
      id: "plan-activation",
      number: "03",
      icon: TrendingUp,
      title: "Select & Activate Growth Plan",
      tagline: "Fixed 365-Day Monthly Returns",
      description:
        "Choose from 4 tailored investment plans (10% Starter, 12% VIP, 18% Daily Earning, or 20% Daily Super) to match your capital growth goals.",
      details: [
        "Starter Plan: ₹1,000 to ₹20,000 with 10% monthly yield.",
        "VIP Member Plan: ₹20,000 to ₹1,00,000 with 12% monthly yield.",
        "Daily Earning Plan: ₹5,000 to ₹1,50,000 with 18% monthly yield + ₹99 daily cash.",
        "Daily Super Plan: Min ₹10,000 (No limit) with 20% monthly yield + ₹300 daily cash."
      ],
    },
    {
      id: "daily-bonus",
      number: "04",
      icon: Coins,
      title: "Daily Midnight Bonus Accrual",
      tagline: "12:00 AM Automated Cash Credited Nightly",
      description:
        "Sit back and watch your daily earnings accumulate. Daily Earning (₹99/day) and Super (₹300/day) bonuses drop automatically into your bonus ledger at midnight without needing manual check-ins.",
      details: [
        "Automatic system-triggered accrual at 12:00 AM IST every single night.",
        "Itemized ledger breakdown displaying exact time stamps and bonus amounts.",
        "Daily bonuses withdrawable to bank after reaching plan threshold (₹1,000 or ₹3,000).",
        "Push notifications sent immediately to your GrowPlus Rewards App."
      ],
    },
    {
      id: "referral-mlm",
      number: "05",
      icon: Users,
      title: "Multi-Tier MLM Referral Network",
      tagline: "5% Direct Cash + 3% Team Override",
      description:
        "Share your personal referral code on WhatsApp, Telegram, or social media. Earn 5% instant cash on direct friends' deposits, plus 3% on their extended invites and ₹5,000 milestone rewards.",
      details: [
        "Level 1: Flat 5% direct cash credited immediately upon friend deposit.",
        "Level 2: 3% team volume override on friends invited by your referrals.",
        "VIP Milestone: Extra ₹5,000 cash bonus when you reach 10 active investors.",
        "Referral commissions are 100% withdrawable to your bank account."
      ],
    },
    {
      id: "withdrawal",
      number: "06",
      icon: ShieldCheck,
      title: "Instant Bank Withdrawal & In-App Shopping",
      tagline: "Direct IMPS Bank Payouts or In-App Shopping",
      description:
        "Request payouts directly to your verified Indian bank account starting at just ₹500, or seamlessly use your credits inside the upcoming GrowPlus Rewards App for electronics and lifestyle purchases.",
      details: [
        "Withdrawal requests processed directly to your savings/current account via IMPS/NEFT.",
        "Minimum withdrawal threshold from ₹500 (standard yield) or ₹1,000 (daily bonus).",
        "Option to redeem 1:1 rupee parity credits on the in-app shopping gateway.",
        "Dedicated treasury concierge support for rapid query resolution."
      ],
    },
  ];

  const currentStage = journeyStages[activeStage];
  const Icon = currentStage.icon;

  return (
    <div className="relative min-h-screen bg-[#070B1E] text-white py-12 sm:py-20 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#287CFF]/15 to-[#8B35FF]/15 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B3B] border border-[#287CFF]/40 text-xs font-semibold text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-[#35E6A2]" />
            <span>End-to-End Investor Lifecycle</span>
          </div>
          <h1 className="text-4xl sm:text-5.5xl font-black tracking-tight">
            How{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
              GROWPLUS
            </span>{" "}
            Works
          </h1>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Follow the complete step-by-step journey from onboarding to daily midnight earnings, community referral overrides, and instant bank withdrawals.
          </p>
        </div>

        {/* Horizontal Timeline Bar */}
        <div className="mb-12">
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none justify-start lg:justify-center">
            {journeyStages.map((stage, idx) => {
              const StageIcon = stage.icon;
              const isActive = activeStage === idx;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(idx)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold shrink-0 transition-all duration-200 border ${
                    isActive
                      ? "bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black border-transparent shadow-[0_0_20px_rgba(56,189,248,0.4)] scale-105 font-extrabold"
                      : "bg-[#0E1533] text-[#AAA2C1] border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-75">{stage.number}</span>
                  <StageIcon className="w-4 h-4" />
                  <span>{stage.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stage Spotlight Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0E1533] border border-[#287CFF]/40 shadow-2xl mb-20 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-black font-mono text-[#38BDF8]">
                  {currentStage.number}
                </span>
                <span className="h-6 w-px bg-white/20" />
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-1 rounded-full border border-[#35E6A2]/30">
                  {currentStage.tagline}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white">
                {currentStage.title}
              </h2>

              <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
                {currentStage.description}
              </p>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Key Mechanics &amp; Advantages:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentStage.details.map((detail, dIdx) => (
                    <div
                      key={dIdx}
                      className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#35E6A2] shrink-0 mt-0.5" />
                      <span className="text-xs text-white/90 leading-relaxed">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/#plans"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs tracking-wide shadow-md hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>Explore Plans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/download-apps"
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-[#38BDF8]" />
                  <span>Get Mobile App</span>
                </Link>
              </div>
            </div>

            {/* Right Graphic Panel (5 cols) */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-[#131D42] border border-[#287CFF]/30 space-y-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#287CFF] to-[#35E6A2] mx-auto flex items-center justify-center text-black font-black shadow-lg">
                <Icon className="w-8 h-8 text-black" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#AAA2C1]">
                  Stage {currentStage.number} Active Focus
                </span>
                <h4 className="text-xl font-bold text-white mt-1">{currentStage.title}</h4>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#AAA2C1]">Execution:</span>
                  <span className="font-bold text-[#35E6A2]">Fully Automated</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#AAA2C1]">Security:</span>
                  <span className="font-bold text-[#38BDF8]">256-bit AES Encryption</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#AAA2C1]">Payout Target:</span>
                  <span className="font-bold text-white">Direct Bank / UPI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
