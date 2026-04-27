import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 w-full border-t border-slate-200/60 bg-white py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row lg:px-8">

        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#172033]">
            <ShieldCheck size={20} className="text-[#ffd59a]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Bihar Fund Tracker</h3>
            <p className="text-xs text-slate-500">Government of Bihar Initiative</p>
          </div>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-[#b52130] transition-colors">About Portal</a>
          <a href="#" className="hover:text-[#b52130] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#b52130] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#b52130] transition-colors">Help & Support</a>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-slate-500 md:text-right">
          <p>&copy; {currentYear} State Government of Bihar.</p>
          <p className="mt-1 text-xs">Powered by Blockchain Technology.</p>
        </div>

      </div>
    </footer>
  );
}
