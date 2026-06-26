<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreCmsHospitalProfileRequest;
use App\Http\Resources\CmsHospitalProfileResource;
use App\Models\CmsHospitalProfile;
use Illuminate\Http\JsonResponse;

class CmsHospitalProfileController extends Controller
{
    public function show(): JsonResponse
    {
        $profile = CmsHospitalProfile::first();
        if (!$profile) {
            return response()->json(['data' => null]);
        }
        return response()->json(new CmsHospitalProfileResource($profile));
    }

    public function update(StoreCmsHospitalProfileRequest $request): JsonResponse
    {
        $profile = CmsHospitalProfile::first();
        if ($profile) {
            $profile->update($request->validated());
        } else {
            $profile = CmsHospitalProfile::create($request->validated());
        }
        return response()->json(new CmsHospitalProfileResource($profile));
    }
}
