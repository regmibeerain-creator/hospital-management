<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class StoreCmsHospitalProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'hospital_name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:500',
            'about' => 'nullable|string',
            'mission' => 'nullable|string',
            'vision' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|string|max:255',
            'logo' => 'nullable|string|max:255',
            'favicon' => 'nullable|string|max:255',
            'social_links' => 'nullable|array',
        ];
    }
}
