<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    protected $fillable = [
        'name', 'sku', 'category', 'description', 'unit',
        'unit_price', 'selling_price', 'current_stock',
        'minimum_stock', 'reorder_level',
        'manufacturer', 'supplier', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'selling_price' => 'decimal:2',
            'current_stock' => 'integer',
            'minimum_stock' => 'integer',
            'reorder_level' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function stockMovements(): HasMany { return $this->hasMany(StockMovement::class); }

    public function scopeActive($q) { return $q->where('is_active', true); }
    public function scopeLowStock($q) { return $q->where('current_stock', '<=', 'minimum_stock'); }
    public function scopeNeedsReorder($q) { return $q->where('current_stock', '<=', 'reorder_level'); }

    public function isLowStock(): bool { return $this->current_stock <= $this->minimum_stock; }
    public function needsReorder(): bool { return $this->current_stock <= $this->reorder_level; }
}
