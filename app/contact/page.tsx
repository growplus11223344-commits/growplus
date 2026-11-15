"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { TwitterIcon, InstagramIcon, LinkedinIcon } from "@/components/SocialIcons";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = "Full Name is required";
    if (!formData.email.trim()) {
      errs.email = "Email Address is required";
    } else if (!formData.email.includes("@") || !formData.email.includes(".")) {
      errs.email = "Please enter a valid email address";
    }
    if (!formData.mobileNumber.trim()) {
      errs.mobileNumber = "Mobile Number is required";
    } else if (formData.mobileNumber.replace(/\D/g, "").length < 10) {
      errs.mobileNumber = "Enter a valid 10-digit mobile number";
    }
    if (!formData.subject.trim()) errs.subject = "Subject is required";
    if (!formData.message.trim()) {
      errs.message = "Message cannot be empty";
    } else if (formData.message.trim().length < 15) {
      errs.message = "Message must be at least 15 characters long";
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    // Simulate frontend submission feedback
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        fullName: "",
        email: "",
        mobileNumber: "",
        subject: "",
        message: "",
      });
    }, 1200);
  };

  const handleInputChange = (field: string, value: string) => {
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
    <div className="relative min-h-screen bg-[#070611] text-white py-12 sm:py-20 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#8B35FF]/15 to-[#287CFF]/15 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1A1235] border border-[#8B35FF]/40 text-xs font-semibold text-white/90">
            <MessageSquare className="w-3.5 h-3.5 text-[#35E6A2]" />
            <span>Member Support &amp; Concierge Desk</span>
          </div>
          <h1 className="text-4xl sm:text-5.5xl font-black tracking-tight">
            Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B44CFF] via-[#8B35FF] to-[#287CFF]">GROWPLUS</span>
          </h1>
          <p className="text-sm sm:text-base text-[#AAA2C1] leading-relaxed">
            Have a question about your rewards wallet, referral perks, or merchant partnerships? We&apos;re here to assist you.
          </p>
        </div>

        {/* ======================================================== */}
        {/* MAIN SPLIT LAYOUT: INFO CARDS (LEFT) + FORM (RIGHT) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Support Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#110D24] border border-white/10 space-y-6 shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#35E6A2] block mb-1">
                  Direct Channels
                </span>
                <h3 className="text-2xl font-black text-white">Get in Touch</h3>
                <p className="text-xs text-[#AAA2C1] mt-1">
                  Our operations and customer assistance teams respond promptly.
                </p>
              </div>

              {/* Channel 1: Helpline */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#161033] border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-[#8B35FF]/20 text-[#B44CFF] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#AAA2C1] uppercase tracking-wider block">
                    Customer Helpline
                  </span>
                  <span className="text-sm font-bold text-white font-mono">+91 8000 476 975</span>
                  <p className="text-[10px] text-[#35E6A2] mt-0.5">Toll-free across India</p>
                </div>
              </div>

              {/* Channel 2: Email */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#121636] border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-[#287CFF]/20 text-[#287CFF] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#AAA2C1] uppercase tracking-wider block">
                    Support Inquiries
                  </span>
                  <span className="text-sm font-bold text-white font-mono">support@growplus.eco</span>
                  <p className="text-[10px] text-[#AAA2C1] mt-0.5">Response within 2 hours</p>
                </div>
              </div>

              {/* Channel 3: Office Headquarters */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#161033] border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#AAA2C1] uppercase tracking-wider block">
                    Headquarters
                  </span>
                  <span className="text-xs font-bold text-white block">
                    GROWPLUS Tech Ecosystem Hub
                  </span>
                  <p className="text-[11px] text-[#AAA2C1] leading-relaxed mt-0.5">
                    Level 7, Infinity Cyber Towers, Outer Ring Road, Bengaluru, Karnataka 560103
                  </p>
                </div>
              </div>

              {/* Channel 4: Operating Hours */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-[#161033] border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#AAA2C1] uppercase tracking-wider block">
                    Operating Schedule
                  </span>
                  <span className="text-xs font-bold text-white block">
                    Monday – Saturday: 9:00 AM – 7:00 PM IST
                  </span>
                  <p className="text-[10px] text-[#AAA2C1] mt-0.5">Automated ticket triage 24/7</p>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] uppercase font-bold text-[#AAA2C1] tracking-wider block mb-2">
                  Official Channels
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-[#161033] border border-white/10 hover:border-[#8B35FF] text-[#AAA2C1] hover:text-white transition-all"
                  >
                    <TwitterIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-[#161033] border border-white/10 hover:border-[#8B35FF] text-[#AAA2C1] hover:text-white transition-all"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-[#161033] border border-white/10 hover:border-[#8B35FF] text-[#AAA2C1] hover:text-white transition-all"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </a>
                  <a
                    href="https://telegram.org"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-[#161033] border border-white/10 hover:border-[#8B35FF] text-[#AAA2C1] hover:text-white transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Premium Contact Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-[#110D24] border border-[#8B35FF]/30 shadow-2xl space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#B44CFF] block mb-1">
                  Send a Message
                </span>
                <h3 className="text-2xl font-black text-white">We&apos;d Love to Hear From You</h3>
                <p className="text-xs text-[#AAA2C1] mt-1">
                  Fill in your details below and our concierge team will follow up with you.
                </p>
              </div>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-[#35E6A2]/15 border border-[#35E6A2]/40 text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white">Message Dispatched (Frontend Demo)</h4>
                  <p className="text-xs text-white/90 leading-relaxed max-w-md mx-auto">
                    Thank you! Your simulated message has been validated successfully on the GROWPLUS frontend portal. Note: Phase 1 is a frontend preview; no real email or backend database is connected yet.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-3 px-5 py-2.5 rounded-xl bg-[#35E6A2] text-black font-extrabold text-xs hover:bg-[#35E6A2]/90 transition-colors"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-semibold text-white/90 block mb-1">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="e.g. Arjun Verma"
                      className={`w-full bg-[#0E0A1D] border rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none transition-colors ${
                        errors.fullName ? "border-rose-500" : "border-white/10 focus:border-[#8B35FF]"
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Email & Mobile 2-col row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-white/90 block mb-1">
                        Email Address <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="arjun@example.com"
                        className={`w-full bg-[#0E0A1D] border rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none transition-colors ${
                          errors.email ? "border-rose-500" : "border-white/10 focus:border-[#8B35FF]"
                        }`}
                      />
                      {errors.email && (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.email}</span>
                        </p>
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
                        className={`w-full bg-[#0E0A1D] border rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none transition-colors ${
                          errors.mobileNumber ? "border-rose-500" : "border-white/10 focus:border-[#8B35FF]"
                        }`}
                      />
                      {errors.mobileNumber && (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.mobileNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="text-xs font-semibold text-white/90 block mb-1">
                      Subject <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      className={`w-full bg-[#0E0A1D] border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-colors ${
                        errors.subject ? "border-rose-500" : "border-white/10 focus:border-[#8B35FF]"
                      }`}
                    >
                      <option value="">Select an inquiry category...</option>
                      <option value="General Inquiry">General Platform Inquiry</option>
                      <option value="Rewards & Accrual">Rewards &amp; Accrual Question</option>
                      <option value="Referral Program">Referral Program &amp; Milestone Bonus</option>
                      <option value="Shopping & Credits">In-App Shopping Credits &amp; Redemption</option>
                      <option value="Merchant Partnership">Merchant / Brand Partnership Inquiry</option>
                      <option value="Compliance & Legal">Regulatory &amp; Legal Desk</option>
                    </select>
                    {errors.subject && (
                      <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.subject}</span>
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="text-xs font-semibold text-white/90 block mb-1">
                      Message <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Please describe your question or inquiry in detail..."
                      className={`w-full bg-[#0E0A1D] border rounded-xl p-4 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none transition-colors ${
                        errors.message ? "border-rose-500" : "border-white/10 focus:border-[#8B35FF]"
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.message ? (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{errors.message}</span>
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-[10px] text-[#AAA2C1]/60 font-mono">
                        {formData.message.length} chars
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B35FF] to-[#287CFF] text-white font-extrabold text-xs shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Validating message...
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Inquiry</span>
                      </>
                    )}
                  </button>

                  <div className="text-[10px] text-[#AAA2C1]/60 text-center">
                    Frontend validation active. In Phase 1, form responses are simulated client-side.
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
