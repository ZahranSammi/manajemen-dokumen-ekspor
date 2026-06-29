<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ManagerValidateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'manager_impor';
    }

    public function rules(): array
    {
        return [
            'decision' => ['required', 'string', 'in:approve,reject'],
            'reason' => ['required_if:decision,reject', 'nullable', 'string', 'max:2000'],
        ];
    }
}
