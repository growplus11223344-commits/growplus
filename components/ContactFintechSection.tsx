"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

export const ContactFintechSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "Investment Plan Inquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        mobile: "",
        subject: "Investment Plan Inquiry",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <section id="contact" className="relative py-24 bg-[#070B1E] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Support Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#35E6A2] bg-[#35E6A2]/10 px-3 py-1 rounded-full border border-[#35E6A2]/30 mb-2 inline-block">
                Investor Helpdesk
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Contact &amp; Support
              </h2>
              <p className="text-xs sm:text-sm text-[#AAA2C1] mt-2 leading-relaxed">
                Our specialized treasury and client concierge team is ready to answer questions about deposits, plan activations, and referral payouts.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-[#0E1533] border border-white/5 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#287CFF]/20 text-[#38BDF8] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#AAA2C1] uppercase tracking-wider block">Official Helpline</span>
                  <span className="text-sm font-bold text-white font-mono">+91 8000 476 975</span>
                  <p className="text-[10px] text-[#35E6A2] mt-0.5">Mon–Sat: 9:00 AM – 7:00 PM IST</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0E1533] border border-white/5 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#8B35FF]/20 text-[#B44CFF] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#AAA2C1] uppercase tracking-wider block">Investor Desk Email</span>
                  <span className="text-sm font-bold text-white font-mono">support@growplus.eco</span>
                  <p className="text-[10px] text-[#AAA2C1] mt-0.5">Guaranteed response within 2 hours</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0E1533] border border-white/5 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#AAA2C1] uppercase tracking-wider block">Official Telegram</span>
                  <span className="text-sm font-bold text-white">@GrowPlusOfficial</span>
                  <p className="text-[10px] text-[#35E6A2] mt-0.5">Live community announcements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form (7 cols) */}
          <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-[#0E1533] border border-[#287CFF]/30 shadow-2xl space-y-5">
            <div>
              <h3 className="text-2xl font-black text-white">Send Us a Direct Inquiry</h3>
              <p className="text-xs text-[#AAA2C1] mt-1">
                Have a specific query about an investment tier or referral partnership?
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-[#35E6A2]/15 border border-[#35E6A2]/40 text-[#35E6A2] text-center space-y-2 animate-fadeIn">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <h4 className="font-bold text-base text-white">Inquiry Dispatched!</h4>
                <p className="text-xs text-white/80">
                  Thank you! Our investor relationship team will reach out to you within 2 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-white/90 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-[#090F26] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none focus:border-[#287CFF]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-white/90 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className="w-full bg-[#090F26] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none focus:border-[#287CFF]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/90 block mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#090F26] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none focus:border-[#287CFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/90 block mb-1">Inquiry Category</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#090F26] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#287CFF]"
                  >
                    <option value="Investment Plan Inquiry">Investment Plan Inquiry (Basic, VIP, Daily, Super)</option>
                    <option value="Daily Midnight Bonus">Daily Midnight Bonus Verification</option>
                    <option value="MLM Referral Network">MLM &amp; 5% Referral Commission</option>
                    <option value="Wallet Deposit & Withdrawal">Wallet Deposit &amp; Withdrawal Support</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-white/90 block mb-1">Your Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please specify your investment queries or assistance needed..."
                    className="w-full bg-[#090F26] border border-white/10 rounded-xl p-3.5 text-xs text-white placeholder-[#AAA2C1]/50 focus:outline-none focus:border-[#287CFF]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Sending message...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Investor Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
