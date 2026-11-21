'use client';

import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, actionButton }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-4">
        {actionButton}
        <button
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};
