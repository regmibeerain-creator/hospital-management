<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreCmsMediaRequest;
use App\Http\Resources\CmsMediaResource;
use App\Models\CmsMedia;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class CmsMediaController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = CmsMedia::latest();
        if ($request->type) {
            $query->where('file_type', $request->type);
        }
        return CmsMediaResource::collection(
            $query->paginate($request->per_page ?? 24)
        );
    }

    public function store(StoreCmsMediaRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $path = $file->store('cms/media', 'public');

        $fileType = match (true) {
            str_starts_with($file->getMimeType(), 'image/') => 'image',
            str_starts_with($file->getMimeType(), 'video/') => 'video',
            default => 'document',
        };

        $media = CmsMedia::create([
            'name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $fileType,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'alt_text' => $request->alt_text,
            'caption' => $request->caption,
            'uploaded_by' => $request->user()->id,
        ]);

        return response()->json(new CmsMediaResource($media), 201);
    }

    public function update(Request $request, CmsMedia $media): JsonResponse
    {
        $validated = $request->validate([
            'alt_text' => 'nullable|string|max:500',
            'caption' => 'nullable|string|max:1000',
        ]);
        $media->update($validated);
        return response()->json(new CmsMediaResource($media));
    }

    public function destroy(CmsMedia $media): JsonResponse
    {
        Storage::disk('public')->delete($media->file_path);
        $media->delete();
        return response()->json(['message' => 'Media deleted successfully.']);
    }
}
