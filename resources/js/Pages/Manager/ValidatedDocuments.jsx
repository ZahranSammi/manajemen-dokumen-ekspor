import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import StatusBadge from '../../Components/StatusBadge';

export default function ValidatedDocuments({ documents }) {
  const [selected, setSelected] = useState([]);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreateReport = () => {
    if (selected.length === 0) {
      alert('Pilih minimal satu dokumen untuk membuat laporan.');
      return;
    }
    router.post('/manager/reports', { document_ids: selected }, {
      onSuccess: () => setSelected([]),
    });
  };

  return (
    <Layout title="Dokumen Tervalidasi">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dokumen Tervalidasi</h1>
        {selected.length > 0 && (
          <button onClick={handleCreateReport} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 cursor-pointer">
            Buat Laporan ({selected.length} dokumen)
          </button>
        )}
      </div>
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
        {(!documents?.data?.length) ? (
          <p className="text-gray-555 dark:text-gray-500 text-center py-12">Tidak ada dokumen tervalidasi.</p>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 text-left">
              <th className="pb-3 w-8"><input type="checkbox" onChange={(e) => setSelected(e.target.checked ? documents.data.map(d => d.id) : [])} className="accent-indigo-500" /></th>
              <th className="pb-3 font-medium">No. Dokumen</th>
              <th className="pb-3 font-medium">Supplier</th>
              <th className="pb-3 font-medium">Tanggal</th>
              <th className="pb-3 font-medium">Nilai</th>
              <th className="pb-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {documents.data.map(doc => (
                <tr key={doc.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-100/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-3"><input type="checkbox" checked={selected.includes(doc.id)} onChange={() => toggleSelect(doc.id)} className="accent-indigo-500" /></td>
                  <td className="py-3 text-gray-900 dark:text-white font-medium">{doc.document_number}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{doc.supplier?.company_name}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{new Date(doc.document_date).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 text-gray-600 dark:text-gray-400">{doc.currency} {Number(doc.goods_value).toLocaleString('id-ID')}</td>
                  <td className="py-3"><StatusBadge status={doc.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
