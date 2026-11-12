<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CatalogItemResource;
use App\Models\Product;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CatalogController extends Controller
{
    /**
     * Public marketplace catalog (active products across all merchants).
     */
    public function index(): AnonymousResourceCollection
    {
        $products = Product::query()
            ->with('merchant')
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->latest()
            ->get();

        return CatalogItemResource::collection($products);
    }
}
