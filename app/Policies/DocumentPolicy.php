<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['staff_impor', 'manager_impor', 'admin']);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Document $document): bool
    {
        // Supplier hanya boleh melihat miliknya sendiri
        if ($user->role === 'supplier') {
            return $user->supplier && $document->supplier_id === $user->supplier->id;
        }

        return in_array($user->role, ['staff_impor', 'manager_impor', 'admin']);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->role === 'supplier';
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Document $document): bool
    {
        // Hanya Staff Impor yang memproses/mengisi metadata saat statusnya diproses/dibuat
        if ($user->role === 'staff_impor') {
            return in_array($document->status, ['submitted', 'staff_processing']);
        }

        return false;
    }

    /**
     * Determine whether the user can validate/approve/reject the model.
     */
    public function validate(User $user, Document $document): bool
    {
        return $user->role === 'manager_impor' && $document->status === 'pending_validation';
    }

    /**
     * Determine whether the user can prepare the model for archiving.
     */
    public function prepare(User $user, Document $document): bool
    {
        return $user->role === 'admin' && $document->status === 'validated';
    }

    /**
     * Determine whether the user can archive the model.
     */
    public function archive(User $user, Document $document): bool
    {
        return $user->role === 'admin' && $document->status === 'ready_to_archive';
    }
}
