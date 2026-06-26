<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class StoreCmsHealthPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:cms_health_packages,slug',
            'description' => 'nullable|string',
            'included_services' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'duration' => 'nullable|string|max:100',
            'featured_image' => 'nullable|string|max:255',
            'is_featured' => 'boolean',
            'status' => 'required|in:draft,published',
        ];
    }
}
