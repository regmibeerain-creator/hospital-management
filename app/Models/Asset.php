<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Asset extends Model
{
    protected $fillable = [
        'name', 'asset_tag', 'category', 'model', 'serial_number',
        'manufacturer', 'purchase_date', 'purchase_price', 'current_value',
        'location', 'status', 'notes', 'warranty_expiry',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'purchase_price' => 'decimal:2',
            'current_value' => 'decimal:2',
            'warranty_expiry' => 'date',
        ];
    }

    public function maintenanceLogs(): HasMany { return $this->hasMany(MaintenanceLog::class); }

    public function scopeActive($q) { return $q->where('status', 'active'); }
    public function scopeUnderMaintenance($q) { return $q->where('status', 'maintenance'); }
}
