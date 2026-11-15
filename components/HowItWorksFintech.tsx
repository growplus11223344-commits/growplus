"use client";

import React from "react";
import Link from "next/link";
import {
  UserPlus,
  CreditCard,
  TrendingUp,
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export const HowItWorksFintech: React.FC = () => {
  const steps = [
    {
      step: "01",
      title: "Register Your Account",
      subtitle: "Instant Digital Onboarding",
      desc: "Sign up in 60 seconds with your phone number and email. Set a secure password and activate your encrypted GROWPLUS wallet.",
      icon: UserPlus,
    },
    {
      step: "02",
      title: "Deposit Funds",
      subtitle: "Top-Up Wallet via UPI / Bank",
      desc: "Add funds seamlessly via UPI, IMPS, or Netbanking. Zero deposit fees and instant transaction confirmation.",
      icon: CreditCard,
    },
    {
      step: "03",
      title: "Select & Activate Plan",
      subtitle: "Choose from 4 Curated Tiers",
      desc: "Pick your preferred growth plan—from Starter 10% to Super 20% with ₹300 daily bonuses credited every midnight.",
      icon: TrendingUp,
    },
    {
      step: "04",
      title: "Earn Returns & Daily Bonuses",
      subtitle: "Real-Time Yield Ledger",
      desc: "Track your capital growth live on the dashboard. Daily bonuses accrue automatically at 12:00 AM midnight.",
      icon: Coins,
    },
    {
      step: "05",
      title: "Withdraw Directly to Bank",
      subtitle: "Automated Payout Gateway",
      desc: "Transfer your earned yield and commissions directly to your bank account with fast-track processing from ₹500+.",
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-[#0A0F26] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#287CFF] bg-[#287CFF]/10 px-3 py-1 rounded-full border border-[#287CFF]/30">
            Frictionless Journey
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            How GROWPLUS Works
          </h2>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            From funding your account to receiving daily midnight bonuses and withdrawing earnings, our streamlined flow makes capital growth effortless.
          </p>
        </div>

        {/* 5 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#0E1533] border border-white/10 hover:border-[#287CFF]/50 transition-all space-y-4 relative flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#287CFF] to-[#8B35FF] flex items-center justify-center text-white shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-2xl font-black text-white/10 group-hover:text-[#287CFF]/20 transition-colors">
                      {st.step}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold text-[#35E6A2] uppercase tracking-wider block mb-1">
                    {st.subtitle}
                  </span>
                  <h3 className="font-extrabold text-base text-white mb-2">{st.title}</h3>
                  <p className="text-xs text-[#AAA2C1] leading-relaxed">{st.desc}</p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-[#AAA2C1]">
                  <span>Step {st.step}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#35E6A2]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
