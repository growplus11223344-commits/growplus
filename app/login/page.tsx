"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Smartphone,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loggedInSuccess, setLoggedInSuccess] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your email or registered mobile number");
      return;
    }
    if (!password) {
      setError("Please enter your account password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError(null);
    setLoading(true);

    // Frontend simulation of authentication
    setTimeout(() => {
      setLoading(false);
      setLoggedInSuccess(true);
    }, 1200);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes("@")) {
      return;
    }
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setForgotModalOpen(false);
      setResetEmail("");
    }, 2500);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#070611] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-[#8B35FF]/15 to-[#287CFF]/15 blur-[140px] pointer-events-none -z-10" />

      {/* Split-Screen Container */}
      <div className="w-full max-w-5xl rounded-3xl bg-[#0E0A1E]/95 border border-[#8B35FF]/30 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl">
        {/* ======================================================== */}
        {/* LEFT COLUMN: BRANDING & FINTECH VISUAL (5 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 p-8 sm:p-12 bg-gradient-to-br from-[#1C123B] via-[#140D2D] to-[#0A0717] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8B35FF]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <Logo size="md" showTagline={false} />
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/30 inline-block">
                Member Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Welcome Back to Your Rewards World.
              </h2>
              <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
                Access your GrowPlus shopping wallet, track monthly loyalty tier points, and manage your community referral network.
              </p>
            </div>
          </div>

          {/* Quick Stats Microcard */}
          <div className="relative z-10 my-8 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#AAA2C1]">Simulated Member Demo</span>
              <span className="text-[#35E6A2] font-semibold">Active Tier</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#8B35FF]/20 text-[#B44CFF] flex items-center justify-center font-bold">
                ₹
              </div>
              <div>
                <span className="text-xs text-[#AAA2C1]">Shopping Credits:</span>
                <div className="text-base font-black text-white font-mono">₹1,250.00</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-[11px] text-[#AAA2C1]/80">
            <ShieldCheck className="w-4 h-4 text-[#35E6A2]" />
            <span>256-bit Encrypted Member Access</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: LOGIN FORM (7 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-6">
          <div>
            <h3 className="text-2xl font-black text-white">Sign In to GROWPLUS</h3>
            <p className="text-xs text-[#AAA2C1] mt-1">
              Access your dashboard, manage partner commissions, and redeem shopping credits.
            </p>
          </div>

          {/* Quick Google Sign In */}
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setLoggedInSuccess(true);
              }, 1200);
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-gray-100 text-gray-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-102 cursor-pointer"
          >
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
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-[#AAA2C1]">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] uppercase font-mono">Or with Email / Password</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {loggedInSuccess ? (
            <div className="p-8 rounded-2xl bg-[#35E6A2]/15 border border-[#35E6A2]/40 text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Signed In Successfully!</h4>
              <p className="text-xs text-white/80 max-w-sm mx-auto">
                Welcome back to GROWPLUS. (Frontend Demo State Active: no real backend database is invoked in Phase 1).
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-white/90 transition-all"
                >
                  Return to Home
                </Link>
                <Link
                  href="/rewards"
                  className="px-5 py-2.5 rounded-xl bg-[#8B35FF] text-white font-bold text-xs hover:bg-[#B44CFF] transition-all"
                >
                  View Rewards Ledger
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email or Mobile Number */}
              <div>
                <label className="text-xs font-semibold text-white/90 block mb-1">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. arjun@example.com or 9876543210"
                  className="w-full bg-[#140F2D] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none focus:border-[#8B35FF] transition-colors"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-white/90">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-xs text-[#8B35FF] hover:text-[#B44CFF] font-medium transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Enter your account password"
                    className="w-full bg-[#140F2D] border border-white/10 rounded-xl pl-4 pr-11 py-3 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none focus:border-[#8B35FF] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[#AAA2C1] hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-[#140F2D] border-white/20 text-[#8B35FF] focus:ring-0 accent-[#8B35FF]"
                  />
                  <span className="text-xs text-[#AAA2C1]">Remember this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white font-extrabold text-xs shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Authenticating credentials...
                  </span>
                ) : (
                  <>
                    <span>Sign In to GrowPlus</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Hint */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#AAA2C1] text-center">
                <span className="text-amber-300 font-semibold">Demo Hint:</span> Enter any valid email and 6+ character password to simulate sign-in.
              </div>
            </form>
          )}

          {/* Switch to Register */}
          <div className="pt-4 border-t border-white/10 text-center text-xs text-[#AAA2C1]">
            <span>Don&apos;t have an account yet? </span>
            <Link
              href="/register"
              className="font-bold text-white hover:text-[#B44CFF] underline ml-1"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Interactive Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setForgotModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-[#140F2D] border border-[#8B35FF]/40 p-6 z-10 text-white space-y-4 shadow-2xl animate-fadeIn">
            <h3 className="text-lg font-bold text-white">Reset Account Password</h3>
            <p className="text-xs text-[#AAA2C1]">
              Enter your registered email address and we will simulate sending a password reset verification link.
            </p>

            {resetSuccess ? (
              <div className="p-4 rounded-xl bg-[#35E6A2]/15 border border-[#35E6A2]/30 text-xs text-[#35E6A2] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Simulated reset link sent! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-[#0E0A1D] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none focus:border-[#8B35FF]"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-[#AAA2C1] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#8B35FF] hover:bg-[#B44CFF] text-white text-xs font-bold"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
