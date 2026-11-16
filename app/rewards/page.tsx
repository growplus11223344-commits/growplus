"use client";

import React from "react";
import Link from "next/link";
import {
  GitFork,
  Coins,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  ShoppingBag,
} from "lucide-react";
import { FeaturesPlanSection } from "@/components/FeaturesPlanSection";
import { MLMReferralSection } from "@/components/MLMReferralSection";

export default function RewardsPage() {
  return (
    <div className="relative min-h-screen bg-[#070B1E] text-white py-12 sm:py-20 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#287CFF]/15 via-[#8B35FF]/10 to-transparent blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B3B] border border-[#287CFF]/40 text-xs font-semibold text-white/90">
            <GitFork className="w-3.5 h-3.5 text-[#35E6A2]" />
            <span>GrowPlus Comprehensive Business Plan</span>
          </div>
          <h1 className="text-4xl sm:text-5.5xl font-black tracking-tight">
            Features &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
              All Business Compensation Plans
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Inspired by direct selling pioneers (Amway, Vestige, Mi Lifestyle). Featuring our dual-wing Binary Tree architecture (&quot;jo mene us din sab ko smjhaya tha&quot;), flat 10% direct first-bill bonuses, and 12% team pair matching payouts.
          </p>
        </div>

        {/* Embedded Features & Binary Tree Plan */}
        <FeaturesPlanSection />

        {/* Embedded 10% Referral Section */}
        <MLMReferralSection />
      </div>
    </div>
  );
}
