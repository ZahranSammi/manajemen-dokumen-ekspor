import React from 'react';

const STATUS_MAP = {
  submitted: { label: 'Diajukan', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  staff_processing: { label: 'Diproses Staff', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  pending_validation: { label: 'Menunggu Validasi', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  validated: { label: 'Tervalidasi', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  rejected: { label: 'Ditolak', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  ready_to_archive: { label: 'Siap Arsip', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  archived: { label: 'Diarsipkan', bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}>
      {s.label}
    </span>
  );
}
