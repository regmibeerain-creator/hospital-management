<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class PasswordReset extends Model
{
    protected $fillable = [
        'user_id',
        'email',
        'token',
        'otp_code',
        'status',
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
        return $this->used_at === null
            && in_array($this->status, ['pending', 'otp_verified'])
            && Carbon::now()->lt($this->expires_at);
    }

    public function scopeValid($query)
    {
        return $query->whereNull('used_at')
            ->whereIn('status', ['pending', 'otp_verified'])
            ->where('expires_at', '>', Carbon::now());
    }
}
