"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Menu, X, ArrowRight, Sparkles, Smartphone, ShieldCheck } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Home", href: "/#home" },
    { label: "Features", href: "/#features" },
    { label: "Investment Plans", href: "/#plans" },
    { label: "Calculator", href: "/#calculator" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Referral", href: "/#referral" },
    { label: "Download App", href: "/#download" },
    { label: "Contact", href: "/#contact" },
  ];

  return (
    <>
      {/* Top Banner Notice - Compliance & Early Access */}
      <div className="bg-gradient-to-r from-[#100D20] via-[#1F143D] to-[#100D20] border-b border-[#8B35FF]/20 text-xs py-1.5 px-4 text-center text-[#AAA2C1]">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 text-[#35E6A2] font-medium">
            <Sparkles className="w-3.5 h-3.5" /> VIP Beta Preview:
          </span>
          <span>GrowPlus Rewards App launching soon on Google Play & App Store.</span>
          <Link
            href="/download-apps"
            className="text-white underline hover:text-[#B44CFF] transition-colors ml-1 font-semibold"
          >
            Join Early Waitlist &rarr;
          </Link>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-[#070611]/85 backdrop-blur-xl border-b border-[#8B35FF]/25 shadow-[0_10px_30px_rgba(7,6,17,0.8)] py-3"
            : "bg-[#070611]/60 backdrop-blur-md border-b border-white/5 py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left: Brand Identity */}
            <div className="flex items-center">
              <Logo showTagline={true} size="md" />
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 bg-[#100D20]/80 p-1.5 rounded-full border border-white/10 shadow-inner">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "text-white font-semibold shadow-sm"
                        : "text-[#AAA2C1] hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-[#8B35FF] to-[#287CFF] -z-10 shadow-[0_0_15px_rgba(139,53,255,0.5)]" />
                    )}
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Action Buttons (Login / Register) */}
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/90 hover:text-white border border-white/15 hover:border-[#8B35FF]/60 hover:bg-[#8B35FF]/10 transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="relative group px-4 py-2 rounded-xl text-xs font-bold text-white overflow-hidden shadow-[0_0_20px_rgba(139,53,255,0.4)] hover:shadow-[0_0_25px_rgba(180,76,255,0.6)] transition-all duration-200"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#8B35FF] via-[#B44CFF] to-[#287CFF] group-hover:opacity-90 transition-opacity" />
                <span className="relative flex items-center gap-1.5">
                  Register <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex sm:hidden items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white/90 border border-white/10"
              >
                Login
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#AAA2C1] hover:text-white bg-[#100D20] border border-white/10 hover:border-[#8B35FF]/40 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-[#B44CFF]" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 w-full max-w-xs h-full bg-[#0E0B1B] border-l border-[#8B35FF]/30 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <Logo showTagline={false} size="sm" />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#AAA2C1] hover:text-white bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tagline */}
              <div className="py-3 text-[11px] text-[#AAA2C1] font-medium">
                Grow More • Earn More • Shop More
              </div>

              {/* Navigation Links */}
              <div className="flex flex-col gap-1.5 mt-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#8B35FF]/30 to-[#287CFF]/20 text-white border border-[#8B35FF]/50 shadow-sm"
                          : "text-[#AAA2C1] hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span>{link.label}</span>
                      {isActive && <span className="w-2 h-2 rounded-full bg-[#35E6A2]" />}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/10 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center text-sm font-semibold text-white border border-white/20 hover:bg-white/5"
              >
                Sign In to Portal
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r from-[#8B35FF] to-[#287CFF] shadow-[0_0_20px_rgba(139,53,255,0.4)]"
              >
                Create Free Account
              </Link>
              <div className="flex items-center justify-center gap-2 text-[10px] text-[#AAA2C1]/70 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#35E6A2]" />
                <span>Verified 256-bit Secure Gateway</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
