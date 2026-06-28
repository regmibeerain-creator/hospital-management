<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PrescriptionResource;
use App\Models\Patient;
use App\Models\Prescription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PrescriptionController extends Controller
{
    /**
     * List prescriptions for the authenticated patient.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->firstOrFail();

        $query = Prescription::with(['doctor.user', 'items'])
            ->forPatient($patient->id)
            ->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return PrescriptionResource::collection(
            $query->paginate($request->per_page ?? 20)
        );
    }

    /**
     * View a single prescription with all items.
     */
    public function show(Request $request, Prescription $prescription): JsonResponse
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->firstOrFail();

        if ($prescription->patient_id !== $patient->id) {
            return response()->json(['message' => 'Prescription not found.'], 404);
        }

        $prescription->load(['doctor.user', 'items', 'appointment']);

        return response()->json(new PrescriptionResource($prescription));
    }

    /**
     * Get active prescriptions for the patient.
     */
    public function active(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->firstOrFail();

        $prescriptions = Prescription::with(['doctor.user', 'items'])
            ->forPatient($patient->id)
            ->active()
            ->latest()
            ->paginate($request->per_page ?? 20);

        return PrescriptionResource::collection($prescriptions);
    }
}
