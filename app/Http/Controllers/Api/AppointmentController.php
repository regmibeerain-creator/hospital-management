<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookAppointmentRequest;
use App\Http\Requests\CancelAppointmentRequest;
use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use App\Models\AuditLog;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AppointmentController extends Controller
{
    /**
     * List appointments for the authenticated patient.
     */
    public function myAppointments(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->firstOrFail();

        $query = Appointment::with(['doctor.user', 'patient'])
            ->forPatient($patient->id)
            ->latest('appointment_date');

        // Filter by status
        if ($request->status) {
            $query->byStatus($request->status);
        }

        // Filter upcoming/past
        if ($request->scope === 'upcoming') {
            $query->upcoming();
        } elseif ($request->scope === 'past') {
            $query->past();
        }

        return AppointmentResource::collection(
            $query->paginate($request->per_page ?? 20)
        );
    }

    /**
     * Book a new appointment.
     */
    public function book(BookAppointmentRequest $request): JsonResponse
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validated();

        // Check for time slot conflict
        $conflict = Appointment::where('doctor_id', $validated['doctor_id'])
            ->where('appointment_date', $validated['appointment_date'])
            ->where('start_time', $validated['start_time'])
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'This time slot is already booked. Please choose another time.',
            ], 409);
        }

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'doctor_id' => $validated['doctor_id'],
            'appointment_date' => $validated['appointment_date'],
            'start_time' => $validated['start_time'],
            'end_time' => $validated['end_time'] ?? null,
            'symptoms' => $validated['symptoms'] ?? null,
            'appointment_type' => $validated['appointment_type'] ?? 'offline',
            'status' => 'scheduled',
        ]);

        $appointment->load(['doctor.user', 'patient']);

        AuditLog::log([
            'user_id' => $user->id,
            'action' => 'appointment_booked',
            'entity_type' => 'appointment',
            'entity_id' => $appointment->id,
            'new_values' => [
                'patient_id' => $patient->id,
                'doctor_id' => $validated['doctor_id'],
                'appointment_date' => $validated['appointment_date'],
                'start_time' => $validated['start_time'],
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Appointment booked successfully.',
            'appointment' => new AppointmentResource($appointment),
        ], 201);
    }

    /**
     * View a single appointment details.
     */
    public function show(Request $request, Appointment $appointment): JsonResponse
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->firstOrFail();

        if ($appointment->patient_id !== $patient->id) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }

        $appointment->load(['doctor.user', 'patient', 'medicalReports', 'prescriptions.items']);

        return response()->json(new AppointmentResource($appointment));
    }

    /**
     * Cancel an appointment.
     */
    public function cancel(CancelAppointmentRequest $request, Appointment $appointment): JsonResponse
    {
        $user = $request->user();
        $patient = Patient::where('user_id', $user->id)->firstOrFail();

        if ($appointment->patient_id !== $patient->id) {
            return response()->json(['message' => 'Appointment not found.'], 404);
        }

        if (!$appointment->canBeCancelled()) {
            return response()->json([
                'message' => 'This appointment cannot be cancelled as it is already ' . $appointment->status . '.',
            ], 422);
        }

        $appointment->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->validated()['cancellation_reason'] ?? null,
        ]);

        AuditLog::log([
            'user_id' => $user->id,
            'action' => 'appointment_cancelled',
            'entity_type' => 'appointment',
            'entity_id' => $appointment->id,
            'new_values' => [
                'status' => 'cancelled',
                'cancellation_reason' => $request->validated()['cancellation_reason'] ?? null,
            ],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Appointment cancelled successfully.',
            'appointment' => new AppointmentResource($appointment->load(['doctor.user', 'patient'])),
        ]);
    }
}
