'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { apiClient } from '../../lib/api';
import { Users, UserPlus, Shield, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function StaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('product_manager');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/staff');
      setStaffList(res.data || []);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await apiClient.post('/admin/staff', {
        email,
        full_name: fullName,
        role,
        password,
      });

      setShowAddModal(false);
      setEmail('');
      setFullName('');
      setPassword('');
      loadStaff();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create staff account');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'owner':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700">Owner</span>;
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">Admin</span>;
      case 'product_manager':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">Product Manager</span>;
      case 'order_manager':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">Order Manager</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">{r}</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRole="admin" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Staff Management & RBAC Permissions"
          subtitle="Provision staff accounts and configure role-based access boundaries across catalog, orders, and financial data"
          actionButton={
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center space-x-2 transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Provision Staff Account</span>
            </button>
          }
        />

        <div className="p-8 space-y-8">
          {/* RBAC Rules Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs">
              <span className="font-bold text-slate-900 block mb-1">Product Manager</span>
              <p className="text-slate-500">Full catalog & inventory management. Cannot view customer financial balances or modify wallet credits.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs">
              <span className="font-bold text-slate-900 block mb-1">Order Manager</span>
              <p className="text-slate-500">Order fulfillment, courier tracking, and processing customer returns/cancellations.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs">
              <span className="font-bold text-slate-900 block mb-1">Support</span>
              <p className="text-slate-500">Customer ticket handling and order lookup without financial adjustment permissions.</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm text-xs">
              <span className="font-bold text-slate-900 block mb-1">Owner & Admin</span>
              <p className="text-slate-500">Unrestricted operational authority, staff provisioning, reward rule approval, and audit review.</p>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Active Staff Accounts</h3>
                <p className="text-xs text-slate-500 mt-0.5">Personnel with authorized access to GrowPlus management portal</p>
              </div>
              <button
                onClick={loadStaff}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading staff members...</div>
            ) : staffList.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-700">No staff members created</h4>
                <p className="text-xs text-slate-400 mt-1">Provision a staff account to assign operational responsibilities.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Assigned Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {staffList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{s.full_name}</td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-600">{s.email}</td>
                        <td className="px-6 py-4">{getRoleBadge(s.role)}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                            Active
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(s.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add Staff Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Provision Staff Account</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateStaff} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Staff Work Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@growplus.internal"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assigned Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="product_manager">Product Manager (Catalog & Inventory only)</option>
                    <option value="order_manager">Order Manager (Fulfillment & Returns only)</option>
                    <option value="support">Support Representative</option>
                    <option value="admin">Admin (All modules except owner setup)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Initial Temporary Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Provision Account'}
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
