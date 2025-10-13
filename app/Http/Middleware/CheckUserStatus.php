<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     * Check if the authenticated user is blocked and prevent access.
     */
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && Auth::user()->isBlocked()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            return redirect()->route('login')->with('error', 'Your account has been blocked. Please contact an administrator.');
        }

        return $next($request);
    }
}
