"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  Apple,
  Download,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  QrCode,
  Zap,
} from "lucide-react";
import { SmartphoneMockup } from "@/components/MobileMockups";

export const AppDownloadFintech: React.FC = () => {
  const [downloadModal, setDownloadModal] = useState(false);

  return (
    <section id="download" className="relative py-24 bg-[#070B1E] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[36px] bg-gradient-to-r from-[#121A3B] via-[#1B2754] to-[#0E1533] border border-[#287CFF]/40 p-8 sm:p-14 overflow-hidden shadow-2xl relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35E6A2]/10 border border-[#35E6A2]/30 text-xs font-bold text-[#35E6A2]">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Official Release: GROWPLUS v2.4.1</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                Invest, Track &amp; Earn <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
                  Directly On Your Phone
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed max-w-xl">
                Take control of your portfolio anywhere, anytime. Receive instant notifications for daily midnight bonuses, track your referral network commissions, and initiate seamless bank withdrawals in 1 tap.
              </p>

              {/* App Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-[#AAA2C1] block">Package Version</span>
                  <span className="font-mono font-bold text-white">v2.4.1 (Stable)</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-[#AAA2C1] block">Compatibility</span>
                  <span className="font-mono font-bold text-[#35E6A2]">Android 8.0+ &amp; iOS</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#AAA2C1] block">Security Engine</span>
                  <span className="font-mono font-bold text-[#38BDF8]">256-bit AES</span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/download-apps#waitlist"
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs sm:text-sm shadow-lg hover:opacity-95 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Android APK</span>
                </Link>

                <Link
                  href="/download-apps#waitlist"
                  className="px-6 py-3.5 rounded-2xl bg-black/50 hover:bg-black/70 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2"
                >
                  <span className="text-base"></span>
                  <span>Apple App Store (Beta)</span>
                </Link>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#AAA2C1] pt-1">
                <span className="flex items-center gap-1 text-[#35E6A2]">
                  <ShieldCheck className="w-4 h-4" /> 100% Virus-Free Verified APK
                </span>
                <span>•</span>
                <span>Instant In-App Updates</span>
              </div>
            </div>

            {/* Right Phone Mockup (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="text-xs font-semibold text-[#AAA2C1] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#35E6A2] animate-pulse" />
                <span>GROWPLUS App Preview</span>
              </div>
              <SmartphoneMockup type="rewards" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
