import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import StatusBadge from '../../Components/StatusBadge';
import ClarificationThread from '../../Components/ClarificationThread';

export default function DocumentDetail({ document }) {
  const canEdit = ['submitted', 'staff_processing'].includes(document.status);
  const canForward = document.status === 'staff_processing';
  const canReject = ['submitted', 'staff_processing'].includes(document.status);

  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    document_number: document.document_number || '',
    document_date: document.document_date?.split('T')[0] || '',
    goods_type: document.goods_type || '',
    origin_country: document.origin_country || '',
    goods_value: document.goods_value || '',
    currency: document.currency || 'IDR',
    notes: '',
  });

  const handleSave = (e) => {
    e.preventDefault();
    put(`/staff/documents/${document.id}/process`);
  };

  const handleForward = () => {
    if (confirm('Teruskan dokumen ini ke Manager untuk validasi?')) {
      router.post(`/staff/documents/${document.id}/forward`);
    }
  };

  const handleReject = (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Alasan penolakan wajib diisi.');
      return;
    }
    setRejecting(true);
    router.put(`/staff/documents/${document.id}/reject`, { reason: rejectReason }, {
      onFinish: () => setRejecting(false),
    });
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors disabled:opacity-50 dark:[color-scheme:dark]";

  return (
    <Layout title={`Dokumen #${document.document_number}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Detail Dokumen</h1>
        <StatusBadge status={document.status} />
      </div>

      {document.rejection_reason && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="text-red-700 dark:text-red-400 font-medium text-sm">Dokumen Ditolak</div>
          <div className="text-red-600 dark:text-red-300 text-sm mt-1">{document.rejection_reason}</div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Metadata Dokumen</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nomor Dokumen</label>
                <input type="text" value={data.document_number} onChange={e => setData('document_number', e.target.value)} className={inputClass} disabled={!canEdit} />
                {errors.document_number && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.document_number}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tanggal</label>
                <input type="date" value={data.document_date} onChange={e => setData('document_date', e.target.value)} className={inputClass} disabled={!canEdit} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jenis Barang</label>
              <input type="text" value={data.goods_type} onChange={e => setData('goods_type', e.target.value)} className={inputClass} disabled={!canEdit} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Negara Asal</label>
                <input type="text" value={data.origin_country} onChange={e => setData('origin_country', e.target.value)} className={inputClass} disabled={!canEdit} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nilai Barang</label>
                  <input type="number" step="0.01" value={data.goods_value} onChange={e => setData('goods_value', e.target.value)} className={inputClass} disabled={!canEdit} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mata Uang</label>
                  <select value={data.currency} onChange={e => setData('currency', e.target.value)} className={`${inputClass} bg-white dark:bg-gray-800`} disabled={!canEdit}>
                    <option value="IDR">IDR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="SGD">SGD</option><option value="CNY">CNY</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan</label>
              <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} className={inputClass} rows={2} placeholder="Catatan tambahan..." disabled={!canEdit} />
            </div>

            {canEdit && (
              <div className="flex gap-3">
                <button type="submit" disabled={processing} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer">
                  {processing ? 'Menyimpan...' : 'Simpan & Proses'}
                </button>
                {canForward && (
                  <button type="button" onClick={handleForward} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors cursor-pointer">
                    Teruskan ke Manager
                  </button>
                )}
                {canReject && (
                  <button type="button" onClick={() => setShowReject(v => !v)} className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors cursor-pointer">
                    Tolak (Tidak Sesuai)
                  </button>
                )}
              </div>
            )}
          </form>

          {canReject && showReject && (
            <form onSubmit={handleReject} className="mt-6 bg-white dark:bg-white/[0.02] border border-red-500/20 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tolak Dokumen (Tidak Sesuai)</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Alasan Penolakan (wajib)</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className={inputClass} rows={3} placeholder="Jelaskan mengapa dokumen tidak sesuai..." required />
              </div>
              <button type="submit" disabled={rejecting} className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 transition-colors cursor-pointer">
                {rejecting ? 'Memproses...' : 'Konfirmasi Penolakan ke Supplier'}
              </button>
            </form>
          )}

          {document.clarifications?.length > 0 && (
            <div className="mt-6 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Riwayat Klarifikasi</h2>
              <ClarificationThread clarifications={document.clarifications} />
            </div>
          )}

          <div className="mt-6 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">File Lampiran</h2>
            {document.files?.length > 0 ? (
              <div className="space-y-2">
                {document.files.map(file => (
                  <a key={file.id} href={`/files/${file.id}/download`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-100 dark:border-transparent">
                    <div className="text-gray-900 dark:text-white text-sm">{file.file_name} <span className="text-gray-500 dark:text-gray-500">({(file.file_size / 1024).toFixed(1)} KB)</span></div>
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
                    <div className="text-gray-900 dark:text-white text-sm font-medium capitalize">{log.action.replace(/_/g, ' ')}</div>
                    <div className="text-gray-555 dark:text-gray-400 text-xs mt-0.5">{log.actor?.name} &middot; {new Date(log.created_at).toLocaleString('id-ID')}</div>
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
