<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreCmsHealthPackageRequest;
use App\Http\Resources\CmsHealthPackageResource;
use App\Models\CmsHealthPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CmsHealthPackageController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = CmsHealthPackage::latest();
        if ($request->search) {
            $query->where('title', 'like', "%{$request->search}%");
        }
        return CmsHealthPackageResource::collection(
            $query->paginate($request->per_page ?? 20)
        );
    }

    public function store(StoreCmsHealthPackageRequest $request): JsonResponse
    {
        $package = CmsHealthPackage::create($request->validated());
        return response()->json(new CmsHealthPackageResource($package), 201);
    }

    public function show(CmsHealthPackage $healthPackage): JsonResponse
    {
        return response()->json(new CmsHealthPackageResource($healthPackage));
    }

    public function update(StoreCmsHealthPackageRequest $request, CmsHealthPackage $healthPackage): JsonResponse
    {
        $healthPackage->update($request->validated());
        return response()->json(new CmsHealthPackageResource($healthPackage));
    }

    public function destroy(CmsHealthPackage $healthPackage): JsonResponse
    {
        $healthPackage->delete();
        return response()->json(['message' => 'Health package deleted successfully.']);
    }
}
