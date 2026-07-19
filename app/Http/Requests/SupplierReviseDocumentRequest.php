<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SupplierReviseDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'supplier';
    }

    public function rules(): array
    {
        return [
            'document_number' => ['required', 'string', 'max:100', Rule::unique('documents', 'document_number')->ignore($this->route('document'))],
            'document_date' => ['required', 'date'],
            'goods_type' => ['required', 'string', 'max:255'],
            'origin_country' => ['required', 'string', 'max:100'],
            'goods_value' => ['required', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'files' => ['sometimes', 'array'],
            'files.*' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ];
    }
}
