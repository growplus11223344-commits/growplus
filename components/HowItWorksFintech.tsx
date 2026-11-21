"use client";

import React from "react";
import Link from "next/link";
import {
  UserPlus,
  ShoppingBag,
  GitFork,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const HowItWorksFintech: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Free Digital Registration",
      subtitle: "Instant Distributor ID",
      desc: "Join with zero registration fee using a Sponsor ID. Complete paperless Aadhaar/PAN KYC in under 2 minutes and unlock your Distributor Portal.",
      icon: UserPlus,
      highlight: "Zero Joining Fee",
    },
    {
      step: "02",
      title: "Deposit ₹500 - ₹5,000 & Activate",
      subtitle: "Instant 10% First Deposit Bonus",
      desc: "Deposit ₹500 to ₹5,000 to activate your partner ID. You receive an instant 10% cash bonus on the spot. Balances power dashboard earning & GrowPlus Mall shopping.",
      icon: ShoppingBag,
      highlight: "Instant 10% Bonus",
    },
    {
      step: "03",
      title: "Build Left & Right Teams",
      subtitle: "Dual Wing Binary Power",
      desc: "Share your referral code. Place new distributors into your Left Team or Right Team to build network momentum and capitalize on spillover.",
      icon: GitFork,
      highlight: "Binary Team Power",
    },
    {
      step: "04",
      title: "1:1 BV Matching Income",
      subtitle: "12% Pair Match Bonus",
      desc: "As your dual teams purchase and retail products, Business Volume (BV) accumulates. Every 1:1 matched BV pays 12% weekly matching cash.",
      icon: Coins,
      highlight: "12% Weekly Pair Bonus",
    },
    {
      step: "05",
      title: "Weekly Bank Payouts & Ranks",
      subtitle: "Direct Bank Transfer",
      desc: "Receive automated payouts directly to your bank account every Wednesday. Unlock Silver, Gold, Diamond ranks with Car, Travel, and House funds.",
      icon: ShieldCheck,
      highlight: "Automated Payouts",
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-[#0A0F26] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#287CFF] bg-[#287CFF]/10 px-3 py-1 rounded-full border border-[#287CFF]/30 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#38BDF8]" />
            The Distributor Roadmap
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            How GrowPlus Works
          </h2>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            From free digital joining to your first product order, binary team building, and automated weekly bank payouts — your path to direct-selling success in 5 simple steps.
          </p>
        </div>

        {/* 5 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#0E1533] border border-white/10 hover:border-[#287CFF]/50 transition-all space-y-4 relative flex flex-col justify-between group shadow-lg hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#287CFF] to-[#35E6A2] flex items-center justify-center text-black font-black shadow-md">
                      <Icon className="w-6 h-6 text-black" />
                    </div>
                    <span className="font-mono text-3xl font-black text-white/10 group-hover:text-[#38BDF8]/20 transition-colors">
                      {st.step}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-[#35E6A2] uppercase tracking-wider block mb-1">
                    {st.subtitle}
                  </span>
                  <h3 className="font-extrabold text-base text-white mb-2 leading-snug">{st.title}</h3>
                  <p className="text-xs text-[#AAA2C1] leading-relaxed">{st.desc}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-[#38BDF8] font-bold">{st.highlight}</span>
                  <CheckCircle2 className="w-4 h-4 text-[#35E6A2]" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Join CTA Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#121A3B] via-[#1B2754] to-[#0E1533] border border-[#287CFF]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <h4 className="text-xl font-black text-white">Ready to start your direct-selling journey?</h4>
            <p className="text-xs text-[#AAA2C1]">Join today with zero registration fees and activate your binary tree.</p>
          </div>
          <Link
            href="/register"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-transform shrink-0"
          >
            <span>Register as Distributor</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </section>
  );
};
