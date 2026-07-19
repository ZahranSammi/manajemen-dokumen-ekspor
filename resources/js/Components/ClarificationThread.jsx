import React from 'react';

function Step({ label, by, at, children }) {
  return (
    <div className="relative pl-4 border-l-2 border-gray-200 dark:border-white/10">
      <div className="text-gray-900 dark:text-white text-sm font-medium">{label}</div>
      {(by || at) && (
        <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
          {by} {by && at && '·'} {at ? new Date(at).toLocaleString('id-ID') : ''}
        </div>
      )}
      {children && <div className="text-gray-600 dark:text-gray-300 text-sm mt-1.5 whitespace-pre-wrap">{children}</div>}
    </div>
  );
}

export default function ClarificationThread({ clarifications }) {
  if (!clarifications?.length) {
    return <p className="text-gray-500 dark:text-gray-500 text-sm">Belum ada klarifikasi.</p>;
  }

  return (
    <div className="space-y-6">
      {clarifications.map(c => (
        <div key={c.id} className="space-y-4">
          <Step label="Manager: Tidak Lengkap" by={c.creator?.name} at={c.created_at}>
            {c.manager_note}
          </Step>
          {c.staff_decided_at && (
            <Step
              label={c.needs_supplier ? 'Staff: perlu klarifikasi Supplier' : 'Staff: tidak perlu Supplier'}
              by={c.staff_decided_by_user?.name}
              at={c.staff_decided_at}
            >
              {c.staff_note}
            </Step>
          )}
          {c.question && (
            <Step label="Staff meminta klarifikasi" by={c.requested_by_user?.name} at={c.requested_at}>
              {c.question}
            </Step>
          )}
          {c.answer && (
            <Step label="Jawaban Supplier" by={c.answered_by_user?.name} at={c.answered_at}>
              {c.answer}
            </Step>
          )}
          {c.manager_response && (
            <Step label="Jawaban Manager" by={c.manager_responded_by_user?.name} at={c.manager_responded_at}>
              {c.manager_response}
            </Step>
          )}
          {c.admin_acknowledged_at && (
            <Step label="Admin menerima hasil klarifikasi" by={c.admin_acknowledged_by_user?.name} at={c.admin_acknowledged_at} />
          )}
        </div>
      ))}
    </div>
  );
}
