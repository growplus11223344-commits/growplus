"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Target,
  Compass,
  Lightbulb,
  Heart,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Building,
  Layers,
  ShoppingBag,
  Award,
} from "lucide-react";

export default function AboutPage() {
  const values = [
    {
      icon: ShieldCheck,
      title: "Trust & Transparency",
      description:
        "Every reward calculation and shopping redemption metric is clearly outlined. We believe long-term community loyalty starts with total visibility.",
      badge: "Core Pillar",
    },
    {
      icon: Target,
      title: "Customer-Centric Value",
      description:
        "We prioritize tangible value. Rather than vanity points that expire unnoticed, our shopping credits directly reduce real checkout costs on quality products.",
      badge: "Member Focus",
    },
    {
      icon: Lightbulb,
      title: "Fintech & E-Commerce Innovation",
      description:
        "By merging modern digital rewards architecture with an agile e-commerce supply chain, we deliver a cohesive ecosystem unmatched in the digital market.",
      badge: "Technology",
    },
    {
      icon: Users,
      title: "Community Growth",
      description:
        "We believe growth is collective. When our members recommend GrowPlus, both the inviter and invitee share in the platform's expanding rewards network.",
      badge: "Synergy",
    },
  ];

  const milestones = [
    {
      year: "Phase 1",
      title: "Ecosystem Architecture & Official Web Portal",
      description:
        "The GROWPLUS digital architecture, brand identity, partner reward framework, and curated e-commerce catalog.",
      status: "Active Stage",
    },
    {
      year: "Phase 2",
      title: "GrowPlus Mobile Platform Rollout",
      description:
        "Official deployment of GrowPlus Rewards App on Google Play and Apple App Store with integrated in-app shopping gateway and notification systems.",
      status: "Official Release",
    },
    {
      year: "Phase 3",
      title: "Merchant Partner Network Expansion",
      description:
        "Onboarding 1,000+ top lifestyle, electronic, and apparel brands into the instant credit redemption engine across India.",
      status: "Pipeline",
    },
    {
      year: "Phase 4",
      title: "Next-Gen Decentralized Loyalty Integration",
      description:
        "Exploring advanced verification and cross-platform reward interoperability under formal regulatory frameworks.",
      status: "Roadmap",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#070611] text-white py-12 sm:py-20 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#8B35FF]/20 to-transparent blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1235] border border-[#8B35FF]/40 text-xs font-semibold text-white/90">
            <Sparkles className="w-3.5 h-3.5 text-[#35E6A2]" />
            <span>Discover Our Story & Purpose</span>
          </div>
          <h1 className="text-4xl sm:text-5.5xl font-black tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B44CFF] via-[#8B35FF] to-[#287CFF]">GROWPLUS</span>
          </h1>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Pioneering a unified bridge between digital loyalty rewards, community referrals, and seamless e-commerce shopping.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. WHO WE ARE */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-24">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#B44CFF]">
              Who We Are
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              A Modern Digital Ecosystem Built for the Connected Shopper
            </h2>
            <p className="text-sm text-[#AAA2C1] leading-relaxed">
              GROWPLUS was established with a singular vision: to eliminate the friction between earning loyalty perks and spending them. Traditional rewards programs leave users with scattered points, complex conversion ratios, and restrictive catalogues that offer little real-world utility.
            </p>
            <p className="text-sm text-[#AAA2C1] leading-relaxed">
              GrowPlus reimagines this paradigm by integrating an advanced rewards and referral architecture directly with a curated consumer shopping marketplace. When members participate in platform activities, they accumulate direct shopping credits that apply immediately at checkout—delivering tangible discounts on real lifestyle products.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-[#120D26] border border-white/5">
                <div className="text-2xl font-black text-white">100%</div>
                <div className="text-xs text-[#AAA2C1] mt-0.5">Connected Workflow</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#120D26] border border-white/5">
                <div className="text-2xl font-black text-[#35E6A2]">₹1 = 1 Credit</div>
                <div className="text-xs text-[#AAA2C1] mt-0.5">Direct Parity</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#120D26] border border-white/5">
                <div className="text-2xl font-black text-[#287CFF]">20% Max</div>
                <div className="text-xs text-[#AAA2C1] mt-0.5">Monthly Yield</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-[#1C143B] via-[#120D26] to-[#0A0717] border border-[#8B35FF]/40 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#8B35FF]/20 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B35FF] to-[#287CFF] flex items-center justify-center text-white font-black text-lg">
                  GP
                </div>
                <h3 className="text-xl font-black text-white">Our Brand Ethos</h3>
                <blockquote className="text-sm italic text-white/80 border-l-2 border-[#8B35FF] pl-4">
                  &ldquo;Grow More. Earn More. Shop More. We believe that customer loyalty should never feel like work—it should feel like everyday progress.&rdquo;
                </blockquote>
                <div className="pt-2 text-xs text-[#AAA2C1]">
                  Official GROWPLUS Brand Architecture (Phase 1 Frontend Prototype)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. VISION & MISSION */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {/* Vision Card */}
          <div className="p-8 rounded-3xl bg-[#110D24] border border-[#8B35FF]/30 space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-[#8B35FF]/20 text-[#B44CFF] flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white">Our Vision</h3>
            <p className="text-sm text-[#AAA2C1] leading-relaxed">
              To build India&apos;s most rewarding, transparent, and frictionless digital lifestyle ecosystem, where every active consumer engagement naturally creates real economic value for everyday shopping.
            </p>
            <ul className="space-y-2 text-xs text-white/90 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#35E6A2]" />
                <span>Empowering 1 million+ smart digital consumers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#35E6A2]" />
                <span>Zero expired or locked reward points</span>
              </li>
            </ul>
          </div>

          {/* Mission Card */}
          <div className="p-8 rounded-3xl bg-[#110D24] border border-[#287CFF]/30 space-y-4 relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-[#287CFF]/20 text-[#287CFF] flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-white">Our Mission</h3>
            <p className="text-sm text-[#AAA2C1] leading-relaxed">
              To pioneer cutting-edge frontend interfaces, intuitive mobile workflows, and compliant community referral mechanisms that turn mundane e-commerce shopping into an empowering, collaborative journey.
            </p>
            <ul className="space-y-2 text-xs text-white/90 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#35E6A2]" />
                <span>High-performance native mobile experience with the GrowPlus Rewards App</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#35E6A2]" />
                <span>Direct 1-tap cart credit deductions</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. CORE VALUES */}
        {/* ======================================================== */}
        <div className="mb-24">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#35E6A2]">
              Guiding Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              The Values That Drive Us
            </h2>
            <p className="text-sm text-[#AAA2C1]">
              Every feature we build and every policy we establish adheres strictly to our foundational principles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-[#110D24] border border-white/10 hover:border-[#8B35FF]/50 transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
                      <Icon className="w-5 h-5 text-[#B44CFF]" />
                    </div>
                    <span className="text-[10px] font-semibold text-[#AAA2C1] bg-white/5 px-2 py-0.5 rounded-full">
                      {v.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-white">{v.title}</h3>
                  <p className="text-xs text-[#AAA2C1] leading-relaxed">
                    {v.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. ECOSYSTEM ARCHITECTURE & ROADMAP */}
        {/* ======================================================== */}
        <div className="p-8 sm:p-12 rounded-3xl bg-[#100D22] border border-white/10 mb-20 space-y-8">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#287CFF]">
              Strategic Timeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              The GROWPLUS Ecosystem Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-[#AAA2C1] max-w-2xl mt-1">
              Phased development lifecycle delivering high-security architecture, verified merchant pipelines, and seamless user experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#150F2C] border border-white/5 space-y-2 relative"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#8B35FF] font-bold">{m.year}</span>
                  <span className="text-[10px] font-semibold text-[#35E6A2] bg-[#35E6A2]/10 px-2 py-0.5 rounded">
                    {m.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-white pt-1">{m.title}</h4>
                <p className="text-xs text-[#AAA2C1] leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-black text-white">
            Experience the Future of Digital Rewards
          </h3>
          <p className="text-xs sm:text-sm text-[#AAA2C1] max-w-lg mx-auto">
            Become an early member of the GrowPlus ecosystem and explore a connected world of growth and smart shopping.
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/register"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white font-bold text-xs shadow-lg hover:opacity-90 transition-opacity"
            >
              Create Free Account &rarr;
            </Link>
            <Link
              href="/how-it-works"
              className="px-5 py-3 rounded-2xl border border-white/10 hover:bg-white/5 text-white font-semibold text-xs transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
