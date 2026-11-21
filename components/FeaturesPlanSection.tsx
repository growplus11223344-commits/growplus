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
  ChevronDown,
  Sparkles,
  Info,
  DollarSign,
  Coins,
  ArrowRight,
  Layers,
  Crown,
  HeartHandshake,
  Sliders,
  Check,
} from "lucide-react";

export interface TreeNode {
  id: string;
  name: string;
  distributorId: string;
  role: string;
  tier: number; // 1 to 10
  referralPercent: number; // 10%, 9%, 8%, 7%...
  level: number;
  placement: "Root" | "Left" | "Right";
  status: "Active" | "New Active" | "Star";
  pbv: number; // Personal BV
  leftBv: number;
  rightBv: number;
  matchingEarned: number;
  children?: TreeNode[];
}

export interface TierLevel {
  tier: number; // 1 to 10
  multiplier: number; // 1, 2, 4, 8, 16, 32, 64, 128, 256, 512
  formula: string;
  percent: number; // 10, 9, 8, 7, 6, 5, 4, 3, 2, 1
  rank: string;
  leftLeg: number;
  rightLeg: number;
  color: string;
  description: string;
}

export const TEN_TIERS_DATA: TierLevel[] = [
  { tier: 1, multiplier: 1, formula: "2⁰ = 1 Leader", percent: 10, rank: "Diamond Director (You)", leftLeg: 0, rightLeg: 0, color: "#38BDF8", description: "Direct Sponsoring (Level 1) - Flat 10% on 1st Order" },
  { tier: 2, multiplier: 2, formula: "2¹ = 2 Members", percent: 9, rank: "Gold Executives", leftLeg: 1, rightLeg: 1, color: "#35E6A2", description: "Dual Team Frontline (1 Left, 1 Right) - 9% Commission" },
  { tier: 3, multiplier: 4, formula: "2² = 4 Members", percent: 8, rank: "Silver Partners", leftLeg: 2, rightLeg: 2, color: "#A855F7", description: "Second Generation Duplication - 8% Commission" },
  { tier: 4, multiplier: 8, formula: "2³ = 8 Members", percent: 7, rank: "Bronze Associates", leftLeg: 4, rightLeg: 4, color: "#F59E0B", description: "Third Generation Duplication - 7% Commission" },
  { tier: 5, multiplier: 16, formula: "2⁴ = 16 Members", percent: 6, rank: "Star Promoters", leftLeg: 8, rightLeg: 8, color: "#EC4899", description: "Core Leadership Duplication - 6% Commission" },
  { tier: 6, multiplier: 32, formula: "2⁵ = 32 Members", percent: 5, rank: "Senior Promoters", leftLeg: 16, rightLeg: 16, color: "#3B82F6", description: "Regional Distribution Force - 5% Commission" },
  { tier: 7, multiplier: 64, formula: "2⁶ = 64 Members", percent: 4, rank: "Team Coordinators", leftLeg: 32, rightLeg: 32, color: "#10B981", description: "District Expansion Network - 4% Commission" },
  { tier: 8, multiplier: 128, formula: "2⁷ = 128 Members", percent: 3, rank: "District Managers", leftLeg: 64, rightLeg: 64, color: "#8B5CF6", description: "State Level Community - 3% Commission" },
  { tier: 9, multiplier: 256, formula: "2⁸ = 256 Members", percent: 2, rank: "Zonal Directors", leftLeg: 128, rightLeg: 128, color: "#F97316", description: "Zonal Direct Selling Power - 2% Commission" },
  { tier: 10, multiplier: 512, formula: "2⁹ = 512 Members", percent: 1, rank: "National Ambassadors", leftLeg: 256, rightLeg: 256, color: "#06B6D4", description: "National Field Force - 1% Commission" },
];

