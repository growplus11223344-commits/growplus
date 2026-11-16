"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Flame,
  Zap,
  Users,
  CheckCircle2,
  Lock,
  Download,
  GitFork,
  Coins,
  Award,
  Layers,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";

import { FeaturesPlanSection } from "@/components/FeaturesPlanSection";
import { HowItWorksFintech } from "@/components/HowItWorksFintech";
import { MLMReferralSection } from "@/components/MLMReferralSection";
import { AppDownloadFintech } from "@/components/AppDownloadFintech";
import { FAQFintech } from "@/components/FAQFintech";
import { ContactFintechSection } from "@/components/ContactFintechSection";
import { DemoVideoModal } from "@/components/DemoVideoModal";

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
      {/* 1. HOME / HERO SECTION (INSPIRED BY AMWAY, VESTIGE, MI LIFESTYLE) */}
      {/* ======================================================== */}
      <section id="home" className="relative pt-8 pb-20 sm:pt-14 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column (7 Cols): Typography & CTAs */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B3B] border border-[#287CFF]/40 text-xs font-semibold text-white/90 shadow-[0_0_20px_rgba(40,124,255,0.25)]">
                <span className="w-2 h-2 rounded-full bg-[#35E6A2] animate-pulse" />
                <span>India&apos;s Next-Gen Direct Selling Community</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
                Empowering Lives with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2] drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
                  GROWPLUS
                </span>
              </h1>

              {/* Supporting Text */}
              <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed max-w-xl mx-auto lg:mx-0">
                Inspired by direct-selling pioneers (Amway, Vestige, Mi Lifestyle). GROWPLUS delivers an ethical 1:1 Binary Compensation Plan (&quot;jo mene us din sab ko smjhaya tha&quot;), flat 10% direct first-bill bonuses, an exclusive mobile shopping app, and automated weekly bank payouts.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <a
                  href="#features"
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-[0_0_25px_rgba(56,189,248,0.4)] hover:shadow-[0_0_35px_rgba(53,230,162,0.6)] transition-all hover:scale-105 flex items-center gap-2 group cursor-pointer"
                >
                  <GitFork className="w-4 h-4" />
                  <span>View Binary Plan</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#referral"
                  className="px-6 py-3.5 rounded-2xl bg-[#101738] hover:bg-[#182352] border border-white/15 hover:border-[#287CFF]/60 text-white text-xs sm:text-sm font-bold tracking-wide transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Coins className="w-4 h-4 text-[#35E6A2]" />
                  <span>10% Referral Offer</span>
                </a>

                <a
                  href="#download"
                  className="px-5 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-[#38BDF8]" />
                  <span>Download App to Shop</span>
                </a>
              </div>

              {/* 4 Trust Metrics Bar */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-3.5 rounded-2xl bg-[#0E1533] border border-white/5">
                  <div className="text-lg font-black text-white font-mono">In-App Shop</div>
                  <div className="text-[10px] text-[#AAA2C1]">Order via Mobile App</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0E1533] border border-white/5">
                  <div className="text-lg font-black text-[#35E6A2] font-mono">10% One-Time</div>
                  <div className="text-[10px] text-[#AAA2C1]">Direct First Bill Bonus</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0E1533] border border-white/5">
                  <div className="text-lg font-black text-[#38BDF8] font-mono">1:1 Binary</div>
                  <div className="text-[10px] text-[#AAA2C1]">12% Pair Match Bonus</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0E1533] border border-white/5">
                  <div className="text-lg font-black text-amber-300 font-mono">Wednesdays</div>
                  <div className="text-[10px] text-[#AAA2C1]">Weekly Bank Settlement</div>
                </div>
              </div>
            </div>

            {/* Right Column (5 Cols): Mobile App & Portal Snapshot */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 sm:p-7 rounded-3xl bg-[#0E1533]/95 border border-[#287CFF]/40 shadow-[0_20px_50px_rgba(7,6,17,0.8)] backdrop-blur-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      GrowPlus Distributor App
                    </h3>
                    <p className="text-[11px] text-[#AAA2C1]">Shop Products &amp; Track Binary Tree</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/30 flex items-center gap-1">
                    <Smartphone className="w-3 h-3" /> In-App Catalog
                  </span>
                </div>

                {/* App Feature Card Snapshot */}
                <div className="p-4 rounded-2xl bg-[#131D42] border border-[#287CFF]/30 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-white block">
                        Products &amp; Orders Available in Mobile App
                      </span>
                      <span className="text-[11px] text-[#38BDF8] font-mono font-bold">
                        100% Certified Healthcare, Ayurveda &amp; FMCG
                      </span>
                    </div>
                    <span className="text-xs font-black text-[#35E6A2] bg-[#35E6A2]/20 px-2 py-0.5 rounded-md font-mono">
                      DP Wholesale
                    </span>
                  </div>

                  <p className="text-[11px] text-[#AAA2C1] leading-relaxed">
                    All certified products are available to order directly inside the GrowPlus Mobile App at wholesale Distributor Prices (DP) with live BV tracking and 10% first bill sponsor bonuses.
                  </p>

                  <a
                    href="#download"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download App to Shop &amp; Order</span>
                  </a>
                </div>

                {/* Direct Android & iOS App Download */}
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-[#AAA2C1] tracking-wider block">
                    Direct Mobile App Download
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/download-apps"
                      className="p-3 rounded-2xl bg-[#141E45] hover:bg-[#1A2657] border border-white/10 hover:border-[#35E6A2] transition-all flex flex-col items-center justify-center text-center group"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-[#AAA2C1]">Android</span>
                      <span className="text-xs font-bold text-white group-hover:text-[#35E6A2] transition-colors flex items-center gap-1 mt-0.5">
                        <Download className="w-3 h-3 text-[#35E6A2]" />
                        APK Direct
                      </span>
                      <span className="text-[8px] text-[#35E6A2] font-semibold mt-1">v2.4.1 Verified</span>
                    </Link>

                    <Link
                      href="/download-apps"
                      className="p-3 rounded-2xl bg-[#141E45] hover:bg-[#1A2657] border border-white/10 hover:border-[#38BDF8] transition-all flex flex-col items-center justify-center text-center group"
                    >
                      <span className="text-[9px] uppercase tracking-wider text-[#AAA2C1]">Apple iOS</span>
                      <span className="text-xs font-bold text-white group-hover:text-[#38BDF8] transition-colors flex items-center gap-1 mt-0.5">
                        <span className="text-xs"></span>
                        App Store
                      </span>
                      <span className="text-[8px] text-[#38BDF8] font-semibold mt-1">Beta Access</span>
                    </Link>
                  </div>
                </div>

                {/* Member Login Direct Link */}
                <div className="pt-2 border-t border-white/5 text-center text-xs text-[#AAA2C1]">
                  <span>Already an authorized distributor? </span>
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
      {/* 2. FEATURES SECTION ("all plan" - Binary Tree Diagram) */}
      {/* ======================================================== */}
      <FeaturesPlanSection />

      {/* ======================================================== */}
      {/* 3. HOW IT WORKS SECTION (Distributor 5-Step Roadmap) */}
      {/* ======================================================== */}
      <HowItWorksFintech />

      {/* ======================================================== */}
      {/* 4. REFERRAL SECTION ("bill 10% onetime only") */}
      {/* ======================================================== */}
      <MLMReferralSection />

      {/* ======================================================== */}
      {/* 5. APP DOWNLOAD SECTION (Where products are shopped) */}
      {/* ======================================================== */}
      <AppDownloadFintech />

      {/* ======================================================== */}
      {/* 6. CONTACT & HELP DESK SECTION */}
      {/* ======================================================== */}
      <ContactFintechSection />

      {/* ======================================================== */}
      {/* 7. FAQ SECTION */}
      {/* ======================================================== */}
      <FAQFintech />

    </div>
  );
}
