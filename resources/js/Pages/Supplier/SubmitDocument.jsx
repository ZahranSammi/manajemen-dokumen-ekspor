import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import Layout from '../../Components/Layout';

export default function SubmitDocument() {
  const { data, setData, post, processing, errors, reset } = useForm({
    document_number: '',
    document_date: '',
    goods_type: '',
    origin_country: '',
    goods_value: '',
    currency: 'IDR',
    files: [],
  });

  const [fileNames, setFileNames] = useState([]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    setData('files', files);
    setFileNames(files.map(f => f.name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('document_number', data.document_number);
    formData.append('document_date', data.document_date);
    formData.append('goods_type', data.goods_type);
    formData.append('origin_country', data.origin_country);
    formData.append('goods_value', data.goods_value);
    formData.append('currency', data.currency);
    data.files.forEach((file, i) => formData.append(`files[${i}]`, file));

    post('/supplier/documents', {
      data: formData,
      forceFormData: true,
      onSuccess: () => { reset(); setFileNames([]); },
    });
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors";

  return (
    <Layout title="Kirim Dokumen">
      <h1 className="text-2xl font-semibold text-white mb-6">Kirim Dokumen Baru</h1>
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Nomor Dokumen</label>
            <input type="text" value={data.document_number} onChange={e => setData('document_number', e.target.value)} className={inputClass} placeholder="IMP-2026-001" required />
            {errors.document_number && <p className="text-red-400 text-sm mt-1">{errors.document_number}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Tanggal Dokumen</label>
              <input type="date" value={data.document_date} onChange={e => setData('document_date', e.target.value)} className={inputClass} required />
              {errors.document_date && <p className="text-red-400 text-sm mt-1">{errors.document_date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Negara Asal</label>
              <input type="text" value={data.origin_country} onChange={e => setData('origin_country', e.target.value)} className={inputClass} placeholder="China" required />
              {errors.origin_country && <p className="text-red-400 text-sm mt-1">{errors.origin_country}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Jenis Barang</label>
            <input type="text" value={data.goods_type} onChange={e => setData('goods_type', e.target.value)} className={inputClass} placeholder="Elektronik, Tekstil, dll." required />
            {errors.goods_type && <p className="text-red-400 text-sm mt-1">{errors.goods_type}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Nilai Barang</label>
              <input type="number" step="0.01" value={data.goods_value} onChange={e => setData('goods_value', e.target.value)} className={inputClass} placeholder="0.00" required />
              {errors.goods_value && <p className="text-red-400 text-sm mt-1">{errors.goods_value}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Mata Uang</label>
              <select value={data.currency} onChange={e => setData('currency', e.target.value)} className={inputClass}>
                <option value="IDR">IDR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="SGD">SGD</option>
                <option value="CNY">CNY</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">File Dokumen (PDF/JPG/PNG, maks 10MB)</label>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFiles} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" required />
            {errors.files && <p className="text-red-400 text-sm mt-1">{errors.files}</p>}
            {errors['files.0'] && <p className="text-red-400 text-sm mt-1">{errors['files.0']}</p>}
            {fileNames.length > 0 && (
              <div className="mt-2 space-y-1">
                {fileNames.map((name, i) => (
                  <div key={i} className="text-sm text-gray-400 flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={processing} className="w-full py-3 px-4 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            {processing ? 'Mengirim...' : 'Kirim Dokumen'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
