import React from 'react';
import { Link } from '@inertiajs/react';
import Layout from '../../Components/Layout';

export default function AuditLog({ document, logs }) {
  return (
    <Layout title={`Audit Log - ${document.document_number}`}>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/admin/documents/${document.id}`} className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </Link>
        <h1 className="text-2xl font-semibold text-white">Audit Trail: {document.document_number}</h1>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Belum ada catatan audit.</p>
        ) : (
          <div className="space-y-0">
            {logs.map((log, i) => (
              <div key={log.id} className="flex gap-4 pb-6 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 border-2 border-gray-950 mt-1.5"></div>
                  {i < logs.length - 1 && <div className="w-0.5 flex-1 bg-white/10 mt-1"></div>}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-medium capitalize">{log.action.replace(/_/g, ' ')}</div>
                      <div className="text-gray-400 text-sm mt-0.5">oleh {log.actor?.name}</div>
                    </div>
                    <div className="text-gray-500 text-xs">{new Date(log.created_at).toLocaleString('id-ID')}</div>
                  </div>
                  {log.notes && <div className="mt-2 p-3 bg-white/5 rounded-lg text-gray-300 text-sm">{log.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
