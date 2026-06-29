<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\StaffProcessDocumentRequest;
use App\Models\Document;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function inbox(Request $request)
    {
        $documents = Document::whereIn('status', ['submitted', 'staff_processing', 'rejected'])
            ->with('supplier', 'files', 'currentHandler')
            ->orderByDesc('created_at')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $documents]);
        }

        return Inertia::render('Staff/Inbox', [
            'documents' => $documents,
        ]);
    }

    public function show(Request $request, Document $document)
    {
        $document->load('supplier', 'files', 'auditLogs.actor', 'currentHandler');

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $document]);
        }

        return Inertia::render('Staff/DocumentDetail', [
            'document' => $document,
        ]);
    }

    public function process(StaffProcessDocumentRequest $request, Document $document)
    {
        if (!in_array($document->status, ['submitted', 'staff_processing', 'rejected'])) {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Dokumen tidak dapat diproses pada status ini.'], 422);
            }
            return back()->with('error', 'Dokumen tidak dapat diproses pada status ini.');
        }

        return DB::transaction(function () use ($request, $document) {
            $user = $request->user();
            $oldStatus = $document->status;

            $document->update(array_merge(
                $request->only(['document_number', 'document_date', 'goods_type', 'origin_country', 'goods_value', 'currency']),
                [
                    'status' => 'staff_processing',
                    'current_handler_id' => $user->id,
                ]
            ));

            if ($oldStatus !== 'staff_processing') {
                AuditService::log($document->id, $user->id, 'staff_processing', $request->notes ?? 'Staff mulai memproses dokumen');
            } else {
                AuditService::log($document->id, $user->id, 'metadata_updated', $request->notes ?? 'Metadata dokumen diperbarui');
            }

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'data' => ['document' => $document->fresh()], 'message' => 'Dokumen berhasil diproses.']);
            }

            return back()->with('success', 'Data dokumen berhasil diperbarui.');
        });
    }

    public function forward(Request $request, Document $document)
    {
        if (!in_array($document->status, ['staff_processing'])) {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Dokumen harus dalam status diproses sebelum diteruskan.'], 422);
            }
            return back()->with('error', 'Dokumen harus dalam status diproses sebelum diteruskan.');
        }

        return DB::transaction(function () use ($request, $document) {
            $user = $request->user();

            $document->update([
                'status' => 'pending_validation',
                'current_handler_id' => null,
                'rejection_reason' => null,
            ]);

            AuditService::log($document->id, $user->id, 'forwarded_to_manager', 'Dokumen diteruskan ke Manager untuk validasi');

            NotificationService::sendToRole('manager_impor', 'Dokumen Perlu Validasi', "Dokumen #{$document->document_number} siap untuk divalidasi.", 'info', [
                'document_id' => $document->id,
            ]);

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'message' => 'Dokumen berhasil diteruskan ke Manager.']);
            }

            return redirect()->route('staff.inbox')->with('success', 'Dokumen berhasil diteruskan ke Manager.');
        });
    }
}
