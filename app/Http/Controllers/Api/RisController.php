<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImagingOrder;
use App\Models\ImagingStudy;
use App\Models\ModalitySchedule;
use App\Models\StructuredReport;
use App\Models\AuditLog;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RisController extends Controller
{
    // ── Dashboard Stats ──

    public function stats(): JsonResponse
    {
        $today = now()->startOfDay();
        $endOfDay = now()->endOfDay();

        return response()->json([
            'total_orders' => ImagingOrder::count(),
            'pending_orders' => ImagingOrder::whereIn('status', ['ordered', 'scheduled'])->count(),
            'unreported_studies' => ImagingOrder::where('status', 'acquired')
                ->whereDoesntHave('report', fn($q) => $q->whereIn('status', ['signed']))
                ->count(),
            'signed_today' => StructuredReport::where('status', 'signed')
                ->whereDate('signed_at', today())->count(),
            'scheduled_today' => ModalitySchedule::whereBetween('scheduled_at', [$today, $endOfDay])
                ->where('status', 'scheduled')->count(),
            'in_progress' => ModalitySchedule::where('status', 'in_progress')->count(),
            'orders_by_modality' => ImagingOrder::select('study_type', DB::raw('count(*) as total'))
                ->groupBy('study_type')->get(),
            'avg_turnaround_hours' => StructuredReport::whereNotNull('signed_at')
                ->join('imaging_orders', 'structured_reports.imaging_order_id', '=', 'imaging_orders.id')
                ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, imaging_orders.created_at, structured_reports.signed_at)) as avg_hours')
                ->value('avg_hours'),
        ]);
    }

    // ── Imaging Orders ──

    public function orders(Request $request): JsonResponse
    {
        $query = ImagingOrder::with(['patient', 'referringDoctor.user', 'radiologist.user', 'schedule', 'report'])
            ->latest();

        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('order_number', 'like', "%{$s}%")
                  ->orWhere('study_type', 'like', "%{$s}%")
                  ->orWhere('body_part', 'like', "%{$s}%")
                  ->orWhereHas('patient', fn($p) => $p->where('first_name', 'like', "%{$s}%")
                      ->orWhere('last_name', 'like', "%{$s}%")
                      ->orWhere('patient_id', 'like', "%{$s}%"));
            });
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->modality) {
            $query->where('study_type', $request->modality);
        }

        if ($request->priority) {
            $query->where('priority', $request->priority);
        }

        return response()->json(
            $query->paginate($request->per_page ?? 20)
        );
    }

    public function storeOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'referring_doctor_id' => 'nullable|exists:doctors,id',
            'study_type' => 'required|string|max:100',
            'body_part' => 'nullable|string|max:255',
            'clinical_history' => 'nullable|string',
            'notes' => 'nullable|string',
            'priority' => 'required|in:routine,urgent,stat',
        ]);

        $order = ImagingOrder::create([
            'patient_id' => $validated['patient_id'],
            'referring_doctor_id' => $validated['referring_doctor_id'] ?? Doctor::where('user_id', $request->user()->id)->first()?->id,
            'order_number' => ImagingOrder::generateOrderNumber(),
            'study_type' => $validated['study_type'],
            'body_part' => $validated['body_part'] ?? null,
            'clinical_history' => $validated['clinical_history'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'priority' => $validated['priority'],
            'status' => 'ordered',
            'created_by' => $request->user()->id,
        ]);

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'ris_order_created',
            'entity_type' => 'imaging_order',
            'entity_id' => $order->id,
            'new_values' => [
                'order_number' => $order->order_number,
                'study_type' => $order->study_type,
                'patient_id' => $order->patient_id,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Imaging order created.',
            'data' => $order->load(['patient', 'referringDoctor.user']),
        ], 201);
    }

    public function showOrder(ImagingOrder $imagingOrder): JsonResponse
    {
        return response()->json([
            'data' => $imagingOrder->load([
                'patient', 'referringDoctor.user', 'radiologist.user',
                'schedule', 'study', 'report.primaryReader', 'report.secondaryReader',
            ]),
        ]);
    }

    public function updateOrder(Request $request, ImagingOrder $imagingOrder): JsonResponse
    {
        $validated = $request->validate([
            'radiologist_id' => 'nullable|exists:doctors,id',
            'study_type' => 'sometimes|string|max:100',
            'body_part' => 'nullable|string|max:255',
            'clinical_history' => 'nullable|string',
            'notes' => 'nullable|string',
            'priority' => 'sometimes|in:routine,urgent,stat',
        ]);

        $old = $imagingOrder->getOriginal();
        $imagingOrder->update($validated);

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'ris_order_updated',
            'entity_type' => 'imaging_order',
            'entity_id' => $imagingOrder->id,
            'old_values' => $old,
            'new_values' => $imagingOrder->getChanges(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Imaging order updated.',
            'data' => $imagingOrder->load(['patient', 'referringDoctor.user']),
        ]);
    }

    // ── Modality Scheduling ──

    public function scheduleIndex(Request $request): JsonResponse
    {
        $query = ModalitySchedule::with(['imagingOrder.patient', 'technician']);

        if ($request->modality) {
            $query->forModality($request->modality);
        }

        if ($request->date) {
            $query->forDate($request->date);
        } else {
            $query->forDate(now()->toDateString());
        }

        return response()->json([
            'data' => $query->orderBy('scheduled_at')->get(),
        ]);
    }

    public function scheduleSlot(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'imaging_order_id' => 'required|exists:imaging_orders,id',
            'modality' => 'required|string|max:50',
            'scheduled_at' => 'required|date',
            'duration_minutes' => 'required|integer|min:5|max:480',
            'room' => 'nullable|string|max:100',
            'preparation_notes' => 'nullable|string',
            'technician_id' => 'nullable|exists:users,id',
        ]);

        $schedule = ModalitySchedule::create($validated);

        // Update order status
        ImagingOrder::where('id', $validated['imaging_order_id'])->update(['status' => 'scheduled']);

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'ris_slot_scheduled',
            'entity_type' => 'modality_schedule',
            'entity_id' => $schedule->id,
            'new_values' => ['modality' => $schedule->modality, 'scheduled_at' => $schedule->scheduled_at->toIso8601String()],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Modality slot scheduled.',
            'data' => $schedule->load('imagingOrder.patient'),
        ], 201);
    }

    public function updateSchedule(Request $request, ModalitySchedule $modalitySchedule): JsonResponse
    {
        $validated = $request->validate([
            'scheduled_at' => 'sometimes|date',
            'duration_minutes' => 'sometimes|integer|min:5|max:480',
            'status' => 'sometimes|in:scheduled,in_progress,completed,cancelled,rescheduled',
            'technician_id' => 'nullable|exists:users,id',
        ]);

        $old = $modalitySchedule->getOriginal();
        $modalitySchedule->update($validated);

        // If cancelled, reset order to ordered
        if (($validated['status'] ?? null) === 'cancelled') {
            ImagingOrder::where('id', $modalitySchedule->imaging_order_id)
                ->where('status', 'scheduled')
                ->update(['status' => 'ordered']);
        }

        // If completed, update order status
        if (($validated['status'] ?? null) === 'completed') {
            ImagingOrder::where('id', $modalitySchedule->imaging_order_id)
                ->update(['status' => 'acquired']);
        }

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'ris_slot_updated',
            'entity_type' => 'modality_schedule',
            'entity_id' => $modalitySchedule->id,
            'old_values' => $old,
            'new_values' => $modalitySchedule->getChanges(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Schedule updated.',
            'data' => $modalitySchedule->fresh()->load('imagingOrder.patient'),
        ]);
    }

    // ── Imaging Studies ──

    public function studies(Request $request): JsonResponse
    {
        $query = ImagingStudy::with(['imagingOrder.patient', 'acquirer', 'report']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->modality) {
            $query->where('modality', $request->modality);
        }

        return response()->json([
            'data' => $query->latest()->get(),
        ]);
    }

    public function acquireStudy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'imaging_order_id' => 'required|exists:imaging_orders,id',
            'modality' => 'required|string|max:50',
            'study_uid' => 'nullable|string|max:100|unique:imaging_studies,study_uid',
            'series_count' => 'nullable|integer|min:0',
            'instance_count' => 'nullable|integer|min:0',
            'dicom_path' => 'nullable|string|max:255',
            'acquisition_notes' => 'nullable|string',
            'quality' => 'nullable|in:acceptable,suboptimal,repeat',
        ]);

        $study = ImagingStudy::create([
            'imaging_order_id' => $validated['imaging_order_id'],
            'accession_number' => ImagingStudy::generateAccessionNumber(),
            'modality' => $validated['modality'],
            'study_uid' => $validated['study_uid'] ?? null,
            'series_count' => $validated['series_count'] ?? 0,
            'instance_count' => $validated['instance_count'] ?? 0,
            'dicom_path' => $validated['dicom_path'] ?? null,
            'acquisition_notes' => $validated['acquisition_notes'] ?? null,
            'quality' => $validated['quality'] ?? null,
            'status' => 'acquired',
            'acquired_by' => $request->user()->id,
            'acquired_at' => now(),
        ]);

        // Update order to acquired
        ImagingOrder::where('id', $validated['imaging_order_id'])->update(['status' => 'acquired']);

        // Update schedule to completed if exists
        ModalitySchedule::where('imaging_order_id', $validated['imaging_order_id'])
            ->whereIn('status', ['scheduled', 'in_progress'])
            ->update(['status' => 'completed']);

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'ris_study_acquired',
            'entity_type' => 'imaging_study',
            'entity_id' => $study->id,
            'new_values' => ['accession' => $study->accession_number, 'modality' => $study->modality],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Study acquired.',
            'data' => $study->load('imagingOrder.patient'),
        ], 201);
    }

    public function updateStudy(Request $request, ImagingStudy $imagingStudy): JsonResponse
    {
        $validated = $request->validate([
            'quality' => 'nullable|in:acceptable,suboptimal,repeat',
            'status' => 'sometimes|in:acquired,completed,rejected',
            'acquisition_notes' => 'nullable|string',
        ]);

        $imagingStudy->update($validated);

        return response()->json([
            'message' => 'Study updated.',
            'data' => $imagingStudy->fresh()->load('imagingOrder.patient'),
        ]);
    }

    // ── Structured Reports ──

    public function reports(Request $request): JsonResponse
    {
        $query = StructuredReport::with([
            'imagingOrder.patient', 'imagingOrder.referringDoctor.user',
            'primaryReader', 'secondaryReader', 'imagingStudy',
        ]);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('report_title', 'like', "%{$s}%")
                  ->orWhereHas('imagingOrder.patient', fn($p) => $p->where('first_name', 'like', "%{$s}%")
                      ->orWhere('last_name', 'like', "%{$s}%"));
            });
        }

        return response()->json([
            'data' => $query->latest()->get(),
        ]);
    }

    public function startReport(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'imaging_order_id' => 'required|exists:imaging_orders,id',
            'imaging_study_id' => 'nullable|exists:imaging_studies,id',
            'report_title' => 'required|string|max:255',
        ]);

        // Check if a report already exists
        $existing = StructuredReport::where('imaging_order_id', $validated['imaging_order_id'])->first();
        if ($existing) {
            return response()->json([
                'message' => 'A report already exists for this order. Use amend to update.',
                'data' => $existing->load(['imagingOrder.patient', 'primaryReader']),
            ], 409);
        }

        $report = StructuredReport::create([
            'imaging_order_id' => $validated['imaging_order_id'],
            'imaging_study_id' => $validated['imaging_study_id'] ?? null,
            'report_title' => $validated['report_title'],
            'status' => 'draft',
            'primary_reader_id' => $request->user()->id,
        ]);

        // Update order to reporting
        ImagingOrder::where('id', $validated['imaging_order_id'])->update(['status' => 'reporting']);

        return response()->json([
            'message' => 'Report started.',
            'data' => $report->load(['imagingOrder.patient', 'primaryReader']),
        ], 201);
    }

    public function updateReport(Request $request, StructuredReport $structuredReport): JsonResponse
    {
        $validated = $request->validate([
            'technique' => 'nullable|string',
            'findings' => 'nullable|string',
            'impression' => 'nullable|string',
            'recommendation' => 'nullable|string',
            'comparison' => 'nullable|string',
        ]);

        $structuredReport->update($validated);

        return response()->json([
            'message' => 'Report updated.',
            'data' => $structuredReport->fresh()->load(['imagingOrder.patient', 'primaryReader']),
        ]);
    }

    public function signReport(Request $request, StructuredReport $structuredReport): JsonResponse
    {
        $validated = $request->validate([
            'is_double_read' => 'boolean',
            'secondary_reader_id' => 'nullable|exists:users,id',
        ]);

        if ($structuredReport->status === 'signed') {
            return response()->json(['message' => 'Report is already signed.'], 409);
        }

        if (empty($structuredReport->findings) && empty($structuredReport->impression)) {
            return response()->json(['message' => 'Cannot sign a report without findings or impression.'], 422);
        }

        $isDoubleRead = $validated['is_double_read'] ?? false;

        if ($isDoubleRead && empty($validated['secondary_reader_id'])) {
            return response()->json(['message' => 'Secondary reader is required for double reading.'], 422);
        }

        $structuredReport->is_double_read = $isDoubleRead;
        $structuredReport->sign($request->user()->id, $validated['secondary_reader_id'] ?? null);

        // Update order to signed
        $structuredReport->imagingOrder()->update(['status' => 'signed', 'radiologist_id' => Doctor::where('user_id', $request->user()->id)->first()?->id]);

        return response()->json([
            'message' => 'Report signed and released.',
            'data' => $structuredReport->fresh()->load([
                'imagingOrder.patient', 'primaryReader', 'secondaryReader',
            ]),
        ]);
    }

    public function amendReport(Request $request, StructuredReport $structuredReport): JsonResponse
    {
        if ($structuredReport->status !== 'signed') {
            return response()->json(['message' => 'Only signed reports can be amended.'], 422);
        }

        $validated = $request->validate([
            'findings' => 'sometimes|string',
            'impression' => 'sometimes|string',
            'recommendation' => 'sometimes|string',
            'amendment_reason' => 'required|string|min:10',
        ]);

        $old = $structuredReport->getOriginal();
        $structuredReport->update([
            'findings' => $validated['findings'] ?? $structuredReport->findings,
            'impression' => $validated['impression'] ?? $structuredReport->impression,
            'recommendation' => $validated['recommendation'] ?? $structuredReport->recommendation,
            'amendment_reason' => $validated['amendment_reason'],
            'status' => 'amended',
            'signed_at' => now(),
        ]);

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'ris_report_amended',
            'entity_type' => 'structured_report',
            'entity_id' => $structuredReport->id,
            'old_values' => $old,
            'new_values' => $structuredReport->getChanges(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Report amended.',
            'data' => $structuredReport->fresh()->load(['imagingOrder.patient', 'primaryReader']),
        ]);
    }

    // ── Modality List / Lookup ──

    public function modalities(): JsonResponse
    {
        return response()->json([
            'data' => [
                ['id' => 'X-Ray', 'name' => 'X-Ray', 'icon' => 'radio'],
                ['id' => 'CT', 'name' => 'CT Scan', 'icon' => 'scan'],
                ['id' => 'MRI', 'name' => 'MRI', 'icon' => 'scan'],
                ['id' => 'USG', 'name' => 'Ultrasound', 'icon' => 'ultrasound'],
                ['id' => 'Mammography', 'name' => 'Mammography', 'icon' => 'scan'],
                ['id' => 'Fluoroscopy', 'name' => 'Fluoroscopy', 'icon' => 'radio'],
                ['id' => 'DEXA', 'name' => 'DEXA Scan', 'icon' => 'scan'],
            ],
        ]);
    }
}
