<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('cash_reconciliations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('worker_id')->constrained('users');
            $table->timestamp('shift_start_time');
            $table->timestamp('shift_end_time');
            $table->decimal('expected_cash', 10, 2);
            $table->decimal('actual_counted_cash', 10, 2);
            $table->decimal('difference', 10, 2);
            $table->enum('status', ['short', 'over', 'balanced']);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cash_reconciliations');
    }
};
