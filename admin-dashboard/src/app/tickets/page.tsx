'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { apiClient } from '../../lib/api';
import {
  LifeBuoy,
  Search,
  RefreshCw,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  User,
  ShieldCheck,
  Tag,
  Filter,
  X,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  order_id?: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    full_name?: string;
    phone?: string;
  };
  support_messages?: TicketMessage[];
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'customer' | 'staff' | 'system';
  message: string;
  is_internal: boolean;
  created_at: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketDetailsLoading, setTicketDetailsLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  // Polling every 10 seconds for real-time ticket updates
  useEffect(() => {
    const timer = setInterval(() => {
      loadTickets(false);
    }, 10000);
    return () => clearInterval(timer);
  }, [filterStatus]);

  const loadTickets = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    try {
      const params: any = {};
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      const response = await apiClient.get('/support/admin/tickets', { params });
      setTickets(response.data.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  const openTicketDetails = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setTicketDetailsLoading(true);
    try {
      const response = await apiClient.get(`/support/admin/tickets/${ticket.id}`);
      setSelectedTicket(response.data);
    } catch (err) {
      console.error('Failed to load ticket details:', err);
    } finally {
      setTicketDetailsLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;
    setSendingReply(true);
    try {
      await apiClient.post(`/support/admin/tickets/${selectedTicket.id}/messages`, {
        message: replyText.trim(),
        is_internal: isInternalNote,
      });
      setReplyText('');
      // Reload ticket details
      const response = await apiClient.get(`/support/admin/tickets/${selectedTicket.id}`);
      setSelectedTicket(response.data);
      loadTickets(false);
    } catch (err) {
      alert('Failed to send reply. Please try again.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    try {
      await apiClient.patch(`/support/admin/tickets/${selectedTicket.id}`, {
        status: newStatus,
      });
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      loadTickets(false);
    } catch (err) {
      alert('Failed to update ticket status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const query = searchQuery.toLowerCase();
    const subjectMatch = t.subject?.toLowerCase().includes(query);
    const categoryMatch = t.category?.toLowerCase().includes(query);
    const userMatch = t.user_profiles?.full_name?.toLowerCase().includes(query) || t.user_id?.toLowerCase().includes(query);
    return subjectMatch || categoryMatch || userMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">Open</span>;
      case 'in_progress':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">In Progress</span>;
      case 'waiting_for_customer':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">Waiting Customer</span>;
      case 'resolved':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Resolved</span>;
      case 'closed':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-700 text-slate-300">Closed</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-800 text-slate-400">{status}</span>;
    }
  };

  const getCategoryBadge = (cat: string) => {
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
        <Tag className="w-3 h-3 text-emerald-400" />
        <span className="capitalize">{cat}</span>
      </span>
    );
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar userRole="admin" />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title="Support Tickets & Customer Helpdesk" />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Bar Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by subject, category, customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 overflow-x-auto">
              {['all', 'open', 'in_progress', 'resolved', 'closed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                    filterStatus === st
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => loadTickets(true)}
              className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Tickets Table */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                <p className="text-sm">Loading support tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                <LifeBuoy className="w-12 h-12 text-slate-700" />
                <p className="text-base font-medium text-slate-400">No support tickets found</p>
                <p className="text-xs text-slate-600">Customer tickets from GrowPlus Rewards will appear here in real time.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredTickets.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-400">
                          #{t.id.slice(0, 8)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-200">
                            {t.user_profiles?.full_name || 'Customer'}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            {t.user_profiles?.phone || t.user_id.slice(0, 8)}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-100 line-clamp-1">{t.subject}</div>
                          <div className="text-xs text-slate-400 line-clamp-1">{t.description}</div>
                        </td>
                        <td className="py-3.5 px-4">{getCategoryBadge(t.category)}</td>
                        <td className="py-3.5 px-4">{getStatusBadge(t.status)}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-400">
                          {new Date(t.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => openTicketDetails(t)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-all"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>View & Reply</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Ticket Details & Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <LifeBuoy className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">{selectedTicket.subject}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
                    <span>Ticket #{selectedTicket.id.slice(0, 8)}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedTicket.category}</span>
                    <span>•</span>
                    <span>{new Date(selectedTicket.created_at).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Selector Bar */}
            <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Current Status:</span>
                {getStatusBadge(selectedTicket.status)}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-slate-400">Change Status:</span>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_customer">Waiting for Customer</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-900/50">
              {/* Initial Customer Ticket Description */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <div className="flex items-center space-x-2 font-medium text-slate-300">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span>{selectedTicket.user_profiles?.full_name || 'Customer'} (Original Ticket)</span>
                  </div>
                  <span>{new Date(selectedTicket.created_at).toLocaleTimeString('en-IN')}</span>
                </div>
                <p className="text-sm text-slate-200 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Message Thread */}
              {ticketDetailsLoading ? (
                <div className="py-6 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
                  <p className="text-xs mt-2">Loading conversation...</p>
                </div>
              ) : selectedTicket.support_messages && selectedTicket.support_messages.length > 0 ? (
                selectedTicket.support_messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl border text-sm ${
                      msg.sender_type === 'staff'
                        ? msg.is_internal
                          ? 'bg-amber-950/30 border-amber-800/40 ml-6 text-amber-200'
                          : 'bg-emerald-950/30 border-emerald-800/40 ml-6 text-slate-100'
                        : 'bg-slate-950 border-slate-800/80 mr-6 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <div className="flex items-center space-x-1.5 font-semibold">
                        {msg.sender_type === 'staff' ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">GrowPlus Staff</span>
                            {msg.is_internal && <span className="text-amber-400 font-normal">(Internal Note)</span>}
                          </>
                        ) : (
                          <>
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>Customer</span>
                          </>
                        )}
                      </div>
                      <span className="text-slate-500">
                        {new Date(msg.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-slate-500 py-3">No replies yet. Send a response to the customer below.</p>
              )}
            </div>

            {/* Reply Input Box */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Reply to customer:</span>
                <label className="flex items-center space-x-1.5 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500"
                  />
                  <span>Internal Staff Note (Hidden from customer)</span>
                </label>
              </div>

              <div className="flex items-end space-x-2">
                <textarea
                  rows={2}
                  placeholder={
                    isInternalNote
                      ? 'Add an internal note visible only to staff...'
                      : 'Type a helpful reply to the customer...'
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyText.trim()}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md"
                >
                  <Send className={`w-3.5 h-3.5 ${sendingReply ? 'animate-spin' : ''}`} />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
