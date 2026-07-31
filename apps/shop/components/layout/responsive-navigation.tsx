'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export function ResponsiveNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4FD1C5] text-white shadow-lg shadow-teal-100">
              <span className="text-xl font-bold italic">V</span>
            </div>
            <span className="hidden sm:inline text-2xl font-black tracking-tight text-[#2D3748]">
              VEL<span className="text-[#4FD1C5]">NOX</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-sm font-semibold text-slate-600 transition-colors hover:text-[#4FD1C5]">สินค้า</Link>
            <Link href="/velrepeat" className="flex items-center gap-1.5 text-sm font-semibold text-[#319795] transition-colors hover:text-[#285E61]">
              <span className="flex h-2 w-2 rounded-full bg-[#4FD1C5] animate-pulse"></span>
              VelRepeat
            </Link>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="ค้นหา..." 
                className="w-48 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-[#4FD1C5] focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-50 transition-all"
              />
            </div>
            
            <Link href="/cart" className="relative p-2 text-slate-600 hover:text-[#4FD1C5] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#4FD1C5] text-[10px] font-bold text-white shadow-sm">3</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-600">{user?.name}</span>
                <button
                  onClick={() => logout()}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <Link href="/login" className="rounded-full bg-[#4FD1C5] px-5 py-2 text-sm font-bold text-white shadow-lg shadow-teal-100 transition-all hover:bg-[#319795] active:scale-95">
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-[#4FD1C5]"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-4 space-y-3">
            <Link href="/products" className="block px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">สินค้า</Link>
            <Link href="/velrepeat" className="block px-4 py-2 rounded-lg text-sm font-semibold text-[#319795] hover:bg-slate-50">VelRepeat</Link>
            
            <div className="px-4 py-2">
              <input 
                type="text" 
                placeholder="ค้นหา..." 
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-[#4FD1C5] focus:outline-none"
              />
            </div>

            <div className="flex gap-2 px-4">
              <Link href="/cart" className="flex-1 rounded-lg bg-slate-50 py-2 text-center text-sm font-bold text-slate-600 hover:bg-slate-100">ตะกร้า</Link>
              {isAuthenticated ? (
                <button
                  onClick={() => logout()}
                  className="flex-1 rounded-lg bg-red-50 py-2 text-center text-sm font-bold text-red-600 hover:bg-red-100"
                >
                  ออกจากระบบ
                </button>
              ) : (
                <Link href="/login" className="flex-1 rounded-lg bg-[#4FD1C5] py-2 text-center text-sm font-bold text-white hover:bg-[#319795]">เข้าสู่ระบบ</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
