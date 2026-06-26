<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreCmsFaqCategoryRequest;
use App\Http\Requests\Cms\StoreCmsFaqRequest;
use App\Http\Resources\CmsFaqCategoryResource;
use App\Http\Resources\CmsFaqResource;
use App\Models\CmsFaq;
use App\Models\CmsFaqCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CmsFaqController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CmsFaqResource::collection(
            CmsFaq::with('category')->ordered()->get()
        );
    }

    public function store(StoreCmsFaqRequest $request): JsonResponse
    {
        $faq = CmsFaq::create($request->validated());
        return response()->json(new CmsFaqResource($faq), 201);
    }

    public function show(CmsFaq $faq): JsonResponse
    {
        return response()->json(new CmsFaqResource($faq->load('category')));
    }

    public function update(StoreCmsFaqRequest $request, CmsFaq $faq): JsonResponse
    {
        $faq->update($request->validated());
        return response()->json(new CmsFaqResource($faq));
    }

    public function destroy(CmsFaq $faq): JsonResponse
    {
        $faq->delete();
        return response()->json(['message' => 'FAQ deleted successfully.']);
    }

    public function categories(): AnonymousResourceCollection
    {
        return CmsFaqCategoryResource::collection(
            CmsFaqCategory::ordered()->with(['faqs' => fn($q) => $q->ordered()])->get()
        );
    }

    public function storeCategory(StoreCmsFaqCategoryRequest $request): JsonResponse
    {
        $category = CmsFaqCategory::create($request->validated());
        return response()->json(new CmsFaqCategoryResource($category), 201);
    }

    public function updateCategory(StoreCmsFaqCategoryRequest $request, CmsFaqCategory $faqCategory): JsonResponse
    {
        $faqCategory->update($request->validated());
        return response()->json(new CmsFaqCategoryResource($faqCategory));
    }

    public function destroyCategory(CmsFaqCategory $faqCategory): JsonResponse
    {
        $faqCategory->faqs()->delete();
        $faqCategory->delete();
        return response()->json(['message' => 'FAQ category deleted successfully.']);
    }
}
