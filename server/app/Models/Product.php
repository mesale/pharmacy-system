<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $fillable = [
        'name', 'category_id', 'barcode', 'unit', 'selling_price',
        'reorder_level', 'requires_prescription', 'is_controlled',
    ];

    protected function casts(): array
    {
        return [
            'selling_price' => 'decimal:2',
            'requires_prescription' => 'boolean',
            'is_controlled' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function stockBatches(): HasMany
    {
        return $this->hasMany(StockBatch::class)->orderBy('expiry_date', 'asc');
    }

    /**
     * Total stock across all batches.
     */
    public function getTotalStockAttribute(): int
    {
        return $this->stockBatches()->sum('quantity');
    }
}
