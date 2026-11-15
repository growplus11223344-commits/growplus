"use client";

import React from "react";
import {
  Users,
  TrendingUp,
  Gift,
  ShoppingBag,
  Bell,
  Activity,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export const AdminDashboardPreview: React.FC = () => {
  return (
    <div className="w-full rounded-3xl bg-[#0E0A1E]/95 border border-[#8B35FF]/30 p-5 sm:p-7 shadow-[0_20px_50px_rgba(7,6,17,0.8)] text-white backdrop-blur-xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B35FF] to-[#287CFF] flex items-center justify-center font-black text-sm text-white shadow-md">
            GP
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base tracking-wide flex items-center gap-2">
              GROWPLUS Ecosystem Hub
              <span className="text-[10px] font-semibold text-[#35E6A2] bg-[#35E6A2]/15 px-2 py-0.5 rounded-full border border-[#35E6A2]/30">
                Live Overview
              </span>
            </h3>
            <p className="text-xs text-[#AAA2C1]">
              Aggregated platform metrics & transparent rewards circulation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-[#AAA2C1]">
          <span className="w-2 h-2 rounded-full bg-[#35E6A2] animate-pulse" />
          <span>System Healthy</span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-5">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-[#150F2C] border border-white/5 hover:border-[#8B35FF]/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-[#AAA2C1] mb-1.5">
            <span>Total Active Members</span>
            <div className="p-1.5 rounded-lg bg-[#35E6A2]/15 text-[#35E6A2]">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">1,25,890</div>
          <div className="text-[11px] text-[#35E6A2] font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12.4% MoM</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-[#150F2C] border border-white/5 hover:border-[#8B35FF]/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-[#AAA2C1] mb-1.5">
            <span>Shopping Credits Circulated</span>
            <div className="p-1.5 rounded-lg bg-[#F5C042]/15 text-[#F5C042]">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">₹5,84,20,000</div>
          <div className="text-[11px] text-[#35E6A2] font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.2% Redemption Rate</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-[#150F2C] border border-white/5 hover:border-[#8B35FF]/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-[#AAA2C1] mb-1.5">
            <span>Loyalty Rewards Distributed</span>
            <div className="p-1.5 rounded-lg bg-[#8B35FF]/15 text-[#B44CFF]">
              <Gift className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">₹58,42,000</div>
          <div className="text-[11px] text-[#35E6A2] font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+20% Engagement</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Growth Chart + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Growth Curve Chart (2 cols) */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-[#130E28] border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#287CFF]" />
              Ecosystem Growth & Credit Velocity
            </span>
            <div className="flex items-center gap-3 text-[10px] text-[#AAA2C1]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#287CFF]" /> Members
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8B35FF]" /> Rewards
              </span>
            </div>
          </div>

          {/* SVG Smooth Curve Graph */}
          <div className="relative w-full h-44 sm:h-52">
            <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradientBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#287CFF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#287CFF" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="chartGradientPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B35FF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8B35FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

              {/* Area 1 - Blue Members Curve */}
              <path
                d="M 0 170 Q 80 160 140 120 T 260 85 T 380 50 T 500 30 L 500 200 L 0 200 Z"
                fill="url(#chartGradientBlue)"
              />
              <path
                d="M 0 170 Q 80 160 140 120 T 260 85 T 380 50 T 500 30"
                fill="none"
                stroke="#287CFF"
                strokeWidth="3"
              />

              {/* Area 2 - Purple Rewards Curve */}
              <path
                d="M 0 185 Q 90 180 160 145 T 280 115 T 400 80 T 500 55 L 500 200 L 0 200 Z"
                fill="url(#chartGradientPurple)"
              />
              <path
                d="M 0 185 Q 90 180 160 145 T 280 115 T 400 80 T 500 55"
                fill="none"
                stroke="#B44CFF"
                strokeWidth="2.5"
                strokeDasharray="6 3"
              />

              {/* Dots on nodes */}
              <circle cx="140" cy="120" r="4" fill="#287CFF" />
              <circle cx="260" cy="85" r="4" fill="#287CFF" />
              <circle cx="380" cy="50" r="4" fill="#287CFF" />
              <circle cx="500" cy="30" r="4" fill="#287CFF" />
            </svg>

            {/* X-Axis labels */}
            <div className="flex items-center justify-between text-[10px] text-[#AAA2C1]/60 pt-2 border-t border-white/5 font-mono">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </div>

        {/* Recent Activities & Quick Actions (1 col) */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="p-4 rounded-2xl bg-[#130E28] border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Recent Activities</span>
              <span className="text-[10px] text-[#8B35FF]">Realtime</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#287CFF]/20 text-[#287CFF] flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-[11px]">
                    New Member Registered
                  </p>
                  <p className="text-[10px] text-[#AAA2C1]">Verified via Referral Code</p>
                </div>
                <span className="text-[9px] text-[#AAA2C1]/60 shrink-0">2m ago</span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-[11px]">
                    Credits Applied at Checkout
                  </p>
                  <p className="text-[10px] text-[#35E6A2]">₹1,200 deducted on Headphones</p>
                </div>
                <span className="text-[9px] text-[#AAA2C1]/60 shrink-0">4m ago</span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#F5C042]/20 text-[#F5C042] flex items-center justify-center shrink-0 mt-0.5">
                  <Gift className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate text-[11px]">
                    Referral Bonus Unlocked
                  </p>
                  <p className="text-[10px] text-[#AAA2C1]">Tier-1 community milestone</p>
                </div>
                <span className="text-[9px] text-[#AAA2C1]/60 shrink-0">7m ago</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="p-3.5 rounded-2xl bg-[#181135] border border-[#8B35FF]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#35E6A2]" />
              <span className="text-xs font-semibold text-white">Merchant Gateway</span>
            </div>
            <span className="text-[10px] text-[#35E6A2] font-mono">350+ Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};
