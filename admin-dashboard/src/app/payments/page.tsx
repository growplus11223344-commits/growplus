'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { apiClient } from '../../lib/api';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Globe,
  Lock,
  Layers,
  Activity,
  FileCode,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface GatewayInfo {
  provider: 'razorpay' | 'europepay';
  displayName: string;
  isActive: boolean;
  isAvailable: boolean;
  unavailabilityReason?: string;
  capabilities: {
    provider: string;
    displayName: string;
    supportsINR: boolean;
    supportsEUR: boolean;
    supportedCurrencies: string[];
    gatewayType: 'sdk' | 'hosted_checkout';
    requiresKYCApproval: boolean;
    isLiveReady: boolean;
    readinessReason: string;
  };
}

interface OverviewData {
  activeProvider: 'razorpay' | 'europepay';
  environment: string;
  gateways: GatewayInfo[];
  metrics: {
    totalPayments: number;
    byProvider: Record<string, number>;
    capturedCount: number;
    failedCount: number;
    refundedCount: number;
  };
}

export default function PaymentsPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [targetProvider, setTargetProvider] = useState<'razorpay' | 'europepay'>('razorpay');
  const [switchReason, setSwitchReason] = useState('');
  const [switching, setSwitching] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/payments/overview');
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load payment overview:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSwitchModal = (provider: 'razorpay' | 'europepay') => {
    setTargetProvider(provider);
    setSwitchReason('');
    setShowSwitchModal(true);
  };

  const handleConfirmSwitch = async () => {
    if (!switchReason.trim()) {
      alert('Please provide a reason for the gateway switch for audit logging.');
      return;
    }

    setSwitching(true);
    setStatusMessage(null);
    try {
      const res = await apiClient.post('/admin/payments/switch-gateway', {
        provider: targetProvider,
        reason: switchReason.trim(),
      });
      setStatusMessage({
        type: 'success',
        text: `Active payment gateway switched to ${res.data.activeProvider}. System audit record saved.`,
      });
      setShowSwitchModal(false);
      loadOverview();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to switch payment gateway.',
      });
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole="admin" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Payment Gateway & Multi-Provider Architecture" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Message Notification */}
          {statusMessage && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-sm font-medium">{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-xs underline hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Top Bar Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">Production Gateway Architecture</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero-downtime server-controlled provider switching across Razorpay (India) & EuropeanPay (SEPA).
              </p>
            </div>

            <button
              onClick={loadOverview}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Metrics Overview Cards */}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Total Transactions</div>
                <div className="text-2xl font-bold text-white mt-1">{data.metrics.totalPayments}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Razorpay: {data.metrics.byProvider.razorpay || 0} • Europepay: {data.metrics.byProvider.europepay || 0}
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Captured / Settled</div>
                <div className="text-2xl font-bold text-emerald-400 mt-1">{data.metrics.capturedCount}</div>
                <div className="text-[11px] text-emerald-500 mt-1">Verified with immutable ledger</div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Failed / Cancelled</div>
                <div className="text-2xl font-bold text-red-400 mt-1">{data.metrics.failedCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">Credits restored automatically</div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-xs text-slate-400">Refunded Orders</div>
                <div className="text-2xl font-bold text-amber-400 mt-1">{data.metrics.refundedCount}</div>
                <div className="text-[11px] text-slate-500 mt-1">Audited via staff management</div>
              </div>
            </div>
          )}

          {/* Dual Gateway Comparison & Status Cards */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-400" />
              <p className="text-sm">Inspecting payment provider status & capabilities...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data?.gateways.map((gw) => {
                const isRazorpay = gw.provider === 'razorpay';
                const isEuropepay = gw.provider === 'europepay';

                return (
                  <div
                    key={gw.provider}
                    className={`bg-slate-900 rounded-2xl border p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                      gw.isActive
                        ? 'border-purple-500/80 shadow-lg shadow-purple-500/10'
                        : 'border-slate-800 opacity-90'
                    }`}
                  >
                    {/* Top Status Header */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2.5 rounded-xl border ${
                              isRazorpay
                                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}
                          >
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-white">{gw.displayName}</h3>
                            <span className="text-xs font-mono text-slate-400">Provider: {gw.provider}</span>
                          </div>
                        </div>

                        {gw.isActive ? (
                          <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
                            <span>ACTIVE GATEWAY</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400">
                            STANDBY
                          </span>
                        )}
                      </div>

                      {/* Currency & Rail Badges */}
                      <div className="space-y-3 mt-4 text-xs">
                        <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                          <span className="text-slate-400">Supported Currencies:</span>
                          <span className="font-mono font-semibold text-slate-200">
                            {gw.capabilities.supportedCurrencies.join(', ')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                          <span className="text-slate-400">Domestic Indian Rail (INR):</span>
                          {gw.capabilities.supportsINR ? (
                            <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Supported (UPI, RuPay, Cards, Netbanking)</span>
                            </span>
                          ) : (
                            <span className="text-red-400 font-semibold flex items-center space-x-1">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Unsupported (EUR-Only SEPA)</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                          <span className="text-slate-400">Integration Type:</span>
                          <span className="font-mono text-slate-300 uppercase">
                            {gw.capabilities.gatewayType === 'sdk' ? 'Native SDK & JS Iframe' : 'Hosted Checkout URL'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                          <span className="text-slate-400">Live Production Readiness:</span>
                          {gw.capabilities.isLiveReady ? (
                            <span className="text-emerald-400 font-semibold">Active Production</span>
                          ) : (
                            <span className="text-amber-400 font-semibold">Gated / Sandbox</span>
                          )}
                        </div>

                        {/* Readiness Reason Warning Box */}
                        <div
                          className={`p-3.5 rounded-xl border text-xs leading-relaxed mt-3 ${
                            isEuropepay
                              ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                              : 'bg-blue-950/20 border-blue-800/40 text-blue-200'
                          }`}
                        >
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <p>{gw.capabilities.readinessReason}</p>
                          </div>
                        </div>

                        {/* Webhook Endpoint Info */}
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-400">
                          <span className="text-slate-500">Webhook URL: </span>
                          <span className="text-slate-300">/api/v1/webhooks/{gw.provider}</span>
                          <div className="text-[10px] text-slate-500 mt-1">Verification: HMAC-SHA256 (Raw Body)</div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="mt-6 pt-4 border-t border-slate-800/80">
                      {gw.isActive ? (
                        <button
                          disabled
                          className="w-full py-2.5 px-4 bg-purple-600/30 text-purple-200 border border-purple-500/40 rounded-xl text-xs font-bold cursor-default"
                        >
                          Currently Processing Customer Orders
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenSwitchModal(gw.provider)}
                          className="w-full py-2.5 px-4 bg-slate-800 hover:bg-purple-600 text-slate-200 hover:text-white border border-slate-700 hover:border-purple-500 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                          <span>Switch to {gw.displayName}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Production Gates Checklist */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Production Safety Gates & Compliance Standards</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                <span className="font-semibold text-emerald-400">✓ Server-Side Gateway Selection:</span>
                <p className="text-slate-400">
                  Switching active gateway requires zero client app updates or reinstalls. Backend dynamically coordinates checkout.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                <span className="font-semibold text-emerald-400">✓ Strict Currency Guardrails:</span>
                <p className="text-slate-400">
                  Direct INR store transactions cannot be processed by EUR-only rails without verified merchant approval and transparent FX disclosure.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                <span className="font-semibold text-emerald-400">✓ Pending Transaction Preservation:</span>
                <p className="text-slate-400">
                  Switching gateways never reroutes in-flight transactions. Existing payment records always settle through their originating gateway.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1">
                <span className="font-semibold text-emerald-400">✓ Webhook Signature & Idempotency:</span>
                <p className="text-slate-400">
                  Both Razorpay and Europepay webhooks enforce strict HMAC-SHA256 signature verification over raw request payloads to prevent spoofing.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Switch Gateway Confirmation Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Confirm Payment Gateway Switch</h3>
                <p className="text-xs text-slate-400">Switching active provider to {targetProvider.toUpperCase()}</p>
              </div>
            </div>

            {targetProvider === 'europepay' && (
              <div className="p-3.5 bg-amber-950/30 border border-amber-800/50 rounded-xl text-xs text-amber-200 space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Currency Compatibility Notice:</span>
                </div>
                <p className="text-[11.5px] leading-relaxed">
                  EuropeanPay operates exclusively in EUR (EU SEPA Open Banking). If your product store prices are in INR, direct charges will be rejected unless explicit EUR catalog pricing or an approved FX conversion layer is enabled.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Audit Trail Reason (Mandatory):
              </label>
              <textarea
                rows={3}
                placeholder="State the operational reason for this gateway switch (e.g., Scheduled provider maintenance, primary gateway activation, testing)..."
                value={switchReason}
                onChange={(e) => setSwitchReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowSwitchModal(false)}
                disabled={switching}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwitch}
                disabled={switching || !switchReason.trim()}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md"
              >
                {switching && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Switch to {targetProvider.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
