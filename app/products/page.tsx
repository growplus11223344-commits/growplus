"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Smartphone, Download, ShieldCheck, Sparkles, ShoppingBag } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-[#070B1E] text-white py-16 px-4">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#AAA2C1] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="p-10 rounded-[32px] bg-[#0E1533] border border-[#287CFF]/40 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#287CFF] to-[#35E6A2] flex items-center justify-center mx-auto text-black shadow-lg">
            <Smartphone className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#35E6A2] bg-[#35E6A2]/10 px-3 py-1 rounded-full border border-[#35E6A2]/30 inline-block">
              Exclusively in Mobile App
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Products Available in GrowPlus App
            </h1>
            <p className="text-sm text-[#AAA2C1] max-w-lg mx-auto leading-relaxed">
              To ensure the best shopping experience and instant BV point crediting, all certified Healthcare, Ayurvedic &amp; FMCG products are available to order exclusively inside the official GrowPlus Mobile App.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/download-apps"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <Download className="w-4 h-4" />
              <span>Download Mobile App to Shop</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
