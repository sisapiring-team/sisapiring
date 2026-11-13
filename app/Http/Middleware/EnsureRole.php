<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Silakan masuk terlebih dahulu.'], 401);
        }

        $role = $user->role?->value ?? $user->role;

        if ($roles !== [] && ! in_array($role, $roles, true)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke sumber daya ini.',
            ], 403);
        }

        if (method_exists($user, 'isSuspended') && $user->isSuspended()) {
            return response()->json([
                'message' => 'Akun Anda sedang dibekukan. Hubungi admin SisaPiring.',
            ], 403);
        }

        return $next($request);
    }
}
