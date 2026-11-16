"use client";

import React, { useState } from "react";
import {
  GitFork,
  Users,
  Award,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Info,
  DollarSign,
  Coins,
  ArrowRight,
  Layers,
  Crown,
  HeartHandshake,
} from "lucide-react";

interface TreeNode {
  id: string;
  name: string;
  distributorId: string;
  role: string;
  level: number;
  placement: "Root" | "Left" | "Right";
  status: "Active" | "New Active" | "Star";
  pbv: number; // Personal BV
  leftBv: number;
  rightBv: number;
  matchingEarned: number;
  children?: TreeNode[];
}

export const FeaturesPlanSection: React.FC = () => {
  // Tree Simulation State
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [leftSimBv, setLeftSimBv] = useState<number>(35000);
  const [rightSimBv, setRightSimBv] = useState<number>(30000);

  // Binary Matching calculations
  const matchedBv = Math.min(leftSimBv, rightSimBv);
  const binaryPayout = Math.round(matchedBv * 0.12); // 12% matching bonus
  const carryForwardBv = Math.abs(leftSimBv - rightSimBv);
  const carryForwardSide = leftSimBv > rightSimBv ? "Left Team" : rightSimBv > leftSimBv ? "Right Team" : "None";

  // Pre-configured Binary Tree reflecting the handwritten diagram
  const sampleTree: TreeNode = {
    id: "root-1",
    name: "You (Leader)",
    distributorId: "GP-98214",
    role: "Diamond Director",
    level: 0,
    placement: "Root",
    status: "Star",
    pbv: 1200,
    leftBv: 45000,
    rightBv: 42000,
    matchingEarned: 5040,
    children: [
      {
        id: "l-1",
        name: "Rohan Sharma",
        distributorId: "GP-98215",
        role: "Gold Executive",
        level: 1,
        placement: "Left",
        status: "Active",
        pbv: 850,
        leftBv: 22000,
        rightBv: 23000,
        matchingEarned: 2640,
        children: [
          {
            id: "ll-1",
            name: "Amit Kumar",
            distributorId: "GP-98220",
            role: "Silver Partner",
            level: 2,
            placement: "Left",
            status: "Active",
            pbv: 600,
            leftBv: 11000,
            rightBv: 11000,
            matchingEarned: 1320,
          },
          {
            id: "lr-1",
            name: "Neha Singh",
            distributorId: "GP-98221",
            role: "Silver Partner",
            level: 2,
            placement: "Right",
            status: "New Active",
            pbv: 750,
            leftBv: 11500,
            rightBv: 11500,
            matchingEarned: 1380,
          },
        ],
      },
      {
        id: "r-1",
        name: "Priya Verma",
        distributorId: "GP-98216",
        role: "Gold Executive",
        level: 1,
        placement: "Right",
        status: "Active",
        pbv: 900,
        leftBv: 21000,
        rightBv: 21000,
        matchingEarned: 2520,
        children: [
          {
            id: "rl-1",
            name: "Vikram Sethi",
            distributorId: "GP-98222",
            role: "Silver Partner",
            level: 2,
            placement: "Left",
            status: "Active",
            pbv: 550,
            leftBv: 10500,
            rightBv: 10500,
            matchingEarned: 1260,
          },
          {
            id: "rr-1",
            name: "Sunita Devi",
            distributorId: "GP-98223",
            role: "Silver Partner",
            level: 2,
            placement: "Right",
            status: "New Active",
            pbv: 620,
            leftBv: 10500,
            rightBv: 10500,
            matchingEarned: 1260,
          },
        ],
      },
    ],
  };

  return (
    <section id="features" className="relative py-24 bg-[#070B1E] border-t border-white/5 overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#287CFF]/15 via-[#8B35FF]/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ======================================================== */}
        {/* HEADER: DIRECT SELLING & BINARY PLAN */}
        {/* ======================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B3B] border border-[#287CFF]/40 text-xs font-semibold text-white/90 shadow-[0_0_20px_rgba(40,124,255,0.25)]">
            <GitFork className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>GrowPlus Compensation Structure</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Features &amp; All Business Plans <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
              The Power of Binary Network Marketing
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Inspired by proven direct-selling giants (Amway, Vestige, Mi Lifestyle). Our dual-team binary architecture ensures unmatched team teamwork, spillover leverage, and transparent weekly payouts with zero flush-out.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. INTERACTIVE BINARY TREE GENEALOGY (FROM USER'S SKETCH) */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-10 rounded-[32px] bg-[#0E1533]/90 border border-[#287CFF]/30 shadow-2xl backdrop-blur-xl relative space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#35E6A2] animate-pulse" />
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Live Binary Genealogy Tree Visualizer
                </h3>
              </div>
              <p className="text-xs text-[#AAA2C1] mt-1">
                Visualizing the exact 2-leg dual team binary structure drawn in your notes (&quot;jo mene us din sab ko smjhaya tha&quot;).
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-[#141E45] border border-white/10 text-[#38BDF8] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" /> Left Wing Team
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#141E45] border border-white/10 text-[#35E6A2] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#35E6A2]" /> Right Wing Team
              </span>
            </div>
          </div>

          {/* TREE CANVAS */}
          <div className="overflow-x-auto py-8">
            <div className="min-w-[700px] flex flex-col items-center select-none">
              
              {/* LEVEL 0: ROOT (YOU) */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setSelectedNode(sampleTree)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center w-60 shadow-xl group ${
                    selectedNode?.id === sampleTree.id
                      ? "bg-gradient-to-b from-[#287CFF]/40 to-[#121B3B] border-[#38BDF8] scale-105"
                      : "bg-[#141F48] border-[#8B35FF]/60 hover:border-[#38BDF8] hover:scale-102"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-[#AAA2C1] mb-1">
                    <span className="font-mono font-bold text-white/80">{sampleTree.distributorId}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5" /> Root
                    </span>
                  </div>
                  <div className="text-sm font-black text-white group-hover:text-[#38BDF8] transition-colors">
                    {sampleTree.name}
                  </div>
                  <div className="text-[11px] text-[#35E6A2] font-semibold mt-0.5">
                    {sampleTree.role}
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 text-[10px] gap-1 font-mono">
                    <div className="text-left">
                      <span className="text-[#AAA2C1] block">L-BV:</span>
                      <span className="font-bold text-[#38BDF8]">{sampleTree.leftBv.toLocaleString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#AAA2C1] block">R-BV:</span>
                      <span className="font-bold text-[#35E6A2]">{sampleTree.rightBv.toLocaleString()}</span>
                    </div>
                  </div>
                </button>

                {/* SVG STEM CONNECTOR */}
                <svg width="400" height="48" viewBox="0 0 400 48" className="overflow-visible">
                  <path
                    d="M 200 0 L 200 24 M 200 24 L 100 24 L 100 48 M 200 24 L 300 24 L 300 48"
                    stroke="#287CFF"
                    strokeWidth="2.5"
                    fill="none"
                    strokeDasharray="4 2"
                    className="animate-pulse"
                  />
                  <circle cx="200" cy="24" r="4" fill="#35E6A2" />
                  <circle cx="100" cy="48" r="3.5" fill="#38BDF8" />
                  <circle cx="300" cy="48" r="3.5" fill="#35E6A2" />
                </svg>
              </div>

              {/* LEVEL 1: TWO CHILDREN (LEFT & RIGHT) */}
              <div className="grid grid-cols-2 gap-16 w-full max-w-3xl">
                {sampleTree.children?.map((child) => (
                  <div key={child.id} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setSelectedNode(child)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-center w-56 shadow-lg group ${
                        selectedNode?.id === child.id
                          ? "bg-gradient-to-b from-[#287CFF]/30 to-[#121B3B] border-[#38BDF8] scale-105"
                          : "bg-[#101738] border-white/15 hover:border-[#287CFF] hover:scale-102"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-[#AAA2C1] mb-1">
                        <span className="font-mono text-white/80">{child.distributorId}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                            child.placement === "Left"
                              ? "bg-[#38BDF8]/20 text-[#38BDF8]"
                              : "bg-[#35E6A2]/20 text-[#35E6A2]"
                          }`}
                        >
                          {child.placement} Leg
                        </span>
                      </div>
                      <div className="text-xs font-black text-white group-hover:text-[#38BDF8] transition-colors">
                        {child.name}
                      </div>
                      <div className="text-[10px] text-amber-300 font-semibold">{child.role}</div>
                      <div className="mt-2 pt-1.5 border-t border-white/10 grid grid-cols-2 text-[9px] font-mono">
                        <div className="text-left text-[#38BDF8]">L: {child.leftBv.toLocaleString()}</div>
                        <div className="text-right text-[#35E6A2]">R: {child.rightBv.toLocaleString()}</div>
                      </div>
                    </button>

                    {/* CONNECTOR TO LEVEL 2 */}
                    <svg width="200" height="40" viewBox="0 0 200 40" className="overflow-visible">
                      <path
                        d="M 100 0 L 100 20 M 100 20 L 50 20 L 50 40 M 100 20 L 150 20 L 150 40"
                        stroke="#8B35FF"
                        strokeWidth="2"
                        fill="none"
                        strokeDasharray="3 2"
                      />
                      <circle cx="100" cy="20" r="3" fill="#B44CFF" />
                    </svg>

                    {/* LEVEL 2: FOUR NODES (2 under Left, 2 under Right) */}
                    <div className="grid grid-cols-2 gap-3 w-full">
                      {child.children?.map((subChild) => (
                        <button
                          key={subChild.id}
                          type="button"
                          onClick={() => setSelectedNode(subChild)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer text-center shadow-md group ${
                            selectedNode?.id === subChild.id
                              ? "bg-[#287CFF]/20 border-[#38BDF8] scale-105"
                              : "bg-[#0C122C] border-white/10 hover:border-[#38BDF8]/60"
                          }`}
                        >
                          <div className="text-[9px] text-[#AAA2C1] font-mono truncate">
                            {subChild.distributorId}
                          </div>
                          <div className="text-[11px] font-bold text-white truncate">
                            {subChild.name}
                          </div>
                          <div className="text-[9px] text-[#35E6A2] font-mono mt-0.5">
                            PBV: {subChild.pbv}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* NODE INSPECTOR CARD / DRAWER */}
          {selectedNode && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141E45] border border-[#38BDF8]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-0.5 rounded-md border border-[#38BDF8]/20">
                    Selected Node Info
                  </span>
                  <span className="font-mono text-xs font-bold text-white">{selectedNode.distributorId}</span>
                </div>
                <div className="text-base font-black text-white flex items-center gap-2">
                  <span>{selectedNode.name}</span>
                  <span className="text-xs font-semibold text-amber-300">• {selectedNode.role}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-[#AAA2C1] block">Personal PBV</span>
                  <span className="font-bold text-white">{selectedNode.pbv} BV</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-[#AAA2C1] block">Left Leg Volume</span>
                  <span className="font-bold text-[#38BDF8]">{selectedNode.leftBv.toLocaleString()} BV</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-[#AAA2C1] block">Right Leg Volume</span>
                  <span className="font-bold text-[#35E6A2]">{selectedNode.rightBv.toLocaleString()} BV</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-[#AAA2C1] block">Matching Bonus</span>
                  <span className="font-bold text-emerald-400">₹{selectedNode.matchingEarned.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white shrink-0"
              >
                Close
              </button>
            </div>
          )}

          {/* SIMULATE YOUR BINARY MATCHING COMMISSION */}
          <div className="pt-6 border-t border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-300" />
                  <h4 className="text-lg font-black text-white">
                    Simulate Your 1:1 Binary Matching Bonus
                  </h4>
                </div>
                <p className="text-xs text-[#AAA2C1] leading-relaxed">
                  Every product purchased by your Left and Right teams accumulates Business Volume (BV). GrowPlus matches equal BV from both teams on a 1:1 ratio and credits <strong className="text-white">12% instant binary commission</strong> directly to your bank account every week.
                </p>

                {/* Left Team BV Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#38BDF8] font-bold">Left Wing Group BV</span>
                    <span className="font-mono font-bold text-white">{leftSimBv.toLocaleString()} BV</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="2500"
                    value={leftSimBv}
                    onChange={(e) => setLeftSimBv(Number(e.target.value))}
                    className="w-full h-2 bg-[#121B3B] rounded-lg appearance-none cursor-pointer accent-[#38BDF8]"
                  />
                </div>

                {/* Right Team BV Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#35E6A2] font-bold">Right Wing Group BV</span>
                    <span className="font-mono font-bold text-white">{rightSimBv.toLocaleString()} BV</span>
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="2500"
                    value={rightSimBv}
                    onChange={(e) => setRightSimBv(Number(e.target.value))}
                    className="w-full h-2 bg-[#121B3B] rounded-lg appearance-none cursor-pointer accent-[#35E6A2]"
                  />
                </div>
              </div>

              {/* Simulation Result Box */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-gradient-to-br from-[#121B3B] to-[#0A0F26] border border-[#287CFF]/40 space-y-4 shadow-xl">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/20 inline-block">
                  Weekly Payout Projection
                </span>

                <div className="space-y-1">
                  <span className="text-xs text-[#AAA2C1] block">Your 12% Matching Income:</span>
                  <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2] font-mono">
                    ₹{binaryPayout.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-[#35E6A2] font-medium block">
                    Calculated on {matchedBv.toLocaleString()} Matched BV @ 12%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#AAA2C1]">Matched Volume:</span>
                    <span className="font-mono font-bold text-white">{matchedBv.toLocaleString()} BV</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAA2C1]">Carry-Forward Balance:</span>
                    <span className="font-mono font-bold text-[#38BDF8]">
                      {carryForwardBv.toLocaleString()} BV ({carryForwardSide})
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/10 text-[11px]">
                    <span className="text-[#35E6A2] font-semibold">Flush-Out:</span>
                    <span className="text-white font-bold">0% (Lifetime Rollover)</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#AAA2C1] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#35E6A2] shrink-0" />
                  <span>Maximum weekly capping up to ₹2,10,000 per distributor ID.</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 2. THE 5 CORE PILLARS OF GROWPLUS COMPENSATION */}
        {/* ======================================================== */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#38BDF8]">
              Income Opportunities
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              5 Ways to Earn with GrowPlus Direct Selling
            </h3>
            <p className="text-xs sm:text-sm text-[#AAA2C1]">
              A complete, sustainable income architecture compliant with Direct Selling Guidelines 2021.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Direct Referral Bonus */}
            <div className="p-7 rounded-3xl bg-[#0E1533] border border-[#35E6A2]/40 space-y-4 hover:border-[#35E6A2] transition-all shadow-lg group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center font-black text-lg">
                  10%
                </div>
                <span className="text-[10px] font-bold text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/30">
                  Featured in Notes
                </span>
              </div>
              <h4 className="text-lg font-black text-white">
                Direct Referral Bonus (10% First Bill)
              </h4>
              <p className="text-xs text-[#AAA2C1] leading-relaxed">
                As written in your plan specification: Earn <strong className="text-white">flat 10% cash one-time only</strong> on the first product invoice / bill of every personally sponsored partner!
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90">
                <span className="text-[#AAA2C1]">Friend&apos;s 1st Order ₹10,000:</span>
                <span className="font-bold text-[#35E6A2] block mt-0.5">You Get ₹1,000 Instant Direct Cash</span>
              </div>
            </div>

            {/* 2. Binary Team Matching Bonus */}
            <div className="p-7 rounded-3xl bg-[#0E1533] border border-[#287CFF]/40 space-y-4 hover:border-[#287CFF] transition-all shadow-lg group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#287CFF]/20 text-[#38BDF8] flex items-center justify-center font-black text-lg">
                  12%
                </div>
                <span className="text-[10px] font-bold text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-0.5 rounded-full border border-[#38BDF8]/30">
                  Binary Pair
                </span>
              </div>
              <h4 className="text-lg font-black text-white">
                Binary Team Matching Bonus
              </h4>
              <p className="text-xs text-[#AAA2C1] leading-relaxed">
                Build 2 balanced teams (Left Wing and Right Wing). Every 1:1 BV match pays out 12% cash bonus directly to your bank every Wednesday, with unlimited depth.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90">
                <span className="text-[#AAA2C1]">Match 50,000 Left &amp; Right BV:</span>
                <span className="font-bold text-[#38BDF8] block mt-0.5">Earn ₹6,000 Team Payout Every Week</span>
              </div>
            </div>

            {/* 3. Retail Profit Margin */}
            <div className="p-7 rounded-3xl bg-[#0E1533] border border-amber-400/40 space-y-4 hover:border-amber-400 transition-all shadow-lg group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-black text-lg">
                  25%
                </div>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  MRP vs DP
                </span>
              </div>
              <h4 className="text-lg font-black text-white">
                Retail Profit (Up to 25% Margin)
              </h4>
              <p className="text-xs text-[#AAA2C1] leading-relaxed">
                Every registered GrowPlus distributor purchases certified products at discounted Distributor Price (DP) and can retail them at Maximum Retail Price (MRP).
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90">
                <span className="text-[#AAA2C1]">MRP ₹1,499 vs DP ₹1,150:</span>
                <span className="font-bold text-amber-300 block mt-0.5">Instant Retail Profit ₹349 per bottle</span>
              </div>
            </div>

            {/* 4. Leadership Rank Rewards */}
            <div className="p-7 rounded-3xl bg-[#0E1533] border border-purple-400/40 space-y-4 hover:border-purple-400 transition-all shadow-lg group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-black text-lg">
                  <Crown className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-purple-300 bg-purple-400/10 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                  Car &amp; Travel Funds
                </span>
              </div>
              <h4 className="text-lg font-black text-white">
                Leadership Rank &amp; Lifestyle Funds
              </h4>
              <p className="text-xs text-[#AAA2C1] leading-relaxed">
                Ascend through Silver, Gold, Platinum, Diamond, and Crown Ambassador ranks. Unlock permanent monthly Travel Fund (3%), Luxury Car Fund (5%), and House Fund (3%).
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90">
                <span className="text-[#AAA2C1]">Star Leadership Perks:</span>
                <span className="font-bold text-purple-300 block mt-0.5">International conventions + luxury vehicle bonus</span>
              </div>
            </div>

            {/* 5. Zero Flush-Out & Carry Forward */}
            <div className="p-7 rounded-3xl bg-[#0E1533] border border-emerald-400/40 space-y-4 hover:border-emerald-400 transition-all shadow-lg group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-emerald-300 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  100% Transparent
                </span>
              </div>
              <h4 className="text-lg font-black text-white">
                Lifetime Carry-Forward (No Flush-Out)
              </h4>
              <p className="text-xs text-[#AAA2C1] leading-relaxed">
                Unlike predatory binary networks, unmatched group volume on your power leg never lapses. Your team volume stays recorded forever until matched.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90">
                <span className="text-[#AAA2C1]">Safety Guarantee:</span>
                <span className="font-bold text-emerald-300 block mt-0.5">Zero pressure monthly quotas or volume wipes</span>
              </div>
            </div>

            {/* 6. Legal Compliance & Direct Selling */}
            <div className="p-7 rounded-3xl bg-[#0E1533] border border-cyan-400/40 space-y-4 hover:border-cyan-400 transition-all shadow-lg group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black text-lg">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                  Govt Compliant
                </span>
              </div>
              <h4 className="text-lg font-black text-white">
                Direct Selling Guidelines 2021
              </h4>
              <p className="text-xs text-[#AAA2C1] leading-relaxed">
                100% genuine product-based network marketing. Strict compliance with Consumer Protection Rules 2021, FSSAI standards, AYUSH norms, and automated TDS deductions.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90">
                <span className="text-[#AAA2C1]">Trust Standard:</span>
                <span className="font-bold text-cyan-300 block mt-0.5">30-Day Product Money-Back Guarantee</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

