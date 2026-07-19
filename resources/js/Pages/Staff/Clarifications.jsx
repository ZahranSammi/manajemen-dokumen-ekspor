import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from '../../Components/Layout';

const CLARIFICATION_STATUS_LABEL = {
  awaiting_staff_request: 'Perlu Diputuskan (Libatkan Supplier?)',
  awaiting_supplier_answer: 'Menunggu Jawaban Supplier',
  awaiting_manager_review: 'Menunggu Jawaban Manager',
  awaiting_admin_ack: 'Menunggu Konfirmasi Admin',
  resolved: 'Selesai',
};

export default function Clarifications({ documents }) {
  return (
    <Layout title="Klarifikasi Dokumen Tidak Lengkap">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Klarifikasi Dokumen Tidak Lengkap</h1>
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
        {!documents?.data?.length ? (
          <div className="text-center text-gray-500 py-12">Tidak ada dokumen yang perlu diklarifikasi.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-left">
                  <th className="pb-3 font-medium">No. Dokumen</th>
                  <th className="pb-3 font-medium">Supplier</th>
                  <th className="pb-3 font-medium">Catatan Manager</th>
                  <th className="pb-3 font-medium">Status Klarifikasi</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {documents.data.map(doc => (
                  <tr key={doc.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-100/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{doc.document_number}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{doc.supplier?.company_name || '-'}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">{doc.latest_clarification?.manager_note || '-'}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{CLARIFICATION_STATUS_LABEL[doc.latest_clarification?.status] || '-'}</td>
                    <td className="py-3">
                      {doc.latest_clarification && (
                        <Link href={`/staff/clarifications/${doc.latest_clarification.id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 text-sm">Detail</Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {documents.links && (
              <div className="flex gap-1 mt-4 flex-wrap">
                {documents.links.map((link, i) => (
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
