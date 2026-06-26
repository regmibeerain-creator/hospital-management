<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreCmsPostRequest;
use App\Http\Resources\CmsPostResource;
use App\Models\CmsPost;
use App\Models\CmsCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CmsPostController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = CmsPost::with('category', 'author');
        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }
        return CmsPostResource::collection(
            $query->latest()->paginate($request->per_page ?? 20)
        );
    }

    public function store(StoreCmsPostRequest $request): JsonResponse
    {
        $post = CmsPost::create([
            ...$request->validated(),
            'author_id' => $request->user()->id,
            'published_at' => $request->status === 'published' ? now() : null,
        ]);
        return response()->json(new CmsPostResource($post->load('category', 'author')), 201);
    }

    public function show(CmsPost $post): JsonResponse
    {
        return response()->json(new CmsPostResource($post->load('category', 'author')));
    }

    public function update(StoreCmsPostRequest $request, CmsPost $post): JsonResponse
    {
        $post->update([
            ...$request->validated(),
            'published_at' => $request->status === 'published' && !$post->published_at ? now() : $post->published_at,
        ]);
        return response()->json(new CmsPostResource($post->load('category', 'author')));
    }

    public function destroy(CmsPost $post): JsonResponse
    {
        $post->delete();
        return response()->json(['message' => 'Post deleted successfully.']);
    }
}
