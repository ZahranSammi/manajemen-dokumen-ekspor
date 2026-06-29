import React from 'react';
import Layout from '../../Components/Layout';
import DocumentTable from '../../Components/DocumentTable';

export default function Inbox({ documents }) {
  return (
    <Layout title="Inbox Dokumen">
      <h1 className="text-2xl font-semibold text-white mb-6">Inbox Dokumen</h1>
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        <DocumentTable documents={documents} linkPrefix="/staff/documents" />
      </div>
    </Layout>
  );
}
