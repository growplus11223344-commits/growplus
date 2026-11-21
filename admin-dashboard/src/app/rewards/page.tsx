'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { apiClient } from '../../lib/api';
import {
  Award,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Coins,
  History,
  Lock,
} from 'lucide-react';

export default function RewardsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRuleModal, setShowAddRuleModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // New Rule form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ruleType, setRuleType] = useState('purchase_commission');
  const [commissionType, setCommissionType] = useState('percentage');
  const [commissionValue, setCommissionValue] = useState('5');
  const [minPurchaseAmount, setMinPurchaseAmount] = useState('500');
  const [maxCommissionPerOrder, setMaxCommissionPerOrder] = useState('1000');
  const [savingRule, setSavingRule] = useState(false);

  // Manual Adjustment form
  const [userId, setUserId] = useState('');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState('credit');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState<string | null>(null);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/rewards/rules');
      setRules(res.data || []);
    } catch (err) {
      console.error('Failed to load reward rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingRule(true);
    try {
      await apiClient.post('/admin/rewards/rules', {
        name,
        description,
        rule_type: ruleType,
        commission_type: commissionType,
        commission_value: parseFloat(commissionValue),
        min_purchase_amount: parseFloat(minPurchaseAmount),
        max_commission_per_order: maxCommissionPerOrder ? parseFloat(maxCommissionPerOrder) : undefined,
      });

      setShowAddRuleModal(false);
      setName('');
      setDescription('');
      loadRules();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create rule');
    } finally {
      setSavingRule(false);
    }
  };

  const handleApproveRule = async (id: string) => {
    if (!confirm('Formally approve and activate this reward rule under compliance regulations?')) return;
    try {
      await apiClient.patch(`/admin/rewards/rules/${id}/approve`);
      loadRules();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve rule');
    }
  };

  const handleManualAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError(null);
    setAdjustSuccess(null);
    setAdjusting(true);

    try {
      const res = await apiClient.post('/admin/wallet/adjust', {
        user_id: userId,
        amount: parseFloat(adjustAmount),
        type: adjustType,
        reason: adjustReason,
      });

      setAdjustSuccess(`Successfully adjusted wallet: ${res.data.message}. New Balance: ₹${res.data.new_balance}`);
      setUserId('');
      setAdjustAmount('');
      setAdjustReason('');
    } catch (err: any) {
      setAdjustError(err.response?.data?.error || 'Adjustment failed');
    } finally {
      setAdjusting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRole="admin" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Reward Rules & Financial Compliance"
          subtitle="Configure approved purchase-based earning rules, maintain immutable audit ledgers, and execute auditable wallet adjustments"
          actionButton={
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAdjustModal(true)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center space-x-2 transition-colors shadow-sm"
              >
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Auditable Adjustment</span>
              </button>
              <button
                onClick={() => setShowAddRuleModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center space-x-2 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Reward Rule</span>
              </button>
            </div>
          }
        />

        <div className="p-8 space-y-8">
          {/* Compliance Safeguards Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base font-bold">Strict Regulatory & Anti-Pyramid Safeguards</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="font-semibold text-emerald-400">Retail Product Sales Only:</span>
                <p className="mt-1">Zero commissions awarded for account creation, referrals joining, or wallet deposits.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="font-semibold text-emerald-400">Anti-Fraud & Reversal:</span>
                <p className="mt-1">Self-referrals are blocked at the database level. Returns and refunds automatically reverse credits.</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <span className="font-semibold text-emerald-400">Immutable Financial Ledger:</span>
                <p className="mt-1">Wallet transactions are append-only. Direct balance overwrites are technically impossible.</p>
              </div>
            </div>
          </div>

          {/* Reward Rules Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Configured Reward Rules</h3>
                <p className="text-xs text-slate-500 mt-0.5">Rules govern store credit allocations on verified eligible retail purchases</p>
              </div>
              <button
                onClick={loadRules}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading reward rules...</div>
            ) : rules.length === 0 ? (
              <div className="p-12 text-center">
                <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-700">No reward rules configured</h4>
                <p className="text-xs text-slate-400 mt-1">Create an approved purchase commission rule to incentivize user referrals.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Rule Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Commission</th>
                      <th className="px-6 py-4">Min Purchase</th>
                      <th className="px-6 py-4">Max Cap / Order</th>
                      <th className="px-6 py-4">Compliance Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {rules.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{r.name}</div>
                          <div className="text-xs text-slate-400">{r.description || 'Verified purchase rule'}</div>
                        </td>
                        <td className="px-6 py-4 capitalize text-xs">{r.rule_type.replace('_', ' ')}</td>
                        <td className="px-6 py-4 font-bold text-emerald-600">
                          {r.commission_type === 'percentage' ? `${r.commission_value}%` : `₹${r.commission_value}`}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold">
                          ₹{r.min_purchase_amount || 0}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {r.max_commission_per_order ? `₹${r.max_commission_per_order}` : 'Unlimited'}
                        </td>
                        <td className="px-6 py-4">
                          {r.is_active ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Approved & Active</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">
                              <Lock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Awaiting Approval</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!r.is_active && (
                            <button
                              onClick={() => handleApproveRule(r.id)}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                            >
                              Approve Rule
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Create Rule Modal */}
        {showAddRuleModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Configure Purchase Reward Rule</h3>
                <button onClick={() => setShowAddRuleModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleCreateRule} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Rule Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Standard Retail Referral Commission"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Applies to verified retail purchases over minimum threshold..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Commission Type</label>
                    <select
                      value={commissionType}
                      onChange={(e) => setCommissionType(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Value</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={commissionValue}
                      onChange={(e) => setCommissionValue(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Min Order Amount (₹)</label>
                    <input
                      type="number"
                      value={minPurchaseAmount}
                      onChange={(e) => setMinPurchaseAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Max Cap / Order (₹)</label>
                    <input
                      type="number"
                      value={maxCommissionPerOrder}
                      onChange={(e) => setMaxCommissionPerOrder(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddRuleModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingRule}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    {savingRule ? 'Saving...' : 'Create Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Auditable Adjustment Modal */}
        {showAdjustModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  <h3 className="text-lg font-bold text-slate-900">Auditable Wallet Adjustment</h3>
                </div>
                <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Strict Rule: Direct balance overwriting is blocked. Any modification creates an immutable, append-only ledger transaction with your staff ID and approval reason.
              </div>

              {adjustSuccess && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                  {adjustSuccess}
                </div>
              )}
              {adjustError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {adjustError}
                </div>
              )}

              <form onSubmit={handleManualAdjust} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Customer User UUID</label>
                  <input
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Adjustment Type</label>
                    <select
                      value={adjustType}
                      onChange={(e) => setAdjustType(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="credit">Credit (+)</option>
                      <option value="debit">Debit (-)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="100.00"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Mandatory Auditable Reason (min 10 chars)
                  </label>
                  <textarea
                    rows={3}
                    required
                    minLength={10}
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Executive resolution for ticket #... approved by compliance manager"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={adjusting}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    {adjusting ? 'Committing...' : 'Commit to Ledger'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
