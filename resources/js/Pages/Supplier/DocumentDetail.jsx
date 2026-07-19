import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import StatusBadge from '../../Components/StatusBadge';
import ClarificationThread from '../../Components/ClarificationThread';

const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors dark:[color-scheme:dark]";

function ReviseForm({ document }) {
  const { data, setData, processing, errors } = useForm({
    document_number: document.document_number || '',
    document_date: document.document_date?.split('T')[0] || '',
    goods_type: document.goods_type || '',
    origin_country: document.origin_country || '',
    goods_value: document.goods_value || '',
    currency: document.currency || 'IDR',
    files: [],
  });
  const [fileNames, setFileNames] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setData('files', files);
    setFileNames(files.map(f => f.name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('document_number', data.document_number);
    formData.append('document_date', data.document_date);
    formData.append('goods_type', data.goods_type);
    formData.append('origin_country', data.origin_country);
    formData.append('goods_value', data.goods_value);
    formData.append('currency', data.currency);
    data.files.forEach((file, i) => formData.append(`files[${i}]`, file));

    setSubmitting(true);
    router.post(`/supplier/documents/${document.id}/revise`, formData, {
      forceFormData: true,
      onFinish: () => setSubmitting(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 space-y-5 shadow-sm dark:shadow-none">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revisi & Kirim Ulang Dokumen</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nomor Dokumen</label>
        <input type="text" value={data.document_number} onChange={e => setData('document_number', e.target.value)} className={inputClass} required />
        {errors.document_number && <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.document_number}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tanggal Dokumen</label>
          <input type="date" value={data.document_date} onChange={e => setData('document_date', e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Negara Asal</label>
          <input type="text" value={data.origin_country} onChange={e => setData('origin_country', e.target.value)} className={inputClass} required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jenis Barang</label>
        <input type="text" value={data.goods_type} onChange={e => setData('goods_type', e.target.value)} className={inputClass} required />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nilai Barang</label>
          <input type="number" step="0.01" value={data.goods_value} onChange={e => setData('goods_value', e.target.value)} className={inputClass} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mata Uang</label>
          <select value={data.currency} onChange={e => setData('currency', e.target.value)} className={`${inputClass} bg-white dark:bg-gray-800`}>
            <option value="IDR">IDR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="SGD">SGD</option><option value="CNY">CNY</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tambah File Baru (opsional)</label>
        <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFiles} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer" />
        {fileNames.length > 0 && (
          <div className="mt-2 space-y-1">
            {fileNames.map((name, i) => (
              <div key={i} className="text-sm text-gray-600 dark:text-gray-400">{name}</div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" disabled={submitting || processing} className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer">
        {submitting ? 'Mengirim...' : 'Kirim Ulang Dokumen'}
      </button>
    </form>
  );
}

function AnswerClarificationForm({ clarification }) {
  const [answer, setAnswer] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      alert('Jawaban wajib diisi.');
      return;
    }
    setProcessing(true);
    router.put(`/supplier/clarifications/${clarification.id}/answer`, { answer }, {
      onFinish: () => setProcessing(false),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-white/[0.02] border border-amber-500/20 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Klarifikasi Diperlukan</h2>
      <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-700 dark:text-amber-400">
        {clarification.manager_note}
      </div>
      {clarification.question && (
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">Pertanyaan Staff:</span> {clarification.question}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Jawaban Anda (wajib)</label>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)} className={inputClass} rows={3} placeholder="Jelaskan kelengkapan/koreksi yang diminta..." required />
      </div>
      <button type="submit" disabled={processing} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer">
        {processing ? 'Mengirim...' : 'Kirim Jawaban'}
      </button>
    </form>
  );
}

export default function DocumentDetail({ document }) {
  const pendingClarification = document.clarifications?.find(c => c.status === 'awaiting_supplier_answer');

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
                <div className="text-red-600 dark:text-red-400 text-sm font-medium">Alasan Penolakan (Tidak Sesuai):</div>
                <div className="text-red-700 dark:text-red-300 text-sm mt-1">{document.rejection_reason}</div>
              </div>
            )}
          </div>

          {document.status === 'rejected_by_staff' && <ReviseForm document={document} />}

          {pendingClarification && <AnswerClarificationForm clarification={pendingClarification} />}

          {document.clarifications?.length > 0 && (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Riwayat Klarifikasi</h2>
              <ClarificationThread clarifications={document.clarifications} />
            </div>
          )}

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
