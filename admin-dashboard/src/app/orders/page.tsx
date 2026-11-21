'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { apiClient } from '../../lib/api';
import {
  ShoppingBag,
  Truck,
  RotateCcw,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  AlertTriangle,
  FileDown,
  Search,
  Bell,
  Sparkles,
  MapPin,
  Package,
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Status Filter: all, new, pending, paid, processing, shipped, delivered, cancelled, refunded
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // Fulfillment form
  const [status, setStatus] = useState('shipped');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Refund form
  const [refundReason, setRefundReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const previousOrderCountRef = useRef<number | null>(null);

  useEffect(() => {
    loadOrders(true);
  }, [filterStatus]);

  // Polling: Auto-refresh orders every 10 seconds for real-time admin sync
  useEffect(() => {
    const timer = setInterval(() => {
      loadOrders(false);
    }, 10000);
    return () => clearInterval(timer);
  }, [filterStatus, searchQuery]);

  const loadOrders = async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiClient.get('/admin/orders', { params });
      const fetchedOrders = res.data.orders || [];

      // Check if new orders arrived since last poll
      if (previousOrderCountRef.current !== null && fetchedOrders.length > previousOrderCountRef.current) {
        const diff = fetchedOrders.length - previousOrderCountRef.current;
        setNewOrdersCount((prev) => prev + diff);
      }
      previousOrderCountRef.current = fetchedOrders.length;
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setProcessing(true);

    try {
      await apiClient.patch(`/admin/orders/${selectedOrder.id}/status`, {
        status,
        tracking_number: trackingNumber || undefined,
        tracking_url: trackingUrl || undefined,
        notes: notes || undefined,
      });

      setShowFulfillModal(false);
      setSelectedOrder(null);
      loadOrders(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update order status');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!confirm('Confirm refund & cancellation? This will restore buyer credits, revert inventory stock, and reverse referral rewards.')) return;

    setProcessing(true);
    try {
      await apiClient.patch(`/admin/orders/${selectedOrder.id}/status`, {
        status: 'refunded',
        refund_reason: refundReason,
      });

      setShowRefundModal(false);
      setSelectedOrder(null);
      loadOrders(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to process refund');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus) {
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">Delivered</span>;
      case 'shipped':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Shipped</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">Processing</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">Confirmed</span>;
      case 'pending':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700">Pending</span>;
      case 'refunded':
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 capitalize">{orderStatus}</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">{orderStatus}</span>;
    }
  };

  const filterTabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'new', label: 'New' },
    { id: 'pending', label: 'Pending' },
    { id: 'paid', label: 'Paid' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'refunded', label: 'Refunded' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar userRole="admin" />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title="Order Fulfillment & Management"
          subtitle="Track customer orders, assign courier shipments, and process cancellations with automated ledger adjustments"
          actionButton={
            <div className="flex items-center space-x-2">
              {newOrdersCount > 0 && (
                <button
                  onClick={() => {
                    setNewOrdersCount(0);
                    loadOrders(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 animate-pulse shadow-sm"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{newOrdersCount} New Orders!</span>
                </button>
              )}
              <button
                onClick={() => loadOrders(true)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          }
        />

        <div className="p-8 space-y-6">
          {/* Filter Bar & Search */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    filterStatus === tab.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadOrders(true)}
                placeholder="Search Order # or Notes..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Orders Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {filterStatus === 'all' ? 'All Live Customer Orders' : `${filterStatus.toUpperCase()} Orders`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {orders.length} order{orders.length === 1 ? '' : 's'} with real-time backend synchronization
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                <span>Loading customer orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-700">No orders found</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {filterStatus !== 'all'
                    ? `No orders matching filter "${filterStatus}". Try switching to All Orders.`
                    : 'Customer orders placed via GrowPlus Shopping will appear here live.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/75 border-b border-slate-200/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Order #</th>
                      <th className="px-5 py-4">Customer Details</th>
                      <th className="px-5 py-4">Products & Qty</th>
                      <th className="px-5 py-4">Order Total</th>
                      <th className="px-5 py-4">Credits Used</th>
                      <th className="px-5 py-4">Razorpay Amount</th>
                      <th className="px-5 py-4">Payment Status</th>
                      <th className="px-5 py-4">Shipping Destination</th>
                      <th className="px-5 py-4">Fulfilment</th>
                      <th className="px-5 py-4">Order Date</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {orders.map((o) => {
                      const latestPayment = o.payments?.[0];
                      const txnRef = latestPayment?.gateway_payment_id || latestPayment?.gateway_order_id || 'N/A';
                      const isRefunded = o.status === 'refunded' || o.payment_status === 'refunded';
                      const orderSubtotal = o.subtotal ? Number(o.subtotal) : (Number(o.total_amount) + Number(o.credits_applied || 0));

                      // Shipping address preview
                      const addr = o.shipping_address;
                      const addrCity = typeof addr === 'object' ? `${addr?.city || ''}${addr?.state ? `, ${addr.state}` : ''}` : '';

                      // Product items summary
                      const items = o.order_items || [];
                      const itemsSummary = items.length > 0
                        ? items.map((it: any) => `${it.product_name} (×${it.quantity})`).join(', ')
                        : 'No item records';

                      return (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-slate-900 text-xs whitespace-nowrap">
                            {o.order_number}
                          </td>
                          <td className="px-5 py-4 min-w-[180px]">
                            <div className="text-slate-900 font-semibold">{o.user_profiles?.full_name || 'Customer'}</div>
                            <div className="text-xs text-slate-500">{o.user_profiles?.email || 'N/A'}</div>
                            {o.user_profiles?.phone && (
                              <div className="text-xs text-slate-400 font-mono">{o.user_profiles.phone}</div>
                            )}
                          </td>
                          <td className="px-5 py-4 max-w-[220px]">
                            <div className="text-xs text-slate-800 font-medium truncate" title={itemsSummary}>
                              {itemsSummary}
                            </div>
                            <div className="text-[11px] text-slate-400">{items.length} item{items.length === 1 ? '' : 's'}</div>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-900 whitespace-nowrap">
                            ₹{orderSubtotal.toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-4 text-xs font-semibold text-emerald-600 whitespace-nowrap">
                            {o.credits_applied && Number(o.credits_applied) > 0
                              ? `₹${Number(o.credits_applied).toLocaleString('en-IN')}`
                              : '₹0.00'}
                          </td>
                          <td className="px-5 py-4 text-xs font-bold text-slate-900 whitespace-nowrap">
                            ₹{Number(o.total_amount).toLocaleString('en-IN')}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                o.payment_status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : o.payment_status === 'refunded'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              {o.payment_status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs min-w-[140px]">
                            <div className="text-slate-700 font-medium flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{addrCity || 'India'}</span>
                            </div>
                            {typeof addr === 'object' && addr?.pincode && (
                              <div className="text-[11px] text-slate-400 ml-4 font-mono">PIN: {addr.pincode}</div>
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">{getStatusBadge(o.status)}</td>
                          <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                            {new Date(o.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setShowDetailsModal(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 rounded hover:bg-slate-100"
                              title="View Payment & Order Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setStatus(o.status);
                                setTrackingNumber(o.tracking_number || '');
                                setTrackingUrl(o.tracking_url || '');
                                setShowFulfillModal(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 rounded hover:bg-slate-100"
                              title="Update Status / Fulfill"
                            >
                              <Truck className="w-4 h-4" />
                            </button>
                            {o.status !== 'refunded' && o.status !== 'cancelled' && (
                              <button
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setShowRefundModal(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-rose-600 rounded hover:bg-rose-50"
                                title="Process Refund & Reverse Rewards"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Fulfillment Modal */}
        {showFulfillModal && selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Update Order Fulfillment</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedOrder.order_number}</p>
                </div>
                <button onClick={() => setShowFulfillModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleUpdateStatus} className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="confirmed">Confirmed (Payment Received)</option>
                    <option value="processing">Processing (Packaging)</option>
                    <option value="shipped">Shipped (Dispatched to Courier)</option>
                    <option value="delivered">Delivered (Handed to Customer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLUEDART-98438291"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Carrier Tracking URL</label>
                  <input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://track.bluedart.com/..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fulfillment Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Internal packaging / delivery notes..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFulfillModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    {processing ? 'Updating...' : 'Save Fulfillment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Refund / Cancellation Modal */}
        {showRefundModal && selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
              <div className="flex items-center space-x-3 text-rose-600 mb-4">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <h3 className="text-lg font-bold">Process Refund & Cancellation</h3>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                Processing this refund will automatically execute the compliance policy:
              </p>

              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1 mb-6">
                <div>• Reverse promotional referral credits awarded to the referrer</div>
                <div>• Restore {selectedOrder.credits_applied || 0} shopping credits to buyer's wallet ledger</div>
                <div>• Restore purchased item quantities back to available inventory</div>
                <div>• Write an immutable audit log entry</div>
              </div>

              <form onSubmit={handleProcessRefund} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Mandatory Refund Reason
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Customer requested cancellation due to..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-sm disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Confirm Refund & Reversals'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Order & Payment Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Order & Payment Overview</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedOrder.order_number}</p>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              {/* Financial & Payment Breakdown Card */}
              <div className="mt-6 bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Payment Breakdown</h4>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Order Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ₹{Number(selectedOrder.subtotal || (Number(selectedOrder.total_amount) + Number(selectedOrder.credits_applied || 0))).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Credits Applied</span>
                  <span className="font-semibold text-emerald-600">
                    - ₹{Number(selectedOrder.credits_applied || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex justify-between text-sm border-t border-slate-200 pt-2 font-bold">
                  <span className="text-slate-900">Net Razorpay Payable Amount</span>
                  <span className="text-slate-900 text-base">
                    ₹{Number(selectedOrder.total_amount).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Payment Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded font-semibold capitalize ${
                      selectedOrder.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {selectedOrder.payment_status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Refund Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded font-semibold ${
                      selectedOrder.status === 'refunded' ? 'bg-rose-50 text-rose-700' : 'text-slate-600'
                    }`}>
                      {selectedOrder.status === 'refunded' ? 'Refunded & Restored' : 'None'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5">Gateway Order ID (Ref)</span>
                    <span className="font-mono text-slate-700 font-medium">
                      {selectedOrder.payments?.[0]?.gateway_order_id || 'N/A (Credits-only or uninitiated)'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5">Gateway Payment ID (Ref)</span>
                    <span className="font-mono text-slate-700 font-medium">
                      {selectedOrder.payments?.[0]?.gateway_payment_id || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="mt-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Customer & Delivery Info</h4>
                <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recipient Name:</span>
                    <span className="font-semibold text-slate-900">{selectedOrder.shipping_address?.name || selectedOrder.user_profiles?.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Customer Email:</span>
                    <span className="font-medium text-slate-800">{selectedOrder.user_profiles?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Contact Phone:</span>
                    <span className="font-medium text-slate-800">{selectedOrder.shipping_address?.phone || selectedOrder.user_profiles?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shipping Address:</span>
                    <span className="font-medium text-slate-800 text-right max-w-xs">
                      {typeof selectedOrder.shipping_address === 'string'
                        ? selectedOrder.shipping_address
                        : `${selectedOrder.shipping_address?.address_line || ''}, ${selectedOrder.shipping_address?.city || ''}, ${selectedOrder.shipping_address?.state || ''} - ${selectedOrder.shipping_address?.pincode || ''}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div className="mt-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Ordered Products</h4>
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                    {selectedOrder.order_items.map((item: any) => (
                      <div key={item.id} className="p-3.5 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-semibold text-slate-900">{item.product_name}</div>
                          <div className="text-slate-400">Qty: {item.quantity} × ₹{item.unit_price}</div>
                        </div>
                        <div className="font-bold text-slate-900">
                          ₹{Number(item.total_price || item.unit_price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setShowDetailsModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
