<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreCmsFaqCategoryRequest;
use App\Http\Resources\CmsCategoryResource;
use App\Models\CmsCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CmsCategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CmsCategoryResource::collection(
            CmsCategory::ordered()->withCount('posts')->get()
        );
    }

    public function store(StoreCmsFaqCategoryRequest $request): JsonResponse
    {
        $category = CmsCategory::create($request->validated());
        return response()->json(new CmsCategoryResource($category), 201);
    }

    public function show(CmsCategory $category): JsonResponse
    {
        return response()->json(new CmsCategoryResource($category->loadCount('posts')));
    }

    public function update(StoreCmsFaqCategoryRequest $request, CmsCategory $category): JsonResponse
    {
        $category->update($request->validated());
        return response()->json(new CmsCategoryResource($category));
    }

    public function destroy(CmsCategory $category): JsonResponse
    {
        if ($category->posts()->count() > 0) {
            return response()->json(['message' => 'Cannot delete category with existing posts.'], 422);
        }
        $category->delete();
        return response()->json(['message' => 'Category deleted successfully.']);
    }
}
