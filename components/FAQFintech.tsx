"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";

export const FAQFintech: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is GROWPLUS and how does it compare to Amway, Vestige, and Mi Lifestyle?",
      a: "GROWPLUS is a 100% legal, product-based direct selling company operating under the Consumer Protection (Direct Selling) Rules 2021. Just like Amway (Nutrilite), Vestige, and Mi Lifestyle (Elements Wellness), we market premium certified FSSAI healthcare, nutraceutical, skincare, and organic agriculture products through independent distributors.",
    },
    {
      q: "How does the 10-Tier Multi-Level Referral (10% to 1%) structure work?",
      a: "Our referral program rewards distributors across 10 completed generations: Tier 1 (Direct Sponsor) earns 10%, Tier 2 earns 9%, Tier 3 earns 8%, Tier 4 earns 7%, Tier 5 earns 6%, Tier 6 earns 5%, Tier 7 earns 4%, Tier 8 earns 3%, Tier 9 earns 2%, and Tier 10 earns 1% on product order invoices. In addition to referral commissions, product BV from your Left and Right teams enters your 1:1 Binary tree for weekly 12% matching bonuses.",
    },
    {
      q: "How does the Binary Network Tree (Left & Right Teams) matching plan work?",
      a: "Every distributor builds two teams: Left Wing and Right Wing ('jo mene us din sab ko smjhaya tha'). When your Left and Right teams purchase products, Business Volume (BV) accumulates. GrowPlus matches equal volume on a 1:1 ratio and pays out 12% matching commission every week. For instance, matching 50,000 Left BV with 50,000 Right BV pays ₹6,000 weekly.",
    },
    {
      q: "What is the difference between MRP, DP, and BV?",
      a: "MRP (Maximum Retail Price) is the standard retail price for regular customers. DP (Distributor Price) is the special discounted wholesale rate (15% to 25% lower) available exclusively to registered distributors. BV (Business Volume) is the points attributed to each product used to calculate your binary team matching checks and rank qualifications.",
    },
    {
      q: "Is there any registration fee to join GROWPLUS as a distributor?",
      a: "No! Under Government Direct Selling Rules 2021, registration is 100% free with zero joining fee or mandatory kit purchase. You simply create your free account, submit digital KYC (Aadhaar & PAN), and choose whichever products you wish to purchase for personal use or retailing.",
    },
    {
      q: "When and how are weekly payouts credited to distributors?",
      a: "Weekly business cut-off closes every Sunday at 11:59 PM IST. All accumulated 10% direct referral bonuses and 12% binary matching commissions are disbursed directly into your verified bank account via automated IMPS/NEFT every Wednesday, with compliant TDS certificates.",
    },
  ];

  return (
    <section id="faq" className="relative py-24 bg-[#0A0F26] border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#38BDF8] bg-[#38BDF8]/10 px-3 py-1 rounded-full border border-[#38BDF8]/30">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Everything You Need to Know
          </h2>
          <p className="text-sm sm:text-base text-[#AAA2C1]">
            Clear, transparent answers about products, the 10% first bill bonus, and the binary compensation tree.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-[#11193D] border-[#287CFF]/50 shadow-lg"
                    : "bg-[#0E1533] border-white/5 hover:border-white/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-white">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#AAA2C1] transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-[#38BDF8]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#AAA2C1] leading-relaxed border-t border-white/5">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
