<?php

namespace App\Jobs;

use App\Models\Document;
use App\Models\Report;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;

class GenerateReportJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private int $reportId,
    ) {}

    public function handle(): void
    {
        $report = Report::with('document.supplier', 'creator')->findOrFail($this->reportId);
        $document = $report->document;

        $pdf = Pdf::loadView('reports.document', [
            'document' => $document,
            'report' => $report,
        ]);

        $filename = 'reports/report_' . $report->id . '_' . now()->format('Ymd_His') . '.pdf';
        Storage::disk('local')->put($filename, $pdf->output());

        $report->update(['report_file_path' => $filename]);
    }
}
