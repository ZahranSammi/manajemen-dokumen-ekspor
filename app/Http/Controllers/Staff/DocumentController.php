<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\StaffProcessDocumentRequest;
use App\Models\Clarification;
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
        $documents = Document::whereIn('status', ['submitted', 'staff_processing'])
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
        $document->load('supplier', 'files', 'auditLogs.actor', 'currentHandler', 'clarifications.creator', 'clarifications.requestedByUser', 'clarifications.answeredByUser', 'clarifications.managerRespondedByUser', 'clarifications.adminAcknowledgedByUser');

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $document]);
        }

        return Inertia::render('Staff/DocumentDetail', [
            'document' => $document,
        ]);
    }

    public function process(StaffProcessDocumentRequest $request, Document $document)
    {
        if (!in_array($document->status, ['submitted', 'staff_processing'])) {
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

    public function reject(Request $request, Document $document)
    {
        if (!in_array($document->status, ['submitted', 'staff_processing'])) {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Dokumen tidak dapat ditolak pada status ini.'], 422);
            }
            return back()->with('error', 'Dokumen tidak dapat ditolak pada status ini.');
        }

        $request->validate([
            'reason' => ['required', 'string', 'max:2000'],
        ]);

        return DB::transaction(function () use ($request, $document) {
            $user = $request->user();

            $document->load('supplier');

            $document->update([
                'status' => 'rejected_by_staff',
                'current_handler_id' => null,
                'rejection_reason' => $request->reason,
            ]);

            AuditService::log($document->id, $user->id, 'rejected_by_staff', 'Dokumen tidak sesuai: ' . $request->reason);

            NotificationService::send($document->supplier->user_id, 'Dokumen Ditolak', "Dokumen #{$document->document_number} tidak sesuai dan perlu direvisi. Alasan: {$request->reason}", 'warning', [
                'document_id' => $document->id,
            ]);

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'data' => ['document' => $document->fresh()], 'message' => 'Dokumen ditolak dan dikembalikan ke Supplier.']);
            }

            return redirect()->route('staff.inbox')->with('success', 'Dokumen ditolak dan dikembalikan ke Supplier untuk direvisi.');
        });
    }

    public function clarifications(Request $request)
    {
        $documents = Document::where('status', 'rejected_incomplete')
            ->with('supplier', 'latestClarification')
            ->orderByDesc('updated_at')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $documents]);
        }

        return Inertia::render('Staff/Clarifications', [
            'documents' => $documents,
        ]);
    }

    public function showClarification(Request $request, Clarification $clarification)
    {
        $clarification->load('document.supplier', 'creator', 'requestedByUser', 'answeredByUser', 'managerRespondedByUser', 'adminAcknowledgedByUser');

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $clarification]);
        }

        return Inertia::render('Staff/ClarificationDetail', [
            'clarification' => $clarification,
        ]);
    }

    public function requestClarification(Request $request, Clarification $clarification)
    {
        if ($clarification->status !== 'awaiting_staff_request') {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Klarifikasi ini sudah diproses.'], 422);
            }
            return back()->with('error', 'Klarifikasi ini sudah diproses.');
        }

        $request->validate([
            'question' => ['required', 'string', 'max:2000'],
            'staff_note' => ['nullable', 'string', 'max:2000'],
        ]);

        return DB::transaction(function () use ($request, $clarification) {
            $user = $request->user();

            $clarification->update([
                'question' => $request->question,
                'requested_by' => $user->id,
                'requested_at' => now(),
                'needs_supplier' => true,
                'staff_note' => $request->staff_note,
                'staff_decided_by' => $user->id,
                'staff_decided_at' => now(),
                'status' => 'awaiting_supplier_answer',
            ]);

            AuditService::log($clarification->document_id, $user->id, 'clarification_requested', 'Staff meminta klarifikasi ke Supplier: ' . $request->question);

            NotificationService::send($clarification->document->supplier->user_id, 'Klarifikasi Dokumen Diperlukan', "Dokumen #{$clarification->document->document_number} memerlukan klarifikasi dari Anda.", 'warning', [
                'document_id' => $clarification->document_id,
                'clarification_id' => $clarification->id,
            ]);

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'message' => 'Klarifikasi berhasil dikirim ke Supplier.']);
            }

            return redirect()->route('staff.clarifications')->with('success', 'Klarifikasi berhasil dikirim ke Supplier.');
        });
    }

    public function skipSupplier(Request $request, Clarification $clarification)
    {
        if ($clarification->status !== 'awaiting_staff_request') {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Klarifikasi ini sudah diproses.'], 422);
            }
            return back()->with('error', 'Klarifikasi ini sudah diproses.');
        }

        $request->validate([
            'staff_note' => ['required', 'string', 'max:2000'],
        ]);

        return DB::transaction(function () use ($request, $clarification) {
            $user = $request->user();

            $clarification->update([
                'needs_supplier' => false,
                'staff_note' => $request->staff_note,
                'staff_decided_by' => $user->id,
                'staff_decided_at' => now(),
                'status' => 'awaiting_manager_review',
            ]);

            AuditService::log($clarification->document_id, $user->id, 'clarification_resolved_without_supplier', 'Staff menyelesaikan tanpa melibatkan Supplier: ' . $request->staff_note);

            NotificationService::sendToRole('manager_impor', 'Klarifikasi Perlu Ditinjau', "Klarifikasi dokumen #{$clarification->document->document_number} tidak memerlukan Supplier dan perlu dijawab Manager.", 'info', [
                'document_id' => $clarification->document_id,
                'clarification_id' => $clarification->id,
            ]);

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'message' => 'Klarifikasi diteruskan ke Manager tanpa melibatkan Supplier.']);
            }

            return redirect()->route('staff.clarifications')->with('success', 'Klarifikasi diteruskan ke Manager tanpa melibatkan Supplier.');
        });
    }
}
