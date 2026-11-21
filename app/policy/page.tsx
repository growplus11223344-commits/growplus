"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Coins,
  ShoppingBag,
  Users,
  Lock,
  ArrowRight,
  FileText,
  BadgeCheck,
  Ban,
} from "lucide-react";

export default function PolicyPage() {
  return (
    <div className="relative min-h-screen bg-[#070B1E] text-white py-14 sm:py-24 overflow-hidden selection:bg-[#287CFF]/30">
      {/* Background ambient lighting */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#287CFF]/15 via-[#8B35FF]/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B3B] border border-[#287CFF]/40 text-xs font-semibold text-white/90">
            <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Official Policy Document • 2026 Edition</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Partner Deposit, E-Mall Shopping &amp; <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-300 to-[#35E6A2]">
              Strict No-Refund Policy
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed max-w-2xl mx-auto">
            Please read these official terms governing initial deposits (₹500 - ₹5,000), immediate 10% first-deposit bonuses, dashboard earning mechanics, GrowPlus Mall shopping credit redemption, and partner commission operations.
          </p>
        </div>

        {/* Core Policy Highlight Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#121B3B] to-[#0A0F26] border-2 border-amber-400/40 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Strict No Return &amp; No Refund Policy
              </h2>
              <span className="text-xs text-amber-300 font-semibold">
                Clear &amp; Transparent Direct Selling Clause
              </span>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
            <p>
              GROWPLUS maintains an unequivocal <strong className="text-white">Strict No Return &amp; No Refund Policy</strong>. All account activation deposits, product purchases, and wallet recharges made on the platform are <strong className="text-amber-300">100% final, irrevocable, and non-refundable</strong>.
            </p>
            <p>
              Under no circumstances does GROWPLUS offer a &quot;30-day money-back guarantee&quot; or cash refund on deposited capital. Once a payment is confirmed, the transaction is processed directly into your digital distributor account and immediately linked to upline commissions, generation overrides, and product inventory allocation.
            </p>
          </div>
        </div>

        {/* 5 Key Clauses */}
        <div className="space-y-6">
          
          {/* Clause 1: Deposit Structure */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1533] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#287CFF]/20 text-[#38BDF8] flex items-center justify-center font-black text-sm">
                01
              </div>
              <h3 className="text-lg font-black text-white">
                Minimum Deposit Range: ₹500 to ₹5,000
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed pl-13">
              Any user seeking to join GROWPLUS and access the dashboard earning ecosystem can initiate an account activation deposit starting from a <strong className="text-white">minimum of ₹500 up to ₹5,000</strong>. This deposit establishes the member&apos;s digital distributor account, positions them on their sponsor&apos;s Left or Right binary wing, and activates portal tracking.
            </p>
          </div>

          {/* Clause 2: Instant 10% First Deposit Bonus */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1533] border border-[#35E6A2]/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center font-black text-sm">
                02
              </div>
              <h3 className="text-lg font-black text-white">
                Instant 10% Cash Bonus on 1st Deposit
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed pl-13">
              Immediately upon successful confirmation of your initial payment (₹500 to ₹5,000), GROWPLUS credits an <strong className="text-white">instant 10% cash bonus</strong> directly into your portal balance at that exact moment. For example, a ₹5,000 activation deposit receives ₹500 instant bonus on the spot.
            </p>
          </div>

          {/* Clause 3: Dashboard Earnings & Withdrawal Rules */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1533] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-sm">
                03
              </div>
              <h3 className="text-lg font-black text-white">
                Dashboard Earning &amp; Capital Withdrawal Conditions
              </h3>
            </div>
            <div className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed pl-13 space-y-2">
              <p>
                Once deposited, the funds serve as working account volume that unlocks daily earning tasks, team duplication tracking, and 10-tier referral commissions inside your personal dashboard.
              </p>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <span className="font-bold text-white block">Important Withdrawal Limitation:</span>
                <p>
                  Members <strong className="text-amber-300">cannot withdraw all deposited capital directly to their bank account as raw cash</strong>. Deposited funds are allocated to maintain active distributor standing, calculate 1:1 binary matching volume, and facilitate commission-based operations. Genuine weekly referral and binary commission earnings can be disbursed per standard platform payout cycles, while the deposit itself remains functional inside the ecosystem.
                </p>
              </div>
            </div>
          </div>

          {/* Clause 4: GrowPlus E-Mall Shopping */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1533] border border-[#287CFF]/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#287CFF]/20 text-[#38BDF8] flex items-center justify-center font-black text-sm">
                04
              </div>
              <h3 className="text-lg font-black text-white">
                Redemption in GrowPlus E-Mall
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed pl-13">
              Members can utilize their available dashboard balance and shopping credits to purchase products directly from our exclusive <strong className="text-white">GrowPlus E-Mall</strong>. All certified healthcare, wellness, electronic, and personal care products can be ordered at wholesale Distributor Price (DP), allowing members to recover and multiply their value through direct consumer retailing or personal consumption.
            </p>
          </div>

          {/* Clause 5: Business Partner & Commission Basis */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1533] border border-[#35E6A2]/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center font-black text-sm">
                05
              </div>
              <h3 className="text-lg font-black text-white">
                Official Business Partner &amp; Commission-Based Earnings
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed pl-13">
              By activating your account, you enter into a commercial relationship with GROWPLUS as an <strong className="text-white">Independent Business Partner / Distributor</strong>. As a partner, you earn commission on team performance: <strong className="text-[#35E6A2]">Tier 1: 10%, Tier 2: 9%, Tier 3: 8%... down to Tier 10: 1%</strong>, alongside weekly 12% binary matching commissions on paired Left and Right team volume.
            </p>
          </div>

        </div>

        {/* Agreement Action Box */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#121B3B] to-[#0A0F26] border border-[#35E6A2]/40 text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 text-xs text-[#35E6A2] font-bold">
            <BadgeCheck className="w-4 h-4" />
            <span>Binding Digital Agreement</span>
          </div>
          <h3 className="text-2xl font-black text-white">
            Ready to Partner with GrowPlus?
          </h3>
          <p className="text-xs sm:text-sm text-[#AAA2C1] max-w-lg mx-auto">
            By proceeding to deposit (₹500 - ₹5,000) or registering your account, you confirm that you have read, understood, and agreed to this strict No-Refund, E-Mall Shopping &amp; Partner Policy.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs sm:text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Accept &amp; Join as Partner</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="px-6 py-3.5 rounded-2xl bg-[#141E45] hover:bg-[#1A2657] border border-white/10 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer"
            >
              Return to Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
