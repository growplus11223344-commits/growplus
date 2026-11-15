"use client";

import React from "react";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Users,
  Smartphone,
  Lock,
  Layers,
  Clock,
  Sparkles,
} from "lucide-react";

export const FeaturesFintech: React.FC = () => {
  const features = [
    {
      icon: TrendingUp,
      title: "Curated Growth Tiers",
      desc: "Four meticulously structured plans ranging from ₹1,000 Starter to ₹10,000+ Super tiers with up to 20% monthly yields.",
      tag: "Fixed Returns",
      color: "blue",
    },
    {
      icon: Clock,
      title: "Daily Midnight Bonuses",
      desc: "Eligible tiers earn an automated ₹99 or ₹300 daily cash bonus credited directly to your dashboard every midnight at 12:00 AM.",
      tag: "Daily Cash",
      color: "green",
    },
    {
      icon: Users,
      title: "Instant 5% Referral Cash",
      desc: "Invite colleagues and friends to earn a flat 5% instant cash reward on all direct deposits, plus secondary team network overrides.",
      tag: "MLM Referral",
      color: "purple",
    },
    {
      icon: ShieldCheck,
      title: "Bank-Grade Encryption",
      desc: "Protected by enterprise-level AES-256 encryption, multi-sig treasury custody, and zero unauthorized third-party access.",
      tag: "Security First",
      color: "emerald",
    },
    {
      icon: Zap,
      title: "Rapid Bank Withdrawals",
      desc: "Fast settlement gateway allows withdrawals starting from ₹500 directly into any verified Indian bank account via IMPS/NEFT.",
      tag: "Automated Payouts",
      color: "amber",
    },
    {
      icon: Smartphone,
      title: "Mobile App Companion",
      desc: "Official mobile application with biometric login, push notifications for daily bonuses, and instant one-click investment management.",
      tag: "Android & iOS",
      color: "cyan",
    },
  ];

  return (
    <section id="features" className="relative py-24 bg-[#070B1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#38BDF8] bg-[#38BDF8]/10 px-3 py-1 rounded-full border border-[#38BDF8]/30">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Engineered for Modern Investors
          </h2>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            GROWPLUS brings together institutional-grade asset allocation, automated daily bonuses, and community referral power into one seamless platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-[#0E1533] border border-white/10 hover:border-[#287CFF]/50 transition-all duration-300 space-y-4 hover:-translate-y-1 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#287CFF] to-[#8B35FF] flex items-center justify-center text-white shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/30">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white">{feat.title}</h3>
                <p className="text-xs text-[#AAA2C1] leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
