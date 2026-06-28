<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->user()?->id;

        return [
            'name' => 'required|string|max:255',
            'mobile_number' => [
                'nullable',
                'string',
                'max:20',
                $userId ? Rule::unique('users', 'mobile_number')->ignore($userId) : 'unique:users,mobile_number',
            ],
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Name is required.',
            'mobile_number.unique' => 'This phone number is already registered.',
            'avatar.image' => 'Avatar must be an image file.',
            'avatar.mimes' => 'Avatar must be a JPG, PNG, or WebP file.',
            'avatar.max' => 'Avatar must not exceed 2MB.',
        ];
    }
}
