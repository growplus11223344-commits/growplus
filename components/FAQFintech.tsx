"use client";

import React, { useState } from "react";
import Link from "next/link";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";

export const FAQFintech: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is GROWPLUS?",
      a: "GROWPLUS is a premier digital financial growth and community referral platform. We offer transparent 365-day fixed-yield capital allocation tiers (10% to 20% monthly yields), daily midnight bonuses up to ₹300/day, and a multi-level referral network that rewards community builders with instant cash commissions.",
    },
    {
      q: "How are returns calculated on GROWPLUS?",
      a: "Returns are calculated based on your activated plan tier. For example, in the Daily Earning Super Plan, you receive a 20% monthly return calculated on your principal allocation, plus an extra ₹300 daily bonus added automatically to your wallet at 12:00 AM midnight.",
    },
    {
      q: "How does the Daily Midnight Bonus work?",
      a: "Daily Earning Plan (₹99/day) and Daily Earning Super (₹300/day) credit cash bonuses every night at midnight. Once your daily bonus wallet reaches the minimum withdrawal threshold (₹1,000 for Daily Earning, ₹3,000 for Super), you can request immediate bank payouts.",
    },
    {
      q: "How does the Referral Commission Program work?",
      a: "When anyone registers with your exclusive referral code or link, you earn a flat 5% instant cash commission on their deposit amount. Additionally, you earn a 3% team override on Level 2 allocations, plus special leadership milestone bonuses.",
    },
    {
      q: "How do I deposit funds into my GROWPLUS wallet?",
      a: "Depositing is instant. Go to your Member Portal, navigate to Deposit, enter your desired amount (minimum ₹1,000), choose UPI, QR code, or IMPS/Bank Transfer, and confirm the transaction. Your wallet is updated in real time with zero deposit fees.",
    },
    {
      q: "How and when can I withdraw my earnings?",
      a: "You can request earnings and referral commission withdrawals at any time once your balance reaches the minimum threshold of ₹500. Withdrawals are processed directly to your registered Indian bank account via IMPS/NEFT within 2 to 24 hours.",
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
            Clear, straightforward answers about our investment plans, daily midnight bonus accruals, and referral commissions.
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
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors"
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
