<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockTransactionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'stock_transaction_id',
        'inventory_id',
        'quantity',
        'quantity_before',
        'quantity_after',
        'expiry_date',
        'reason',
    ];

    protected $casts = [
        'expiry_date' => 'date',
    ];

    public function transaction()
    {
        return $this->belongsTo(StockTransaction::class, 'stock_transaction_id');
    }

    public function inventory()
    {
        return $this->belongsTo(Inventory::class);
    }
}
