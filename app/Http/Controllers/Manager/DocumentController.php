<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\ManagerValidateDocumentRequest;
use App\Models\Clarification;
use App\Models\Document;
use App\Models\Report;
use App\Jobs\GenerateReportJob;
use App\Services\AuditService;
use App\Services\NotificationService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function queue(Request $request)
    {
        $documents = Document::where('status', 'pending_validation')
            ->with('supplier', 'files')
            ->orderByDesc('created_at')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $documents]);
        }

        return Inertia::render('Manager/Queue', [
            'documents' => $documents,
        ]);
    }

    public function show(Request $request, Document $document)
    {
        $document->load('supplier', 'files', 'auditLogs.actor', 'currentHandler', 'clarifications.creator', 'clarifications.requestedByUser', 'clarifications.answeredByUser', 'clarifications.managerRespondedByUser', 'clarifications.adminAcknowledgedByUser');

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $document]);
        }

        return Inertia::render('Manager/DocumentDetail', [
            'document' => $document,
        ]);
    }

    public function validate(ManagerValidateDocumentRequest $request, Document $document)
    {
        if ($document->status !== 'pending_validation') {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Dokumen tidak dalam status menunggu validasi.'], 422);
            }
            return back()->with('error', 'Dokumen tidak dalam status menunggu validasi.');
        }

        return DB::transaction(function () use ($request, $document) {
            $user = $request->user();
            $decision = $request->decision;

            if ($decision === 'approve') {
                $document->update([
                    'status' => 'validated',
                    'current_handler_id' => null,
                    'rejection_reason' => null,
                ]);

                AuditService::log($document->id, $user->id, 'validated', 'Dokumen disetujui oleh Manager');
            } else {
                $document->update([
                    'status' => 'rejected_incomplete',
                    'current_handler_id' => null,
                    'rejection_reason' => null,
                ]);

                Clarification::create([
                    'document_id' => $document->id,
                    'manager_note' => $request->reason,
                    'created_by' => $user->id,
                    'status' => 'awaiting_staff_request',
                ]);

                AuditService::log($document->id, $user->id, 'rejected_incomplete', 'Dokumen sesuai namun tidak lengkap: ' . $request->reason);

                NotificationService::sendToRole('staff_impor', 'Dokumen Tidak Lengkap', "Dokumen #{$document->document_number} sesuai namun tidak lengkap. Perlu klarifikasi ke Supplier. Catatan: {$request->reason}", 'warning', [
                    'document_id' => $document->id,
                ]);
            }

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'data' => ['document' => $document->fresh()], 'message' => 'Keputusan validasi berhasil disimpan.']);
            }

            return redirect()->route('manager.queue')->with('success', 'Keputusan validasi berhasil disimpan.');
        });
    }

    public function clarificationQueue(Request $request)
    {
        $clarifications = Clarification::where('status', 'awaiting_manager_review')
            ->with('document.supplier', 'requestedByUser', 'answeredByUser')
            ->orderByDesc('staff_decided_at')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $clarifications]);
        }

        return Inertia::render('Manager/Clarifications', [
            'clarifications' => $clarifications,
        ]);
    }

    public function showClarification(Request $request, Clarification $clarification)
    {
        $clarification->load('document.supplier', 'creator', 'requestedByUser', 'answeredByUser', 'managerRespondedByUser', 'adminAcknowledgedByUser');

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $clarification]);
        }

        return Inertia::render('Manager/ClarificationDetail', [
            'clarification' => $clarification,
        ]);
    }

    public function answerClarification(Request $request, Clarification $clarification)
    {
        if ($clarification->status !== 'awaiting_manager_review') {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Klarifikasi ini tidak menunggu jawaban Manager.'], 422);
            }
            return back()->with('error', 'Klarifikasi ini tidak menunggu jawaban Manager.');
        }

        $request->validate([
            'manager_response' => ['required', 'string', 'max:2000'],
        ]);

        return DB::transaction(function () use ($request, $clarification) {
            $user = $request->user();

            $clarification->update([
                'manager_response' => $request->manager_response,
                'manager_responded_by' => $user->id,
                'manager_responded_at' => now(),
                'status' => 'awaiting_admin_ack',
            ]);

            AuditService::log($clarification->document_id, $user->id, 'clarification_resolved_by_manager', 'Manager menjawab klarifikasi: ' . $request->manager_response);

            NotificationService::sendToRole('admin', 'Klarifikasi Menunggu Konfirmasi', "Jawaban klarifikasi dokumen #{$clarification->document->document_number} telah dijawab Manager dan menunggu konfirmasi Admin.", 'info', [
                'document_id' => $clarification->document_id,
            ]);

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'message' => 'Jawaban klarifikasi berhasil dikirim ke Admin.']);
            }

            return redirect()->route('manager.clarifications')->with('success', 'Jawaban klarifikasi berhasil dikirim ke Admin.');
        });
    }

    public function reports(Request $request)
    {
        $reports = Report::where('created_by', $request->user()->id)
            ->with('document.supplier', 'recipient')
            ->orderByDesc('created_at')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $reports]);
        }

        return Inertia::render('Manager/Reports', [
            'reports' => $reports,
        ]);
    }

    public function createReport(Request $request)
    {
        $request->validate([
            'document_ids' => ['required', 'array', 'min:1'],
            'document_ids.*' => ['required', 'integer', 'exists:documents,id'],
        ]);

        $user = $request->user();
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            return back()->with('error', 'Tidak ada Admin yang terdaftar.');
        }

        return DB::transaction(function () use ($request, $user, $admin) {
            $reports = [];
            foreach ($request->document_ids as $documentId) {
                $document = Document::where('id', $documentId)->where('status', 'validated')->first();
                if (!$document) {
                    continue;
                }

                $report = Report::create([
                    'document_id' => $documentId,
                    'created_by' => $user->id,
                    'sent_to' => $admin->id,
                    'report_file_path' => 'pending',
                ]);

                GenerateReportJob::dispatch($report->id);

                AuditService::log($documentId, $user->id, 'report_created', 'Laporan dibuat oleh Manager');

                $reports[] = $report;
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'data' => ['report_ids' => collect($reports)->pluck('id')],
                    'message' => count($reports) . ' laporan sedang dibuat.',
                ]);
            }

            return back()->with('success', count($reports) . ' laporan sedang dibuat.');
        });
    }

    public function sendReport(Request $request, Report $report)
    {
        if ($report->created_by !== $request->user()->id) {
            abort(403);
        }

        if ($report->sent_at) {
            return back()->with('error', 'Laporan sudah dikirim sebelumnya.');
        }

        $report->update(['sent_at' => now()]);

        AuditService::log($report->document_id, $request->user()->id, 'report_sent', 'Laporan dikirim ke Admin');

        NotificationService::send($report->sent_to, 'Laporan Baru', "Laporan untuk dokumen #{$report->document->document_number} telah dikirim.", 'info', [
            'report_id' => $report->id,
            'document_id' => $report->document_id,
        ]);

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'message' => 'Laporan berhasil dikirim ke Admin.']);
        }

        return back()->with('success', 'Laporan berhasil dikirim ke Admin.');
    }

    public function validated(Request $request)
    {
        $documents = Document::where('status', 'validated')
            ->with('supplier')
            ->orderByDesc('updated_at')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $documents]);
        }

        return Inertia::render('Manager/ValidatedDocuments', [
            'documents' => $documents,
        ]);
    }
}
