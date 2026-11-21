'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { apiClient } from '../lib/api';
import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Clock,
  Sparkles,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('admin');

  useEffect(() => {
    const token = localStorage.getItem('growplus_admin_token');
    if (!token) {
      router.push('/login');
      return;
    }

    loadDashboardData();
  }, [router]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/dashboard');
      setStats(res.data);
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRole={userRole} />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Executive Dashboard"
          subtitle="Real-time production metrics, sales ledger, and fulfillment overview"
          actionButton={
            <button
              onClick={loadDashboardData}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center space-x-2 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          }
        />

        <div className="p-8 space-y-8">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Sales */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Product Sales</span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{stats?.total_sales?.toLocaleString('en-IN') ?? '0'}
                </span>
                <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Realized from verified orders</span>
                </p>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Orders</span>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">
                  {stats?.total_orders ?? '0'}
                </span>
                <p className="text-xs text-slate-400 mt-1">
                  <span className="text-amber-500 font-semibold">{stats?.pending_orders ?? 0}</span> awaiting fulfillment
                </p>
              </div>
            </div>

            {/* Registered Customers */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registered Customers</span>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">
                  {stats?.total_users ?? '0'}
                </span>
                <p className="text-xs text-slate-400 mt-1">Verified Rewards & Shopping users</p>
              </div>
            </div>

            {/* Promotional Credits Issued */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rewards Credits Issued</span>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900">
                  ₹{stats?.promotional_credits_issued?.toLocaleString('en-IN') ?? '0'}
                </span>
                <p className="text-xs text-slate-400 mt-1">Backed by verified product purchases</p>
              </div>
            </div>
          </div>

          {/* Quick Operations Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Inventory Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Product Inventory</h3>
                  <Package className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  Published catalog products actively syncing to the GrowPlus Shopping mobile app.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Active Live Products</span>
                  <span className="text-xl font-bold text-emerald-600">{stats?.active_products ?? 0}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => router.push('/products')}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors text-center"
                >
                  Manage Products & Stock
                </button>
              </div>
            </div>

            {/* Pending Orders Action Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Fulfillment Pipeline</h3>
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  Orders requiring shipment, delivery confirmation, or courier tracking number assignment.
                </p>
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-900">Pending Fulfillment</span>
                  <span className="text-xl font-bold text-amber-600">{stats?.pending_orders ?? 0}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-colors text-center"
                >
                  Process Pending Orders
                </button>
              </div>
            </div>

            {/* Compliance & Audit Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Rewards Compliance</h3>
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-sm text-slate-500 mb-6">
                  Anti-fraud safeguards, approved retail purchase commission rules, and append-only financial ledger.
                </p>
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-emerald-800 space-y-1">
                  <p className="font-semibold">✓ Deposit commission blocked</p>
                  <p className="font-semibold">✓ Self-referral prevention active</p>
                  <p className="font-semibold">✓ Append-only wallet transactions</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => router.push('/rewards')}
                  className="w-full py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-colors text-center"
                >
                  Review Rules & Audit Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
