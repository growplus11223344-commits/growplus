"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Calculator,
  Flame,
  Zap,
  Users,
  CheckCircle2,
  Lock,
  Download,
  Calendar,
  Coins,
  ChevronRight,
  Play,
} from "lucide-react";

import { FeaturesFintech } from "@/components/FeaturesFintech";
import { InvestmentPlansSection } from "@/components/InvestmentPlansSection";
import { InvestmentCalculator } from "@/components/InvestmentCalculator";
import { MLMReferralSection } from "@/components/MLMReferralSection";
import { HowItWorksFintech } from "@/components/HowItWorksFintech";
import { AppDownloadFintech } from "@/components/AppDownloadFintech";
import { FAQFintech } from "@/components/FAQFintech";
import { ContactFintechSection } from "@/components/ContactFintechSection";
import { DemoVideoModal } from "@/components/DemoVideoModal";
import { GiftBoxVisual } from "@/components/GiftBoxVisual";

export default function HomePage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#070B1E] text-white overflow-hidden selection:bg-[#287CFF]/30">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-[#287CFF]/20 via-[#8B35FF]/15 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[900px] -left-48 w-96 h-96 bg-[#35E6A2]/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[1800px] -right-48 w-96 h-96 bg-[#287CFF]/15 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Demo Video Walkthrough Modal */}
      <DemoVideoModal isOpen={demoModalOpen} onClose={() => setDemoModalOpen(false)} />

      {/* ======================================================== */}
      {/* 1. HERO SECTION (GROWTH FINTECH & MLM PRESENTATION) */}
      {/* ======================================================== */}
      <section id="home" className="relative pt-8 pb-20 sm:pt-14 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column (7 Cols): Typography & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B3B] border border-[#287CFF]/40 text-xs font-semibold text-white/90 shadow-[0_0_20px_rgba(40,124,255,0.25)]">
                <span className="w-2 h-2 rounded-full bg-[#35E6A2] animate-pulse" />
                <span>Next-Gen Financial Empowerment</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                Grow Your Future with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2] drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
                  GROWPLUS
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Experience next-generation financial empowerment. GROWPLUS delivers intuitive investment plans (10% to 20% monthly yields), automated ₹300 daily midnight cash bonuses, flat 5% direct referral commissions, and a companion mobile app.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <a
                  href="#plans"
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(56,189,248,0.4)] hover:shadow-[0_0_35px_rgba(53,230,162,0.6)] transition-all hover:scale-105 flex items-center gap-2 group"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Explore Plans</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#calculator"
                  className="px-6 py-3.5 rounded-2xl bg-[#101738] hover:bg-[#182352] border border-white/15 hover:border-[#287CFF]/60 text-white text-xs sm:text-sm font-bold tracking-wide transition-all flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4 text-[#38BDF8]" />
                  <span>Calculate Returns</span>
                </a>

                <a
                  href="#download"
                  className="px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4 text-[#35E6A2]" />
                  <span>Download App</span>
                </a>
              </div>

              {/* 4 Micro Metrics Bar */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3 rounded-2xl bg-[#0E1533] border border-white/5">
                  <div className="text-lg font-black text-white font-mono">₹5.84 Cr+</div>
                  <div className="text-[10px] text-[#AAA2C1]">Capital Deployed</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#0E1533] border border-white/5">
                  <div className="text-lg font-black text-[#35E6A2] font-mono">1,25,890+</div>
                  <div className="text-[10px] text-[#AAA2C1]">Active Investors</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#0E1533] border border-white/5">
                  <div className="text-lg font-black text-[#38BDF8] font-mono">20% Max</div>
                  <div className="text-[10px] text-[#AAA2C1]">Monthly Yield</div>
                </div>
                <div className="p-3 rounded-2xl bg-[#0E1533] border border-white/5">
                  <div className="text-lg font-black text-amber-300 font-mono">12:00 AM</div>
                  <div className="text-[10px] text-[#AAA2C1]">Daily Midnight Cash</div>
                </div>
              </div>
            </div>

            {/* Right Column (5 Cols): Interactive Quick Portal Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0E1533]/95 border border-[#287CFF]/40 shadow-[0_20px_50px_rgba(7,6,17,0.8)] backdrop-blur-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      Featured Growth Tier
                    </h3>
                    <p className="text-[11px] text-[#AAA2C1]">Instant Activation Available</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/30 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-current" /> Super Tier
                  </span>
                </div>

                {/* Plan Snapshot Card */}
                <div className="p-4 rounded-2xl bg-[#131D42] border border-[#287CFF]/30 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Daily Earning Super Plan
                      </span>
                      <span className="text-[11px] text-[#38BDF8] font-mono font-bold">
                        ₹300 Daily Bonus + 20% Monthly Return
                      </span>
                    </div>
                    <span className="text-lg font-black text-[#35E6A2] font-mono">20% Mo.</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#AAA2C1]">Min Allocation:</span>
                      <span className="font-mono font-bold text-white">₹10,000 (No Limit)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#AAA2C1]">Midnight Bonus:</span>
                      <span className="font-mono font-bold text-[#35E6A2]">+₹300 / Day</span>
                    </div>
                  </div>

                  <a
                    href="#plans"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <span>View Plan Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Direct Android & iOS App Download */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-[#AAA2C1] tracking-wider block">
                    Official Mobile App Download
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/download-apps#waitlist"
                      className="p-3 rounded-2xl bg-[#141E45] hover:bg-[#1A2657] border border-white/10 hover:border-[#35E6A2] transition-all flex flex-col items-center justify-center text-center group"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-[#AAA2C1]">Android</span>
                      <span className="text-xs font-bold text-white group-hover:text-[#35E6A2] transition-colors flex items-center gap-1 mt-0.5">
                        <Download className="w-3 h-3 text-[#35E6A2]" />
                        APK Direct
                      </span>
                      <span className="text-[8px] text-[#35E6A2] font-semibold mt-1">v2.4.1 Stable</span>
                    </Link>

                    <Link
                      href="/download-apps#waitlist"
                      className="p-3 rounded-2xl bg-[#141E45] hover:bg-[#1A2657] border border-white/10 hover:border-[#38BDF8] transition-all flex flex-col items-center justify-center text-center group"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-[#AAA2C1]">Apple iOS</span>
                      <span className="text-xs font-bold text-white group-hover:text-[#38BDF8] transition-colors flex items-center gap-1 mt-0.5">
                        <span className="text-xs"></span>
                        App Store
                      </span>
                      <span className="text-[8px] text-[#38BDF8] font-semibold mt-1">Coming Soon</span>
                    </Link>
                  </div>
                </div>

                {/* Member Login Direct Link */}
                <div className="pt-2 border-t border-white/5 text-center text-xs text-[#AAA2C1]">
                  <span>Existing investor? </span>
                  <Link href="/login" className="font-bold text-white hover:text-[#38BDF8] underline">
                    Access Portal &rarr;
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. FEATURES SECTION */}
      {/* ======================================================== */}
      <FeaturesFintech />

      {/* ======================================================== */}
      {/* 3. INVESTMENT PLANS SECTION */}
      {/* ======================================================== */}
      <InvestmentPlansSection />

      {/* ======================================================== */}
      {/* 4. INTERACTIVE ROI & MLM CALCULATOR */}
      {/* ======================================================== */}
      <section id="calculator" className="relative py-24 bg-[#070B1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InvestmentCalculator />
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. MULTI-TIER MLM REFERRAL SECTION */}
      {/* ======================================================== */}
      <MLMReferralSection />

      {/* ======================================================== */}
      {/* 6. HOW IT WORKS SECTION (5 STEPS) */}
      {/* ======================================================== */}
      <HowItWorksFintech />

      {/* ======================================================== */}
      {/* 7. APP DOWNLOAD SECTION */}
      {/* ======================================================== */}
      <AppDownloadFintech />

      {/* ======================================================== */}
      {/* 8. FAQS SECTION */}
      {/* ======================================================== */}
      <FAQFintech />

      {/* ======================================================== */}
      {/* 9. CONTACT & HELPDESK SECTION */}
      {/* ======================================================== */}
      <ContactFintechSection />
    </div>
  );
}
