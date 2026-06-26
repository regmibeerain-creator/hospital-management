<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeviceLogResource;
use App\Models\DeviceLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $devices = DeviceLog::where('user_id', $request->user()->id)
            ->latest('last_login_at')
            ->get();

        return response()->json(DeviceLogResource::collection($devices));
    }

    public function show(DeviceLog $deviceLog): JsonResponse
    {
        if ($deviceLog->user_id !== request()->user()->id) {
            abort(403);
        }

        return response()->json(new DeviceLogResource($deviceLog));
    }
}
