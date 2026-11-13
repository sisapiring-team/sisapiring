<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImpactService;
use Illuminate\Http\JsonResponse;

class ImpactController extends Controller
{
    public function __construct(private readonly ImpactService $impact)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json($this->impact->summary());
    }
}
