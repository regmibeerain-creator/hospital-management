<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class StoreCmsPostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:cms_posts,slug',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'nullable|string',
            'featured_image' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:cms_categories,id',
            'status' => 'required|in:draft,published',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:500',
        ];
    }
}
