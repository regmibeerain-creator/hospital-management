<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalReport;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LaboratoryController extends Controller
{
    /**
     * List lab test orders/reports.
     */
    public function tests(Request $request): JsonResponse
    {
        $query = MedicalReport::with(['patient', 'doctor.user'])
            ->byType('lab')
            ->latest();

        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('report_title', 'like', "%{$s}%")
                  ->orWhereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$s}%")
                      ->orWhere('last_name', 'like', "%{$s}%")
                      ->orWhere('patient_id', 'like', "%{$s}%"));
            });
        }

        if ($request->status === 'pending') {
            $query->whereNull('file_path')->where(function ($q) {
                $q->whereNull('description')->orWhere('description', '');
            });
        }

        return response()->json(
            $query->paginate($request->per_page ?? 20)
        );
    }

    /**
     * Create a new lab test order.
     */
    public function storeTest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'report_title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $report = MedicalReport::create([
            'patient_id' => $validated['patient_id'],
            'doctor_id' => Doctor::where('user_id', $request->user()->id)->first()?->id,
            'appointment_id' => $validated['appointment_id'] ?? null,
            'report_title' => $validated['report_title'],
            'report_type' => 'lab',
            'description' => $validated['description'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'uploaded_by' => $request->user()->id,
        ]);

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'lab_test_ordered',
            'entity_type' => 'medical_report',
            'entity_id' => $report->id,
            'new_values' => ['title' => $report->report_title, 'patient_id' => $report->patient_id],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Lab test order created.',
            'data' => $report->load(['patient', 'doctor.user']),
        ], 201);
    }

    /**
     * View a single lab test/report.
     */
    public function showTest(MedicalReport $medicalReport): JsonResponse
    {
        if ($medicalReport->report_type !== 'lab') {
            return response()->json(['message' => 'Not a lab report.'], 404);
        }

        return response()->json([
            'data' => $medicalReport->load(['patient', 'doctor.user', 'uploadedBy']),
        ]);
    }

    /**
     * Enter lab test results (update description / attach file).
     */
    public function enterResults(Request $request, MedicalReport $medicalReport): JsonResponse
    {
        if ($medicalReport->report_type !== 'lab') {
            return response()->json(['message' => 'Not a lab report.'], 404);
        }

        $validated = $request->validate([
            'description' => 'required|string',
            'notes' => 'nullable|string',
            'file' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,doc,docx',
        ]);

        $data = [
            'description' => $validated['description'],
            'notes' => $validated['notes'] ?? $medicalReport->notes,
        ];

        if ($request->hasFile('file')) {
            $data['file_path'] = $request->file('file')->store('medical-reports/lab', 'public');
        }

        $medicalReport->update($data);

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'lab_results_entered',
            'entity_type' => 'medical_report',
            'entity_id' => $medicalReport->id,
            'new_values' => ['title' => $medicalReport->report_title],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Lab results entered.',
            'data' => $medicalReport->load(['patient', 'doctor.user']),
        ]);
    }

    /**
     * Lab dashboard stats.
     */
    public function stats(): JsonResponse
    {
        $total = MedicalReport::byType('lab');
        $pending = MedicalReport::byType('lab')
            ->whereNull('file_path')
            ->where(function ($q) {
                $q->whereNull('description')->orWhere('description', '');
            });

        return response()->json([
            'total_tests' => $total->count(),
            'pending_tests' => $pending->count(),
            'completed_today' => MedicalReport::byType('lab')
                ->whereNotNull('description')
                ->whereDate('updated_at', today())->count(),
        ]);
    }
}
