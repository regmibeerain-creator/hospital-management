<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bill extends Model
{
    protected $fillable = [
        'bill_number', 'patient_id', 'episode_id',
        'subtotal', 'discount', 'tax', 'total', 'paid_amount', 'due_amount',
        'status', 'notes', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount' => 'decimal:2',
            'tax' => 'decimal:2',
            'total' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'due_amount' => 'decimal:2',
        ];
    }

    public function patient(): BelongsTo { return $this->belongsTo(Patient::class); }
    public function items(): HasMany { return $this->hasMany(BillItem::class); }
    public function payments(): HasMany { return $this->hasMany(Payment::class); }
    public function createdBy(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }

    public function scopeDraft($q) { return $q->where('status', 'draft'); }
    public function scopeUnpaid($q) { return $q->whereIn('status', ['waiting_payment', 'partially_paid']); }
    public function scopePaid($q) { return $q->where('status', 'paid'); }

    public static function generateBillNumber(): string
    {
        $year = now()->format('Y');
        $last = static::whereYear('created_at', $year)->max('id') ?? 0;
        return 'BILL-' . $year . '-' . str_pad($last + 1, 5, '0', STR_PAD_LEFT);
    }

    public function recalculate(): void
    {
        $this->subtotal = $this->items()->sum('total');
        $this->total = $this->subtotal - $this->discount + $this->tax;
        $this->paid_amount = $this->payments()->where('status', 'completed')->sum('amount');
        $this->due_amount = max(0, $this->total - $this->paid_amount);

        if ($this->due_amount <= 0 && $this->paid_amount > 0) {
            $this->status = 'paid';
        } elseif ($this->paid_amount > 0) {
            $this->status = 'partially_paid';
        }

        $this->save();
    }

    public function canBeVoided(): bool
    {
        return in_array($this->status, ['draft', 'waiting_payment', 'partially_paid']);
    }
}
