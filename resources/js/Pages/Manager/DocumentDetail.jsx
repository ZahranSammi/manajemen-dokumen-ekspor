import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import StatusBadge from '../../Components/StatusBadge';
import ClarificationThread from '../../Components/ClarificationThread';

export default function DocumentDetail({ document }) {
  const canValidate = document.status === 'pending_validation';
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleValidate = (e) => {
    e.preventDefault();
    if (decision === 'reject_incomplete' && !reason.trim()) {
      alert('Catatan ketidaklengkapan wajib diisi.');
      return;
    }
    setProcessing(true);
    router.post(`/manager/documents/${document.id}/validate`, { decision, reason }, {
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <Layout title={`Validasi Dokumen #${document.document_number}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Review Dokumen</h1>
        <StatusBadge status={document.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Dokumen</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500 dark:text-gray-400">Nomor Dokumen</dt><dd className="text-gray-900 dark:text-white font-medium mt-1">{document.document_number}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400">Tanggal</dt><dd className="text-gray-900 dark:text-white mt-1">{new Date(document.document_date).toLocaleDateString('id-ID')}</dd></div>
              <div><dt className="text-gray-555 dark:text-gray-400">Supplier</dt><dd className="text-gray-900 dark:text-white mt-1">{document.supplier?.company_name}</dd></div>
              <div><dt className="text-gray-555 dark:text-gray-400">Negara Asal</dt><dd className="text-gray-900 dark:text-white mt-1">{document.origin_country}</dd></div>
              <div><dt className="text-gray-555 dark:text-gray-400">Jenis Barang</dt><dd className="text-gray-900 dark:text-white mt-1">{document.goods_type}</dd></div>
              <div><dt className="text-gray-555 dark:text-gray-400">Nilai Barang</dt><dd className="text-gray-900 dark:text-white mt-1">{document.currency} {Number(document.goods_value).toLocaleString('id-ID')}</dd></div>
            </dl>
          </div>

          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">File Lampiran</h2>
            {document.files?.length > 0 ? (
              <div className="space-y-2">
                {document.files.map(file => (
                  <a key={file.id} href={`/files/${file.id}/download`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-transparent">
                    <div className="text-gray-900 dark:text-white text-sm">{file.file_name} <span className="text-gray-550 dark:text-gray-550">({(file.file_size / 1024).toFixed(1)} KB)</span></div>
                    <svg className="w-5 h-5 text-gray-400 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </a>
                ))}
              </div>
            ) : <p className="text-gray-555 dark:text-gray-500 text-sm">Tidak ada file.</p>}
          </div>

          {canValidate && (
            <form onSubmit={handleValidate} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Keputusan Validasi</h2>
              <div className="flex gap-3">
                <button type="button" onClick={() => setDecision('approve')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${decision === 'approve' ? 'bg-green-600 text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'}`}>Setujui (Lengkap)</button>
                <button type="button" onClick={() => setDecision('reject_incomplete')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${decision === 'reject_incomplete' ? 'bg-red-600 text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'}`}>Tolak (Tidak Lengkap)</button>
              </div>
              {decision === 'reject_incomplete' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan Ketidaklengkapan (wajib)</label>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-red-500 outline-none" rows={3} placeholder="Jelaskan apa yang kurang lengkap pada dokumen ini..." required />
                </div>
              )}
              {decision && (
                <button type="submit" disabled={processing} className={`w-full py-3 rounded-xl font-medium transition-colors disabled:opacity-50 cursor-pointer ${decision === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                  {processing ? 'Memproses...' : decision === 'approve' ? 'Konfirmasi Persetujuan' : 'Kirim untuk Klarifikasi'}
                </button>
              )}
            </form>
          )}

          {document.clarifications?.length > 0 && (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Riwayat Klarifikasi</h2>
              <ClarificationThread clarifications={document.clarifications} />
            </div>
          )}
        </div>

        <div>
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Riwayat</h2>
            {document.audit_logs?.length > 0 ? (
              <div className="space-y-4">
                {document.audit_logs.map(log => (
                  <div key={log.id} className="relative pl-4 border-l-2 border-gray-200 dark:border-white/10">
                    <div className="text-gray-900 dark:text-white text-sm font-medium capitalize">{log.action.replace(/_/g, ' ')}</div>
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
