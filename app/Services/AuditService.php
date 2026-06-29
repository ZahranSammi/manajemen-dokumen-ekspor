<?php

namespace App\Services;

use App\Models\AuditLog;

class AuditService
{
    public static function log(int $documentId, int $actorId, string $action, ?string $notes = null): AuditLog
    {
        return AuditLog::create([
            'document_id' => $documentId,
            'actor_id' => $actorId,
            'action' => $action,
            'notes' => $notes,
        ]);
    }
}
