import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import StatusBadge from '../../Components/StatusBadge';
import ClarificationThread from '../../Components/ClarificationThread';

const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors dark:[color-scheme:dark]";

export default function ClarificationDetail({ clarification }) {
  const document = clarification.document;

  const [needsSupplier, setNeedsSupplier] = useState('');
  const [question, setQuestion] = useState('');
  const [staffNote, setStaffNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSendToSupplier = (e) => {
    e.preventDefault();
    if (!question.trim()) {
      alert('Pertanyaan klarifikasi wajib diisi.');
      return;
    }
    setSubmitting(true);
    router.put(`/staff/clarifications/${clarification.id}/request`, { question, staff_note: staffNote }, {
      onFinish: () => setSubmitting(false),
    });
  };

  const handleSkipSupplier = (e) => {
    e.preventDefault();
    if (!staffNote.trim()) {
      alert('Catatan wajib diisi untuk menjelaskan mengapa Supplier tidak perlu dilibatkan.');
      return;
    }
    setSubmitting(true);
    router.put(`/staff/clarifications/${clarification.id}/skip`, { staff_note: staffNote }, {
      onFinish: () => setSubmitting(false),
    });
  };

  return (
    <Layout title={`Klarifikasi Dokumen #${document.document_number}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Klarifikasi Dokumen #{document.document_number}</h1>
        <StatusBadge status={document.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Riwayat Klarifikasi</h2>
            <ClarificationThread clarifications={[clarification]} />
          </div>

          {clarification.status === 'awaiting_staff_request' && (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Apakah klarifikasi ini perlu melibatkan Supplier?</h2>
              <div className="flex gap-3">
                <button type="button" onClick={() => setNeedsSupplier('tidak_perlu')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${needsSupplier === 'tidak_perlu' ? 'bg-green-600 text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'}`}>Tidak Perlu</button>
                <button type="button" onClick={() => setNeedsSupplier('perlu')} className={`flex-1 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer ${needsSupplier === 'perlu' ? 'bg-amber-600 text-white' : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10'}`}>Perlu</button>
              </div>

              {needsSupplier === 'perlu' && (
                <form onSubmit={handleSendToSupplier} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pertanyaan untuk Supplier (wajib)</label>
                    <textarea value={question} onChange={e => setQuestion(e.target.value)} className={inputClass} rows={3} placeholder="Jelaskan kekurangan dokumen dan apa yang perlu dilengkapi Supplier..." required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan (opsional)</label>
                    <textarea value={staffNote} onChange={e => setStaffNote(e.target.value)} className={inputClass} rows={2} placeholder="Catatan tambahan..." />
                  </div>
                  <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer">
                    {submitting ? 'Mengirim...' : 'Kirim ke Supplier'}
                  </button>
                </form>
              )}

              {needsSupplier === 'tidak_perlu' && (
                <form onSubmit={handleSkipSupplier} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Catatan (wajib)</label>
                    <textarea value={staffNote} onChange={e => setStaffNote(e.target.value)} className={inputClass} rows={3} placeholder="Jelaskan mengapa Supplier tidak perlu dilibatkan..." required />
                  </div>
                  <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer">
                    {submitting ? 'Memproses...' : 'Teruskan ke Manager'}
                  </button>
                </form>
              )}
            </div>
          )}

          {clarification.status === 'awaiting_supplier_answer' && (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Menunggu jawaban dari Supplier.</p>
            </div>
          )}

          {clarification.status === 'awaiting_manager_review' && (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Menunggu jawaban dari Manager.</p>
            </div>
          )}

          {clarification.status === 'awaiting_admin_ack' && (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Manager sudah menjawab. Menunggu konfirmasi Admin.</p>
            </div>
          )}

          {clarification.status === 'resolved' && (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Klarifikasi selesai. Dokumen sudah kembali ke antrian validasi Manager.</p>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Dokumen</h2>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-gray-500 dark:text-gray-400">Supplier</dt><dd className="text-gray-900 dark:text-white mt-1">{document.supplier?.company_name}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400">Jenis Barang</dt><dd className="text-gray-900 dark:text-white mt-1">{document.goods_type}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400">Nilai Barang</dt><dd className="text-gray-900 dark:text-white mt-1">{document.currency} {Number(document.goods_value).toLocaleString('id-ID')}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
}
