import React from 'react';
import { Link } from '@inertiajs/react';
import StatusBadge from './StatusBadge';

export default function DocumentTable({ documents, linkPrefix, showSupplier = true }) {
  if (!documents?.data?.length) {
    return <div className="text-center text-gray-500 py-12">Tidak ada dokumen.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-gray-400 text-left">
            <th className="pb-3 font-medium">No. Dokumen</th>
            {showSupplier && <th className="pb-3 font-medium">Supplier</th>}
            <th className="pb-3 font-medium">Tanggal</th>
            <th className="pb-3 font-medium">Jenis Barang</th>
            <th className="pb-3 font-medium">Nilai</th>
            <th className="pb-3 font-medium">Status</th>
            <th className="pb-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {documents.data.map(doc => (
            <tr key={doc.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
              <td className="py-3 font-medium text-white">{doc.document_number}</td>
              {showSupplier && <td className="py-3 text-gray-400">{doc.supplier?.company_name || '-'}</td>}
              <td className="py-3 text-gray-400">{new Date(doc.document_date).toLocaleDateString('id-ID')}</td>
              <td className="py-3 text-gray-400">{doc.goods_type}</td>
              <td className="py-3 text-gray-400">{doc.currency} {Number(doc.goods_value).toLocaleString('id-ID')}</td>
              <td className="py-3"><StatusBadge status={doc.status} /></td>
              <td className="py-3">
                <Link href={`${linkPrefix}/${doc.id}`} className="text-indigo-400 hover:text-indigo-300 text-sm">Detail</Link>
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
              className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-white/5'} ${!link.url ? 'opacity-30 pointer-events-none' : ''}`}
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
