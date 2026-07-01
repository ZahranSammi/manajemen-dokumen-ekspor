import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from '../../Components/Layout';

export default function Reports({ reports }) {
  return (
    <Layout title="Laporan Masuk">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Laporan Masuk</h1>
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
        {(!reports?.data?.length) ? (
          <p className="text-gray-500 dark:text-gray-500 text-center py-12">Belum ada laporan masuk.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-left">
              <th className="pb-3 font-medium">ID</th>
              <th className="pb-3 font-medium">Dokumen</th>
              <th className="pb-3 font-medium">Dari</th>
              <th className="pb-3 font-medium">Dikirim</th>
              <th className="pb-3 font-medium">Aksi</th>
            </tr></thead>
            <tbody>
              {reports.data.map(report => (
                <tr key={report.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-100/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 text-gray-900 dark:text-white">#{report.id}</td>
                  <td className="py-3"><Link href={`/admin/documents/${report.document_id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium">{report.document?.document_number}</Link></td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{report.creator?.name}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{report.sent_at ? new Date(report.sent_at).toLocaleString('id-ID') : '-'}</td>
                  <td className="py-3 flex gap-2">
                    <a href={`/reports/${report.id}/download`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm">Unduh</a>
                    <Link href={`/admin/documents/${report.document_id}`} className="text-green-600 dark:text-green-400 hover:text-green-550 dark:hover:text-green-300 text-sm">Review</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
