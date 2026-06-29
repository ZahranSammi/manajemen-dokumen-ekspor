import React from 'react';
import { router, Link } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import StatusBadge from '../../Components/StatusBadge';

export default function DocumentDetail({ document }) {
  const canPrepare = document.status === 'validated';
  const canArchive = document.status === 'ready_to_archive';

  const handlePrepare = () => {
    if (confirm('Siapkan dokumen ini untuk diarsipkan?')) {
      router.put(`/admin/documents/${document.id}/prepare`);
    }
  };

  const handleArchive = () => {
    if (confirm('Arsipkan dokumen ini? Tindakan ini bersifat final.')) {
      router.put(`/admin/documents/${document.id}/archive`);
    }
  };

  return (
    <Layout title={`Dokumen #${document.document_number}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-white">Detail Dokumen</h1>
        <div className="flex items-center gap-3">
          <StatusBadge status={document.status} />
          {canPrepare && (
            <button onClick={handlePrepare} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 transition-colors">Siapkan Dokumen</button>
          )}
          {canArchive && (
            <button onClick={handleArchive} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">Arsipkan</button>
          )}
        </div>
      </div>

      {canPrepare && (
        <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
          <div className="text-cyan-400 font-medium text-sm">Langkah 1: Menyiapkan Dokumen</div>
          <div className="text-cyan-300/70 text-sm mt-1">Review dokumen dan file lampiran, lalu klik "Siapkan Dokumen" untuk menandai siap diarsipkan.</div>
        </div>
      )}

      {canArchive && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <div className="text-green-400 font-medium text-sm">Langkah 2: Mengarsipkan Dokumen</div>
          <div className="text-green-300/70 text-sm mt-1">Dokumen sudah disiapkan. Klik "Arsipkan" untuk mengarsipkan dokumen secara final.</div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Informasi Dokumen</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-400">Nomor Dokumen</dt><dd className="text-white font-medium mt-1">{document.document_number}</dd></div>
              <div><dt className="text-gray-400">Tanggal</dt><dd className="text-white mt-1">{new Date(document.document_date).toLocaleDateString('id-ID')}</dd></div>
              <div><dt className="text-gray-400">Supplier</dt><dd className="text-white mt-1">{document.supplier?.company_name}</dd></div>
              <div><dt className="text-gray-400">Negara Asal</dt><dd className="text-white mt-1">{document.origin_country}</dd></div>
              <div><dt className="text-gray-400">Jenis Barang</dt><dd className="text-white mt-1">{document.goods_type}</dd></div>
              <div><dt className="text-gray-400">Nilai Barang</dt><dd className="text-white mt-1">{document.currency} {Number(document.goods_value).toLocaleString('id-ID')}</dd></div>
            </dl>
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">File Lampiran</h2>
            {document.files?.length > 0 ? (
              <div className="space-y-2">
                {document.files.map(file => (
                  <a key={file.id} href={`/files/${file.id}/download`} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="text-white text-sm">{file.file_name} <span className="text-gray-500">({(file.file_size / 1024).toFixed(1)} KB)</span></div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </a>
                ))}
              </div>
            ) : <p className="text-gray-500 text-sm">Tidak ada file.</p>}
          </div>

          {document.reports?.length > 0 && (
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Laporan Terkait</h2>
              <div className="space-y-2">
                {document.reports.map(report => (
                  <div key={report.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <div className="text-white text-sm">Laporan #{report.id}</div>
                      <div className="text-gray-500 text-xs">Oleh: {report.creator?.name} &middot; {new Date(report.created_at).toLocaleDateString('id-ID')}</div>
                    </div>
                    {report.report_file_path !== 'pending' && (
                      <a href={`/reports/${report.id}/download`} className="text-indigo-400 hover:text-indigo-300 text-sm">Unduh</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">Audit Trail</h2>
              <Link href={`/admin/documents/${document.id}/audit-log`} className="text-xs text-indigo-400 hover:text-indigo-300">Detail</Link>
            </div>
            {document.audit_logs?.length > 0 ? (
              <div className="space-y-4">
                {document.audit_logs.map(log => (
                  <div key={log.id} className="relative pl-4 border-l-2 border-white/10">
                    <div className="text-white text-sm font-medium capitalize">{log.action.replace(/_/g, ' ')}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{log.actor?.name} &middot; {new Date(log.created_at).toLocaleString('id-ID')}</div>
                    {log.notes && <div className="text-gray-500 text-xs mt-1">{log.notes}</div>}
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-sm">Belum ada riwayat.</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
}
