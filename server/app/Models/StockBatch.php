<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockBatch extends Model
{
    protected $fillable = [
        'product_id', 'supplier_id', 'batch_number', 'cost_price',
        'quantity', 'expiry_date', 'received_date',
    ];

    protected function casts(): array
    {
        return [
            'cost_price' => 'decimal:2',
            'expiry_date' => 'date',
            'received_date' => 'date',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }
}
