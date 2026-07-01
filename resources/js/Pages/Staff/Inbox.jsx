import React from 'react';
import Layout from '../../Components/Layout';
import DocumentTable from '../../Components/DocumentTable';

export default function Inbox({ documents }) {
  return (
    <Layout title="Inbox Dokumen">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Inbox Dokumen</h1>
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <DocumentTable documents={documents} linkPrefix="/staff/documents" />
      </div>
    </Layout>
  );
}
