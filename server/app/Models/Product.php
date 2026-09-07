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
     * Batches that may actually be dispensed: in stock and not past expiry.
     * Expired stock stays on the books (it still has to be written off) but is
     * never counted as sellable.
     */
    public function sellableBatches(): HasMany
    {
        return $this->stockBatches()
            ->where('quantity', '>', 0)
            ->whereDate('expiry_date', '>=', now()->toDateString());
    }

    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    /**
     * Sellable stock across all batches.
     *
     * Prefers an aggregate already loaded by the query (e.g.
     * `withSum('sellableBatches as total_stock', 'quantity')`) so that eager
     * aggregation isn't silently discarded and re-queried per model.
     */
    public function getTotalStockAttribute(): int
    {
        if (array_key_exists('total_stock', $this->attributes)) {
            return (int) $this->attributes['total_stock'];
        }

        return (int) $this->sellableBatches()->sum('quantity');
    }
}
