"use client";

import React from "react";
import { TrendingUp, Users, ShoppingBag, Sparkles, Coins, Gift } from "lucide-react";

export const GiftBoxVisual: React.FC = () => {
  return (
    <div className="relative w-full max-w-[540px] aspect-[1/1] mx-auto flex items-center justify-center select-none">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial from-[#8B35FF]/35 via-[#B44CFF]/15 to-transparent blur-3xl rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute inset-10 bg-radial from-[#287CFF]/25 via-transparent to-transparent blur-2xl rounded-full pointer-events-none" />

      {/* Floating Sparkles */}
      <div className="absolute top-10 left-12 text-[#35E6A2] animate-bounce duration-1000">
        <Sparkles className="w-5 h-5 drop-shadow-[0_0_10px_#35E6A2]" />
      </div>
      <div className="absolute top-20 right-14 text-amber-300 animate-pulse">
        <Sparkles className="w-6 h-6 drop-shadow-[0_0_12px_#F5C042]" />
      </div>
      <div className="absolute bottom-28 left-6 text-[#B44CFF] animate-bounce">
        <Sparkles className="w-4 h-4 drop-shadow-[0_0_8px_#B44CFF]" />
      </div>

      {/* Floating 3D Gold Coins */}
      {/* Coin 1 - Top Left */}
      <div className="absolute top-12 left-1/4 -translate-x-12 animate-float-slow z-20">
        <div className="relative w-11 h-11 rounded-full bg-gradient-to-br from-[#FFF4B0] via-[#E6A817] to-[#8C5E03] p-[2px] shadow-[0_0_20px_rgba(245,192,66,0.6)] rotate-12">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#9B6B04] via-[#FAD355] to-[#FFECA7] flex items-center justify-center font-bold text-[#4B3302] text-xs border border-[#FFF7C2]/70">
            ₹
          </div>
        </div>
      </div>

      {/* Coin 2 - Bottom Right */}
      <div className="absolute bottom-24 right-10 animate-float-medium z-20" style={{ animationDelay: "1.5s" }}>
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#FFF4B0] via-[#E6A817] to-[#8C5E03] p-[2.5px] shadow-[0_0_25px_rgba(245,192,66,0.7)] -rotate-12">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#9B6B04] via-[#FAD355] to-[#FFECA7] flex items-center justify-center font-black text-[#4B3302] text-sm border border-[#FFF7C2]/70">
            GP
          </div>
        </div>
      </div>

      {/* Coin 3 - Bottom Left */}
      <div className="absolute bottom-16 left-12 animate-float-slow z-20" style={{ animationDelay: "2.8s" }}>
        <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-[#FFF4B0] via-[#E6A817] to-[#8C5E03] p-[2px] shadow-[0_0_15px_rgba(245,192,66,0.5)] rotate-45">
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#9B6B04] via-[#FAD355] to-[#FFECA7] flex items-center justify-center font-bold text-[#4B3302] text-[10px]">
            %
          </div>
        </div>
      </div>

      {/* Main Pedestal & 3D Gift Box SVG Canvas */}
      <div className="relative w-[420px] h-[420px] sm:w-[480px] sm:h-[480px] flex items-center justify-center">
        <svg
          viewBox="0 0 500 500"
          className="w-full h-full filter drop-shadow-[0_20px_40px_rgba(139,53,255,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Pedestal Gradients */}
            <radialGradient id="daisGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8B35FF" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#287CFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#070611" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="pedestalRim" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#287CFF" />
              <stop offset="50%" stopColor="#B44CFF" />
              <stop offset="100%" stopColor="#8B35FF" />
            </linearGradient>

            <linearGradient id="pedestalBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1B1238" />
              <stop offset="50%" stopColor="#120B26" />
              <stop offset="100%" stopColor="#080515" />
            </linearGradient>

            {/* Gift Box Gradients */}
            <linearGradient id="boxFront" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7E22CE" />
              <stop offset="50%" stopColor="#581C87" />
              <stop offset="100%" stopColor="#3B0764" />
            </linearGradient>

            <linearGradient id="boxSide" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4C1D95" />
              <stop offset="100%" stopColor="#2E1065" />
            </linearGradient>

            <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#7E22CE" />
            </linearGradient>

            {/* Ribbon Gradients */}
            <linearGradient id="ribbonPurple" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="40%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#9333EA" />
            </linearGradient>

            <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="50%" stopColor="#F5C042" />
              <stop offset="100%" stopColor="#B48206" />
            </linearGradient>
          </defs>

          {/* Glowing Ground Dais Rings */}
          <ellipse cx="250" cy="420" rx="210" ry="50" fill="url(#daisGlow)" />
          
          {/* Lower Pedestal Layer */}
          <ellipse cx="250" cy="415" rx="180" ry="38" fill="url(#pedestalBody)" stroke="url(#pedestalRim)" strokeWidth="3" />
          <path d="M 70 415 C 70 435 430 435 430 415 L 430 435 C 430 455 70 455 70 435 Z" fill="#0C081B" />
          <ellipse cx="250" cy="435" rx="180" ry="38" fill="none" stroke="#287CFF" strokeWidth="2" strokeOpacity="0.6" />

          {/* Upper Pedestal Ring (Intense Neon) */}
          <ellipse cx="250" cy="385" rx="145" ry="30" fill="#181133" stroke="url(#pedestalRim)" strokeWidth="4" />
          <path d="M 105 385 C 105 405 395 405 395 385 L 395 400 C 395 420 105 420 105 400 Z" fill="#0F0922" />
          <ellipse cx="250" cy="400" rx="145" ry="30" fill="none" stroke="#B44CFF" strokeWidth="2" strokeDasharray="6 4" />

          {/* 3D GIFT BOX GEOMETRY */}
          {/* Box Shadow */}
          <ellipse cx="250" cy="365" rx="90" ry="20" fill="#000000" fillOpacity="0.7" />

          {/* Main Box Cube Body */}
          {/* Left / Front-Left Face */}
          <path d="M 170 230 L 250 270 L 250 365 L 170 325 Z" fill="url(#boxFront)" />
          
          {/* Right / Front-Right Face */}
          <path d="M 250 270 L 330 230 L 330 325 L 250 365 Z" fill="url(#boxSide)" />
          
          {/* Box Lid / Top Overhang Face */}
          <path d="M 160 220 L 250 175 L 340 220 L 250 265 Z" fill="url(#boxTop)" />
          <path d="M 160 220 L 250 265 L 250 276 L 160 231 Z" fill="#6B21A8" />
          <path d="M 250 265 L 340 220 L 340 231 L 250 276 Z" fill="#581C87" />

          {/* Vertical Ribbons */}
          {/* Left Face Ribbon */}
          <path d="M 205 248 L 217 254 L 217 348 L 205 342 Z" fill="url(#goldRibbon)" />
          {/* Right Face Ribbon */}
          <path d="M 285 252 L 297 246 L 297 340 L 285 346 Z" fill="url(#goldRibbon)" />
          {/* Lid Ribbon Left */}
          <path d="M 200 198 L 210 193 L 255 242 L 245 247 Z" fill="url(#goldRibbon)" />
          {/* Lid Ribbon Right */}
          <path d="M 290 195 L 300 200 L 255 242 L 245 237 Z" fill="url(#goldRibbon)" />

          {/* 3D Bow Knot on Top of Gift Box */}
          {/* Bow Loop Left */}
          <path
            d="M 245 178 C 215 140 185 160 215 185 C 235 200 245 185 245 180 Z"
            fill="url(#ribbonPurple)"
            stroke="#F5C042"
            strokeWidth="1.5"
          />
          {/* Bow Loop Right */}
          <path
            d="M 255 178 C 285 140 315 160 285 185 C 265 200 255 185 255 180 Z"
            fill="url(#ribbonPurple)"
            stroke="#F5C042"
            strokeWidth="1.5"
          />
          {/* Bow Center Knot */}
          <ellipse cx="250" cy="180" rx="14" ry="10" fill="url(#goldRibbon)" />
          <circle cx="250" cy="180" r="6" fill="#4B3302" />

          {/* GrowPlus Geometric Insignia on Gift Box Front */}
          <g transform="translate(236, 296) scale(0.45)">
            <rect width="64" height="64" rx="16" fill="#100D20" stroke="#F5C042" strokeWidth="4" />
            <path
              d="M 32 14 C 20 14 14 21 14 32 C 14 43 21 50 33 50 C 43 50 49 44 49 36 L 33 36 L 33 42 L 41.5 42 C 40 45 37 46 33 46 C 24 46 19 40 19 32 C 19 24 24 18 32 18 C 38 18 42 21 44 24 L 48 20 C 44 16 39 14 32 14 Z"
              fill="#F5C042"
            />
          </g>
        </svg>

        {/* Central Golden Medallion: 10% Monthly Return / Rewards */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
          <div className="group relative px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#17102D] via-[#241747] to-[#17102D] border-2 border-[#F5C042] shadow-[0_0_30px_rgba(245,192,66,0.5)] flex flex-col items-center justify-center text-center">
            {/* Soft inner glow */}
            <div className="absolute inset-0 rounded-2xl bg-[#F5C042]/10 blur-sm pointer-events-none" />
            
            <div className="flex items-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFF7D1] via-[#F5C042] to-[#E69D00] drop-shadow-sm">
                10%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#35E6A2] bg-[#35E6A2]/15 px-1.5 py-0.5 rounded border border-[#35E6A2]/30">
                Reward Tier*
              </span>
            </div>
            <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-white/90">
              Monthly Rewards
            </div>
            <div className="text-[9px] text-[#AAA2C1]/80 mt-0.5">
              *Illustrative member loyalty preview
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
