"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Gift,
  Tag,
} from "lucide-react";
import { Logo } from "@/components/Logo";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    referralCode: "GP-VIP2026",
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  // Compute password strength
  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score += 1;
    if (p.length >= 8) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    return score; // 0 to 5
  };

  const strengthScore = getPasswordStrength();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = "Full Name is required";
    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!formData.email.includes("@") || !formData.email.includes(".")) {
      errs.email = "Enter a valid email address";
    }
    if (!formData.mobileNumber.trim()) {
      errs.mobileNumber = "Mobile Number is required";
    } else if (formData.mobileNumber.replace(/\D/g, "").length < 10) {
      errs.mobileNumber = "Enter a valid 10-digit mobile number";
    }
    if (!formData.password) {
      errs.password = "Password is required";
    } else if (formData.password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    if (!formData.termsAccepted) {
      errs.termsAccepted = "You must accept the terms & conditions to proceed";
    }
    return errs;
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    // Simulate registration
    setTimeout(() => {
      setLoading(false);
      setRegisteredSuccess(true);
    }, 1200);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] bg-[#070611] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-[#287CFF]/15 to-[#8B35FF]/15 blur-[140px] pointer-events-none -z-10" />

      {/* Split-Screen Container */}
      <div className="w-full max-w-5xl rounded-3xl bg-[#0E0A1E]/95 border border-[#8B35FF]/30 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl">
        {/* ======================================================== */}
        {/* LEFT COLUMN: BRANDING & PERKS SHOWCASE (5 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 p-8 sm:p-12 bg-gradient-to-br from-[#1C123B] via-[#140D2D] to-[#0A0717] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#287CFF]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <Logo size="md" showTagline={false} />
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#35E6A2] bg-[#35E6A2]/10 px-2.5 py-0.5 rounded-full border border-[#35E6A2]/30 inline-block">
                Free Membership
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Join the GROWPLUS Digital Ecosystem.
              </h2>
              <p className="text-xs sm:text-sm text-[#AAA2C1] leading-relaxed">
                Create your verified member profile in seconds. Unlock instant welcome shopping credits, track loyalty rewards, and refer friends to expand your circle.
              </p>
            </div>
          </div>

          {/* Member Welcome Perks List */}
          <div className="relative z-10 my-6 space-y-3">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">₹250 Welcome Credits</span>
                <span className="text-[10px] text-[#AAA2C1]">Applied to your shopping wallet</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#8B35FF]/20 text-[#B44CFF] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Monthly Loyalty Tiers</span>
                <span className="text-[10px] text-[#AAA2C1]">Explore up to 10% monthly perks</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-[11px] text-[#AAA2C1]/80">
            <ShieldCheck className="w-4 h-4 text-[#35E6A2]" />
            <span>Zero Subscription Fees • Instant Setup</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: REGISTRATION FORM (7 COLS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-5">
          <div>
            <h3 className="text-2xl font-black text-white">Create Partner Account</h3>
            <p className="text-xs text-[#AAA2C1] mt-1">
              Deposit ₹500 - ₹5,000 to activate, get instant 10% bonus, and partner commissions.
            </p>
          </div>

          {/* Quick Google Sign Up */}
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setTimeout(() => {
                setLoading(false);
                setRegisteredSuccess(true);
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
            <span>Sign Up with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-[#AAA2C1]">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] uppercase font-mono">Or Register with Details</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {registeredSuccess ? (
            <div className="p-8 rounded-2xl bg-[#35E6A2]/15 border border-[#35E6A2]/40 text-center space-y-4 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white">Account Created Successfully!</h4>
              <p className="text-xs text-white/80 max-w-sm mx-auto">
                Welcome to GROWPLUS! You have unlocked your initial demo wallet with ₹250 welcome credits. (Phase 1 Frontend Sandbox).
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-xs hover:bg-white/90 transition-all"
                >
                  Go to Home
                </Link>
                <Link
                  href="/download-apps"
                  className="px-5 py-2.5 rounded-xl bg-[#8B35FF] text-white font-bold text-xs hover:bg-[#B44CFF] transition-all"
                >
                  Preview Mobile Apps
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-white/90 block mb-1">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="e.g. Pooja Sharma"
                  className={`w-full bg-[#140F2D] border rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none transition-colors ${
                    errors.fullName ? "border-rose-500" : "border-white/10 focus:border-[#8B35FF]"
                  }`}
                />
                {errors.fullName && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email & Mobile Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/90 block mb-1">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="pooja@example.com"
                    className={`w-full bg-[#140F2D] border rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none transition-colors ${
                      errors.email ? "border-rose-500" : "border-white/10 focus:border-[#8B35FF]"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/90 block mb-1">
                    Mobile Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full bg-[#140F2D] border rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none transition-colors ${
                      errors.mobileNumber ? "border-rose-500" : "border-white/10 focus:border-[#8B35FF]"
                    }`}
                  />
                  {errors.mobileNumber && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.mobileNumber}</p>
                  )}
                </div>
              </div>

              {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-white/90">
                      Password <span className="text-rose-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-[#AAA2C1] hover:text-white"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Min. 6 chars"
                    className={`w-full bg-[#140F2D] border rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none transition-colors ${
                      errors.password ? "border-rose-500" : "border-white/10 focus:border-[#8B35FF]"
                    }`}
                  />
                  {errors.password && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/90 block mb-1">
                    Confirm Password <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full bg-[#140F2D] border rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none transition-colors ${
                      errors.confirmPassword ? "border-rose-500" : "border-white/10 focus:border-[#8B35FF]"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#AAA2C1]">Password Strength:</span>
                    <span className={`font-semibold ${
                      strengthScore >= 4 ? "text-[#35E6A2]" : strengthScore >= 2 ? "text-amber-300" : "text-rose-400"
                    }`}>
                      {strengthScore >= 4 ? "Strong" : strengthScore >= 2 ? "Moderate" : "Weak"}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strengthScore >= 4
                          ? "w-full bg-[#35E6A2]"
                          : strengthScore >= 2
                          ? "w-3/5 bg-amber-400"
                          : "w-1/4 bg-rose-500"
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Referral Code (Optional) */}
              <div>
                <label className="text-xs font-semibold text-white/90 block mb-1">
                  Referral Invitation Code <span className="text-[#AAA2C1] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Tag className="w-3.5 h-3.5 absolute left-3 top-3 text-[#B44CFF]" />
                  <input
                    type="text"
                    value={formData.referralCode}
                    onChange={(e) => handleInputChange("referralCode", e.target.value.toUpperCase())}
                    placeholder="e.g. GP-VIP2026"
                    className="w-full bg-[#140F2D] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white font-mono placeholder-[#AAA2C1]/50 focus:outline-none focus:border-[#8B35FF]"
                  />
                </div>
                {formData.referralCode && (
                  <p className="text-[11px] text-[#35E6A2] flex items-center gap-1 mt-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Referral Code Applied: Extra ₹250 Welcome Credits Unlocked!</span>
                  </p>
                )}
              </div>

              {/* Terms Acceptance Checkbox */}
              <div>
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange("termsAccepted", e.target.checked)}
                    className="mt-0.5 rounded bg-[#140F2D] border-white/20 text-[#8B35FF] focus:ring-0 accent-[#8B35FF]"
                  />
                  <span className="text-[11px] text-[#AAA2C1] leading-relaxed">
                    I agree to the{" "}
                    <Link href="/policy" className="text-white underline hover:text-[#38BDF8] font-bold">
                      Strict No-Refund &amp; Deposit Policy
                    </Link>
                    ,{" "}
                    <Link href="/policy" className="text-white underline hover:text-[#38BDF8]">
                      E-Mall Shopping &amp; Partner Terms
                    </Link>{" "}
                    and understand deposits (₹500 - ₹5,000) are utilized for dashboard earnings and mall redemptions.
                  </span>
                </label>
                {errors.termsAccepted && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.termsAccepted}</p>
                )}
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
                    Creating digital profile...
                  </span>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Switch to Login */}
          <div className="pt-3 border-t border-white/10 text-center text-xs text-[#AAA2C1]">
            <span>Already have a GROWPLUS account? </span>
            <Link
              href="/login"
              className="font-bold text-white hover:text-[#B44CFF] underline ml-1"
            >
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
