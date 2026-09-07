<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashReconciliation extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'shift_start_time' => 'datetime',
        'shift_end_time' => 'datetime',
    ];

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }
}
