<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'document_number',
    'supplier_id',
    'document_date',
    'goods_type',
    'origin_country',
    'goods_value',
    'currency',
    'status',
    'current_handler_id',
    'rejection_reason'
])]
class Document extends Model
{
    protected function casts(): array
    {
        return [
            'document_date' => 'date',
            'goods_value' => 'decimal:2',
        ];
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function currentHandler()
    {
        return $this->belongsTo(User::class, 'current_handler_id');
    }

    public function files()
    {
        return $this->hasMany(DocumentFile::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
}
