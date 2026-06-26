<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LoginLogResource;
use App\Models\LoginLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoginLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = LoginLog::where('user_id', $request->user()->id)
            ->latest('login_at')
            ->paginate(20);

        return response()->json(LoginLogResource::collection($logs));
    }

    public function show(LoginLog $loginLog): JsonResponse
    {
        if ($loginLog->user_id !== request()->user()->id) {
            abort(403);
        }

        return response()->json(new LoginLogResource($loginLog));
    }
}
