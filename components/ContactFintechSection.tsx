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
  Building2,
  FileText,
} from "lucide-react";

export const ContactFintechSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "Distributor Membership Inquiry",
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
        subject: "Distributor Membership Inquiry",
        message: "",
      });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <section id="contact" className="relative py-24 bg-[#070B1E] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Support Info (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#35E6A2] bg-[#35E6A2]/10 px-3 py-1 rounded-full border border-[#35E6A2]/30 mb-2 inline-block">
                Distributor &amp; Consumer Helpdesk
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Contact &amp; Grievance Redressal
              </h2>
              <p className="text-xs sm:text-sm text-[#AAA2C1] mt-2 leading-relaxed">
                Compliant with Consumer Protection (Direct Selling) Rules 2021. Our dedicated distributor concierge, product fulfillment, and grievance redressal teams are here to assist you 6 days a week.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-[#0E1533] border border-white/5 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#287CFF]/20 text-[#38BDF8] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#AAA2C1] uppercase tracking-wider block">Toll-Free Distributor Helpline</span>
                  <span className="text-sm font-bold text-white font-mono">+91 1800 890 4765</span>
                  <p className="text-[10px] text-[#35E6A2] mt-0.5">Mon–Sat: 9:30 AM – 6:30 PM IST</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0E1533] border border-white/5 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#AAA2C1] uppercase tracking-wider block">WhatsApp Direct Support</span>
                  <span className="text-sm font-bold text-white font-mono">+91 98210 54321</span>
                  <p className="text-[10px] text-[#35E6A2] mt-0.5">Instant order tracking &amp; KYC status</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0E1533] border border-white/5 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#8B35FF]/20 text-[#B44CFF] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#AAA2C1] uppercase tracking-wider block">Grievance &amp; Compliance Email</span>
                  <span className="text-sm font-bold text-white font-mono">grievance@growplus.eco</span>
                  <p className="text-[10px] text-[#AAA2C1] mt-0.5">Nodal Grievance Officer: grievance.officer@growplus.eco</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0E1533] border border-white/5 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-[#AAA2C1] uppercase tracking-wider block">Corporate Headquarters</span>
                  <span className="text-xs font-bold text-white">
                    GROWPLUS GLOBAL WELLNESS MARKETING PVT. LTD.
                  </span>
                  <p className="text-[10px] text-[#AAA2C1] mt-0.5">
                    Tower B, Horizon Business Park, Sector 62, Noida, Uttar Pradesh - 201309
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form (7 cols) */}
          <div className="lg:col-span-7 p-8 rounded-3xl bg-[#0E1533] border border-white/10 shadow-2xl relative">
            <h3 className="text-xl font-black text-white mb-1">
              Send an Inquiry or Grievance
            </h3>
            <p className="text-xs text-[#AAA2C1] mb-6">
              Fill out the form below. Our distributor care team will respond within 24 business hours.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-[#35E6A2]/10 border border-[#35E6A2]/30 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#35E6A2]/20 text-[#35E6A2] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Message Dispatched Successfully!</h4>
                <p className="text-xs text-[#AAA2C1]">
                  Your ticket ID #GP-{Math.floor(100000 + Math.random() * 900000)} has been generated. A distributor relationship manager will get in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#AAA2C1] font-semibold block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-[#141E45] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#AAA2C1] font-semibold block">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#141E45] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[#AAA2C1] font-semibold block">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className="w-full bg-[#141E45] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-[#38BDF8]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[#AAA2C1] font-semibold block">Inquiry Type</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[#141E45] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#38BDF8]"
                    >
                      <option value="Distributor Membership Inquiry">Join as Distributor (Sponsor Query)</option>
                      <option value="10% Referral Bonus Inquiry">10% First Bill Referral Bonus Query</option>
                      <option value="Binary Matching Payout">Binary Matching Weekly Payout Query</option>
                      <option value="Product Order & Delivery">Product Order &amp; Delivery Tracking</option>
                      <option value="Formal Grievance">Direct Selling Grievance Redressal</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#AAA2C1] font-semibold block">Message / Details *</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details about your query or distributor ID if applicable..."
                    className="w-full bg-[#141E45] border border-white/10 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-[#38BDF8] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#287CFF] to-[#35E6A2] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? "Submitting Inquiry..." : "Submit Inquiry to Helpdesk"}</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};
