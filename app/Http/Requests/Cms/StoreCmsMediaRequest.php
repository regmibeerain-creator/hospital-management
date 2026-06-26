<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class StoreCmsMediaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp,svg,pdf,doc,docx,mp4,avi|max:102400',
            'alt_text' => 'nullable|string|max:500',
            'caption' => 'nullable|string|max:1000',
        ];
    }
}
