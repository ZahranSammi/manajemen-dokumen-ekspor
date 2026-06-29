<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Dokumen Impor #{{ $document->document_number }}</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
        h1 { font-size: 18px; color: #1F4E79; border-bottom: 2px solid #2E75B6; padding-bottom: 8px; }
        h2 { font-size: 14px; color: #2E75B6; margin-top: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .meta { margin-bottom: 20px; }
        .meta td:first-child { font-weight: bold; width: 180px; background: #f9f9f9; }
        .footer { margin-top: 30px; font-size: 10px; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <h1>Laporan Dokumen Impor</h1>

    <h2>Informasi Dokumen</h2>
    <table class="meta">
        <tr><td>Nomor Dokumen</td><td>{{ $document->document_number }}</td></tr>
        <tr><td>Tanggal Dokumen</td><td>{{ $document->document_date->format('d/m/Y') }}</td></tr>
        <tr><td>Supplier</td><td>{{ $document->supplier->company_name ?? '-' }}</td></tr>
        <tr><td>Jenis Barang</td><td>{{ $document->goods_type }}</td></tr>
        <tr><td>Negara Asal</td><td>{{ $document->origin_country }}</td></tr>
        <tr><td>Nilai Barang</td><td>{{ $document->currency }} {{ number_format($document->goods_value, 2) }}</td></tr>
        <tr><td>Status</td><td>{{ ucfirst(str_replace('_', ' ', $document->status)) }}</td></tr>
    </table>

    <h2>Informasi Laporan</h2>
    <table class="meta">
        <tr><td>Dibuat Oleh</td><td>{{ $report->creator->name ?? '-' }}</td></tr>
        <tr><td>Tanggal Dibuat</td><td>{{ $report->created_at->format('d/m/Y H:i') }}</td></tr>
    </table>

    <h2>File Lampiran</h2>
    <table>
        <thead>
            <tr><th>No</th><th>Nama File</th><th>Tipe</th><th>Ukuran</th></tr>
        </thead>
        <tbody>
            @forelse ($document->files as $i => $file)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $file->file_name }}</td>
                    <td>{{ $file->mime_type }}</td>
                    <td>{{ number_format($file->file_size / 1024, 1) }} KB</td>
                </tr>
            @empty
                <tr><td colspan="4" style="text-align:center;">Tidak ada file</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        Laporan ini dibuat secara otomatis oleh Sistem Manajemen Dokumen Impor pada {{ now()->format('d/m/Y H:i') }}.
    </div>
</body>
</html>
