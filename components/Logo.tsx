import React from "react";
import Link from "next/link";

interface LogoProps {
  showTagline?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  linkToHome?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  showTagline = false,
  size = "md",
  className = "",
  linkToHome = true,
}) => {
  const sizeConfig = {
    sm: { icon: 32, text: "text-lg", tag: "text-[9px]" },
    md: { icon: 40, text: "text-xl", tag: "text-[10px]" },
    lg: { icon: 50, text: "text-2xl", tag: "text-xs" },
    xl: { icon: 64, text: "text-3xl", tag: "text-sm" },
  };

  const currentSize = sizeConfig[size];

  const logoContent = (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* GP Geometric Hex / Gradient Symbol */}
      <div className="relative flex items-center justify-center">
        {/* Glow backdrop */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-[#8B35FF] to-[#287CFF] blur-md opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
        
        {/* SVG Graphic */}
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            <linearGradient id="gpGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#287CFF" />
              <stop offset="50%" stopColor="#8B35FF" />
              <stop offset="100%" stopColor="#B44CFF" />
            </linearGradient>
            <linearGradient id="gpGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B44CFF" />
              <stop offset="70%" stopColor="#287CFF" />
              <stop offset="100%" stopColor="#35E6A2" />
            </linearGradient>
            <linearGradient id="boxShadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#100D20" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#070611" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* Outer Rounded Shield Frame */}
          <rect
            x="3"
            y="3"
            width="58"
            height="58"
            rx="16"
            fill="url(#boxShadowGrad)"
            stroke="url(#gpGrad1)"
            strokeWidth="2.5"
          />

          {/* Geometric Interlocking G & P */}
          {/* 'G' outer circuit */}
          <path
            d="M 32 14 C 20 14 14 21 14 32 C 14 43 21 50 33 50 C 43 50 49 44 49 36 L 33 36 L 33 42 L 41.5 42 C 40 45 37 46 33 46 C 24 46 19 40 19 32 C 19 24 24 18 32 18 C 38 18 42 21 44 24 L 48 20 C 44 16 39 14 32 14 Z"
            fill="url(#gpGrad1)"
          />

          {/* 'P' stem and loop interlocking */}
          <path
            d="M 28 20 L 39 20 C 44.5 20 48 23 48 27.5 C 48 32 44.5 35 39 35 L 34 35 L 34 46 L 28 46 L 28 20 Z M 34 25 L 34 30 L 38.5 30 C 41 30 42.5 29 42.5 27.5 C 42.5 26 41 25 38.5 25 L 34 25 Z"
            fill="url(#gpGrad2)"
          />

          {/* Growth Node (Futuristic Sparkle dot) */}
          <circle cx="49" cy="15" r="2.5" fill="#35E6A2" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-wider uppercase text-white ${currentSize.text} leading-none`}>
            GROW<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B44CFF] via-[#8B35FF] to-[#287CFF]">PLUS</span>
          </span>
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#35E6A2] animate-pulse" />
        </div>
        {showTagline && (
          <span className={`text-[#AAA2C1] font-medium tracking-wide mt-0.5 ${currentSize.tag}`}>
            Grow More • Earn More • Shop More
          </span>
        )}
      </div>
    </div>
  );

  if (!linkToHome) {
    return logoContent;
  }

  return (
    <Link href="/" className="inline-block transition-transform duration-200">
      {logoContent}
    </Link>
  );
};
