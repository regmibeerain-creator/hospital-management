<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class OtpCode extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'code',
        'type',
        'expires_at',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isValid(): bool
    {
        return $this->used_at === null && Carbon::now()->lt($this->expires_at);
    }

    public function scopeValidForEmail($query, string $email, string $type)
    {
        return $query->where('email', $email)
            ->where('type', $type)
            ->whereNull('used_at')
            ->where('expires_at', '>', Carbon::now());
    }
}
