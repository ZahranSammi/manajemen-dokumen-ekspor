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
    { label: 'Klarifikasi', href: '/staff/clarifications', icon: 'chat' },
  ],
  manager_impor: [
    { label: 'Dasbor', href: '/dashboard', icon: 'home' },
    { label: 'Antrian Validasi', href: '/manager/queue', icon: 'clipboard-check' },
    { label: 'Klarifikasi', href: '/manager/clarifications', icon: 'chat' },
    { label: 'Tervalidasi', href: '/manager/validated', icon: 'check' },
    { label: 'Laporan', href: '/manager/reports', icon: 'report' },
  ],
  admin: [
    { label: 'Dasbor', href: '/dashboard', icon: 'home' },
    { label: 'Klarifikasi', href: '/admin/clarifications', icon: 'chat' },
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

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const loadNotifications = async () => {
    try {
      const res = await fetch('/notifications');
      const data = await res.json();
      setNotifications(data.data || []);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 font-sans transition-colors duration-200">
      <Head title={`${title} - Sistem Manajemen Dokumen Impor`} />

      <nav className="border-b border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm">IM</div>
                <span className="font-semibold text-gray-900 dark:text-white hidden sm:block">Dokumen Impor</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {navItems.map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                        ? 'bg-gray-200/60 text-gray-900 dark:bg-white/10 dark:text-white font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                title={theme === 'dark' ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              >
                {theme === 'dark' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="m4.93 4.93 1.41 1.41" />
                    <path d="m17.66 17.66 1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="m6.34 17.66-1.41 1.41" />
                    <path d="m19.07 4.93-1.41 1.41" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
              <div className="relative">
                <button
                  onClick={() => { setShowNotif(!showNotif); if (!showNotif) loadNotifications(); }}
                  className="relative p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {(unreadNotifications > 0) && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadNotifications}</span>
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Notifikasi</span>
                      <button onClick={() => { fetch('/notifications/read-all', { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content } }); }} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Tandai semua dibaca</button>
                    </div>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">Tidak ada notifikasi</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-3 border-b border-gray-100 dark:border-white/5 text-sm ${!n.read_at ? 'bg-indigo-500/5 dark:bg-indigo-500/10' : ''}`}>
                          <div className="font-medium text-gray-900 dark:text-white">{n.title}</div>
                          <div className="text-gray-600 dark:text-gray-400 mt-1">{n.message}</div>
                          <div className="text-gray-400 dark:text-gray-600 text-xs mt-1">{new Date(n.created_at).toLocaleString('id-ID')}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: roleColor.bg, color: roleColor.color }}>{ROLE_LABELS[user.role]}</span>
                </div>
                <Link href="/logout" method="post" as="button" className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-red-500 dark:text-red-400 text-sm hover:bg-red-500/10 transition-colors">Keluar</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <div className="md:hidden border-b border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.01] overflow-x-auto">
        <div className="flex px-4 gap-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`px-3 py-2 text-sm whitespace-nowrap ${location.pathname === item.href ? 'text-indigo-600 dark:text-white border-b-2 border-indigo-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{item.label}</Link>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {flash?.success && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">{flash.success}</div>
        )}
        {flash?.error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">{flash.error}</div>
        )}
        {children}
      </main>
    </div>
  );
}
