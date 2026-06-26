<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreCmsPageRequest;
use App\Http\Requests\Cms\UpdateCmsPageRequest;
use App\Http\Resources\CmsPageResource;
use App\Models\CmsPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CmsPageController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = CmsPage::with('author');
        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }
        return CmsPageResource::collection(
            $query->latest()->paginate($request->per_page ?? 20)
        );
    }

    public function store(StoreCmsPageRequest $request): JsonResponse
    {
        $page = CmsPage::create([
            ...$request->validated(),
            'created_by' => $request->user()->id,
            'published_at' => $request->status === 'published' ? now() : null,
        ]);
        return response()->json(new CmsPageResource($page), 201);
    }

    public function show(CmsPage $page): JsonResponse
    {
        return response()->json(new CmsPageResource($page->load('author')));
    }

    public function update(UpdateCmsPageRequest $request, CmsPage $page): JsonResponse
    {
        $page->update([
            ...$request->validated(),
            'published_at' => $request->status === 'published' && !$page->published_at ? now() : $page->published_at,
        ]);
        return response()->json(new CmsPageResource($page));
    }

    public function destroy(CmsPage $page): JsonResponse
    {
        $page->delete();
        return response()->json(['message' => 'Page deleted successfully.']);
    }
}
