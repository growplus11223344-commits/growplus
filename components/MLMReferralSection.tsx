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
} from "lucide-react";

export const MLMReferralSection: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [billAmount, setBillAmount] = useState<number>(10000);

  const referralCode = "GP-VIP9821";
  const referralLink = "https://growplus.eco/distributor-join?ref=GP-VIP9821";

  // 10% Direct Bonus calculation on first bill
  const directBonus = Math.round(billAmount * 0.10);
  const estimatedBv = Math.round(billAmount * 0.60); // approx 60% BV

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
      `Join India's premier direct-selling wellness brand GROWPLUS! Use my Sponsor ID ${referralCode} to register for free and get certified Ayurvedic & Wellness products at wholesale Distributor Price (DP): ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  return (
    <section id="referral" className="relative py-24 bg-gradient-to-b from-[#070B1E] via-[#0E1533] to-[#070B1E] border-t border-white/5 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#35E6A2]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ======================================================== */}
        {/* HEADER: DIRECT REFERRAL PROGRAM */}
        {/* ======================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B3B] border border-[#35E6A2]/40 text-xs font-semibold text-[#35E6A2]">
            <Users className="w-3.5 h-3.5" />
            <span>Direct Sponsor Reward Policy</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Direct Referral Bonus <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
              Flat 10% on First Bill (One-Time Only)
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            As highlighted in our business plan blueprint: Whenever you introduce a new direct partner, you receive <strong className="text-white">instant 10% cash bonus on their very first product invoice / bill</strong>. No hidden cuts, credited on the spot!
          </p>
        </div>

        {/* ======================================================== */}
        {/* INTERACTIVE FIRST-BILL 10% SIMULATOR */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-10 rounded-[32px] bg-[#0E1533]/95 border border-[#35E6A2]/40 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#35E6A2] block mb-1">
                  Interactive Earning Simulator
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  See What You Earn on Your Friend&apos;s First Purchase
                </h3>
                <p className="text-xs sm:text-sm text-[#AAA2C1] mt-1.5">
                  Slide or pick a starter order package to preview your immediate 10% one-time direct referral commission.
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
                        ? "bg-[#35E6A2] text-black shadow-md scale-105"
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
                  <span className="text-[#AAA2C1] font-semibold">New Partner&apos;s 1st Bill Value:</span>
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

              {/* Policy Explanation Note */}
              <div className="p-4 rounded-2xl bg-[#141E45]/80 border border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-white font-bold">
                  <HelpCircle className="w-4 h-4 text-[#38BDF8]" />
                  <span>How the &quot;10% One-Time Only&quot; Rule Works:</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-[#AAA2C1] pl-5 list-disc">
                  <li>
                    <strong className="text-white">1st Purchase:</strong> You get flat 10% direct cash bonus credited to your bank payout wallet immediately.
                  </li>
                  <li>
                    <strong className="text-white">Re-orders &amp; Subsequent Purchases:</strong> Do not pay 10% direct bonus again. Instead, 100% of their product BV flows directly into your <strong className="text-[#35E6A2]">Binary Team matching tree</strong> for weekly 12% team checks!
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Result Card (5 cols) */}
            <div className="lg:col-span-5 p-7 rounded-3xl bg-gradient-to-br from-[#141E45] to-[#0A0F26] border border-[#35E6A2]/50 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/30">
                  Direct Referral Payout
                </span>
                <span className="text-xs font-mono font-bold text-white/70">10% One-Time</span>
              </div>

              <div>
                <span className="text-xs text-[#AAA2C1] block">Your Instant Cash Bonus:</span>
                <div className="text-4xl sm:text-5xl font-black text-[#35E6A2] font-mono mt-1">
                  ₹{directBonus.toLocaleString()}
                </div>
                <span className="text-[11px] text-white/80 font-medium block mt-1">
                  10% of ₹{billAmount.toLocaleString()} First Bill
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#AAA2C1]">Team Tree Placement:</span>
                  <span className="font-bold text-white">Left or Right Wing (Your choice)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#AAA2C1]">Approx Business Volume:</span>
                  <span className="font-mono font-bold text-[#38BDF8]">+{estimatedBv.toLocaleString()} BV</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/10">
                  <span className="text-[#35E6A2] font-semibold">Credited To:</span>
                  <span className="font-bold text-white">Bank Account / E-Wallet</span>
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
                  <span>Share via WhatsApp with 10% First Bill Offer</span>
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
            <h4 className="font-black text-base text-white">They Place Their 1st Bill</h4>
            <p className="text-xs text-[#AAA2C1] leading-relaxed">
              Your friend completes free digital KYC and orders certified Ayurvedic, health, or personal care products at discounted Distributor Price (DP).
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-[#0E1533] border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black">
              3
            </div>
            <h4 className="font-black text-base text-white">Get Instant 10% Cash</h4>
            <p className="text-xs text-[#AAA2C1] leading-relaxed">
              You receive 10% of their total invoice bill value credited directly into your payout balance, plus their BV enters your Binary Team tree!
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
