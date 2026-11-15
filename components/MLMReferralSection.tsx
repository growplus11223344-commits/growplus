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
  Award,
  Layers,
  Coins,
} from "lucide-react";

export const MLMReferralSection: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = "GP-VIP2026";
  const referralLink = "https://growplus.eco/ref/GP-VIP2026";

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

  return (
    <section id="referral" className="relative py-24 bg-gradient-to-b from-[#070B1E] via-[#0E1533] to-[#070B1E] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#35E6A2] bg-[#35E6A2]/10 px-3 py-1 rounded-full border border-[#35E6A2]/30 inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Direct &amp; Multi-Tier Referral Program
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Invite Friends &amp; Build Your Wealth Network
          </h2>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Earn instant cash commissions on every friend deposit, plus ongoing multi-tier team overrides and leadership milestone bonuses.
          </p>
        </div>

        {/* 3 Tier MLM Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Tier 1: Direct Referrals */}
          <div className="p-8 rounded-3xl bg-[#0E1430] border border-[#35E6A2]/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center font-black text-lg">
                L1
              </div>
              <span className="text-xs font-bold text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/30">
                Direct Commission
              </span>
            </div>
            <h3 className="text-2xl font-black text-white">Flat 5% Direct Cash</h3>
            <p className="text-xs text-[#AAA2C1] leading-relaxed">
              Every time a direct referral registers with your code and activates any investment plan, you receive 5% cash credited instantly to your wallet.
            </p>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90">
              <span className="text-[#AAA2C1]">Friend Deposits:</span> <span className="font-bold text-white">₹1,00,000</span>
              <br />
              <span className="text-[#35E6A2] font-bold">You Get: ₹5,000 Instant Cash!</span>
            </div>
          </div>

          {/* Tier 2: Team Network Override */}
          <div className="p-8 rounded-3xl bg-[#0E1430] border border-[#287CFF]/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#287CFF]/20 text-[#287CFF] flex items-center justify-center font-black text-lg">
                L2
              </div>
              <span className="text-xs font-bold text-[#287CFF] bg-[#287CFF]/10 px-2.5 py-0.5 rounded-full border border-[#287CFF]/30">
                Team Override
              </span>
            </div>
            <h3 className="text-2xl font-black text-white">3% Extended Bonus</h3>
            <p className="text-xs text-[#AAA2C1] leading-relaxed">
              When friends invited by your direct referrals allocate capital into plans, unlock an additional 3% secondary team override commission.
            </p>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90">
              <span className="text-[#AAA2C1]">Level 2 Team Volume:</span> <span className="font-bold text-white">₹2,00,000</span>
              <br />
              <span className="text-[#287CFF] font-bold">You Get: ₹6,000 Team Cash!</span>
            </div>
          </div>

          {/* Tier 3: Ambassador Milestone */}
          <div className="p-8 rounded-3xl bg-[#0E1430] border border-[#F5C042]/40 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#F5C042]/20 text-[#F5C042] flex items-center justify-center font-black text-lg">
                VIP
              </div>
              <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Leadership Pool
              </span>
            </div>
            <h3 className="text-2xl font-black text-white">Milestone Lump-Sum</h3>
            <p className="text-xs text-[#AAA2C1] leading-relaxed">
              Reach 10 active verified investors in your personal tree and unlock an exclusive ₹5,000 VIP leadership booster plus priority treasury limits.
            </p>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90">
              <span className="text-[#AAA2C1]">Tree Milestone:</span> <span className="font-bold text-white">10 Active Investors</span>
              <br />
              <span className="text-amber-300 font-bold">You Get: ₹5,000 Cash Bonus!</span>
            </div>
          </div>
        </div>

        {/* Real-World GrowMore Example & Share Box */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#101838] border border-white/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Story (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              <Zap className="w-3.5 h-3.5" />
              <span>How It Works in Real Life</span>
            </div>
            <h3 className="text-2xl font-black text-white">
              &ldquo;I sent my link on WhatsApp — ₹5,000 credited instantly!&rdquo;
            </h3>
            <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
              Rahul registered using my exclusive invite link and deposited ₹1,00,000 into the Daily Earning Super Plan. Instantly, flat 5% (₹5,000 cash) was deposited into my GROWPLUS commission wallet—100% withdrawable to my bank account!
            </p>
            <div className="flex items-center gap-2 text-xs text-[#35E6A2] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero delays • Automated payout on verified deposit</span>
            </div>
          </div>

          {/* Right Share Box (6 cols) */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-[#090F26] border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Your Referral Code &amp; Share Link
            </h4>

            {/* Code */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-[#AAA2C1] block">Referral Code:</span>
                <span className="font-mono font-bold text-white text-sm">{referralCode}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-1.5 rounded-lg bg-[#287CFF] hover:bg-[#38BDF8] text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#35E6A2]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Copied" : "Copy Code"}</span>
              </button>
            </div>

            {/* Link */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 text-xs">
              <div className="truncate mr-2">
                <span className="text-[10px] text-[#AAA2C1] block">Referral Link:</span>
                <span className="font-mono text-white/80 text-xs truncate block">{referralLink}</span>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#35E6A2]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </button>
            </div>

            {/* WhatsApp Share CTA */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join GROWPLUS with my referral code ${referralCode} and explore daily earning plans: ${referralLink}`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share on WhatsApp &amp; Earn 5%</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
