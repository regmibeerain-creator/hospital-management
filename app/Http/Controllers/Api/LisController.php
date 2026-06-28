<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LabTestCatalog;
use App\Models\LabSample;
use App\Models\LabTestOrder;
use App\Models\LabTestResult;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LisController extends Controller
{
    // ─── Test Catalog ───

    public function catalogIndex(Request $request): JsonResponse
    {
        $query = LabTestCatalog::query();

        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('test_name', 'like', "%{$s}%")
                  ->orWhere('test_code', 'like', "%{$s}%")
                  ->orWhere('department', 'like', "%{$s}%");
            });
        }

        if ($request->department) $query->where('department', $request->department);

        return response()->json(
            $query->latest()->paginate($request->per_page ?? 50)
        );
    }

    public function catalogStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'test_name' => 'required|string|max:255',
            'test_code' => 'required|string|max:50|unique:lab_test_catalogs,test_code',
            'department' => 'nullable|string|max:100',
            'specimen_type' => 'nullable|string|max:100',
            'unit' => 'nullable|string|max:50',
            'reference_range_low' => 'nullable|numeric',
            'reference_range_high' => 'nullable|numeric',
            'reference_range_text' => 'nullable|string',
            'gender' => 'nullable|in:male,female',
            'age_min' => 'nullable|integer|min:0',
            'age_max' => 'nullable|integer|min:0',
            'turnaround_minutes' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'instructions' => 'nullable|string',
        ]);

        $catalog = LabTestCatalog::create($validated);
        return response()->json(['message' => 'Test created.', 'data' => $catalog], 201);
    }

    public function catalogUpdate(Request $request, LabTestCatalog $labTestCatalog): JsonResponse
    {
        $validated = $request->validate([
            'test_name' => 'sometimes|string|max:255',
            'test_code' => 'sometimes|string|max:50|unique:lab_test_catalogs,test_code,' . $labTestCatalog->id,
            'department' => 'nullable|string|max:100',
            'specimen_type' => 'nullable|string|max:100',
            'unit' => 'nullable|string|max:50',
            'reference_range_low' => 'nullable|numeric',
            'reference_range_high' => 'nullable|numeric',
            'reference_range_text' => 'nullable|string',
            'gender' => 'nullable|in:male,female',
            'age_min' => 'nullable|integer|min:0',
            'age_max' => 'nullable|integer|min:0',
            'turnaround_minutes' => 'nullable|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'instructions' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $labTestCatalog->update($validated);
        return response()->json(['message' => 'Test updated.', 'data' => $labTestCatalog]);
    }

    // ─── Test Orders ───

    public function orders(Request $request): JsonResponse
    {
        $query = LabTestOrder::with(['patient', 'doctor.user', 'orderedBy', 'labSample', 'results.testCatalog']);

        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                  ->orWhereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$s}%")
                      ->orWhere('last_name', 'like', "%{$s}%")
                      ->orWhere('patient_id', 'like', "%{$s}%"));
            });
        }

        if ($request->status) $query->where('status', $request->status);
        if ($request->priority) $query->where('priority', $request->priority);

        return response()->json(
            $query->latest()->paginate($request->per_page ?? 20)
        );
    }

    public function storeOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'priority' => 'nullable|in:routine,urgent,stat',
            'clinical_notes' => 'nullable|string',
            'tests' => 'required|array|min:1',
            'tests.*.catalog_id' => 'required|exists:lab_test_catalogs,id',
        ]);

        $doctor = Doctor::where('user_id', $request->user()->id)->first();

        DB::beginTransaction();
        try {
            $order = LabTestOrder::create([
                'patient_id' => $validated['patient_id'],
                'doctor_id' => $doctor?->id,
                'appointment_id' => $validated['appointment_id'] ?? null,
                'order_number' => LabTestOrder::generateOrderNumber(),
                'priority' => $validated['priority'] ?? 'routine',
                'clinical_notes' => $validated['clinical_notes'] ?? null,
                'status' => 'ordered',
                'ordered_by' => $request->user()->id,
            ]);

            foreach ($validated['tests'] as $test) {
                $catalog = LabTestCatalog::findOrFail($test['catalog_id']);
                LabTestResult::create([
                    'lab_test_order_id' => $order->id,
                    'lab_test_catalog_id' => $catalog->id,
                    'unit' => $catalog->unit,
                    'reference_range_low' => $catalog->reference_range_low,
                    'reference_range_high' => $catalog->reference_range_high,
                    'reference_range_text' => $catalog->reference_range_text,
                    'status' => 'pending',
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Lab order created.',
                'data' => $order->load(['patient', 'doctor.user', 'results.testCatalog']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create order.'], 500);
        }
    }

    public function showOrder(LabTestOrder $labTestOrder): JsonResponse
    {
        return response()->json([
            'data' => $labTestOrder->load(['patient', 'doctor.user', 'orderedBy', 'labSample', 'results.testCatalog', 'results.enteredBy', 'results.validatedBy']),
        ]);
    }

    // ─── Sample Collection ───

    public function samples(Request $request): JsonResponse
    {
        $query = LabSample::with(['patient', 'collectedBy']);

        if ($request->status) $query->byStatus($request->status);
        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('accession_number', 'like', "%{$s}%")
                  ->orWhereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$s}%")
                      ->orWhere('last_name', 'like', "%{$s}%")
                      ->orWhere('patient_id', 'like', "%{$s}%"));
            });
        }

        return response()->json(
            $query->latest()->paginate($request->per_page ?? 20)
        );
    }

    public function collectSample(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'specimen_type' => 'required|string|max:100',
            'notes' => 'nullable|string',
            'order_ids' => 'required|array|min:1',
            'order_ids.*' => 'exists:lab_test_orders,id',
        ]);

        DB::beginTransaction();
        try {
            $sample = LabSample::create([
                'patient_id' => $validated['patient_id'],
                'collected_by' => $request->user()->id,
                'accession_number' => LabSample::generateAccessionNumber(),
                'specimen_type' => $validated['specimen_type'],
                'status' => 'collected',
                'collected_at' => now(),
                'notes' => $validated['notes'] ?? null,
            ]);

            LabTestOrder::whereIn('id', $validated['order_ids'])
                ->update(['lab_sample_id' => $sample->id, 'status' => 'collected']);

            DB::commit();

            return response()->json([
                'message' => 'Sample collected.',
                'data' => $sample->load(['patient', 'collectedBy', 'testOrders']),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to collect sample.'], 500);
        }
    }

    public function accessionSample(LabSample $labSample): JsonResponse
    {
        if ($labSample->status !== 'collected') {
            return response()->json(['message' => 'Sample must be in collected status.'], 422);
        }

        $labSample->update([
            'status' => 'accessioned',
            'accessioned_at' => now(),
        ]);

        // Mark orders as in_progress
        $labSample->testOrders()->update(['status' => 'in_progress']);

        return response()->json(['message' => 'Sample accessioned.', 'data' => $labSample->load('testOrders')]);
    }

    // ─── Results ───

    public function pendingResults(Request $request): JsonResponse
    {
        $results = LabTestResult::with(['testOrder.patient', 'testCatalog'])
            ->pending()
            ->whereHas('testOrder', fn ($q) => $q->whereIn('status', ['in_progress', 'collected']))
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json($results);
    }

    public function enterResult(Request $request, LabTestResult $labTestResult): JsonResponse
    {
        if ($labTestResult->status !== 'pending') {
            return response()->json(['message' => 'Result is not in pending status.'], 422);
        }

        $validated = $request->validate([
            'result_value' => 'nullable|numeric',
            'result_text' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $data = [
            'result_value' => $validated['result_value'] ?? null,
            'result_text' => $validated['result_text'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'entered_by' => $request->user()->id,
            'status' => 'completed',
        ];

        // Calculate flag based on result vs reference range
        $labTestResult->fill($data);
        $labTestResult->flag = $labTestResult->calculateCriticalFlag();
        $labTestResult->save();

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'lab_result_entered',
            'entity_type' => 'lab_test_result',
            'entity_id' => $labTestResult->id,
            'new_values' => ['test_id' => $labTestResult->lab_test_catalog_id, 'value' => $labTestResult->result_value],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Result entered.',
            'data' => $labTestResult->load(['testCatalog', 'testOrder.patient']),
        ]);
    }

    public function validateResult(Request $request, LabTestResult $labTestResult): JsonResponse
    {
        if ($labTestResult->status !== 'completed') {
            return response()->json(['message' => 'Result must be completed before validation.'], 422);
        }

        $labTestResult->update([
            'status' => 'validated',
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
        ]);

        // Check if all results in the order are validated -> mark order as completed
        $order = $labTestResult->testOrder;
        $allValidated = $order->results()->whereNotIn('status', ['validated'])->count() === 0;
        if ($allValidated) {
            $order->update(['status' => 'completed']);

            // Auto-release any associated sample
            if ($order->labSample && $order->labSample->status === 'accessioned') {
                $order->labSample->update([
                    'status' => 'released',
                    'released_at' => now(),
                ]);
            }
        }

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'lab_result_validated',
            'entity_type' => 'lab_test_result',
            'entity_id' => $labTestResult->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Result validated.',
            'data' => $labTestResult->load(['testCatalog', 'testOrder.patient', 'validatedBy']),
        ]);
    }

    public function bulkValidate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'result_ids' => 'required|array|min:1',
            'result_ids.*' => 'exists:lab_test_results,id',
        ]);

        $count = 0;
        foreach ($validated['result_ids'] as $id) {
            $result = LabTestResult::find($id);
            if ($result && $result->status === 'completed') {
                $result->update([
                    'status' => 'validated',
                    'validated_by' => $request->user()->id,
                    'validated_at' => now(),
                ]);
                $count++;
            }
        }

        return response()->json(['message' => "{$count} results validated."]);
    }

    public function amendResult(Request $request, LabTestResult $labTestResult): JsonResponse
    {
        $validated = $request->validate([
            'result_value' => 'nullable|numeric',
            'result_text' => 'nullable|string',
            'amendment_reason' => 'required|string|max:500',
            'notes' => 'nullable|string',
        ]);

        $oldValue = $labTestResult->result_value;

        $labTestResult->update([
            'result_value' => $validated['result_value'] ?? $labTestResult->result_value,
            'result_text' => $validated['result_text'] ?? $labTestResult->result_text,
            'notes' => $validated['notes'] ?? $labTestResult->notes,
            'amendment_reason' => $validated['amendment_reason'],
            'flag' => $labTestResult->calculateCriticalFlag(),
            'status' => 'validated', // re-validated after amendment
            'validated_by' => $request->user()->id,
            'validated_at' => now(),
        ]);

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'lab_result_amended',
            'entity_type' => 'lab_test_result',
            'entity_id' => $labTestResult->id,
            'old_values' => ['result_value' => $oldValue],
            'new_values' => ['result_value' => $labTestResult->result_value, 'reason' => $validated['amendment_reason']],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Result amended.', 'data' => $labTestResult->load('testCatalog')]);
    }

    // ─── Dashboard Stats ───

    public function stats(): JsonResponse
    {
        return response()->json([
            'total_catalog_tests' => LabTestCatalog::count(),
            'pending_orders' => LabTestOrder::where('status', 'ordered')->count(),
            'collected_samples' => LabSample::whereIn('status', ['collected', 'accessioned'])->count(),
            'pending_results' => LabTestResult::pending()->count(),
            'awaiting_validation' => LabTestResult::completed()->count(),
            'completed_today' => LabTestOrder::where('status', 'completed')
                ->whereDate('updated_at', today())->count(),
        ]);
    }
}
