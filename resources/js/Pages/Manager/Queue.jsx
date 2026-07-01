import React from 'react';
import Layout from '../../Components/Layout';
import DocumentTable from '../../Components/DocumentTable';

export default function Queue({ documents }) {
  return (
    <Layout title="Antrian Validasi">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Antrian Validasi</h1>
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <DocumentTable documents={documents} linkPrefix="/manager/documents" />
      </div>
    </Layout>
  );
}
