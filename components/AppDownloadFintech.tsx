"use client";

import React from "react";
import Link from "next/link";
import {
  Smartphone,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  QrCode,
  GitFork,
  ShoppingBag,
  Bell,
  ArrowRight,
} from "lucide-react";
import { SmartphoneMockup } from "@/components/MobileMockups";

export const AppDownloadFintech: React.FC = () => {
  return (
    <section id="download" className="relative py-24 bg-[#070B1E] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-gradient-to-r from-[#121A3B] via-[#1B2754] to-[#0E1533] border border-[#287CFF]/40 p-8 sm:p-14 overflow-hidden shadow-2xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#35E6A2]/10 border border-[#35E6A2]/30 text-xs font-bold text-[#35E6A2]">
                <Smartphone className="w-3.5 h-3.5" />
                <span>GrowPlus Distributor Mobile Suite v2.4.1</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                Manage Your Network &amp; Orders <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
                  Directly On Your Smartphone
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed max-w-xl">
                Just like Amway Creator and Mi Lifestyle apps, take your entire direct-selling business in your pocket. Track live binary tree genealogy, monitor Left/Right BV match, receive 10% direct referral alerts, and order wellness products in 1 tap.
              </p>

              {/* 4 Feature Highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#38BDF8] font-bold">
                    <GitFork className="w-4 h-4" />
                    <span>Live Binary Tree</span>
                  </div>
                  <p className="text-[11px] text-[#AAA2C1]">Explore your entire Left &amp; Right downline genealogy tree on mobile.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#35E6A2] font-bold">
                    <Bell className="w-4 h-4" />
                    <span>10% First Bill Alerts</span>
                  </div>
                  <p className="text-[11px] text-[#AAA2C1]">Instant push notifications when your sponsor makes their first order.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <ShoppingBag className="w-4 h-4" />
                    <span>In-App DP Shopping</span>
                  </div>
                  <p className="text-[11px] text-[#AAA2C1]">Shop 100+ certified products with doorstep delivery &amp; live tracking.</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Bank Payout Ledger</span>
                  </div>
                  <p className="text-[11px] text-[#AAA2C1]">Automated weekly bank transfer statements and TDS certificates.</p>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/download-apps"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs sm:text-sm shadow-lg hover:opacity-95 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Android APK (v2.4.1)</span>
                </Link>

                <Link
                  href="/download-apps"
                  className="px-6 py-3.5 rounded-2xl bg-black/50 hover:bg-black/70 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
                >
                  <span className="text-base"></span>
                  <span>iOS App Store (TestFlight)</span>
                </Link>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#AAA2C1] pt-1">
                <span className="flex items-center gap-1 text-[#35E6A2]">
                  <ShieldCheck className="w-4 h-4" /> 100% Virus-Free Verified APK
                </span>
                <span>•</span>
                <span>FSSAI &amp; Quality Certified Catalog</span>
              </div>
            </div>

            {/* Right Phone Mockup (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="text-xs font-semibold text-[#AAA2C1] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#35E6A2] animate-pulse" />
                <span>GROWPLUS Distributor Portal Mobile Preview</span>
              </div>
              <SmartphoneMockup type="rewards" />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
