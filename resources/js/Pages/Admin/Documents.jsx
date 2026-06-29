import React from 'react';
import { router, Link } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import StatusBadge from '../../Components/StatusBadge';

export default function Documents({ documents, filters }) {
  const [search, setSearch] = React.useState(filters?.search || '');
  const [status, setStatus] = React.useState(filters?.status || '');
  const [dateFrom, setDateFrom] = React.useState(filters?.date_from || '');
  const [dateTo, setDateTo] = React.useState(filters?.date_to || '');

  const handleFilter = (e) => {
    e.preventDefault();
    router.get('/admin/documents', { search, status, date_from: dateFrom, date_to: dateTo }, { preserveState: true });
  };

  const inputClass = "px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-indigo-500 outline-none";

  return (
    <Layout title="Semua Dokumen">
      <h1 className="text-2xl font-semibold text-white mb-6">Semua Dokumen</h1>

      <form onSubmit={handleFilter} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1">Cari</label>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} className={inputClass + ' w-full'} placeholder="Nomor dokumen / supplier..." />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
            <option value="">Semua</option>
            <option value="submitted">Diajukan</option>
            <option value="staff_processing">Diproses Staff</option>
            <option value="pending_validation">Menunggu Validasi</option>
            <option value="validated">Tervalidasi</option>
            <option value="rejected">Ditolak</option>
            <option value="ready_to_archive">Siap Arsip</option>
            <option value="archived">Diarsipkan</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Dari</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Sampai</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">Cari</button>
      </form>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        {(!documents?.data?.length) ? (
          <p className="text-gray-500 text-center py-12">Tidak ada dokumen ditemukan.</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/10 text-gray-400 text-left">
                <th className="pb-3 font-medium">No. Dokumen</th>
                <th className="pb-3 font-medium">Supplier</th>
                <th className="pb-3 font-medium">Tanggal</th>
                <th className="pb-3 font-medium">Jenis</th>
                <th className="pb-3 font-medium">Nilai</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Aksi</th>
              </tr></thead>
              <tbody>
                {documents.data.map(doc => (
                  <tr key={doc.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 text-white font-medium">{doc.document_number}</td>
                    <td className="py-3 text-gray-400">{doc.supplier?.company_name}</td>
                    <td className="py-3 text-gray-400">{new Date(doc.document_date).toLocaleDateString('id-ID')}</td>
                    <td className="py-3 text-gray-400">{doc.goods_type}</td>
                    <td className="py-3 text-gray-400">{doc.currency} {Number(doc.goods_value).toLocaleString('id-ID')}</td>
                    <td className="py-3"><StatusBadge status={doc.status} /></td>
                    <td className="py-3"><Link href={`/admin/documents/${doc.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm">Detail</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {documents.links && (
              <div className="flex gap-1 mt-4 flex-wrap">
                {documents.links.map((link, i) => (
                  <Link key={i} href={link.url || '#'} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'} ${!link.url ? 'opacity-30 pointer-events-none' : ''}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
