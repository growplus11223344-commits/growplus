'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Award,
  Users,
  FileSpreadsheet,
  LifeBuoy,
  CreditCard,
  LogOut,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole = 'admin' }) => {
  const pathname = usePathname();

  const isProductManager = userRole === 'product_manager';
  const isOrderManager = userRole === 'order_manager';
  const isSupport = userRole === 'support';

  // Role-based navigation visibility
  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      label: 'Products',
      href: '/products',
      icon: Package,
      visible: !isOrderManager && !isSupport,
    },
    {
      label: 'Orders',
      href: '/orders',
      icon: ShoppingBag,
      visible: !isProductManager,
    },
    {
      label: 'Reward Rules & Audit',
      href: '/rewards',
      icon: Award,
      visible: !isProductManager && !isOrderManager && !isSupport, // Owner & Admin only
    },
    {
      label: 'Support Tickets',
      href: '/tickets',
      icon: LifeBuoy,
      visible: true,
    },
    {
      label: 'Staff & Roles',
      href: '/staff',
      icon: Users,
      visible: userRole === 'owner' || userRole === 'admin',
    },
    {
      label: 'Payment Gateways',
      href: '/payments',
      icon: CreditCard,
      visible: userRole === 'owner' || userRole === 'admin',
    },
    {
      label: 'Reports & Sync',
      href: '/reports',
      icon: FileSpreadsheet,
      visible: userRole === 'owner' || userRole === 'admin',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('growplus_admin_token');
    localStorage.removeItem('growplus_admin_user');
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-white">GROW</span>
            <span className="text-xl font-bold text-emerald-400">PLUS</span>
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Management Portal</p>
        </div>
      </div>

      {/* Role Pill */}
      <div className="px-6 py-3 bg-slate-800/50 border-b border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400">Signed in as:</span>
        <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {userRole}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => item.visible)
          .map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* Compliance / Security Notice */}
      <div className="p-4 mx-4 mb-4 rounded-lg bg-slate-800/80 border border-slate-700/50 text-xs text-slate-400">
        <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Audit Active</span>
        </div>
        <p>All administrative actions and financial adjustments are recorded immutably.</p>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
