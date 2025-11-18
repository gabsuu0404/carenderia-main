<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;

class ClearOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:clear {--force : Force the operation without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all orders from the database';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $ordersCount = Order::count();
        
        if ($ordersCount === 0) {
            $this->info('No orders found in the database.');
            return 0;
        }

        $this->warn("Found {$ordersCount} order(s) in the database.");

        if (!$this->option('force')) {
            if (!$this->confirm('Do you want to delete all orders? This action cannot be undone.')) {
                $this->info('Operation cancelled.');
                return 0;
            }
        }

        Order::truncate();
        
        $this->info("Successfully deleted {$ordersCount} order(s) from the database.");
        
        return 0;
    }
}
