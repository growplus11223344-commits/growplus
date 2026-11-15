"use client";

import React, { useState } from "react";
import { X, Play, Pause, Sparkles, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoVideoModal: React.FC<DemoVideoModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"rewards" | "referral" | "shopping">("rewards");
  const [isPlaying, setIsPlaying] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0F0B21] border border-[#8B35FF]/40 shadow-[0_0_50px_rgba(139,53,255,0.4)] overflow-hidden z-10 text-white animate-fadeIn">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#140F2D]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#35E6A2] animate-pulse" />
            <h3 className="font-bold text-sm tracking-wide">
              GROWPLUS Ecosystem Interactive Demo Walkthrough
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#AAA2C1] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Simulation Canvas */}
        <div className="relative aspect-video bg-gradient-to-br from-[#070611] via-[#100D20] to-[#1C143B] p-6 flex flex-col justify-between overflow-hidden">
          {/* Animated Background Graphic */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#8B35FF]/20 rounded-full blur-3xl pointer-events-none" />

          {/* Tab Switcher at top */}
          <div className="relative z-10 flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveTab("rewards")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "rewards"
                  ? "bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white shadow-md"
                  : "bg-white/5 text-[#AAA2C1] hover:text-white"
              }`}
            >
              1. Digital Rewards
            </button>
            <button
              onClick={() => setActiveTab("referral")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "referral"
                  ? "bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white shadow-md"
                  : "bg-white/5 text-[#AAA2C1] hover:text-white"
              }`}
            >
              2. Referral Network
            </button>
            <button
              onClick={() => setActiveTab("shopping")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "shopping"
                  ? "bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white shadow-md"
                  : "bg-white/5 text-[#AAA2C1] hover:text-white"
              }`}
            >
              3. Shopping Redemption
            </button>
          </div>

          {/* Dynamic Content View */}
          <div className="relative z-10 my-auto py-4 text-center max-w-xl mx-auto space-y-3">
            {activeTab === "rewards" && (
              <div className="space-y-3 animate-fadeIn">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B35FF]/20 border border-[#8B35FF]/40 text-[#B44CFF] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Monthly Loyalty Accrual Engine
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  Track Your Rewards in Real Time
                </h4>
                <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
                  Experience dynamic tracking where member engagement unlocks monthly digital loyalty credits. Explore up to a 10% monthly incentive preview, strictly credited to your shopping wallet.
                </p>
                <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
                  <span className="text-[#35E6A2] font-bold">Wallet Accrual: +₹100/mo</span>
                  <span className="text-white/40">|</span>
                  <span className="text-[#B44CFF]">Redeemable: Instantly</span>
                </div>
              </div>
            )}

            {activeTab === "referral" && (
              <div className="space-y-3 animate-fadeIn">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#287CFF]/20 border border-[#287CFF]/40 text-[#287CFF] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Multi-Tier Community Rewards
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  Share Your Code. Grow Together.
                </h4>
                <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
                  Send your personalized GP invitation link to friends, peers, and family. Every successful registration unlocks direct bonus credits for both sender and invitee.
                </p>
                <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
                  <span className="text-[#35E6A2] font-bold">Direct Bonus: ₹250</span>
                  <span className="text-white/40">|</span>
                  <span className="text-amber-300">Milestone Bonus: ₹1,500</span>
                </div>
              </div>
            )}

            {activeTab === "shopping" && (
              <div className="space-y-3 animate-fadeIn">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35E6A2]/20 border border-[#35E6A2]/40 text-[#35E6A2] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Direct Cart Credit Deduction
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white">
                  Shop Verified Brands with Up to 50%+ Discount
                </h4>
                <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
                  Select electronics, audio, luxury fashion, or home gadgets. Apply your shopping credits with a single tap at checkout to slash the final price.
                </p>
                <div className="inline-flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
                  <span className="text-white line-through">₹4,999</span>
                  <span className="text-[#35E6A2] font-bold">Credits Applied: -₹2,500</span>
                  <span className="text-white font-bold">You Pay: ₹2,499</span>
                </div>
              </div>
            )}
          </div>

          {/* Video Control Bar Simulation */}
          <div className="relative z-10 flex items-center justify-between text-xs text-[#AAA2C1] border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <span className="text-[11px] font-mono">01:45 / 03:20</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-300/80">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Educational simulation preview</span>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="px-6 py-4 bg-[#140F2D] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#AAA2C1]">
            Ready to experience the future of connected digital rewards?
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#AAA2C1] hover:text-white border border-white/10 hover:bg-white/5 transition-colors"
            >
              Close
            </button>
            <Link
              href="/register"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#8B35FF] to-[#287CFF] shadow-[0_0_15px_rgba(139,53,255,0.4)] hover:shadow-lg flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
