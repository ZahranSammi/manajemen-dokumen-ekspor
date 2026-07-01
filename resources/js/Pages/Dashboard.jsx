import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from '../Components/Layout';
import StatusBadge from '../Components/StatusBadge';

const STAT_LABELS = {
  supplier: { submitted: 'Diajukan', processing: 'Dalam Proses', validated: 'Tervalidasi', rejected: 'Ditolak' },
  staff_impor: { inbox: 'Inbox Baru', processing: 'Sedang Diproses', returned: 'Dikembalikan', forwarded: 'Diteruskan' },
  manager_impor: { pending: 'Menunggu Validasi', validated: 'Disetujui', rejected: 'Ditolak', reports: 'Total Laporan' },
  admin: { total_documents: 'Total Dokumen', validated: 'Tervalidasi', ready_to_archive: 'Siap Arsip', archived: 'Diarsipkan' },
};

const STAT_COLORS = {
  submitted: 'text-blue-400', processing: 'text-yellow-400', validated: 'text-green-400', rejected: 'text-red-400',
  inbox: 'text-blue-400', returned: 'text-orange-400', forwarded: 'text-purple-400',
  pending: 'text-purple-400', reports: 'text-indigo-400',
  total_documents: 'text-indigo-400', ready_to_archive: 'text-cyan-400', archived: 'text-gray-400',
};

const LINK_MAP = {
  supplier: '/supplier/documents',
  staff_impor: '/staff/inbox',
  manager_impor: '/manager/queue',
  admin: '/admin/documents',
};

export default function Dashboard({ auth, stats, recentDocuments, unreadNotifications }) {
  const user = auth.user;
  const labels = STAT_LABELS[user.role] || {};

  return (
    <Layout title="Dasbor">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Selamat Datang, {user.name}!</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Ringkasan aktivitas dokumen impor Anda.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(stats || {}).map(([key, value]) => (
          <div key={key} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-5 shadow-sm dark:shadow-none">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{labels[key] || key}</div>
            <div className={`text-3xl font-bold ${STAT_COLORS[key] || 'text-gray-900 dark:text-white'}`}>{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Dokumen Terbaru</h2>
          <Link href={LINK_MAP[user.role] || '/dashboard'} className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">Lihat semua</Link>
        </div>
        {(!recentDocuments || recentDocuments.length === 0) ? (
          <p className="text-gray-500 dark:text-gray-500 text-center py-8">Belum ada dokumen.</p>
        ) : (
          <div className="space-y-3">
            {recentDocuments.map(doc => (
              <div key={doc.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-white/5 last:border-0">
                <div>
                  <div className="text-gray-900 dark:text-white font-medium">{doc.document_number}</div>
                  <div className="text-gray-500 dark:text-gray-500 text-sm">{doc.supplier?.company_name} &middot; {new Date(doc.document_date).toLocaleDateString('id-ID')}</div>
                </div>
                <StatusBadge status={doc.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
