<?php

namespace App\Http\Controllers\Supplier;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplierReviseDocumentRequest;
use App\Http\Requests\SupplierSubmitDocumentRequest;
use App\Models\Clarification;
use App\Models\Document;
use App\Models\DocumentFile;
use App\Services\AuditService;
use App\Services\NotificationService;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $supplier = $request->user()->supplier;
        $documents = Document::where('supplier_id', $supplier->id)
            ->with('files')
            ->orderByDesc('created_at')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $documents]);
        }

        return Inertia::render('Supplier/Documents', [
            'documents' => $documents,
        ]);
    }

    public function create()
    {
        return Inertia::render('Supplier/SubmitDocument');
    }

    public function store(SupplierSubmitDocumentRequest $request)
    {
        $user = $request->user();
        $supplier = $user->supplier;

        return DB::transaction(function () use ($request, $user, $supplier) {
            $document = Document::create([
                'document_number' => $request->document_number,
                'supplier_id' => $supplier->id,
                'document_date' => $request->document_date,
                'goods_type' => $request->goods_type,
                'origin_country' => $request->origin_country,
                'goods_value' => $request->goods_value,
                'currency' => $request->currency ?? 'IDR',
                'status' => 'submitted',
            ]);

            foreach ($request->file('files') as $file) {
                $finfo = new \finfo(FILEINFO_MIME_TYPE);
                $mimeType = $finfo->file($file->getRealPath());

                $path = $file->store('documents/' . $document->id, 'local');

                DocumentFile::create([
                    'document_id' => $document->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $mimeType,
                    'file_size' => $file->getSize(),
                    'uploaded_by' => $user->id,
                ]);
            }

            AuditService::log($document->id, $user->id, 'submitted', 'Dokumen diajukan oleh Supplier');

            NotificationService::sendToRole('staff_impor', 'Dokumen Baru', "Dokumen baru #{$document->document_number} dikirim oleh {$supplier->company_name}.", 'info', [
                'document_id' => $document->id,
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'data' => ['document_id' => $document->id, 'status' => $document->status],
                    'message' => 'Dokumen berhasil diajukan.',
                ], 201);
            }

            return redirect()->route('supplier.documents')->with('success', 'Dokumen berhasil diajukan.');
        });
    }

    public function show(Request $request, Document $document)
    {
        $supplier = $request->user()->supplier;
        if ($document->supplier_id !== $supplier->id) {
            abort(403);
        }

        $document->load('files', 'auditLogs.actor', 'clarifications.creator', 'clarifications.requestedByUser', 'clarifications.answeredByUser', 'clarifications.managerRespondedByUser', 'clarifications.adminAcknowledgedByUser');

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $document]);
        }

        return Inertia::render('Supplier/DocumentDetail', [
            'document' => $document,
        ]);
    }

    public function revise(SupplierReviseDocumentRequest $request, Document $document)
    {
        $supplier = $request->user()->supplier;
        if ($document->supplier_id !== $supplier->id) {
            abort(403);
        }

        if ($document->status !== 'rejected_by_staff') {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Dokumen ini tidak dalam status ditolak.'], 422);
            }
            return back()->with('error', 'Dokumen ini tidak dalam status ditolak.');
        }

        return DB::transaction(function () use ($request, $document) {
            $user = $request->user();

            $document->update(array_merge(
                $request->only(['document_number', 'document_date', 'goods_type', 'origin_country', 'goods_value', 'currency']),
                [
                    'status' => 'submitted',
                    'rejection_reason' => null,
                ]
            ));

            foreach ($request->file('files', []) as $file) {
                $finfo = new \finfo(FILEINFO_MIME_TYPE);
                $mimeType = $finfo->file($file->getRealPath());

                $path = $file->store('documents/' . $document->id, 'local');

                DocumentFile::create([
                    'document_id' => $document->id,
                    'file_path' => $path,
                    'file_name' => $file->getClientOriginalName(),
                    'mime_type' => $mimeType,
                    'file_size' => $file->getSize(),
                    'uploaded_by' => $user->id,
                ]);
            }

            AuditService::log($document->id, $user->id, 'resubmitted', 'Dokumen direvisi dan dikirim ulang oleh Supplier');

            NotificationService::sendToRole('staff_impor', 'Dokumen Direvisi', "Dokumen #{$document->document_number} telah direvisi dan dikirim ulang oleh Supplier.", 'info', [
                'document_id' => $document->id,
            ]);

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'data' => ['document' => $document->fresh()], 'message' => 'Dokumen berhasil direvisi dan dikirim ulang.']);
            }

            return redirect()->route('supplier.documents.show', $document)->with('success', 'Dokumen berhasil direvisi dan dikirim ulang.');
        });
    }

    public function answerClarification(Request $request, Clarification $clarification)
    {
        $supplier = $request->user()->supplier;
        $clarification->load('document');

        if ($clarification->document->supplier_id !== $supplier->id) {
            abort(403);
        }

        if ($clarification->status !== 'awaiting_supplier_answer') {
            if ($request->wantsJson()) {
                return response()->json(['status' => 'error', 'message' => 'Klarifikasi ini tidak menunggu jawaban Anda.'], 422);
            }
            return back()->with('error', 'Klarifikasi ini tidak menunggu jawaban Anda.');
        }

        $request->validate([
            'answer' => ['required', 'string', 'max:2000'],
        ]);

        return DB::transaction(function () use ($request, $clarification) {
            $user = $request->user();

            $clarification->update([
                'answer' => $request->answer,
                'answered_by' => $user->id,
                'answered_at' => now(),
                'status' => 'awaiting_manager_review',
            ]);

            AuditService::log($clarification->document_id, $user->id, 'clarification_answered', 'Supplier menjawab klarifikasi: ' . $request->answer);

            NotificationService::sendToRole('manager_impor', 'Klarifikasi Dijawab Supplier', "Supplier telah menjawab klarifikasi untuk dokumen #{$clarification->document->document_number}, menunggu tinjauan Manager.", 'info', [
                'document_id' => $clarification->document_id,
                'clarification_id' => $clarification->id,
            ]);

            if ($request->wantsJson()) {
                return response()->json(['status' => 'success', 'message' => 'Jawaban klarifikasi berhasil dikirim.']);
            }

            return redirect()->route('supplier.documents.show', $clarification->document_id)->with('success', 'Jawaban klarifikasi berhasil dikirim.');
        });
    }
}
