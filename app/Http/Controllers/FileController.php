<?php

namespace App\Http\Controllers;

use App\Models\DocumentFile;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function downloadDocument(Request $request, DocumentFile $file)
    {
        $user = $request->user();
        $document = $file->document;

        if ($user->role === 'supplier') {
            $supplier = $user->supplier;
            if (!$supplier || $document->supplier_id !== $supplier->id) {
                abort(403);
            }
        }

        if (!Storage::disk('local')->exists($file->file_path)) {
            abort(404, 'File tidak ditemukan.');
        }

        return Storage::disk('local')->download($file->file_path, $file->file_name);
    }

    public function downloadReport(Request $request, Report $report)
    {
        $user = $request->user();

        if (!in_array($user->role, ['manager_impor', 'admin'])) {
            abort(403);
        }

        if ($report->report_file_path === 'pending') {
            abort(404, 'Laporan sedang diproses.');
        }

        if (!Storage::disk('local')->exists($report->report_file_path)) {
            abort(404, 'File laporan tidak ditemukan.');
        }

        return Storage::disk('local')->download($report->report_file_path, 'laporan_' . $report->id . '.pdf');
    }
}
