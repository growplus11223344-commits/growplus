"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Coins,
  ShoppingBag,
  Users,
} from "lucide-react";

export const AutoAuthModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if user already dismissed or logged in in this session
    const alreadyDismissed = sessionStorage.getItem("growplus_auth_popup_dismissed");
    if (alreadyDismissed) return;

    // Trigger after 7 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("growplus_auth_popup_dismissed", "true");
  };

  const handleGoogleSignIn = () => {
    setLoadingGoogle(true);
    // Simulate instant Google Sign-In flow
    setTimeout(() => {
      setLoadingGoogle(false);
      setIsSuccess(true);
      sessionStorage.setItem("growplus_auth_popup_dismissed", "true");
      setTimeout(() => {
        window.location.href = "/register";
      }, 1500);
    }, 1200);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailOrPhone.trim()) {
      setIsSuccess(true);
      sessionStorage.setItem("growplus_auth_popup_dismissed", "true");
      setTimeout(() => {
        window.location.href = "/register";
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#141E45] via-[#0E1533] to-[#0A0F26] border-2 border-[#287CFF]/50 shadow-[0_0_60px_rgba(40,124,255,0.4)] overflow-hidden text-left animate-scaleIn">
        
        {/* Background glow orb */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#35E6A2]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#287CFF]/25 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#AAA2C1] hover:text-white transition-colors z-10 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121B3B] border border-[#35E6A2]/40 text-[11px] font-bold text-[#35E6A2]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Partner &amp; Distributor Access</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Sign In to GROWPLUS
            </h3>

            <p className="text-xs text-[#AAA2C1] leading-relaxed">
              Deposit ₹500 - ₹5,000 to unlock your dashboard, get an instant 10% first deposit bonus, and start earning weekly partner commissions!
            </p>
          </div>

          {/* Value Props Bullet List */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
              <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                <Coins className="w-3 h-3" /> Min Deposit:
              </span>
              <span className="font-mono font-bold text-white text-xs">₹500 to ₹5,000</span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
              <span className="text-[10px] text-[#35E6A2] font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 1st Deposit Bonus:
              </span>
              <span className="font-mono font-bold text-[#35E6A2] text-xs">Flat 10% Instant Cash</span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
              <span className="text-[10px] text-[#38BDF8] font-bold flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" /> E-Mall Shopping:
              </span>
              <span className="font-bold text-white text-[11px]">Redeem Credits in Mall</span>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-0.5">
              <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                <Users className="w-3 h-3" /> 10-Tier Partner:
              </span>
              <span className="font-bold text-white text-[11px]">10% to 1% Commission</span>
            </div>
          </div>

          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-[#35E6A2]/20 border border-[#35E6A2]/50 text-center space-y-2 animate-fadeIn">
              <CheckCircle2 className="w-10 h-10 text-[#35E6A2] mx-auto animate-bounce" />
              <h4 className="font-black text-white text-base">Authentication Successful!</h4>
              <p className="text-xs text-white/80">
                Redirecting to your GrowPlus Partner Dashboard &amp; Deposit Gateway...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* PRIMARY: GOOGLE SIGN-IN BUTTON */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loadingGoogle}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
              >
                {/* Official Google G Logo SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loadingGoogle ? "Signing In with Google..." : "Continue with Google"}</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 text-xs text-[#AAA2C1]">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[10px] uppercase font-mono">Or with Mobile / Email</span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              {/* Secondary Phone / Email form */}
              <form onSubmit={handleManualSubmit} className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter mobile (+91) or email"
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none focus:border-[#38BDF8]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#287CFF] hover:bg-[#1f6adb] text-white font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* Footer note: Policy reminder */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-[#AAA2C1]">
            <Link
              href="/policy"
              onClick={handleClose}
              className="hover:text-amber-300 underline font-semibold transition-colors"
            >
              Strict No-Refund &amp; Deposit Policy
            </Link>

            <button
              type="button"
              onClick={handleClose}
              className="text-[#AAA2C1] hover:text-white transition-colors cursor-pointer"
            >
              Explore Website First &rarr;
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
