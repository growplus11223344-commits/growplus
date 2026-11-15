"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Gift,
  ShieldAlert,
  Percent,
  TrendingUp,
  Users,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  FileText,
  Lock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Zap,
  Flame,
  Award,
  Smartphone,
} from "lucide-react";
import { INVESTMENT_PLANS } from "@/data/plansData";
import { InvestmentCalculator } from "@/components/InvestmentCalculator";

export default function RewardsPage() {
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("SUPER");

  return (
    <div className="relative min-h-screen bg-[#070B1E] text-white py-12 sm:py-20 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#287CFF]/15 via-[#8B35FF]/10 to-transparent blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B3B] border border-[#287CFF]/40 text-xs font-semibold text-white/90">
            <Gift className="w-3.5 h-3.5 text-[#35E6A2]" />
            <span>GROWPLUS Comprehensive Yield &amp; Commission Matrix</span>
          </div>
          <h1 className="text-4xl sm:text-5.5xl font-black tracking-tight">
            Financial Plans &amp;{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
              MLM Referral Rewards
            </span>
          </h1>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Explore 4 curated fixed-return capital growth plans (10% to 20% monthly yields), automated ₹300 daily midnight bonuses, and our multi-tier 5% + 3% MLM community referral network.
          </p>
        </div>

        {/* Regulatory Disclosure Box */}
        <div className="mb-16 p-6 sm:p-8 rounded-3xl bg-[#0E1533] border-2 border-amber-500/40 shadow-[0_10px_40px_rgba(245,158,11,0.15)] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded border border-amber-400/30">
                  Transparency Notice
                </span>
                <span className="text-xs font-mono text-amber-200/80">Phase 1 Architecture</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Capital Allocation, Midnight Bonus &amp; Community Referral Rules
              </h3>
              <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
                GROWPLUS offers transparent digital loyalty, capital growth, and multi-tier MLM referral incentives. All reward rates, including 10% to 20% monthly yield options and daily bonus credits, operate in full compliance with platform rules. Shopping credits and bonuses are also redeemable directly inside the upcoming GrowPlus Rewards App.
              </p>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90 space-y-1">
                <p className="font-semibold text-amber-300">Guiding Pillars:</p>
                <ul className="list-disc list-inside space-y-1 text-[#AAA2C1]">
                  <li>Automated daily midnight bonus accrual (₹99/day for Daily Earning, ₹300/day for Super).</li>
                  <li>Flat 5% direct cash commission on Level 1 referrals + 3% Level 2 team volume override.</li>
                  <li>Fast bank withdrawals starting at ₹500 via IMPS / UPI transfer.</li>
                  <li>The full merchant shopping catalog is accessible directly inside the companion mobile app.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1. THREE REWARD CHANNELS OVERVIEW */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Monthly Returns */}
          <div className="p-8 rounded-3xl bg-[#0E1533] border border-[#287CFF]/30 space-y-5 hover:border-[#287CFF] transition-all shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#287CFF]/20 text-[#38BDF8] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#35E6A2] block mb-1">
                Fixed 365-Day Yield
              </span>
              <h3 className="text-xl font-black text-white">Monthly Fixed Returns</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
              Allocate capital across 4 verified plans with monthly returns scaling from 10% on Starter up to 20% on the Daily Super tier. Capital is held securely with transparent 365-day accounting.
            </p>
            <div className="pt-2 border-t border-white/5 space-y-2 text-xs text-white/90">
              <div className="flex justify-between">
                <span className="text-[#AAA2C1]">Yield Range:</span>
                <span className="font-bold text-[#35E6A2]">10% – 20% Monthly</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAA2C1]">Payout Schedule:</span>
                <span className="font-bold text-white">Every 30 Days</span>
              </div>
            </div>
          </div>

          {/* Daily Midnight Bonus */}
          <div className="p-8 rounded-3xl bg-[#0E1533] border border-[#35E6A2]/30 space-y-5 hover:border-[#35E6A2] transition-all shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block mb-1">
                12:00 AM Automated Cash
              </span>
              <h3 className="text-xl font-black text-white">Daily Midnight Bonuses</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
              Investors on Daily Earning and Super tiers receive automatic daily cash credits deposited into their bonus ledger every night at 12:00 AM midnight—without manual claiming.
            </p>
            <div className="pt-2 border-t border-white/5 space-y-2 text-xs text-white/90">
              <div className="flex justify-between">
                <span className="text-[#AAA2C1]">Daily Credit:</span>
                <span className="font-bold text-amber-300">₹99 or ₹300 / Day</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAA2C1]">Withdrawal Threshold:</span>
                <span className="font-bold text-[#35E6A2]">From ₹1,000</span>
              </div>
            </div>
          </div>

          {/* MLM Referral Network */}
          <div className="p-8 rounded-3xl bg-[#0E1533] border border-[#8B35FF]/30 space-y-5 hover:border-[#8B35FF] transition-all shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#8B35FF]/20 text-[#B44CFF] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#B44CFF] block mb-1">
                Multi-Level Override
              </span>
              <h3 className="text-xl font-black text-white">MLM Referral Commissions</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
              Earn flat 5% instant cash when direct friends fund a plan, plus a 3% secondary team override on Level 2 volume and ₹5,000 leadership milestone bonuses.
            </p>
            <div className="pt-2 border-t border-white/5 space-y-2 text-xs text-white/90">
              <div className="flex justify-between">
                <span className="text-[#AAA2C1]">Level 1 Direct:</span>
                <span className="font-bold text-[#35E6A2]">5% Instant Cash</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#AAA2C1]">Level 2 Team:</span>
                <span className="font-bold text-[#38BDF8]">3% Team Override</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. INTERACTIVE ESTIMATOR */}
        {/* ======================================================== */}
        <div className="mb-20">
          <InvestmentCalculator />
        </div>

        {/* ======================================================== */}
        {/* 3. DETAILED 4 INVESTMENT TIERS COMPARISON */}
        {/* ======================================================== */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0E1533] border border-white/10 shadow-2xl mb-20 space-y-8">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#38BDF8] bg-[#38BDF8]/10 px-3 py-1 rounded-full border border-[#38BDF8]/30 mb-2 inline-block">
              Plan Comparison Matrix
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Transparent Tier Specifications
            </h3>
            <p className="text-xs sm:text-sm text-[#AAA2C1]">
              Review all 4 plans with their exact capital thresholds, monthly return yields, daily bonus schedules, and minimum bank withdrawal limits.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10 text-[#AAA2C1] uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Min – Max Deposit</th>
                  <th className="py-3 px-4">Monthly Return</th>
                  <th className="py-3 px-4">Daily Midnight Bonus</th>
                  <th className="py-3 px-4">Min. Withdrawal</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {INVESTMENT_PLANS.map((plan) => (
                  <tr key={plan.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-sans font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{plan.name}</span>
                        {plan.featured && (
                          <span className="text-[9px] bg-[#35E6A2]/20 text-[#35E6A2] px-1.5 py-0.5 rounded font-sans">
                            Popular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#AAA2C1]">
                      ₹{plan.minAmount.toLocaleString()} – {plan.maxAmount ? `₹${plan.maxAmount.toLocaleString()}` : "No Limit"}
                    </td>
                    <td className="py-4 px-4 text-[#35E6A2] font-black text-sm">
                      {plan.monthlyReturnRate}% / mo
                    </td>
                    <td className="py-4 px-4 text-amber-300 font-bold">
                      {plan.dailyBonus > 0 ? `+₹${plan.dailyBonus} / day` : "None"}
                    </td>
                    <td className="py-4 px-4 text-white">
                      ₹{plan.minWithdrawal.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right font-sans">
                      <Link
                        href="/#plans"
                        className="px-3.5 py-1.5 rounded-lg bg-[#287CFF] hover:bg-[#38BDF8] text-white text-[11px] font-bold transition-colors inline-block"
                      >
                        Select
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. IN-APP SHOPPING ADVANTAGE CALLOUT */}
        {/* ======================================================== */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#121B3B] via-[#1A2652] to-[#0E1533] border border-[#287CFF]/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-left">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#35E6A2] bg-[#35E6A2]/10 px-3 py-1 rounded-full border border-[#35E6A2]/30 inline-block">
              In-App Shopping Privilege
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Redeem Credits Inside the GrowPlus Rewards App
            </h3>
            <p className="text-xs sm:text-sm text-[#AAA2C1] max-w-2xl leading-relaxed">
              Every rupee earned from your yield and referral commissions can also be redeemed for 1:1 discounts on verified electronics, gadgets, and lifestyle items through our in-app shopping gateway.
            </p>
          </div>

          <Link
            href="/download-apps"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs sm:text-sm shrink-0 flex items-center gap-2 shadow-lg hover:opacity-95 transition-opacity"
          >
            <Smartphone className="w-4 h-4" />
            <span>Get Rewards App</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
