<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MedicalReportResource;
use App\Models\MedicalReport;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MedicalReportController extends Controller
{
    /**
     * List medical reports for the authenticated patient.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->firstOrFail();

        $query = MedicalReport::with('doctor.user', 'appointment')
            ->forPatient($patient->id)
            ->latest();

        if ($request->report_type) {
            $query->byType($request->report_type);
        }

        return MedicalReportResource::collection(
            $query->paginate($request->per_page ?? 20)
        );
    }

    /**
     * View a single medical report.
     */
    public function show(Request $request, MedicalReport $medicalReport): JsonResponse
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->firstOrFail();

        if ($medicalReport->patient_id !== $patient->id) {
            return response()->json(['message' => 'Report not found.'], 404);
        }

        $medicalReport->load(['doctor.user', 'appointment', 'uploadedBy']);

        return response()->json(new MedicalReportResource($medicalReport));
    }

    /**
     * Get report type summary/counts for the patient.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->firstOrFail();

        $reports = MedicalReport::forPatient($patient->id)->get();

        return response()->json([
            'total_reports' => $reports->count(),
            'by_type' => $reports->groupBy('report_type')->map->count(),
        ]);
    }
}
