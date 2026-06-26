<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = AuditLog::with('user')
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json($logs);
    }

    public function show(AuditLog $auditLog): JsonResponse
    {
        return response()->json([
            'log' => $auditLog->load('user'),
        ]);
    }

    public function myLogs(Request $request): JsonResponse
    {
        $logs = AuditLog::where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json($logs);
    }
}
