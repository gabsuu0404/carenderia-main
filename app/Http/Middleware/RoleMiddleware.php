<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class RoleMiddleware
{
	/**
	 * Handle an incoming request.
	 * Expected usage: ->middleware('role:admin') or multiple roles comma-separated.
	 */
	public function handle(Request $request, Closure $next, string $roles)
	{
		$user = $request->user();
		$allowedRoles = array_map('trim', explode(',', strtolower($roles)));
		if (!$user || !in_array(strtolower((string) $user->role), $allowedRoles, true)) {
			throw new AccessDeniedHttpException('You are not authorized to access this resource.');
		}
		return $next($request);
	}
}


