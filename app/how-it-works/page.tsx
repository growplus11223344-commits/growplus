"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  ShoppingBag,
  GitFork,
  Coins,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Zap,
  Users,
  Smartphone,
  Award,
} from "lucide-react";
import { HowItWorksFintech } from "@/components/HowItWorksFintech";

export default function HowItWorksPage() {
  const [activeStage, setActiveStage] = useState(0);

  const journeyStages = [
    {
      id: "registration",
      number: "01",
      icon: UserPlus,
      title: "Free Distributor Registration",
      tagline: "Instant Digital KYC & Sponsor Linking",
      description:
        "Join in under 60 seconds with your mobile number, email, and Sponsor ID. In accordance with the Consumer Protection (Direct Selling) Rules 2021, registration is 100% free with zero joining fees.",
      details: [
        "Zero registration fee or hidden setup charges.",
        "Quick paperless Aadhaar & PAN KYC verification.",
        "Enter your sponsor's ID to connect to their Left or Right binary team.",
        "Instant generation of your personal Distributor ID and portal dashboard."
      ],
    },
    {
      id: "first-bill",
      number: "02",
      icon: ShoppingBag,
      title: "1st Product Bill & ID Activation",
      tagline: "15%-25% Wholesale DP & 10% Sponsor Credit",
      description:
        "Order certified healthcare, wellness, or personal care products at wholesale Distributor Price (DP). Your direct sponsor receives an immediate 10% cash bonus on your first invoice.",
      details: [
        "Explore 100% genuine herbal nutrition, skincare, and organic agriculture lines.",
        "Enjoy 15% to 25% direct savings compared to Maximum Retail Price (MRP).",
        "Your sponsor earns flat 10% cash one-time bonus on your 1st bill.",
        "Your account is activated with full Business Volume (BV) recorded for binary matching."
      ],
    },
    {
      id: "binary-teams",
      number: "03",
      icon: GitFork,
      title: "Build Your Left & Right Teams",
      tagline: "The Power of Dual-Wing Binary Synergy",
      description:
        "Share your unique referral code or app invite. Place new distributors into your Left Team or Right Team to build network momentum and benefit from upline spillover.",
      details: [
        "Balanced dual-team binary tree ensures team teamwork and shared volume.",
        "Upline spillover automatically places motivated distributors in your team.",
        "Real-time visual genealogy tree available on both web portal and mobile app.",
        "Unlimited depth: Earn from 10th, 50th, or 100th generation team product sales!"
      ],
    },
    {
      id: "bv-matching",
      number: "04",
      icon: Coins,
      title: "1:1 BV Matching Income",
      tagline: "12% Weekly Pair Match Bonus",
      description:
        "Every product purchased by your Left and Right teams generates Business Volume (BV). GrowPlus matches equal volume on a 1:1 ratio and pays out 12% matching commission every single week.",
      details: [
        "1:1 matching ratio between Left Team BV and Right Team BV.",
        "Flat 12% matching bonus calculated on matched volume.",
        "Unmatched BV carries forward indefinitely with ZERO flush-out.",
        "Generous weekly capping up to ₹2,10,000 per distributor ID."
      ],
    },
    {
      id: "bank-payouts",
      number: "05",
      icon: ShieldCheck,
      title: "Automated Bank Payouts & Ranks",
      tagline: "Weekly Bank Transfers & Leadership Funds",
      description:
        "Your earned direct referral bonuses and binary matching commissions are disbursed directly into your bank account every Wednesday via IMPS/NEFT with compliant TDS deductions.",
      details: [
        "Automated weekly closing every Sunday midnight with Wednesday bank transfer.",
        "Ascend through Silver, Gold, Platinum, Diamond, and Crown ranks.",
        "Unlock permanent monthly Car Fund (5%), Travel Fund (3%), and House Fund (3%).",
        "Official TDS certificates and financial statements generated automatically."
      ],
    },
  ];

  const currentStage = journeyStages[activeStage];
  const CurrentIcon = currentStage.icon;

  return (
    <div className="relative min-h-screen bg-[#070B1E] text-white py-12 sm:py-20 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#287CFF]/15 via-[#8B35FF]/10 to-transparent blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B3B] border border-[#287CFF]/40 text-xs font-semibold text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-[#35E6A2]" />
            <span>The Direct Selling Roadmap</span>
          </div>
          <h1 className="text-4xl sm:text-5.5xl font-black tracking-tight leading-tight">
            How GrowPlus Works: <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
              From Joining to Weekly Bank Payouts
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Follow our proven 5-stage blueprint designed after world-class direct selling giants (Amway, Vestige, Mi Lifestyle) to build a sustainable, recurring income.
          </p>
        </div>

        {/* Interactive Tabbed Walkthrough */}
        <div className="p-6 sm:p-10 rounded-[32px] bg-[#0E1533]/90 border border-[#287CFF]/30 shadow-2xl backdrop-blur-xl space-y-8">
          
          {/* Tabs Navigation */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 border-b border-white/10 pb-6">
            {journeyStages.map((stage, idx) => {
              const active = activeStage === idx;
              const Icon = stage.icon;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setActiveStage(idx)}
                  className={`p-3.5 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                    active
                      ? "bg-gradient-to-b from-[#287CFF]/30 to-[#121B3B] border-2 border-[#38BDF8] shadow-lg scale-102"
                      : "bg-[#101738] border border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-[#35E6A2]">Stage {stage.number}</span>
                    <Icon className={`w-4 h-4 ${active ? "text-[#38BDF8]" : "text-[#AAA2C1]"}`} />
                  </div>
                  <span className={`text-xs font-bold line-clamp-1 ${active ? "text-white" : "text-[#AAA2C1]"}`}>
                    {stage.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Detailed Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#287CFF] to-[#35E6A2] flex items-center justify-center text-black font-black">
                  <CurrentIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#35E6A2] tracking-wider block">
                    {currentStage.tagline}
                  </span>
                  <h3 className="text-2xl font-black text-white">{currentStage.title}</h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
                {currentStage.description}
              </p>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Stage Highlights &amp; Guarantees:
                </span>
                <ul className="space-y-2 text-xs text-[#AAA2C1]">
                  {currentStage.details.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#35E6A2] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-5 p-7 rounded-3xl bg-gradient-to-br from-[#141E45] to-[#0A0F26] border border-[#287CFF]/40 shadow-xl space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-0.5 rounded-full border border-[#38BDF8]/20 inline-block">
                Distributor Benefit
              </span>

              <h4 className="text-lg font-black text-white">
                {activeStage === 0 && "100% Free Lifetime Account"}
                {activeStage === 1 && "10% Direct First Bill Sponsor Bonus"}
                {activeStage === 2 && "Dual Wing Spillover Momentum"}
                {activeStage === 3 && "12% Weekly Binary Match (No Flush)"}
                {activeStage === 4 && "Automated Bank Transfers Every Week"}
              </h4>

              <p className="text-xs text-[#AAA2C1] leading-relaxed">
                GROWPLUS is designed to make network building rewarding, ethical, and fully transparent. Join thousands of distributors across India.
              </p>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
                >
                  <span>Start Stage 01 Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Embedded HowItWorks 5 Cards */}
        <HowItWorksFintech />

      </div>
    </div>
  );
}