export const FeaturesPlanSection: React.FC = () => {
  const formatNumber = (val: number) => val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Tree Simulation State
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [activeTab, setActiveTab] = useState<"tree" | "matrix">("tree");
  const [selectedTier, setSelectedTier] = useState<number>(1);
  const [showTier4, setShowTier4] = useState<boolean>(true);
  const [billSimulationAmount, setBillSimulationAmount] = useState<number>(5000);

  // Binary Matching calculations
  const [leftSimBv, setLeftSimBv] = useState<number>(35000);
  const [rightSimBv, setRightSimBv] = useState<number>(30000);
  const matchedBv = Math.min(leftSimBv, rightSimBv);
  const binaryPayout = Math.round(matchedBv * 0.12); // 12% matching bonus
  const carryForwardBv = Math.abs(leftSimBv - rightSimBv);
  const carryForwardSide = leftSimBv > rightSimBv ? "Left Team" : rightSimBv > leftSimBv ? "Right Team" : "None";

  // Pre-configured Binary Tree reflecting 1 -> 2 -> 4 -> 8 structure with 10%, 9%, 8%, 7%
  const sampleTree: TreeNode = {
    id: "root-1",
    name: "You (Leader)",
    distributorId: "GP-98214",
    role: "Diamond Director",
    tier: 1,
    referralPercent: 10,
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
        tier: 2,
        referralPercent: 9,
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
            tier: 3,
            referralPercent: 8,
            level: 2,
            placement: "Left",
            status: "Active",
            pbv: 600,
            leftBv: 11000,
            rightBv: 11000,
            matchingEarned: 1320,
            children: [
              {
                id: "lll-1",
                name: "Rajesh Patel",
                distributorId: "GP-98230",
                role: "Bronze Associate",
                tier: 4,
                referralPercent: 7,
                level: 3,
                placement: "Left",
                status: "Active",
                pbv: 500,
                leftBv: 5500,
                rightBv: 5500,
                matchingEarned: 660,
              },
              {
                id: "llr-1",
                name: "Pooja Mishra",
                distributorId: "GP-98231",
                role: "Bronze Associate",
                tier: 4,
                referralPercent: 7,
                level: 3,
                placement: "Right",
                status: "New Active",
                pbv: 450,
                leftBv: 5200,
                rightBv: 5200,
                matchingEarned: 624,
              },
            ],
          },
          {
            id: "lr-1",
            name: "Neha Singh",
            distributorId: "GP-98221",
            role: "Silver Partner",
            tier: 3,
            referralPercent: 8,
            level: 2,
            placement: "Right",
            status: "New Active",
            pbv: 750,
            leftBv: 11500,
            rightBv: 11500,
            matchingEarned: 1380,
            children: [
              {
                id: "lrl-1",
                name: "Suresh Gupta",
                distributorId: "GP-98232",
                role: "Bronze Associate",
                tier: 4,
                referralPercent: 7,
                level: 3,
                placement: "Left",
                status: "Active",
                pbv: 480,
                leftBv: 5700,
                rightBv: 5700,
                matchingEarned: 684,
              },
              {
                id: "lrr-1",
                name: "Anjali Roy",
                distributorId: "GP-98233",
                role: "Bronze Associate",
                tier: 4,
                referralPercent: 7,
                level: 3,
                placement: "Right",
                status: "Active",
                pbv: 520,
                leftBv: 5800,
                rightBv: 5800,
                matchingEarned: 696,
              },
            ],
          },
        ],
      },
      {
        id: "r-1",
        name: "Priya Verma",
        distributorId: "GP-98216",
        role: "Gold Executive",
        tier: 2,
        referralPercent: 9,
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
            tier: 3,
            referralPercent: 8,
            level: 2,
            placement: "Left",
            status: "Active",
            pbv: 550,
            leftBv: 10500,
            rightBv: 10500,
            matchingEarned: 1260,
            children: [
              {
                id: "rll-1",
                name: "Deepak Joshi",
                distributorId: "GP-98234",
                role: "Bronze Associate",
                tier: 4,
                referralPercent: 7,
                level: 3,
                placement: "Left",
                status: "Active",
                pbv: 460,
                leftBv: 5200,
                rightBv: 5200,
                matchingEarned: 624,
              },
              {
                id: "rlr-1",
                name: "Kavita Rao",
                distributorId: "GP-98235",
                role: "Bronze Associate",
                tier: 4,
                referralPercent: 7,
                level: 3,
                placement: "Right",
                status: "Active",
                pbv: 510,
                leftBv: 5300,
                rightBv: 5300,
                matchingEarned: 636,
              },
            ],
          },
          {
            id: "rr-1",
            name: "Sunita Devi",
            distributorId: "GP-98223",
            role: "Silver Partner",
            tier: 3,
            referralPercent: 8,
            level: 2,
            placement: "Right",
            status: "New Active",
            pbv: 620,
            leftBv: 10500,
            rightBv: 10500,
            matchingEarned: 1260,
            children: [
              {
                id: "rrl-1",
                name: "Manoj Tiwari",
                distributorId: "GP-98236",
                role: "Bronze Associate",
                tier: 4,
                referralPercent: 7,
                level: 3,
                placement: "Left",
                status: "Active",
                pbv: 490,
                leftBv: 5100,
                rightBv: 5100,
                matchingEarned: 612,
              },
              {
                id: "rrr-1",
                name: "Divya Nair",
                distributorId: "GP-98237",
                role: "Bronze Associate",
                tier: 4,
                referralPercent: 7,
                level: 3,
                placement: "Right",
                status: "New Active",
                pbv: 530,
                leftBv: 5400,
                rightBv: 5400,
                matchingEarned: 648,
              },
            ],
          },
        ],
      },
    ],
  };

  // 10 Tiers calculation helpers
  const totalTeamMembers = TEN_TIERS_DATA.reduce((acc, t) => acc + t.multiplier, 0); // 1,023 members
  const totalReferralIncome = TEN_TIERS_DATA.reduce(
    (acc, t) => acc + Math.round(t.multiplier * billSimulationAmount * (t.percent / 100)),
    0
  );

  return (
    <section id="features" className="relative py-24 bg-[#070B1E] border-t border-white/5 overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-[#287CFF]/15 via-[#8B35FF]/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ======================================================== */}
        {/* HEADER: DIRECT SELLING & 10-TIER BINARY PLAN */}
        {/* ======================================================== */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121B3B] border border-[#287CFF]/40 text-xs font-semibold text-white/90 shadow-[0_0_20px_rgba(40,124,255,0.25)]">
            <GitFork className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>GrowPlus 10-Tier Binary Architecture</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Features &amp; 10-Tier Business Plan <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#38BDF8] to-[#35E6A2]">
              1 &rarr; 2 &rarr; 4 &rarr; 8 &rarr; 512 Duplication (10% to 1%)
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Inspired by proven direct-selling giants (Amway, Vestige, Mi Lifestyle). Our dual-team binary tree doubles each tier (<strong className="text-white">1 se 2, 2 se 4, 4 se 8... 512 tak</strong>) with descending referral commissions from <strong className="text-[#35E6A2]">Tier 1 (10%)</strong> to <strong className="text-[#38BDF8]">Tier 10 (1%)</strong> across 1,023 team leaders!
          </p>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-center gap-2 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("tree")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "tree"
                  ? "bg-[#287CFF] text-white shadow-[0_0_20px_rgba(40,124,255,0.4)]"
                  : "bg-[#121B3B] text-[#AAA2C1] hover:text-white border border-white/10"
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Interactive Binary Tree Visualizer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("matrix")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === "matrix"
                  ? "bg-[#35E6A2] text-black shadow-[0_0_20px_rgba(53,230,162,0.4)]"
                  : "bg-[#121B3B] text-[#AAA2C1] hover:text-white border border-white/10"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Complete 10-Tier Referral &amp; Volume Matrix (10% to 1%)</span>
            </button>
          </div>
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
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30">
                  10 Tiers Architecture
                </span>
              </div>
              <p className="text-xs text-[#AAA2C1] mt-1">
                Visualizing the exact 2-leg dual team binary structure: Tier 1 (1 Leader @ 10%) &rarr; Tier 2 (2 @ 9%) &rarr; Tier 3 (4 @ 8%) &rarr; Tier 4 (8 @ 7%) &rarr; up to Tier 10 (512 @ 1%).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-[#141E45] border border-white/10 text-[#38BDF8] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" /> Left Wing Team (511)
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-[#141E45] border border-white/10 text-[#35E6A2] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#35E6A2]" /> Right Wing Team (511)
              </span>
              <button
                type="button"
                onClick={() => setShowTier4(!showTier4)}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <span>{showTier4 ? "Hide Tier 4 (8 Nodes)" : "Expand Tier 4 (8 Nodes)"}</span>
              </button>
            </div>
          </div>

          {/* 10-TIER QUICK SELECTOR BAR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#AAA2C1] font-semibold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#38BDF8]" />
                Select any Tier (1 to 10) to inspect commission rate &amp; binary count:
              </span>
              <span className="text-[11px] font-mono text-[#35E6A2]">
                Total: 1,023 Team Members Across 10 Tiers
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {TEN_TIERS_DATA.map((t) => {
                const isSelected = selectedTier === t.tier;
                return (
                  <button
                    key={t.tier}
                    type="button"
                    onClick={() => setSelectedTier(t.tier)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-gradient-to-b from-[#287CFF]/40 to-[#141E45] border-[#38BDF8] shadow-md scale-102"
                        : "bg-[#101738] border-white/10 hover:border-white/25 hover:bg-[#141F48]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="font-extrabold text-white">Tier {t.tier}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-black"
                        style={{ color: t.color, backgroundColor: `${t.color}20` }}
                      >
                        {t.percent}%
                      </span>
                    </div>
                    <div className="text-[11px] font-mono font-bold text-white/90">
                      {t.multiplier} {t.multiplier === 1 ? "Leader" : "Members"}
                    </div>
                    <div className="text-[9px] text-[#AAA2C1] font-mono mt-0.5 truncate">
                      {t.formula}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE TIER HIGHLIGHT BANNER */}
          {(() => {
            const activeTierData = TEN_TIERS_DATA.find((t) => t.tier === selectedTier) || TEN_TIERS_DATA[0];
            const sampleEarning = Math.round(
              activeTierData.multiplier * billSimulationAmount * (activeTierData.percent / 100)
            );
            return (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#141E45] to-[#0F173B] border border-[#38BDF8]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 text-sm shadow-md"
                    style={{ backgroundColor: `${activeTierData.color}30`, borderColor: activeTierData.color, borderWidth: 1 }}
                  >
                    T{activeTierData.tier}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-white text-sm sm:text-base">
                        {activeTierData.name}
                      </h4>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                        style={{ color: activeTierData.color, backgroundColor: `${activeTierData.color}20` }}
                      >
                        {activeTierData.percent}% Referral Payout
                      </span>
                    </div>
                    <p className="text-xs text-[#AAA2C1] mt-0.5">
                      {activeTierData.description} &bull; Binary Formula: <span className="font-mono text-white font-bold">{activeTierData.formula}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div className="p-2 px-3 rounded-xl bg-black/40 border border-white/5 text-right">
                    <span className="text-[10px] text-[#AAA2C1] block">Tier Size</span>
                    <span className="font-bold text-white">{formatNumber(activeTierData.multiplier)} Distributors</span>
                  </div>
                  <div className="p-2 px-3 rounded-xl bg-black/40 border border-white/5 text-right">
                    <span className="text-[10px] text-[#AAA2C1] block">Earn on ₹{formatNumber(billSimulationAmount)} Bill</span>
                    <span className="font-black text-[#35E6A2] text-sm">₹{formatNumber(sampleEarning)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB 1: VISUAL TREE CANVAS */}
          {activeTab === "tree" && (
            <div className="overflow-x-auto py-6">
              <div className="min-w-[960px] flex flex-col items-center select-none space-y-4">
                
                {/* LEVEL 0: ROOT (YOU) - TIER 1 (10%) */}
                <div className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedNode(sampleTree)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center w-64 shadow-xl group ${
                      selectedNode?.id === sampleTree.id
                        ? "bg-gradient-to-b from-[#287CFF]/40 to-[#121B3B] border-[#38BDF8] scale-105"
                        : "bg-[#141F48] border-[#8B35FF]/60 hover:border-[#38BDF8] hover:scale-102"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#AAA2C1] mb-1">
                      <span className="font-mono font-bold text-white/80">{sampleTree.distributorId}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center gap-1 text-[9px]">
                        <Crown className="w-2.5 h-2.5" /> Tier 1 &bull; 10%
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
                        <span className="text-[#AAA2C1] block">Left Wing:</span>
                        <span className="font-bold text-[#38BDF8]">{formatNumber(sampleTree.leftBv)} BV</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#AAA2C1] block">Right Wing:</span>
                        <span className="font-bold text-[#35E6A2]">{formatNumber(sampleTree.rightBv)} BV</span>
                      </div>
                    </div>
                  </button>

                  {/* SVG STEM CONNECTOR FROM ROOT TO LEVEL 1 */}
                  <svg width="480" height="48" viewBox="0 0 480 48" className="overflow-visible">
                    <path
                      d="M 240 0 L 240 24 M 240 24 L 120 24 L 120 48 M 240 24 L 360 24 L 360 48"
                      stroke="#287CFF"
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                    <circle cx="240" cy="24" r="4" fill="#35E6A2" />
                    <circle cx="120" cy="48" r="3.5" fill="#38BDF8" />
                    <circle cx="360" cy="48" r="3.5" fill="#35E6A2" />
                  </svg>
                </div>

                {/* LEVEL 1: TWO CHILDREN (LEFT & RIGHT) - TIER 2 (9%) */}
                <div className="grid grid-cols-2 gap-20 w-full max-w-4xl">
                  {sampleTree.children?.map((child) => (
                    <div key={child.id} className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => setSelectedNode(child)}
                        className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer text-center w-60 shadow-lg group ${
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
                            Tier 2 &bull; 9% ({child.placement} Leg)
                          </span>
                        </div>
                        <div className="text-xs font-black text-white group-hover:text-[#38BDF8] transition-colors">
                          {child.name}
                        </div>
                        <div className="text-[10px] text-amber-300 font-semibold">{child.role}</div>
                        <div className="mt-2 pt-1.5 border-t border-white/10 grid grid-cols-2 text-[9px] font-mono">
                          <div className="text-left text-[#38BDF8]">L: {formatNumber(child.leftBv)}</div>
                          <div className="text-right text-[#35E6A2]">R: {formatNumber(child.rightBv)}</div>
                        </div>
                      </button>

                      {/* CONNECTOR TO LEVEL 2 */}
                      <svg width="220" height="38" viewBox="0 0 220 38" className="overflow-visible">
                        <path
                          d="M 110 0 L 110 18 M 110 18 L 55 18 L 55 38 M 110 18 L 165 18 L 165 38"
                          stroke="#8B35FF"
                          strokeWidth="2"
                          fill="none"
                          strokeDasharray="3 2"
                        />
                        <circle cx="110" cy="18" r="3" fill="#B44CFF" />
                        <circle cx="55" cy="38" r="2.5" fill="#38BDF8" />
                        <circle cx="165" cy="38" r="2.5" fill="#35E6A2" />
                      </svg>

                      {/* LEVEL 2: FOUR NODES (2 under Left, 2 under Right) - TIER 3 (8%) */}
                      <div className="grid grid-cols-2 gap-3 w-full">
                        {child.children?.map((subChild) => (
                          <div key={subChild.id} className="flex flex-col items-center">
                            <button
                              type="button"
                              onClick={() => setSelectedNode(subChild)}
                              className={`p-2.5 rounded-xl border transition-all cursor-pointer text-center shadow-md w-full group ${
                                selectedNode?.id === subChild.id
                                  ? "bg-[#287CFF]/20 border-[#38BDF8] scale-105"
                                  : "bg-[#0C122C] border-white/10 hover:border-[#38BDF8]/60"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[8px] text-[#AAA2C1] font-mono">
                                <span className="truncate">{subChild.distributorId}</span>
                                <span className="text-purple-300 font-bold">T3 &bull; 8%</span>
                              </div>
                              <div className="text-[11px] font-bold text-white truncate mt-0.5">
                                {subChild.name}
                              </div>
                              <div className="text-[9px] text-[#35E6A2] font-mono mt-0.5">
                                PBV: {subChild.pbv}
                              </div>
                            </button>

                            {/* TIER 4 BRANCH EXPANSION (8 NODES TOTAL) */}
                            {showTier4 && subChild.children && (
                              <div className="w-full flex flex-col items-center">
                                <svg width="100" height="26" viewBox="0 0 100 26" className="overflow-visible">
                                  <path
                                    d="M 50 0 L 50 12 M 50 12 L 25 12 L 25 26 M 50 12 L 75 12 L 75 26"
                                    stroke="#F59E0B"
                                    strokeWidth="1.5"
                                    fill="none"
                                    strokeDasharray="2 2"
                                  />
                                  <circle cx="50" cy="12" r="2.5" fill="#F59E0B" />
                                </svg>

                                <div className="grid grid-cols-2 gap-1.5 w-full">
                                  {subChild.children.map((tier4Node) => (
                                    <button
                                      key={tier4Node.id}
                                      type="button"
                                      onClick={() => setSelectedNode(tier4Node)}
                                      className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer text-[9px] ${
                                        selectedNode?.id === tier4Node.id
                                          ? "bg-amber-500/20 border-amber-400 text-white"
                                          : "bg-[#080D20] border-white/10 hover:border-amber-400/50 text-[#AAA2C1]"
                                      }`}
                                    >
                                      <div className="text-[7px] font-mono text-amber-300 font-bold truncate">
                                        T4 &bull; 7%
                                      </div>
                                      <div className="font-bold text-white truncate text-[10px]">
                                        {tier4Node.name}
                                      </div>
                                      <div className="text-[8px] text-[#35E6A2] font-mono">
                                        {tier4Node.pbv} BV
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* SUMMARY OF DEEP TIERS 5 TO 10 */}
                <div className="w-full max-w-4xl pt-6">
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#101738] via-[#121B3B] to-[#101738] border border-white/10 shadow-lg text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Dual Binary Power Duplication Across 10 Tiers (1 &rarr; 2 &rarr; 4 &rarr; 8 &rarr; 16... &rarr; 512)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[10px] text-pink-400 font-bold block">Tier 5 (6%)</span>
                        <span className="font-black text-white text-sm">16 Leaders</span>
                        <span className="text-[9px] text-[#AAA2C1] block">8 Left &bull; 8 Right</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[10px] text-blue-400 font-bold block">Tier 6 (5%)</span>
                        <span className="font-black text-white text-sm">32 Leaders</span>
                        <span className="text-[9px] text-[#AAA2C1] block">16 Left &bull; 16 Right</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[10px] text-emerald-400 font-bold block">Tier 7 (4%)</span>
                        <span className="font-black text-white text-sm">64 Leaders</span>
                        <span className="text-[9px] text-[#AAA2C1] block">32 Left &bull; 32 Right</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[10px] text-purple-400 font-bold block">Tier 8 (3%)</span>
                        <span className="font-black text-white text-sm">128 Leaders</span>
                        <span className="text-[9px] text-[#AAA2C1] block">64 Left &bull; 64 Right</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                        <span className="text-[10px] text-orange-400 font-bold block">Tier 9 (2%)</span>
                        <span className="font-black text-white text-sm">256 Leaders</span>
                        <span className="text-[9px] text-[#AAA2C1] block">128 Left &bull; 128 Right</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-[#35E6A2]/30">
                        <span className="text-[10px] text-[#35E6A2] font-bold block">Tier 10 (1%)</span>
                        <span className="font-black text-white text-sm">512 Leaders</span>
                        <span className="text-[9px] text-[#AAA2C1] block">256 Left &bull; 256 Right</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#AAA2C1]">
                      Click &quot;Complete 10-Tier Referral &amp; Volume Matrix&quot; above to view the full detailed table and real-time commission earnings on every single tier!
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: COMPLETE 10-TIER MATRIX TABLE & COMMISSION SIMULATOR */}
          {activeTab === "matrix" && (
            <div className="space-y-6">
              
              {/* Order Simulator Controls */}
              <div className="p-5 rounded-2xl bg-[#141E45] border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-black text-white text-base flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-300" />
                      10-Tier Commission Simulator on Product Orders
                    </h4>
                    <p className="text-xs text-[#AAA2C1]">
                      Adjust the average first order / monthly invoice value to calculate earnings from each tier (10% down to 1%).
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {[2500, 5000, 10000, 20000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBillSimulationAmount(amt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                          billSimulationAmount === amt
                            ? "bg-[#35E6A2] text-black shadow-md font-black"
                            : "bg-[#0E1533] text-white/80 hover:text-white border border-white/10"
                        }`}
                      >
                        ₹{formatNumber(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#AAA2C1]">Average Order / Bill Amount per Distributor:</span>
                    <span className="font-mono font-black text-white text-base">₹{formatNumber(billSimulationAmount)}</span>
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="50000"
                    step="1000"
                    value={billSimulationAmount}
                    onChange={(e) => setBillSimulationAmount(Number(e.target.value))}
                    className="w-full h-2.5 bg-[#0A0F26] rounded-lg appearance-none cursor-pointer accent-[#35E6A2]"
                  />
                </div>
              </div>

              {/* 10-Tier Table */}
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121B3B] text-white/80 uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Tier / Level</th>
                      <th className="py-3 px-4">Binary Duplication</th>
                      <th className="py-3 px-4">Team Count</th>
                      <th className="py-3 px-4">Left / Right Split</th>
                      <th className="py-3 px-4">Referral %</th>
                      <th className="py-3 px-4">Per Member Payout</th>
                      <th className="py-3 px-4 text-right">Total Tier Income</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-[#0E1533]">
                    {TEN_TIERS_DATA.map((tier) => {
                      const perMemberPayout = Math.round(billSimulationAmount * (tier.percent / 100));
                      const tierTotal = tier.multiplier * perMemberPayout;
                      const isSelected = selectedTier === tier.tier;

                      return (
                        <tr
                          key={tier.tier}
                          onClick={() => setSelectedTier(tier.tier)}
                          className={`transition-colors cursor-pointer hover:bg-white/5 ${
                            isSelected ? "bg-[#287CFF]/15" : ""
                          }`}
                        >
                          <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: tier.color }}
                            />
                            <span>Tier {tier.tier}</span>
                            <span className="text-[10px] font-normal text-[#AAA2C1] hidden sm:inline">
                              ({tier.rank})
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-white/90">
                            {tier.formula}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-white">
                            {tier.multiplier} {tier.multiplier === 1 ? "Leader" : "Members"}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#AAA2C1]">
                            {tier.tier === 1 ? (
                              <span className="text-amber-300 font-bold">Root (You)</span>
                            ) : (
                              <span>
                                <span className="text-[#38BDF8] font-bold">{tier.leftLeg} L</span>
                                {" / "}
                                <span className="text-[#35E6A2] font-bold">{tier.rightLeg} R</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold font-mono">
                            <span
                              className="px-2 py-0.5 rounded text-[11px]"
                              style={{ color: tier.color, backgroundColor: `${tier.color}20` }}
                            >
                              {tier.percent}%
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-white/80">
                            ₹{formatNumber(perMemberPayout)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-black text-right text-base text-[#35E6A2]">
                            ₹{formatNumber(tierTotal)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-[#121B3B] border-t-2 border-[#35E6A2]/50 text-white font-mono">
                    <tr>
                      <td className="py-4 px-4 font-black text-sm uppercase">Total 10 Tiers</td>
                      <td className="py-4 px-4 font-bold">1 &rarr; 512 Duplication</td>
                      <td className="py-4 px-4 font-black text-sm text-[#38BDF8]">
                        {formatNumber(totalTeamMembers)} Members
                      </td>
                      <td className="py-4 px-4 font-bold text-[#AAA2C1]">511 L / 511 R</td>
                      <td className="py-4 px-4 font-black text-amber-300">55% Pool</td>
                      <td className="py-4 px-4 text-xs text-[#AAA2C1]">Full 10-Tier Payout</td>
                      <td className="py-4 px-4 text-right font-black text-lg text-[#35E6A2]">
                        ₹{formatNumber(totalReferralIncome)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* 3 Summary Highlight Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-[#141E45] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
                      Total Team Network
                    </span>
                    <Users className="w-4 h-4 text-[#38BDF8]" />
                  </div>
                  <div className="text-3xl font-black text-white font-mono">
                    1,023 Leaders
                  </div>
                  <p className="text-[11px] text-[#AAA2C1]">
                    Built seamlessly via 2-leg dual team binary spillover across 10 completed tiers.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#141E45] border border-[#35E6A2]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#35E6A2]">
                      10-Tier Referral Earnings
                    </span>
                    <Coins className="w-4 h-4 text-[#35E6A2]" />
                  </div>
                  <div className="text-3xl font-black text-[#35E6A2] font-mono">
                    ₹{formatNumber(totalReferralIncome)}
                  </div>
                  <p className="text-[11px] text-[#AAA2C1]">
                    Calculated on ₹{formatNumber(billSimulationAmount)} purchase across all 10 tiers (10% to 1%).
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#141E45] border border-amber-400/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      12% Binary Pair Bonus
                    </span>
                    <Crown className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="text-3xl font-black text-amber-300 font-mono">
                    ₹{formatNumber(Math.round(511 * billSimulationAmount * 0.60 * 0.12))}
                  </div>
                  <p className="text-[11px] text-[#AAA2C1]">
                    Matching 511 Left vs 511 Right team purchases at 60% BV with 12% binary matching!
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* NODE INSPECTOR CARD / DRAWER */}
          {selectedNode && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141E45] border border-[#38BDF8]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold text-[#38BDF8] bg-[#38BDF8]/10 px-2.5 py-0.5 rounded-md border border-[#38BDF8]/20">
                    Tier {selectedNode.tier} Member Info
                  </span>
                  <span className="font-mono text-xs font-bold text-white">{selectedNode.distributorId}</span>
                  <span className="text-xs font-bold text-[#35E6A2] bg-[#35E6A2]/20 px-2 py-0.5 rounded-full">
                    {selectedNode.referralPercent}% Referral
                  </span>
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
                  <span className="font-bold text-[#38BDF8]">{formatNumber(selectedNode.leftBv)} BV</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-[#AAA2C1] block">Right Leg Volume</span>
                  <span className="font-bold text-[#35E6A2]">{formatNumber(selectedNode.rightBv)} BV</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-[#AAA2C1] block">Matching Bonus</span>
                  <span className="font-bold text-emerald-400">₹{formatNumber(selectedNode.matchingEarned)}</span>
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
                    <span className="font-mono font-bold text-white">{formatNumber(leftSimBv)} BV</span>
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
                    <span className="font-mono font-bold text-white">{formatNumber(rightSimBv)} BV</span>
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
                    ₹{formatNumber(binaryPayout)}
                  </div>
                  <span className="text-[11px] text-[#35E6A2] font-medium block">
                    Calculated on {formatNumber(matchedBv)} Matched BV @ 12%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#AAA2C1]">Matched Volume:</span>
                    <span className="font-mono font-bold text-white">{formatNumber(matchedBv)} BV</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#AAA2C1]">Carry-Forward Balance:</span>
                    <span className="font-mono font-bold text-[#38BDF8]">
                      {formatNumber(carryForwardBv)} BV ({carryForwardSide})
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
            
            {/* 1. Direct & Multi-Tier Referral Bonus */}
            <div className="p-7 rounded-3xl bg-[#0E1533] border border-[#35E6A2]/40 space-y-4 hover:border-[#35E6A2] transition-all shadow-lg group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center font-black text-lg">
                  10%
                </div>
                <span className="text-[10px] font-bold text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/30">
                  10 Tiers (10% to 1%)
                </span>
              </div>
              <h4 className="text-lg font-black text-white">
                Multi-Tier Referral Bonus (10 Tiers)
              </h4>
              <p className="text-xs text-[#AAA2C1] leading-relaxed">
                As detailed in your blueprint: Earn <strong className="text-white">Tier 1: 10%, Tier 2: 9%, Tier 3: 8%, Tier 4: 7%... down to Tier 10: 1%</strong> on product order invoices across your entire 10-tier organization!
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90">
                <span className="text-[#AAA2C1]">Tier 1 Direct Order ₹10,000:</span>
                <span className="font-bold text-[#35E6A2] block mt-0.5">₹1,000 Direct Cash + Multi-Tier Team Bonuses</span>
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
                100% genuine product-based network marketing. Strict compliance with Consumer Protection Rules 2021, FSSAI standards, and automated TDS deductions.
              </p>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/90">
                <span className="text-[#AAA2C1]">Partner Policy:</span>
                <span className="font-bold text-cyan-300 block mt-0.5">E-Mall Shopping Credits &amp; Commission Basis (No Refund)</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
