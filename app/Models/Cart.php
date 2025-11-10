<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'package_id',
        'package_name',
        'package_price',
        'package_set',
        'main_item',
        'quantity',
        'number_of_pax',
        'selected_dishes',
        'selected_desserts',
        'delivery_date',
        'delivery_time',
        'delivery_address',
        'notes',
        'total_amount',
        'payment_method',
        'gcash_number',
        'gcash_receipt'
    ];

    protected $casts = [
        'selected_dishes' => 'array',
        'selected_desserts' => 'array',
        'delivery_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
