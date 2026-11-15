"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { FAQS_DATA, FaqItem } from "@/data/mockData";

export default function FaqsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "faq-1": true,
    "faq-2": true,
  });

  const toggleAccordion = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const categories = ["All", "General", "Rewards", "Referral", "Shopping", "Security"];

  // Filtered FAQs
  const filteredFaqs = FAQS_DATA.filter((faq) => {
    const matchesCat = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="relative min-h-screen bg-[#070611] text-white py-12 sm:py-20 overflow-hidden">
      {/* Glow Backdrop */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#8B35FF]/15 to-[#287CFF]/15 blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1235] border border-[#8B35FF]/40 text-xs font-semibold text-white/90">
            <HelpCircle className="w-3.5 h-3.5 text-[#35E6A2]" />
            <span>Help Center &amp; Knowledge Base</span>
          </div>
          <h1 className="text-4xl sm:text-5.5xl font-black tracking-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B44CFF] via-[#8B35FF] to-[#287CFF]">Questions</span>
          </h1>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed max-w-xl mx-auto">
            Find immediate answers regarding account setup, reward calculation, referral benefits, and shopping credit redemption.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-[#AAA2C1]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword (e.g., 'rewards', 'referral', 'credits')..."
            className="w-full bg-[#110D24] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-[#AAA2C1]/60 focus:outline-none focus:border-[#8B35FF] shadow-inner transition-colors"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white shadow-md"
                  : "bg-[#110D24] border border-white/10 text-[#AAA2C1] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5 mb-16">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div
                  key={faq.id}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? "bg-[#130E29] border-[#8B35FF]/40 shadow-lg"
                      : "bg-[#110D24] border-white/5 hover:border-white/20"
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#35E6A2] bg-[#35E6A2]/10 px-2 py-0.5 rounded">
                        {faq.category}
                      </span>
                      <span className="font-bold text-sm sm:text-base text-white">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#AAA2C1] transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-[#B44CFF]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#AAA2C1] leading-relaxed border-t border-white/5 space-y-2">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-10 rounded-2xl bg-[#110D24] border border-white/5 text-center text-sm text-[#AAA2C1]">
              No questions found matching &ldquo;{searchQuery}&rdquo;. Try another search term or browse by category.
            </div>
          )}
        </div>

        {/* Still Have Questions Box */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#170F35] via-[#201449] to-[#121B3B] border border-[#8B35FF]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Still have questions?
            </h3>
            <p className="text-xs sm:text-sm text-[#AAA2C1] max-w-md">
              Can&apos;t find what you&apos;re looking for? Reach out to our dedicated support concierge for prompt assistance.
            </p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-2xl bg-white text-black font-extrabold text-xs sm:text-sm shadow-lg hover:bg-white/90 transition-all shrink-0 flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Support Desk</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
