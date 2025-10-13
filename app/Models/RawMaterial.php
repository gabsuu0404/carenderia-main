<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RawMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'unit',
        'unit_price',
        'total_value',
        'is_available',
        'is_hidden',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_value' => 'decimal:2',
        'is_available' => 'boolean',
        'is_hidden' => 'boolean',
    ];

    // Categories
    public const CATEGORY_MEAT = 'meat';
    public const CATEGORY_VEGETABLES = 'vegetables';
    public const CATEGORY_SPICES = 'spices';
    public const CATEGORY_DAIRY = 'dairy';
    public const CATEGORY_GRAINS = 'grains';
    public const CATEGORY_OTHER = 'other';

    // Units
    public const UNIT_KG = 'kg';
    public const UNIT_GRAMS = 'grams';
    public const UNIT_PIECES = 'pieces';
    public const UNIT_LITERS = 'liters';
    public const UNIT_CUPS = 'cups';
    public const UNIT_TABLESPOONS = 'tablespoons';

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeVisible($query)
    {
        return $query->where('is_hidden', false);
    }

    public function scopeHidden($query)
    {
        return $query->where('is_hidden', true);
    }

    public function hide()
    {
        $this->update(['is_hidden' => true]);
    }

    public function unhide()
    {
        $this->update(['is_hidden' => false]);
    }

    public function calculateTotalValue()
    {
        $unitPrice = $this->unit_price ?? 0;
        $this->total_value = $unitPrice;
        $this->save();
    }

}
