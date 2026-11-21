"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Copy,
  Check,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Share2,
  Gift,
  Coins,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  Layers,
} from "lucide-react";

export const MLMReferralSection: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [billAmount, setBillAmount] = useState<number>(5000);
  const [viewMode, setViewMode] = useState<"allTiers" | "direct">("allTiers");

  const formatCurrency = (val: number) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const referralCode = "GP-VIP9821";
  const referralLink = "https://growplus.eco/distributor-join?ref=GP-VIP9821";

  // 10-Tier compensation structure (10% down to 1%, 1 to 512 duplication)
  const tiersConfig = [
    { tier: 1, percent: 10, count: 1, formula: "2⁰ = 1 Leader", label: "Tier 1: Direct Sponsor" },
    { tier: 2, percent: 9, count: 2, formula: "2¹ = 2 Members", label: "Tier 2: Frontline Left & Right" },
    { tier: 3, percent: 8, count: 4, formula: "2² = 4 Members", label: "Tier 3: Generation 2" },
    { tier: 4, percent: 7, count: 8, formula: "2³ = 8 Members", label: "Tier 4: Generation 3" },
    { tier: 5, percent: 6, count: 16, formula: "2⁴ = 16 Members", label: "Tier 5: Core Achievers" },
    { tier: 6, percent: 5, count: 32, formula: "2⁵ = 32 Members", label: "Tier 6: Regional Force" },
    { tier: 7, percent: 4, count: 64, formula: "2⁶ = 64 Members", label: "Tier 7: District Network" },
    { tier: 8, percent: 3, count: 128, formula: "2⁷ = 128 Members", label: "Tier 8: State Network" },
    { tier: 9, percent: 2, count: 256, formula: "2⁸ = 256 Members", label: "Tier 9: Zonal Network" },
    { tier: 10, percent: 1, count: 512, formula: "2⁹ = 512 Members", label: "Tier 10: National Force" },
  ];

  // Calculations
  const directBonus = Math.round(billAmount * 0.10);
  const estimatedBv = Math.round(billAmount * 0.60); // approx 60% BV

  const totalTierEarnings = tiersConfig.reduce(
    (acc, t) => acc + Math.round(t.count * billAmount * (t.percent / 100)),
    0
  );

  const handleCopyCode = () => {
    setCopiedCode(true);
    navigator.clipboard?.writeText(referralCode);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    navigator.clipboard?.writeText(referralLink);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Join India's premier direct-selling wellness brand GROWPLUS! Use my Sponsor ID ${referralCode} to register for free and get certified Ayurvedic & Wellness products with 10-Tier referral benefits (10% to 1%): ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <section id="referral" className="relative py-24 bg-gradient-to-b from-[#070B1E] via-[#0E1533] to-[#070B1E] border-t border-white/5 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#35E6A2]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ======================================================== */}
        {/* HEADER: 10-TIER REFERRAL PROGRAM */}
        {/* ======================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B3B] border border-[#35E6A2]/40 text-xs font-semibold text-[#35E6A2]">
            <Users className="w-3.5 h-3.5" />
            <span>Multi-Tier Sponsor &amp; Referral Policy</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            10-Tier Referral Commission <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
              10% to 1% Across 10 Generations
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            GrowPlus empowers distributors with unmatched multi-tier referral income: <strong className="text-white">Tier 1 gives 10%, Tier 2 gives 9%, Tier 3 gives 8%... up to Tier 10 giving 1%</strong> on product order invoices. Plus, unmatched team volume flows directly into your 12% Binary matching tree!
          </p>

          {/* Mode Switcher */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setViewMode("allTiers")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "allTiers"
                  ? "bg-[#35E6A2] text-black shadow-md font-black"
                  : "bg-[#141E45] text-white/80 hover:text-white border border-white/10"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Full 10-Tier Matrix Breakdown (10% to 1%)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("direct")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === "direct"
                  ? "bg-[#287CFF] text-white shadow-md font-black"
                  : "bg-[#141E45] text-white/80 hover:text-white border border-white/10"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Direct First-Bill Simulator (Tier 1 @ 10%)</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* INTERACTIVE 10-TIER SIMULATOR */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-10 rounded-[32px] bg-[#0E1533]/95 border border-[#35E6A2]/40 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#35E6A2] block mb-1">
                  Interactive Referral Simulator
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {viewMode === "allTiers"
                    ? "See Earnings Across All 10 Tiers (10% to 1%)"
                    : "See What You Earn on Direct 1st Purchase (10%)"}
                </h3>
                <p className="text-xs sm:text-sm text-[#AAA2C1] mt-1.5">
                  Pick or slide order package value to simulate real-time referral payouts per member and total team generation.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-[#AAA2C1]">Quick Packages:</span>
                {[3000, 5000, 10000, 20000, 50000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBillAmount(amt)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      billAmount === amt
                        ? "bg-[#35E6A2] text-black shadow-md scale-105 font-black"
                        : "bg-[#141E45] text-white/80 hover:text-white border border-white/10"
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#AAA2C1] font-semibold">Average Order / Bill Value:</span>
                  <span className="font-mono font-bold text-2xl text-white">₹{billAmount.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="50000"
                  step="1000"
                  value={billAmount}
                  onChange={(e) => setBillAmount(Number(e.target.value))}
                  className="w-full h-2.5 bg-[#141E45] rounded-lg appearance-none cursor-pointer accent-[#35E6A2]"
                />
                <div className="flex justify-between text-[10px] text-[#AAA2C1] font-mono">
                  <span>₹2,000 (Starter Kit)</span>
                  <span>₹25,000 (Family Pack)</span>
                  <span>₹50,000 (Mega Stockist)</span>
                </div>
              </div>

              {/* 10-Tier Visual Grid preview */}
              {viewMode === "allTiers" && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                  {tiersConfig.map((t) => {
                    const payoutPerMember = Math.round(billAmount * (t.percent / 100));
                    return (
                      <div
                        key={t.tier}
                        className="p-2.5 rounded-xl bg-[#141E45]/80 border border-white/5 space-y-1"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-white">Tier {t.tier}</span>
                          <span className="font-mono font-black text-[#35E6A2]">{t.percent}%</span>
                        </div>
                        <div className="text-[10px] text-[#38BDF8] font-mono font-bold">
                          {t.count} {t.count === 1 ? "Head" : "Heads"}
                        </div>
                        <div className="text-[10px] font-mono text-white/80">
                          ₹{payoutPerMember.toLocaleString()}/ea
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Policy Explanation Note */}
              <div className="p-4 rounded-2xl bg-[#141E45]/80 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <HelpCircle className="w-4 h-4 text-[#38BDF8]" />
                  <span>How the 10-Tier Progression Works:</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-[#AAA2C1] pl-5 list-disc">
                  <li>
                    <strong className="text-white">Tier 1 (Direct):</strong> You earn 10% direct cash bonus on the first bill of every direct partner.
                  </li>
                  <li>
                    <strong className="text-white">Tiers 2 to 10 (Multi-Level):</strong> You earn 9% on Tier 2, 8% on Tier 3, 7% on Tier 4... down to 1% on Tier 10 as teams duplicate in 2-leg binary structure!
                  </li>
                  <li>
                    <strong className="text-[#35E6A2]">Binary Team Volume:</strong> In addition to referral commissions, product BV enters your Binary Team tree for weekly 12% matching bonuses!
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Result Card (5 cols) */}
            <div className="lg:col-span-5 p-7 rounded-3xl bg-gradient-to-br from-[#141E45] to-[#0A0F26] border border-[#35E6A2]/50 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/30">
                  {viewMode === "allTiers" ? "10-Tier Total Pool Payout" : "Direct Sponsor Payout"}
                </span>
                <span className="text-xs font-mono font-bold text-white/70">
                  {viewMode === "allTiers" ? "10 Tiers (10% to 1%)" : "Tier 1 @ 10%"}
                </span>
              </div>

              <div>
                <span className="text-xs text-[#AAA2C1] block">
                  {viewMode === "allTiers" ? "Total 10-Tier Referral Income:" : "Direct Sponsor Bonus (Tier 1):"}
                </span>
                <div className="text-4xl sm:text-5xl font-black text-[#35E6A2] font-mono mt-1">
                  ₹{viewMode === "allTiers" ? formatCurrency(totalTierEarnings) : formatCurrency(directBonus)}
                </div>
                <span className="text-[11px] text-white/80 font-medium block mt-1">
                  {viewMode === "allTiers"
                    ? `Sum of all 10 tiers (1,023 team members @ ₹${formatCurrency(billAmount)})`
                    : `10% of ₹${formatCurrency(billAmount)} First Bill`}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#AAA2C1]">Team Network Size:</span>
                  <span className="font-bold text-white">1,023 Distributors across 10 Tiers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#AAA2C1]">Approx Business Volume:</span>
                  <span className="font-mono font-bold text-[#38BDF8]">+{formatCurrency(estimatedBv)} BV per order</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#AAA2C1]">Tier 2 (9%) Bonus:</span>
                  <span className="font-mono font-bold text-white">₹{formatCurrency(Math.round(2 * billAmount * 0.09))} (2 Members)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#AAA2C1]">Tier 3 (8%) Bonus:</span>
                  <span className="font-mono font-bold text-white">₹{formatCurrency(Math.round(4 * billAmount * 0.08))} (4 Members)</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/10">
                  <span className="text-[#35E6A2] font-semibold">Credited To:</span>
                  <span className="font-bold text-white">Bank Account / E-Wallet (Every Wednesday)</span>
                </div>
              </div>

              {/* Sponsor Link & WhatsApp Share */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralLink}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-mono text-white/80 truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-3 py-2 rounded-xl bg-[#287CFF] text-white text-xs font-bold shrink-0 flex items-center gap-1 hover:bg-[#2068dc]"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Share via WhatsApp with 10-Tier Plan</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 3 STEPS TO REFER & EARN */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-[#0E1533] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#287CFF]/20 text-[#38BDF8] flex items-center justify-center font-black">
              1
            </div>
            <h4 className="font-black text-base text-white">Share Your Sponsor Code</h4>
            <p className="text-xs text-[#AAA2C1] leading-relaxed">
              Send your unique GrowPlus referral link or sponsor ID (<span className="text-white font-mono">GP-VIP9821</span>) to colleagues, family, and direct-selling prospects.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#0E1533] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center font-black">
              2
            </div>
            <h4 className="font-black text-base text-white">Team Duplication (1 &rarr; 2 &rarr; 4... &rarr; 512)</h4>
            <p className="text-xs text-[#AAA2C1] leading-relaxed">
              Your direct team recruits their Left &amp; Right legs. As your network grows across 10 tiers, your passive multi-level referral commissions multiply automatically.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#0E1533] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black">
              3
            </div>
            <h4 className="font-black text-base text-white">10-Tier Weekly Bank Payout</h4>
            <p className="text-xs text-[#AAA2C1] leading-relaxed">
              Receive 10% on Tier 1, 9% on Tier 2, 8% on Tier 3... down to 1% on Tier 10 credited directly into your verified bank account every Wednesday!
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
