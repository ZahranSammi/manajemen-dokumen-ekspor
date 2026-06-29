import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';

const NAV_ITEMS = {
  supplier: [
    { label: 'Dasbor', href: '/dashboard', icon: 'home' },
    { label: 'Dokumen Saya', href: '/supplier/documents', icon: 'file' },
    { label: 'Kirim Dokumen', href: '/supplier/documents/create', icon: 'upload' },
  ],
  staff_impor: [
    { label: 'Dasbor', href: '/dashboard', icon: 'home' },
    { label: 'Inbox', href: '/staff/inbox', icon: 'inbox' },
  ],
  manager_impor: [
    { label: 'Dasbor', href: '/dashboard', icon: 'home' },
    { label: 'Antrian Validasi', href: '/manager/queue', icon: 'clipboard-check' },
    { label: 'Tervalidasi', href: '/manager/validated', icon: 'check' },
    { label: 'Laporan', href: '/manager/reports', icon: 'report' },
  ],
  admin: [
    { label: 'Dasbor', href: '/dashboard', icon: 'home' },
    { label: 'Laporan Masuk', href: '/admin/reports', icon: 'report' },
    { label: 'Semua Dokumen', href: '/admin/documents', icon: 'files' },
  ],
};

const ROLE_LABELS = {
  supplier: 'Supplier',
  staff_impor: 'Staff Impor',
  manager_impor: 'Manager Impor',
  admin: 'Admin',
};

const ROLE_COLORS = {
  supplier: { bg: '#d1fae5', color: '#065f46' },
  staff_impor: { bg: '#fef3c7', color: '#92400e' },
  manager_impor: { bg: '#dbeafe', color: '#1e40af' },
  admin: { bg: '#fee2e2', color: '#991b1b' },
};

export default function Layout({ children, title }) {
  const { auth, unreadNotifications, flash } = usePage().props;
  const user = auth.user;
  const navItems = NAV_ITEMS[user.role] || [];
  const roleColor = ROLE_COLORS[user.role];
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await fetch('/notifications');
      const data = await res.json();
      setNotifications(data.data || []);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <Head title={`${title} - Sistem Manajemen Dokumen Impor`} />

      <nav className="border-b border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">IM</div>
                <span className="font-semibold text-white hidden sm:block">Dokumen Impor</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => { setShowNotif(!showNotif); if (!showNotif) loadNotifications(); }}
                  className="relative p-2 text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {(unreadNotifications > 0) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadNotifications}</span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-white/10 flex justify-between items-center">
                      <span className="text-sm font-medium">Notifikasi</span>
                      <button onClick={() => { fetch('/notifications/read-all', { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content } }); }} className="text-xs text-indigo-400 hover:text-indigo-300">Tandai semua dibaca</button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">Tidak ada notifikasi</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-white/5 text-sm ${!n.read_at ? 'bg-indigo-500/5' : ''}`}>
                          <div className="font-medium text-white">{n.title}</div>
                          <div className="text-gray-400 mt-1">{n.message}</div>
                          <div className="text-gray-600 text-xs mt-1">{new Date(n.created_at).toLocaleString('id-ID')}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-white">{user.name}</div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: roleColor.bg, color: roleColor.color }}>{ROLE_LABELS[user.role]}</span>
                </div>
                <Link href="/logout" method="post" as="button" className="px-3 py-1.5 rounded-lg border border-white/10 text-red-400 text-sm hover:bg-red-500/10 transition-colors">Keluar</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className="md:hidden border-b border-white/5 bg-white/[0.01] overflow-x-auto">
        <div className="flex px-4 gap-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`px-3 py-2 text-sm whitespace-nowrap ${location.pathname === item.href ? 'text-white border-b-2 border-indigo-500' : 'text-gray-400'}`}>{item.label}</Link>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {flash?.success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">{flash.success}</div>
        )}
        {flash?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{flash.error}</div>
        )}
        {children}
      </main>
    </div>
  );
}
