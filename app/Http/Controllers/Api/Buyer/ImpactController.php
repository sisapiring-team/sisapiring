<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Http\Controllers\Controller;
use App\Services\ImpactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ImpactController extends Controller
{
    public function __construct(private readonly ImpactService $impact)
    {
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json($this->impact->summary($request->user()));
    }
}
