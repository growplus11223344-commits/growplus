"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  Info,
  Calendar,
  Lock,
} from "lucide-react";
import { INVESTMENT_PLANS, InvestmentPlan } from "@/data/plansData";

export const InvestmentPlansSection: React.FC = () => {
  const [activePlanModal, setActivePlanModal] = useState<InvestmentPlan | null>(null);

  return (
    <section id="plans" className="relative py-24 bg-[#070B1E]/90 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#38BDF8] bg-[#38BDF8]/10 px-3 py-1 rounded-full border border-[#38BDF8]/30 inline-flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#35E6A2]" />
            Tiered Growth Plans
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Curated Investment Plans
          </h2>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Select a verified capital allocation tier with transparent fixed monthly returns and automated daily bonus credits accrued every midnight.
          </p>
        </div>

        {/* 4 Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {INVESTMENT_PLANS.map((plan) => {
            const isFeatured = plan.featured;
            const isSuper = plan.planCode === "SUPER";

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl ${
                  isSuper
                    ? "bg-gradient-to-b from-[#182942] via-[#0E1B2E] to-[#0A121F] border-2 border-[#35E6A2] shadow-[0_10px_40px_rgba(53,230,162,0.25)]"
                    : isFeatured
                    ? "bg-gradient-to-b from-[#1C1844] via-[#120F2E] to-[#0B091D] border-2 border-[#8B35FF]/60 shadow-[0_10px_35px_rgba(139,53,255,0.25)]"
                    : "bg-[#0E1430] border border-white/10 hover:border-white/30"
                }`}
              >
                {/* Top Badge */}
                {isSuper && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#35E6A2] to-[#287CFF] text-black text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span>Most Popular Tier</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/20">
                      {plan.badge}
                    </span>
                    <span className="text-xs font-mono text-[#AAA2C1]">365 Days</span>
                  </div>

                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <p className="text-[11px] text-[#AAA2C1] mt-0.5 mb-4">{plan.tagline}</p>

                  {/* Return Big Display */}
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 mb-5 space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
                        {plan.monthlyReturnRate}%
                      </span>
                      <span className="text-xs text-[#AAA2C1] font-semibold">/ Month</span>
                    </div>

                    {plan.dailyBonus > 0 ? (
                      <div className="text-[11px] font-bold text-[#35E6A2] flex items-center gap-1 pt-1 border-t border-white/5">
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>+₹{plan.dailyBonus} Daily Midnight Bonus</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-[#AAA2C1] pt-1 border-t border-white/5">
                        Simple Monthly Yield
                      </div>
                    )}
                  </div>

                  {/* Allocation Limits */}
                  <div className="space-y-1 text-xs mb-5 p-3 rounded-xl bg-white/5">
                    <div className="flex justify-between">
                      <span className="text-[#AAA2C1]">Min Investment:</span>
                      <span className="font-bold font-mono text-white">₹{plan.minAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#AAA2C1]">Max Investment:</span>
                      <span className="font-bold font-mono text-white">
                        {plan.maxAmount ? `₹${plan.maxAmount.toLocaleString()}` : "No Limit"}
                      </span>
                    </div>
                  </div>

                  {/* Perks List */}
                  <ul className="space-y-2 text-xs text-[#AAA2C1] mb-6">
                    {plan.perks.map((perk, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#35E6A2] shrink-0 mt-0.5" />
                        <span className="text-white/90 leading-tight">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <button
                  onClick={() => setActivePlanModal(plan)}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 ${
                    isSuper
                      ? "bg-gradient-to-r from-[#35E6A2] to-[#287CFF] text-black hover:opacity-95"
                      : isFeatured
                      ? "bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white hover:opacity-90"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                  }`}
                >
                  <span>Select Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Details & Activation Modal */}
      {activePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setActivePlanModal(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0F1633] border border-[#287CFF]/50 p-6 sm:p-8 z-10 text-white space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#35E6A2]">
                  {activePlanModal.badge}
                </span>
                <h3 className="text-2xl font-black text-white">{activePlanModal.name}</h3>
              </div>
              <button
                onClick={() => setActivePlanModal(null)}
                className="p-2 rounded-xl bg-white/5 text-[#AAA2C1] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#AAA2C1]">
              <p className="text-sm text-white font-medium">{activePlanModal.summary}</p>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span>Monthly Return Rate:</span>
                  <span className="font-bold text-[#35E6A2] text-sm">{activePlanModal.monthlyReturnRate}% Monthly</span>
                </div>
                {activePlanModal.dailyBonus > 0 && (
                  <div className="flex justify-between">
                    <span>Daily Bonus (Midnight Accrual):</span>
                    <span className="font-bold text-amber-300">₹{activePlanModal.dailyBonus} / day</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Lock-in Duration:</span>
                  <span className="font-bold text-white">365 Days (1 Year)</span>
                </div>
                <div className="flex justify-between">
                  <span>Minimum Withdrawal Threshold:</span>
                  <span className="font-bold text-white">₹{activePlanModal.minWithdrawal}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="font-bold text-white uppercase text-[11px] block">
                  Mandatory Plan Terms:
                </span>
                <ul className="space-y-1 text-[11px] list-disc list-inside">
                  {activePlanModal.terms.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => setActivePlanModal(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#AAA2C1] hover:text-white"
              >
                Cancel
              </button>
              <Link
                href="/register"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#8B35FF] text-white font-bold text-xs shadow-lg"
              >
                Deposit &amp; Activate Plan &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
