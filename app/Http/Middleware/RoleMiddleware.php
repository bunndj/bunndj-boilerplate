<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!auth()->check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = auth()->user();
        
        // Check if user has the required role
        if (!$this->hasRole($user, $role)) {
            return response()->json([
                'message' => 'Access denied. Insufficient permissions.',
                'required_role' => $role,
                'user_role' => $user->role
            ], 403);
        }

        return $next($request);
    }

    /**
     * Check if user has the required role
     */
    private function hasRole($user, string $role): bool
    {
        switch ($role) {
            case 'admin':
                return $user->isAdmin();
            case 'dj':
                return $user->isDj();
            case 'client':
                return $user->isClient();
            case 'admin_or_dj':
                return $user->isAdmin() || $user->isDj();
            case 'dj_or_client':
                return $user->isDj() || $user->isClient();
            default:
                return false;
        }
    }
}