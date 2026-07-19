import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import StatusBadge from '../../Components/StatusBadge';
import ClarificationThread from '../../Components/ClarificationThread';

export default function ClarificationDetail({ clarification }) {
  const document = clarification.document;
  const canAcknowledge = clarification.status === 'awaiting_admin_ack';

  const [processing, setProcessing] = useState(false);

  const handleAcknowledge = () => {
    if (!confirm('Terima hasil klarifikasi ini dan kembalikan dokumen ke antrian validasi Manager?')) {
      return;
    }
    setProcessing(true);
    router.put(`/admin/clarifications/${clarification.id}/acknowledge`, {}, {
      onFinish: () => setProcessing(false),
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

          {canAcknowledge ? (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 space-y-4 shadow-sm dark:shadow-none">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Terima Hasil Klarifikasi</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Manager telah menjawab klarifikasi ini. Konfirmasi untuk mengembalikan dokumen ke antrian validasi Manager.</p>
              <button onClick={handleAcknowledge} disabled={processing} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer">
                {processing ? 'Memproses...' : 'Terima Hasil Klarifikasi'}
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Klarifikasi ini sudah selesai.</p>
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
