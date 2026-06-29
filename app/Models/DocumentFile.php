<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['document_id', 'file_path', 'file_name', 'mime_type', 'file_size', 'uploaded_by'])]
class DocumentFile extends Model
{
    public $timestamps = false;

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
