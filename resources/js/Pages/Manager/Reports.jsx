import React from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';

export default function Reports({ reports }) {
  const handleSend = (reportId) => {
    if (confirm('Kirim laporan ini ke Admin?')) {
      router.post(`/manager/reports/${reportId}/send`);
    }
  };

  return (
    <Layout title="Laporan Saya">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Laporan Saya</h1>
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
        {(!reports?.data?.length) ? (
          <p className="text-gray-500 dark:text-gray-500 text-center py-12">Belum ada laporan.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-white/10 text-gray-555 dark:text-gray-400 text-left">
              <th className="pb-3 font-medium">ID</th>
              <th className="pb-3 font-medium">Dokumen</th>
              <th className="pb-3 font-medium">Supplier</th>
              <th className="pb-3 font-medium">Dibuat</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Aksi</th>
            </tr></thead>
            <tbody>
              {reports.data.map(report => (
                <tr key={report.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-100/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 text-gray-900 dark:text-white">#{report.id}</td>
                  <td className="py-3 text-gray-900 dark:text-white font-medium">{report.document?.document_number}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{report.document?.supplier?.company_name}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{new Date(report.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="py-3">
                    {report.sent_at ? (
                      <span className="text-green-600 dark:text-green-400 text-xs font-medium bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">Terkirim</span>
                    ) : report.report_file_path === 'pending' ? (
                      <span className="text-yellow-750 dark:text-yellow-400 text-xs font-medium bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">Diproses</span>
                    ) : (
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-medium bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Siap Kirim</span>
                    )}
                  </td>
                  <td className="py-3 flex gap-2">
                    {report.report_file_path !== 'pending' && (
                      <a href={`/reports/${report.id}/download`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm">Unduh</a>
                    )}
                    {!report.sent_at && report.report_file_path !== 'pending' && (
                      <button onClick={() => handleSend(report.id)} className="text-green-600 dark:text-green-400 hover:text-green-500 dark:hover:text-green-300 text-sm cursor-pointer">Kirim</button>
                    )}
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
