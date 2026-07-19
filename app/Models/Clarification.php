<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'document_id',
    'manager_note',
    'created_by',
    'question',
    'requested_by',
    'requested_at',
    'answer',
    'answered_by',
    'answered_at',
    'needs_supplier',
    'staff_note',
    'staff_decided_by',
    'staff_decided_at',
    'manager_response',
    'manager_responded_by',
    'manager_responded_at',
    'admin_acknowledged_by',
    'admin_acknowledged_at',
    'status',
    'resolved_at',
])]
class Clarification extends Model
{
    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'answered_at' => 'datetime',
            'staff_decided_at' => 'datetime',
            'manager_responded_at' => 'datetime',
            'admin_acknowledged_at' => 'datetime',
            'resolved_at' => 'datetime',
            'needs_supplier' => 'boolean',
        ];
    }

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function requestedByUser()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function answeredByUser()
    {
        return $this->belongsTo(User::class, 'answered_by');
    }

    public function staffDecidedByUser()
    {
        return $this->belongsTo(User::class, 'staff_decided_by');
    }

    public function managerRespondedByUser()
    {
        return $this->belongsTo(User::class, 'manager_responded_by');
    }

    public function adminAcknowledgedByUser()
    {
        return $this->belongsTo(User::class, 'admin_acknowledged_by');
    }
}
