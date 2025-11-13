<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_id',
        'stock_transaction_item_id',
        'quantity',
        'original_quantity',
        'expiry_date',
        'stock_in_date',
    ];

    protected $casts = [
        'expiry_date' => 'date',
        'stock_in_date' => 'date',
    ];

    /**
     * Get the inventory that owns this batch.
     */
    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }

    /**
     * Get the stock transaction item.
     */
    public function stockTransactionItem()
    {
        return $this->belongsTo(StockTransactionItem::class);
    }

    /**
     * Scope to get batches ordered by FIFO (earliest expiry first, then earliest stock-in date)
     */
    public function scopeFifo($query, $inventoryId)
    {
        return $query->where('inventory_id', $inventoryId)
                     ->where('quantity', '>', 0)
                     ->orderByRaw('CASE WHEN expiry_date IS NULL THEN 1 ELSE 0 END') // Non-expiring items last
                     ->orderBy('expiry_date', 'asc')
                     ->orderBy('stock_in_date', 'asc');
    }
}
