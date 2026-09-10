<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Product;
use App\Models\Sale;

class ExecutiveAdminController extends Controller
{
    public function index()
    {
        $dbConnection = DB::connection()->getPdo()->getAttribute(\PDO::ATTR_DRIVER_NAME);
        $dbSize = "N/A";
        if ($dbConnection === "sqlite") {
            $path = DB::connection()->getDatabaseName();
            if (file_exists($path)) {
                $dbSize = round(filesize($path) / 1024 / 1024, 2) . " MB";
            }
        }

        $metrics = [
            "system_status" => "ONLINE",
            "laravel_version" => app()->version(),
            "php_version" => phpversion(),
            "database_driver" => strtoupper($dbConnection),
            "database_size" => $dbSize,
            "total_users" => User::count(),
            "total_products" => Product::count(),
            "total_sales_records" => Sale::count(),
            "cache_driver" => env("CACHE_STORE", "file"),
            "environment" => env("APP_ENV", "production")
        ];

        return response()->json(["data" => $metrics]);
    }
}
