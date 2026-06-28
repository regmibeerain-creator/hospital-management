<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Notification::forUser($request->user()->id)->latest();

        if ($request->unread_only) {
            $query->unread();
        }

        return response()->json(
            $query->paginate($request->per_page ?? 20)
        );
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'count' => Notification::forUser($request->user()->id)->unread()->count(),
        ]);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $notification->markAsRead();
        return response()->json(['message' => 'Marked as read.', 'data' => $notification]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        Notification::forUser($request->user()->id)->unread()->update(['read_at' => now()]);
        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function destroy(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $notification->delete();
        return response()->json(['message' => 'Notification dismissed.']);
    }
}
