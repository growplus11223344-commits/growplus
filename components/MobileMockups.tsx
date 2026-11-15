"use client";

import React, { useState } from "react";
import {
  Bell,
  Search,
  ShoppingCart,
  Copy,
  Check,
  TrendingUp,
  Users,
  Gift,
  History,
  Home,
  User,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Layers,
  Star,
} from "lucide-react";

export const RewardsAppScreen: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full h-full bg-[#0B0819] text-white flex flex-col font-sans select-none overflow-hidden text-left">
      {/* Phone Status Bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-semibold text-white/80">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>5G</span>
          <div className="w-4 h-2 border border-white/70 rounded-[2px] p-[1px] flex items-center">
            <div className="w-full h-full bg-white rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* App Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#8B35FF] to-[#287CFF] flex items-center justify-center font-black text-[10px] shadow-sm">
            GP
          </div>
          <span className="font-bold text-xs tracking-wide">GrowPlus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative p-1.5 rounded-full bg-white/5">
            <Bell className="w-3.5 h-3.5 text-[#AAA2C1]" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#35E6A2]" />
          </div>
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 border border-white/20 flex items-center justify-center text-[10px] font-bold">
            AJ
          </div>
        </div>
      </div>

      {/* Screen Body */}
      <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto scrollbar-none text-[11px]">
        {/* Wallet Balance Card */}
        <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-[#1C143B] via-[#150F2E] to-[#0D091D] border border-[#8B35FF]/40 shadow-[0_8px_20px_rgba(139,53,255,0.25)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] text-[#AAA2C1] font-medium uppercase tracking-wider">
                Your Shopping Wallet
              </span>
              <div className="text-xl font-black text-white mt-0.5 tracking-tight flex items-baseline gap-1">
                <span>₹1,250.00</span>
                <span className="text-[10px] text-[#35E6A2] font-semibold flex items-center">
                  <TrendingUp className="w-3 h-3 ml-0.5" />
                </span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-[#35E6A2]/15 text-[#35E6A2] border border-[#35E6A2]/30">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
            <span className="text-[#AAA2C1]">Last Month Reward</span>
            <span className="text-[#35E6A2] font-bold bg-[#35E6A2]/10 px-1.5 py-0.5 rounded">
              +₹100.00 (10% Tier)
            </span>
          </div>
        </div>

        {/* Quick Action Icons */}
        <div className="grid grid-cols-4 gap-2 text-center text-[9px]">
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-1 hover:border-[#8B35FF]/40">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-[#B44CFF] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-white/90 font-medium">Grow</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-1 hover:border-[#8B35FF]/40">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-[#287CFF] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <span className="text-white/90 font-medium">Refer</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-1 hover:border-[#8B35FF]/40">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <span className="text-white/90 font-medium">Rewards</span>
          </div>
          <div className="p-2 rounded-xl bg-white/5 border border-white/5 flex flex-col items-center gap-1 hover:border-[#8B35FF]/40">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-[#35E6A2] flex items-center justify-center">
              <History className="w-3.5 h-3.5" />
            </div>
            <span className="text-white/90 font-medium">History</span>
          </div>
        </div>

        {/* Referral Link Box */}
        <div className="p-3 rounded-xl bg-[#140F2A] border border-[#8B35FF]/30 space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-[#AAA2C1]">Your Referral Link</span>
            <span className="text-[#35E6A2] font-semibold text-[9px]">Active Bonus</span>
          </div>
          <div className="flex items-center justify-between gap-1 p-1.5 rounded-lg bg-black/40 border border-white/10 text-[10px]">
            <span className="text-white/80 font-mono truncate text-[9px]">
              growplus.eco/ref/GP891
            </span>
            <button
              onClick={handleCopy}
              className="px-2 py-1 rounded bg-[#8B35FF] hover:bg-[#B44CFF] text-white text-[9px] font-bold shrink-0 flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-[#35E6A2]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Special Promo Banner */}
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#287CFF]/20 to-[#8B35FF]/20 border border-[#287CFF]/30 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-white block">
              Refer 3 Friends & Unlock
            </span>
            <span className="text-[9px] text-[#35E6A2] font-medium">
              Extra ₹500 Shopping Credits
            </span>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#287CFF] flex items-center justify-center text-white">
            <Gift className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Monthly Rewards Concept Pill */}
        <div className="p-2 rounded-xl bg-[#1B1438]/80 border border-white/10 flex items-center justify-between text-[9px]">
          <span className="text-[#AAA2C1]">Monthly Loyalty Accrual</span>
          <span className="text-amber-300 font-bold">10% Tier Preview*</span>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="px-4 py-2 bg-[#090614] border-t border-white/10 flex items-center justify-around text-[9px] text-[#AAA2C1]">
        <div className="flex flex-col items-center text-[#B44CFF]">
          <Home className="w-3.5 h-3.5" />
          <span className="mt-0.5 font-bold">Home</span>
        </div>
        <div className="flex flex-col items-center hover:text-white">
          <Users className="w-3.5 h-3.5" />
          <span className="mt-0.5">Referral</span>
        </div>
        <div className="flex flex-col items-center hover:text-white">
          <Gift className="w-3.5 h-3.5" />
          <span className="mt-0.5">Rewards</span>
        </div>
        <div className="flex flex-col items-center hover:text-white">
          <User className="w-3.5 h-3.5" />
          <span className="mt-0.5">Profile</span>
        </div>
      </div>
    </div>
  );
};

export const ShoppingAppScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("Electronics");
  const [cartCount, setCartCount] = useState(2);

  const handleAddToCart = () => {
    setCartCount((c) => c + 1);
  };

  return (
    <div className="w-full h-full bg-[#0B0819] text-white flex flex-col font-sans select-none overflow-hidden text-left">
      {/* Phone Status Bar */}
      <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[11px] font-semibold text-white/80">
        <span>9:41</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>5G</span>
          <div className="w-4 h-2 border border-white/70 rounded-[2px] p-[1px] flex items-center">
            <div className="w-full h-full bg-white rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* App Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#287CFF] to-[#35E6A2] flex items-center justify-center font-black text-[10px] text-black">
            GP
          </div>
          <span className="font-bold text-xs tracking-wide">GrowPlus Shop</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative p-1.5 rounded-full bg-white/5">
            <ShoppingCart className="w-3.5 h-3.5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#8B35FF] text-[8px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          </div>
        </div>
      </div>

      {/* Screen Body */}
      <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto scrollbar-none text-[11px]">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#AAA2C1]" />
          <input
            type="text"
            readOnly
            value=""
            placeholder="Search products, brands..."
            className="w-full bg-[#140F2A] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-[10px] text-white placeholder-[#AAA2C1]/60 focus:outline-none"
          />
        </div>

        {/* Big Savings Hero Banner */}
        <div className="relative p-3 rounded-2xl bg-gradient-to-r from-[#8B35FF] via-[#7025D9] to-[#287CFF] overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-[65%] space-y-1">
            <span className="text-[9px] uppercase font-black tracking-wider text-amber-300 bg-black/30 px-1.5 py-0.5 rounded inline-block">
              Redeem Credits
            </span>
            <div className="text-xs font-black text-white leading-tight">
              Big Savings! Up to 70% OFF
            </div>
            <button className="px-2.5 py-1 rounded-lg bg-white text-black font-extrabold text-[9px] shadow-sm hover:bg-white/90 transition-colors">
              Shop Now &rarr;
            </button>
          </div>
          {/* Headphones vector graphic on right */}
          <div className="absolute -right-2 -bottom-2 w-24 h-24 opacity-85">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80"
              alt="Promotion"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 text-[9px]">
          {["Electronics", "Fashion", "Living", "Beauty"].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-full shrink-0 font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-[#8B35FF] text-white font-bold"
                  : "bg-white/5 text-[#AAA2C1] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Top Deals Product Grid */}
        <div>
          <div className="flex items-center justify-between text-[10px] mb-2">
            <span className="font-bold text-white flex items-center gap-1">
              Top Deals 🔥
            </span>
            <span className="text-[#8B35FF] font-semibold text-[9px]">View All</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px]">
            {/* Product Card 1 */}
            <div className="p-2 rounded-xl bg-[#140F2A] border border-white/5 flex flex-col justify-between">
              <div className="w-full h-16 rounded-lg bg-black/30 overflow-hidden mb-1.5 relative">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80"
                  alt="Smart Watch"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 bg-[#35E6A2] text-black text-[7px] font-black px-1 rounded">
                  -38%
                </span>
              </div>
              <div className="font-bold text-white text-[9px] truncate">Smart Watch OLED</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-white font-black text-[10px]">₹2,499</span>
                <span className="text-[#AAA2C1] line-through text-[8px]">₹3,999</span>
              </div>
              <div className="text-[8px] text-[#35E6A2] font-semibold mt-0.5">
                Apply ₹900 Credits
              </div>
              <button
                onClick={handleAddToCart}
                className="mt-1.5 w-full py-1 rounded-lg bg-[#8B35FF] text-white font-bold text-[8px] hover:bg-[#B44CFF] transition-colors"
              >
                + Add to Cart
              </button>
            </div>

            {/* Product Card 2 */}
            <div className="p-2 rounded-xl bg-[#140F2A] border border-white/5 flex flex-col justify-between">
              <div className="w-full h-16 rounded-lg bg-black/30 overflow-hidden mb-1.5 relative">
                <img
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&auto=format&fit=crop&q=80"
                  alt="Earbuds"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 bg-[#35E6A2] text-black text-[7px] font-black px-1 rounded">
                  -25%
                </span>
              </div>
              <div className="font-bold text-white text-[9px] truncate">Wireless Earbuds</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-white font-black text-[10px]">₹1,999</span>
                <span className="text-[#AAA2C1] line-through text-[8px]">₹2,699</span>
              </div>
              <div className="text-[8px] text-[#35E6A2] font-semibold mt-0.5">
                Apply ₹750 Credits
              </div>
              <button
                onClick={handleAddToCart}
                className="mt-1.5 w-full py-1 rounded-lg bg-[#8B35FF] text-white font-bold text-[8px] hover:bg-[#B44CFF] transition-colors"
              >
                + Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="px-4 py-2 bg-[#090614] border-t border-white/10 flex items-center justify-around text-[9px] text-[#AAA2C1]">
        <div className="flex flex-col items-center text-[#287CFF]">
          <Home className="w-3.5 h-3.5" />
          <span className="mt-0.5 font-bold">Home</span>
        </div>
        <div className="flex flex-col items-center hover:text-white">
          <Layers className="w-3.5 h-3.5" />
          <span className="mt-0.5">Categories</span>
        </div>
        <div className="flex flex-col items-center hover:text-white">
          <ShoppingCart className="w-3.5 h-3.5" />
          <span className="mt-0.5">Cart ({cartCount})</span>
        </div>
        <div className="flex flex-col items-center hover:text-white">
          <User className="w-3.5 h-3.5" />
          <span className="mt-0.5">Account</span>
        </div>
      </div>
    </div>
  );
};

export const SmartphoneMockup: React.FC<{
  type?: "rewards" | "shopping";
  className?: string;
}> = ({ type = "rewards", className = "" }) => {
  return (
    <div
      className={`relative mx-auto w-[280px] sm:w-[300px] h-[580px] rounded-[44px] bg-[#1a1433] p-[10px] shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(139,53,255,0.25)] border-[3px] border-[#31255e] transition-all duration-300 hover:shadow-[0_25px_70px_rgba(139,53,255,0.4)] ${className}`}
    >
      {/* Outer Metallic Bezel Shine */}
      <div className="absolute inset-0 rounded-[44px] border border-white/20 pointer-events-none" />

      {/* Phone Speaker & Dynamic Island Notch */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full bg-black z-30 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#1a1433] border border-white/10 ml-auto mr-2" />
      </div>

      {/* Screen Frame */}
      <div className="relative w-full h-full rounded-[36px] overflow-hidden bg-[#070611]">
        {type === "rewards" ? <RewardsAppScreen /> : <ShoppingAppScreen />}
      </div>
    </div>
  );
};
