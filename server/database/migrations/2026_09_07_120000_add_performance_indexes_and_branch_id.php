<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The original tables carried only the indexes that foreign keys create
 * implicitly. Every hot query in this system filters or sorts on columns that
 * had none:
 *
 *  - FEFO dispensing sorts a product's batches by expiry_date on every sale.
 *  - The dashboard and the purchasing suggestions scan stock_batches by
 *    expiry_date across the whole catalogue.
 *  - The reports and the shift reconciliation both range-scan sales by
 *    created_at, and the reconciliation scopes that to one worker.
 *
 * This also adds the branch_id column the design reserved for future
 * multi-branch support. It is deliberately nullable and unconstrained: it is a
 * placeholder, and the design doc warns that retrofitting it once there is
 * production data is painful.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_batches', function (Blueprint $table) {
            // Serves the FEFO lookup: batches of one product, earliest expiry first.
            $table->index(['product_id', 'expiry_date'], 'stock_batches_product_expiry_idx');
            // Serves catalogue-wide expiring/expired sweeps.
            $table->index('expiry_date', 'stock_batches_expiry_idx');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->index('created_at', 'sales_created_at_idx');
            $table->index(['worker_id', 'created_at'], 'sales_worker_created_at_idx');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('branch_id')->nullable()->after('id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('stock_batches', function (Blueprint $table) {
            $table->dropIndex('stock_batches_product_expiry_idx');
            $table->dropIndex('stock_batches_expiry_idx');
        });

        Schema::table('sales', function (Blueprint $table) {
            $table->dropIndex('sales_created_at_idx');
            $table->dropIndex('sales_worker_created_at_idx');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['branch_id']);
            $table->dropColumn('branch_id');
        });
    }
};
