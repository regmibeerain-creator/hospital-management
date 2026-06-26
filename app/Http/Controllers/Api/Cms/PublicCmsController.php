<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Resources\CmsCategoryResource;
use App\Http\Resources\CmsFaqCategoryResource;
use App\Http\Resources\CmsHealthPackageResource;
use App\Http\Resources\CmsHospitalProfileResource;
use App\Http\Resources\CmsInquiryResource;
use App\Http\Resources\CmsMediaResource;
use App\Http\Resources\CmsPageResource;
use App\Http\Resources\CmsPostResource;
use App\Models\CmsCategory;
use App\Models\CmsFaqCategory;
use App\Models\CmsHealthPackage;
use App\Models\CmsHospitalProfile;
use App\Models\CmsInquiry;
use App\Models\CmsMedia;
use App\Models\CmsPage;
use App\Models\CmsPost;
use App\Http\Requests\Cms\StoreCmsInquiryRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicCmsController extends Controller
{
    public function hospitalProfile(): JsonResponse
    {
        $profile = CmsHospitalProfile::first();
        if (!$profile) {
            return response()->json(['data' => null]);
        }
        return response()->json(new CmsHospitalProfileResource($profile));
    }

    public function pages(): AnonymousResourceCollection
    {
        return CmsPageResource::collection(
            CmsPage::published()->orderBy('title')->get()
        );
    }

    public function page(string $slug): JsonResponse
    {
        $page = CmsPage::where('slug', $slug)->published()->firstOrFail();
        return response()->json(new CmsPageResource($page));
    }

    public function posts(Request $request): AnonymousResourceCollection
    {
        $query = CmsPost::published()->with('category', 'author');

        if ($request->category) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        if ($request->featured) {
            $query->featured();
        }

        return CmsPostResource::collection(
            $query->latest('published_at')->paginate($request->per_page ?? 12)
        );
    }

    public function post(string $slug): JsonResponse
    {
        $post = CmsPost::where('slug', $slug)->published()->with('category', 'author')->firstOrFail();
        return response()->json(new CmsPostResource($post));
    }

    public function categories(): AnonymousResourceCollection
    {
        return CmsCategoryResource::collection(
            CmsCategory::active()->ordered()->withCount('posts')->get()
        );
    }

    public function faqs(): AnonymousResourceCollection
    {
        return CmsFaqCategoryResource::collection(
            CmsFaqCategory::ordered()->with(['faqs' => fn($q) => $q->published()->ordered()])->get()
        );
    }

    public function healthPackages(Request $request): AnonymousResourceCollection
    {
        $query = CmsHealthPackage::published();

        if ($request->featured) {
            $query->featured();
        }

        return CmsHealthPackageResource::collection(
            $query->latest()->paginate($request->per_page ?? 20)
        );
    }

    public function healthPackage(string $slug): JsonResponse
    {
        $package = CmsHealthPackage::where('slug', $slug)->published()->firstOrFail();
        return response()->json(new CmsHealthPackageResource($package));
    }

    public function media(): AnonymousResourceCollection
    {
        return CmsMediaResource::collection(
            CmsMedia::latest()->paginate(24)
        );
    }

    public function submitInquiry(StoreCmsInquiryRequest $request): JsonResponse
    {
        $inquiry = CmsInquiry::create($request->validated());
        return response()->json(new CmsInquiryResource($inquiry), 201);
    }
}
