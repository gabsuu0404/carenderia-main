<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'delivery_address',
        'delivery_date',
        'package_id',
        'package_name',
        'package_set',
        'main_item',
        'package_price',
        'number_of_pax',
        'selected_dishes',
        'selected_desserts',
        'total_amount',
        'status',
        'notes'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'delivery_date' => 'date',
        'selected_dishes' => 'array',
        'selected_desserts' => 'array',
    ];

    /**
     * Get the user who placed the order.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
