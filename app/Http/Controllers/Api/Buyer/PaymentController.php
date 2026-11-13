<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $payments)
    {
    }

    public function show(Payment $payment): PaymentResource
    {
        $this->authorize('view', $payment);

        return new PaymentResource($payment);
    }

    public function mockPay(Payment $payment): JsonResponse
    {
        $this->authorize('view', $payment);

        $paid = $this->payments->mockPay($payment);

        return response()->json([
            'message' => 'Pembayaran mock berhasil.',
            'data' => new PaymentResource($paid),
        ]);
    }
}
