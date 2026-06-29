<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StaffProcessDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'staff_impor';
    }

    public function rules(): array
    {
        return [
            'document_number' => ['sometimes', 'string', 'max:100'],
            'document_date' => ['sometimes', 'date'],
            'goods_type' => ['sometimes', 'string', 'max:255'],
            'origin_country' => ['sometimes', 'string', 'max:100'],
            'goods_value' => ['sometimes', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
