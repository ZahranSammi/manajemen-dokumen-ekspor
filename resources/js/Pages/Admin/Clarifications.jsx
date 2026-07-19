import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from '../../Components/Layout';

export default function Clarifications({ clarifications }) {
  return (
    <Layout title="Klarifikasi Menunggu Konfirmasi">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Klarifikasi Menunggu Konfirmasi</h1>
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
        {!clarifications?.data?.length ? (
          <div className="text-center text-gray-500 py-12">Tidak ada klarifikasi yang menunggu konfirmasi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-left">
                  <th className="pb-3 font-medium">No. Dokumen</th>
                  <th className="pb-3 font-medium">Supplier</th>
                  <th className="pb-3 font-medium">Jawaban Manager</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {clarifications.data.map(c => (
                  <tr key={c.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-100/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{c.document?.document_number}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{c.document?.supplier?.company_name || '-'}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">{c.manager_response || '-'}</td>
                    <td className="py-3">
                      <Link href={`/admin/clarifications/${c.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm">Detail</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {clarifications.links && (
              <div className="flex gap-1 mt-4 flex-wrap">
                {clarifications.links.map((link, i) => (
                  <Link
                    key={i}
                    href={link.url || '#'}
                    className={`px-3 py-1 rounded text-sm transition-colors ${link.active ? 'bg-indigo-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/5'} ${!link.url ? 'opacity-30 pointer-events-none' : ''}`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
