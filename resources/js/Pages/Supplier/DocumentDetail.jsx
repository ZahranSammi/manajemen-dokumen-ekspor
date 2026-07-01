import React from 'react';
import Layout from '../../Components/Layout';
import StatusBadge from '../../Components/StatusBadge';

export default function DocumentDetail({ document }) {
  return (
    <Layout title={`Dokumen #${document.document_number}`}>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Detail Dokumen</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Dokumen</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500 dark:text-gray-400">Nomor Dokumen</dt><dd className="text-gray-900 dark:text-white font-medium mt-1">{document.document_number}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400">Status</dt><dd className="mt-1"><StatusBadge status={document.status} /></dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400">Tanggal</dt><dd className="text-gray-900 dark:text-white mt-1">{new Date(document.document_date).toLocaleDateString('id-ID')}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400">Negara Asal</dt><dd className="text-gray-900 dark:text-white mt-1">{document.origin_country}</dd></div>
              <div><dt className="text-gray-555 dark:text-gray-400">Jenis Barang</dt><dd className="text-gray-900 dark:text-white mt-1">{document.goods_type}</dd></div>
              <div><dt className="text-gray-555 dark:text-gray-400">Nilai Barang</dt><dd className="text-gray-900 dark:text-white mt-1">{document.currency} {Number(document.goods_value).toLocaleString('id-ID')}</dd></div>
            </dl>
            {document.rejection_reason && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="text-red-600 dark:text-red-400 text-sm font-medium">Alasan Penolakan:</div>
                <div className="text-red-700 dark:text-red-300 text-sm mt-1">{document.rejection_reason}</div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">File Lampiran</h2>
            {document.files?.length > 0 ? (
              <div className="space-y-2">
                {document.files.map(file => (
                  <a key={file.id} href={`/files/${file.id}/download`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-transparent">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      <div>
                        <div className="text-gray-900 dark:text-white text-sm">{file.file_name}</div>
                        <div className="text-gray-500 dark:text-gray-500 text-xs">{(file.file_size / 1024).toFixed(1)} KB</div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </a>
                ))}
              </div>
            ) : <p className="text-gray-500 dark:text-gray-500 text-sm">Tidak ada file.</p>}
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Riwayat</h2>
            {document.audit_logs?.length > 0 ? (
              <div className="space-y-4">
                {document.audit_logs.map(log => (
                  <div key={log.id} className="relative pl-4 border-l-2 border-gray-200 dark:border-white/10">
                    <div className="text-gray-900 dark:text-white text-sm font-medium">{log.action.replace(/_/g, ' ')}</div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{log.actor?.name} &middot; {new Date(log.created_at).toLocaleString('id-ID')}</div>
                    {log.notes && <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">{log.notes}</div>}
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 dark:text-gray-500 text-sm">Belum ada riwayat.</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
