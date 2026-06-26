<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\CmsInquiryResource;
use App\Models\CmsInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CmsInquiryController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = CmsInquiry::latest();
        if ($request->unread) {
            $query->unread();
        }
        return CmsInquiryResource::collection(
            $query->paginate($request->per_page ?? 20)
        );
    }

    public function show(CmsInquiry $inquiry): JsonResponse
    {
        $inquiry->markAsRead();
        return response()->json(new CmsInquiryResource($inquiry));
    }

    public function markRead(CmsInquiry $inquiry): JsonResponse
    {
        $inquiry->markAsRead();
        return response()->json(new CmsInquiryResource($inquiry));
    }

    public function destroy(CmsInquiry $inquiry): JsonResponse
    {
        $inquiry->delete();
        return response()->json(['message' => 'Inquiry deleted successfully.']);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total' => CmsInquiry::count(),
            'unread' => CmsInquiry::unread()->count(),
        ]);
    }
}
