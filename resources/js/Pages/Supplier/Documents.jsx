import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from '../../Components/Layout';
import DocumentTable from '../../Components/DocumentTable';

export default function Documents({ documents }) {
  return (
    <Layout title="Dokumen Saya">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dokumen Saya</h1>
        <Link href="/supplier/documents/create" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Kirim Dokumen Baru</Link>
      </div>
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <DocumentTable documents={documents} linkPrefix="/supplier/documents" showSupplier={false} />
      </div>
    </Layout>
  );
}
