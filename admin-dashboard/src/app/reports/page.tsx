'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { apiClient } from '../../lib/api';
import { FileSpreadsheet, RefreshCw, CheckCircle, ExternalLink, ShieldCheck, Database } from 'lucide-react';

export default function ReportsPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const handleSyncSheets = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await apiClient.post('/admin/reports/sync-sheets');
      setSyncResult(res.data.message || 'Synchronization initiated successfully');
    } catch (err: any) {
      setSyncResult('Failed to sync: ' + (err.response?.data?.error || err.message));
    } finally {
      setSyncing(false);
    }
  };

  const reportsList = [
    {
      title: 'Customers Report',
      description: 'Profile status, KYC status, lifetime earned rewards, and registered contact information.',
      sheetTarget: 'Customers!A1',
      frequency: 'Every 6 hours or on-demand',
    },
    {
      title: 'Products & Catalog Report',
      description: 'Live retail items, SKUs, category mappings, selling prices, and active reward eligibility flags.',
      sheetTarget: 'Products!A1',
      frequency: 'Every 6 hours or on-demand',
    },
    {
      title: 'Orders Report',
      description: 'Detailed purchase histories, payment statuses, applied wallet credits, and courier tracking codes.',
      sheetTarget: 'Orders!A1',
      frequency: 'Every 6 hours or on-demand',
    },
    {
      title: 'Inventory Health Report',
      description: 'Current warehouse stock levels, reserved quantities, and low stock threshold alerts.',
      sheetTarget: 'Inventory!A1',
      frequency: 'Every 6 hours or on-demand',
    },
    {
      title: 'Reward Transactions Ledger',
      description: 'Beneficiary IDs, qualifying purchase amounts, referral rewards, and cancellation reversal logs.',
      sheetTarget: 'Rewards!A1',
      frequency: 'Every 6 hours or on-demand',
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRole="admin" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Google Sheets & Analytics Reporting"
          subtitle="Asynchronous automated exports of operational, inventory, customer, and reward ledgers to Google Sheets"
          actionButton={
            <button
              onClick={handleSyncSheets}
              disabled={syncing}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold flex items-center space-x-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync All Sheets Now'}</span>
            </button>
          }
        />

        <div className="p-8 space-y-8">
          {/* Important Principle Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Architectural Source of Truth Notice</p>
              <p className="mt-0.5 text-amber-800">
                Google Sheets serves strictly as an asynchronous analytics and team export target. Supabase PostgreSQL remains the sole primary source of truth for all balances, financial ledgers, and transactions.
              </p>
            </div>
          </div>

          {syncResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{syncResult}</span>
            </div>
          )}

          {/* Connected Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportsList.map((r) => (
              <div key={r.title} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{r.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{r.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-500">
                    <span>Target Range:</span>
                    <span className="font-mono text-slate-700">{r.sheetTarget}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Sync Interval:</span>
                    <span className="font-medium text-slate-700">{r.frequency}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
