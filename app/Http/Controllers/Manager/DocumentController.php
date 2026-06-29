<?php

namespace App\Http\Controllers\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\ManagerValidateDocumentRequest;
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
        $document->load('supplier', 'files', 'auditLogs.actor', 'currentHandler');

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

                $admin = User::where('role', 'admin')->first();
                if ($admin) {
                    $report = Report::create([
                        'document_id' => $document->id,
                        'created_by' => $user->id,
                        'sent_to' => $admin->id,
                        'report_file_path' => 'pending',
                    ]);

                    GenerateReportJob::dispatch($report->id);
                    AuditService::log($document->id, $user->id, 'report_created', 'Laporan otomatis dibuat setelah validasi');

                    $report->update(['sent_at' => now()]);
                    AuditService::log($document->id, $user->id, 'report_sent', 'Laporan dikirim ke Admin');

                    NotificationService::send($admin->id, 'Laporan Dokumen Baru', "Dokumen #{$document->document_number} telah divalidasi. Laporan dikirim untuk diarsipkan.", 'success', [
                        'document_id' => $document->id,
                        'report_id' => $report->id,
                    ]);
                }
            } else {
                $document->update([
                    'status' => 'rejected',
                    'current_handler_id' => null,
                    'rejection_reason' => $request->reason,
                ]);

                AuditService::log($document->id, $user->id, 'rejected', 'Ditolak: ' . $request->reason);

                NotificationService::sendToRole('staff_impor', 'Dokumen Ditolak', "Dokumen #{$document->document_number} ditolak. Alasan: {$request->reason}", 'warning', [
                    'document_id' => $document->id,
                ]);
            }

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'data' => ['document' => $document->fresh()], 'message' => 'Keputusan validasi berhasil disimpan.']);
            }

            return redirect()->route('manager.queue')->with('success', 'Keputusan validasi berhasil disimpan.');
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
