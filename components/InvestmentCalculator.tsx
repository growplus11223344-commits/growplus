"use client";

import React, { useState } from "react";
import {
  Calculator,
  TrendingUp,
  Sparkles,
  Users,
  Coins,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";
import { INVESTMENT_PLANS, InvestmentPlan } from "@/data/plansData";

export const InvestmentCalculator: React.FC = () => {
  const [calculatorMode, setCalculatorMode] = useState<"investment" | "referral">("investment");

  // Investment Calculator State
  const [selectedPlanId, setSelectedPlanId] = useState<number>(4); // Super tier by default
  const [investmentAmount, setInvestmentAmount] = useState<number>(25000);

  // MLM Referral Calculator State
  const [directReferrals, setDirectReferrals] = useState<number>(5);
  const [avgDepositPerMember, setAvgDepositPerMember] = useState<number>(20000);
  const [teamLevel2Count, setTeamLevel2Count] = useState<number>(15);

  // Selected plan logic
  const currentPlan = INVESTMENT_PLANS.find((p) => p.id === selectedPlanId) || INVESTMENT_PLANS[0];

  // Calculations for Investment
  const monthlyReturn = Math.round((investmentAmount * currentPlan.monthlyReturnRate) / 100);
  const annualMonthlyReturns = monthlyReturn * 12;
  const annualDailyBonus = currentPlan.dailyBonus * 365;
  const totalAnnualYield = annualMonthlyReturns + annualDailyBonus;
  const netRoiPercentage = Math.round((totalAnnualYield / investmentAmount) * 100);

  // Calculations for MLM Referral
  const directVolume = directReferrals * avgDepositPerMember;
  const level1Commission = Math.round(directVolume * 0.05); // 5% direct
  const level2Volume = teamLevel2Count * (avgDepositPerMember * 0.7);
  const level2Commission = Math.round(level2Volume * 0.03); // 3% team override
  const milestoneBonus = directReferrals >= 10 ? 5000 : directReferrals >= 5 ? 2000 : 0;
  const totalReferralIncome = level1Commission + level2Commission + milestoneBonus;

  return (
    <div className="w-full rounded-3xl bg-[#0B1026] border border-[#287CFF]/30 p-6 sm:p-10 shadow-[0_20px_60px_rgba(7,6,17,0.7)] text-white backdrop-blur-xl">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-8 border-b border-white/10 gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#35E6A2] bg-[#35E6A2]/10 px-3 py-1 rounded-full border border-[#35E6A2]/30 inline-flex items-center gap-1.5 mb-2">
            <Calculator className="w-3.5 h-3.5" />
            Interactive ROI &amp; MLM Estimator
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Calculate Your Earnings
          </h3>
          <p className="text-xs sm:text-sm text-[#AAA2C1]">
            Simulate your fixed growth returns and explore community referral income.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="p-1.5 rounded-2xl bg-[#131B38] border border-white/10 flex gap-1.5 self-stretch md:self-auto">
          <button
            onClick={() => setCalculatorMode("investment")}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              calculatorMode === "investment"
                ? "bg-gradient-to-r from-[#287CFF] to-[#8B35FF] text-white shadow-lg"
                : "text-[#AAA2C1] hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Investment Returns</span>
          </button>

          <button
            onClick={() => setCalculatorMode("referral")}
            className={`flex-1 md:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              calculatorMode === "referral"
                ? "bg-gradient-to-r from-[#35E6A2] to-[#287CFF] text-black font-extrabold shadow-lg"
                : "text-[#AAA2C1] hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>MLM Referral Income</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODE 1: INVESTMENT RETURNS CALCULATOR */}
      {/* ======================================================== */}
      {calculatorMode === "investment" && (
        <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
          {/* Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Select Plan Chips */}
            <div>
              <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                1. Select Growth Plan:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {INVESTMENT_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlanId(plan.id);
                        if (investmentAmount < plan.minAmount) {
                          setInvestmentAmount(plan.minAmount);
                        }
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "bg-[#287CFF]/20 border-[#287CFF] text-white shadow-md shadow-[#287CFF]/20"
                          : "bg-white/5 border-white/10 text-[#AAA2C1] hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-[#35E6A2]">
                        {plan.badge}
                      </div>
                      <div className="text-xs font-black text-white mt-0.5 truncate">
                        {plan.name}
                      </div>
                      <div className="text-[11px] font-mono font-bold text-[#38BDF8] mt-1">
                        {plan.monthlyReturnRate}% Mo.
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Principal Amount Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-medium">
                  2. Investment Principal Amount:
                </span>
                <span className="text-lg font-black text-white font-mono bg-black/40 px-3 py-1 rounded-xl border border-white/10">
                  ₹{investmentAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={currentPlan.minAmount}
                max={currentPlan.maxAmount || 200000}
                step={1000}
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(parseInt(e.target.value))}
                className="w-full accent-[#287CFF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#AAA2C1] font-mono">
                <span>Min: ₹{currentPlan.minAmount.toLocaleString()}</span>
                <span>Max: {currentPlan.maxAmount ? `₹${currentPlan.maxAmount.toLocaleString()}` : "No Limit"}</span>
              </div>
            </div>

            {/* Plan Snapshot Badge */}
            <div className="p-4 rounded-2xl bg-[#121B38] border border-white/10 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#35E6A2]" />
                <span className="text-white/90">Tenure: 365 Days Locked Capital</span>
              </div>
              <span className="font-mono text-[#38BDF8] font-bold">Min Withdrawal: ₹500</span>
            </div>
          </div>

          {/* Results Display Frame (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#131D42] via-[#0E1533] to-[#0A0F26] border border-[#287CFF]/40 shadow-2xl space-y-5 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#AAA2C1]">
                Projected Total Annual Payout
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#35E6A2] mt-1 font-mono">
                ₹{totalAnnualYield.toLocaleString()}
              </div>
              <span className="text-xs font-bold text-amber-300 mt-1 inline-block">
                +{netRoiPercentage}% Net Annual Return
              </span>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs text-left">
              <div className="flex justify-between p-2 rounded-xl bg-black/30">
                <span className="text-[#AAA2C1]">Monthly Return ({currentPlan.monthlyReturnRate}%):</span>
                <span className="font-mono font-bold text-white">₹{monthlyReturn.toLocaleString()} / mo</span>
              </div>

              {currentPlan.dailyBonus > 0 && (
                <div className="flex justify-between p-2 rounded-xl bg-[#35E6A2]/10 border border-[#35E6A2]/20">
                  <span className="text-[#35E6A2] font-semibold">Daily Bonus (Midnight):</span>
                  <span className="font-mono font-bold text-white">+₹{currentPlan.dailyBonus} / day</span>
                </div>
              )}

              <div className="flex justify-between p-2 rounded-xl bg-black/30">
                <span className="text-[#AAA2C1]">Total Principal Reimbursed:</span>
                <span className="font-mono font-bold text-white">At 365-Day Maturity</span>
              </div>
            </div>

            <a
              href="#plans"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#8B35FF] text-white font-extrabold text-xs shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <span>Activate {currentPlan.name}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODE 2: MLM REFERRAL INCOME CALCULATOR */}
      {/* ======================================================== */}
      {calculatorMode === "referral" && (
        <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fadeIn">
          {/* Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#35E6A2] bg-[#35E6A2]/10 px-3 py-1 rounded-full border border-[#35E6A2]/30">
              <Users className="w-3.5 h-3.5" />
              <span>Multi-Tier Community Growth Network</span>
            </div>

            {/* Slider 1: Direct Referrals Count */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-medium">Level 1 Direct Referrals:</span>
                <span className="text-base font-black text-white font-mono bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  {directReferrals} Members
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={directReferrals}
                onChange={(e) => setDirectReferrals(parseInt(e.target.value))}
                className="w-full accent-[#35E6A2] cursor-pointer"
              />
            </div>

            {/* Slider 2: Average Deposit per Member */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-medium">Avg. Deposit Per Member:</span>
                <span className="text-base font-black text-white font-mono bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  ₹{avgDepositPerMember.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={100000}
                step={5000}
                value={avgDepositPerMember}
                onChange={(e) => setAvgDepositPerMember(parseInt(e.target.value))}
                className="w-full accent-[#287CFF] cursor-pointer"
              />
            </div>

            {/* Slider 3: Team L2 Members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-medium">Level 2 Team Size (Indirect):</span>
                <span className="text-base font-black text-white font-mono bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                  {teamLevel2Count} Members
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={teamLevel2Count}
                onChange={(e) => setTeamLevel2Count(parseInt(e.target.value))}
                className="w-full accent-[#8B35FF] cursor-pointer"
              />
            </div>

            {/* Real World Example Callout (GrowMore Style) */}
            <div className="p-4 rounded-2xl bg-[#121B38] border border-amber-500/30 text-xs space-y-1">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" /> Real Referral Example:
              </p>
              <p className="text-[#AAA2C1] leading-relaxed">
                When you invite a friend who deposits ₹1,00,000, flat 5% (₹5,000 cash) is credited instantly to your GROWPLUS commission wallet—100% withdrawable!
              </p>
            </div>
          </div>

          {/* Results Display Frame (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#15233A] via-[#0E1B2C] to-[#0A121F] border border-[#35E6A2]/40 shadow-2xl space-y-5 text-center">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#AAA2C1]">
                Estimated Referral Commission
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#35E6A2] mt-1 font-mono">
                ₹{totalReferralIncome.toLocaleString()}
              </div>
              <span className="text-xs font-bold text-white/90 mt-1 inline-block">
                Instant Withdrawable Cash Commissions
              </span>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2.5 text-xs text-left">
              <div className="flex justify-between p-2 rounded-xl bg-black/30">
                <span className="text-[#AAA2C1]">L1 Direct Commission (5%):</span>
                <span className="font-mono font-bold text-white">₹{level1Commission.toLocaleString()}</span>
              </div>

              <div className="flex justify-between p-2 rounded-xl bg-black/30">
                <span className="text-[#AAA2C1]">L2 Team Override (3%):</span>
                <span className="font-mono font-bold text-[#38BDF8]">₹{level2Commission.toLocaleString()}</span>
              </div>

              {milestoneBonus > 0 && (
                <div className="flex justify-between p-2 rounded-xl bg-[#F5C042]/10 border border-[#F5C042]/20">
                  <span className="text-amber-300 font-semibold">Leadership Milestone Bonus:</span>
                  <span className="font-mono font-bold text-amber-300">+₹{milestoneBonus.toLocaleString()}</span>
                </div>
              )}
            </div>

            <a
              href="#referral"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#35E6A2] to-[#287CFF] text-black font-extrabold text-xs shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <span>Get Your Referral Link</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
