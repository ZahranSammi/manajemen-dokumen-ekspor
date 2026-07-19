<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Clarification;
use App\Models\Document;
use App\Models\Report;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function reports(Request $request)
    {
        $reports = Report::whereNotNull('sent_at')
            ->where('sent_to', $request->user()->id)
            ->with('document.supplier', 'creator')
            ->orderByDesc('sent_at')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $reports]);
        }

        return Inertia::render('Admin/Reports', [
            'reports' => $reports,
        ]);
    }

    public function documents(Request $request)
    {
        $query = Document::with('supplier', 'currentHandler');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('document_number', 'like', "%{$search}%")
                    ->orWhereHas('supplier', fn ($sq) => $sq->where('company_name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date_from')) {
            $query->where('document_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('document_date', '<=', $request->date_to);
        }

        $documents = $query->orderByDesc('created_at')->paginate(15)->withQueryString();

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $documents]);
        }

        return Inertia::render('Admin/Documents', [
            'documents' => $documents,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function show(Request $request, Document $document)
    {
        $document->load('supplier', 'files', 'auditLogs.actor', 'reports.creator', 'currentHandler', 'clarifications.creator', 'clarifications.requestedByUser', 'clarifications.answeredByUser', 'clarifications.managerRespondedByUser', 'clarifications.adminAcknowledgedByUser');

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $document]);
        }

        return Inertia::render('Admin/DocumentDetail', [
            'document' => $document,
        ]);
    }

    public function prepare(Request $request, Document $document)
    {
        if ($document->status !== 'validated') {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Hanya dokumen tervalidasi yang dapat disiapkan.'], 422);
            }
            return back()->with('error', 'Hanya dokumen tervalidasi yang dapat disiapkan.');
        }

        return DB::transaction(function () use ($request, $document) {
            $user = $request->user();

            $document->update([
                'status' => 'ready_to_archive',
                'current_handler_id' => $user->id,
            ]);

            AuditService::log($document->id, $user->id, 'prepared', 'Dokumen disiapkan oleh Admin untuk diarsipkan');

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'data' => ['document' => $document->fresh()], 'message' => 'Dokumen berhasil disiapkan.']);
            }

            return back()->with('success', 'Dokumen berhasil disiapkan. Silakan lanjutkan untuk mengarsipkan.');
        });
    }

    public function archive(Request $request, Document $document)
    {
        if ($document->status !== 'ready_to_archive') {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Dokumen harus disiapkan terlebih dahulu sebelum diarsipkan.'], 422);
            }
            return back()->with('error', 'Dokumen harus disiapkan terlebih dahulu sebelum diarsipkan.');
        }

        return DB::transaction(function () use ($request, $document) {
            $user = $request->user();

            $document->update([
                'status' => 'archived',
                'current_handler_id' => null,
            ]);

            AuditService::log($document->id, $user->id, 'archived', 'Dokumen diarsipkan oleh Admin');

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'data' => ['document' => $document->fresh()], 'message' => 'Dokumen berhasil diarsipkan.']);
            }

            return back()->with('success', 'Dokumen berhasil diarsipkan.');
        });
    }

    public function auditLog(Request $request, Document $document)
    {
        $logs = $document->auditLogs()->with('actor')->orderByDesc('created_at')->get();

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $logs]);
        }

        return Inertia::render('Admin/AuditLog', [
            'document' => $document,
            'logs' => $logs,
        ]);
    }

    public function clarifications(Request $request)
    {
        $clarifications = Clarification::where('status', 'awaiting_admin_ack')
            ->with('document.supplier', 'managerRespondedByUser')
            ->orderByDesc('manager_responded_at')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $clarifications]);
        }

        return Inertia::render('Admin/Clarifications', [
            'clarifications' => $clarifications,
        ]);
    }

    public function showClarification(Request $request, Clarification $clarification)
    {
        $clarification->load('document.supplier', 'creator', 'requestedByUser', 'answeredByUser', 'managerRespondedByUser', 'adminAcknowledgedByUser');

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $clarification]);
        }

        return Inertia::render('Admin/ClarificationDetail', [
            'clarification' => $clarification,
        ]);
    }

    public function acknowledgeClarification(Request $request, Clarification $clarification)
    {
        if ($clarification->status !== 'awaiting_admin_ack') {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Klarifikasi ini tidak menunggu konfirmasi Admin.'], 422);
            }
            return back()->with('error', 'Klarifikasi ini tidak menunggu konfirmasi Admin.');
        }

        return DB::transaction(function () use ($request, $clarification) {
            $user = $request->user();

            $clarification->update([
                'admin_acknowledged_by' => $user->id,
                'admin_acknowledged_at' => now(),
                'status' => 'resolved',
                'resolved_at' => now(),
            ]);

            $clarification->document->update([
                'status' => 'pending_validation',
                'current_handler_id' => null,
            ]);

            AuditService::log($clarification->document_id, $user->id, 'clarification_acknowledged_by_admin', 'Admin menerima hasil klarifikasi, dokumen dikembalikan ke antrian validasi Manager');

            NotificationService::sendToRole('manager_impor', 'Dokumen Siap Divalidasi Ulang', "Dokumen #{$clarification->document->document_number} sudah dilengkapi klarifikasi dan siap divalidasi ulang.", 'info', [
                'document_id' => $clarification->document_id,
            ]);

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'message' => 'Hasil klarifikasi diterima, dokumen dikembalikan ke Manager.']);
            }

            return redirect()->route('admin.clarifications')->with('success', 'Hasil klarifikasi diterima, dokumen dikembalikan ke Manager.');
        });
    }
}
