<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CmsHospitalProfile extends Model
{
    protected $fillable = [
        'hospital_name',
        'tagline',
        'about',
        'mission',
        'vision',
        'address',
        'phone',
        'email',
        'website',
        'logo',
        'favicon',
        'social_links',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
        ];
    }
}
