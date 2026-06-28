<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DoctorResource;
use App\Http\Resources\AppointmentResource;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DoctorController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Doctor::with('user')->active();

        if ($request->specialization) {
            $query->where('specialization', 'like', "%{$request->specialization}%");
        }

        if ($request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        return DoctorResource::collection(
            $query->paginate($request->per_page ?? 20)
        );
    }

    public function show(Doctor $doctor): JsonResponse
    {
        $doctor->load('user');
        return response()->json(new DoctorResource($doctor));
    }

    public function availableSlots(Doctor $doctor, Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
        ]);

        $date = $request->date;
        $dayOfWeek = strtolower(now()->parse($date)->format('l'));

        $availability = $doctor->availability ?? [];

        // Check if doctor is available on this day
        if (!isset($availability[$dayOfWeek]) || empty($availability[$dayOfWeek])) {
            return response()->json([
                'date' => $date,
                'slots' => [],
                'message' => 'Doctor is not available on this day.',
            ]);
        }

        $daySlots = $availability[$dayOfWeek];
        $bookedSlots = $doctor->appointments()
            ->where('appointment_date', $date)
            ->whereNotIn('status', ['cancelled', 'no_show'])
            ->pluck('start_time')
            ->map(fn ($time) => $time instanceof \Carbon\Carbon ? $time->format('H:i') : $time)
            ->toArray();

        $availableSlots = [];
        foreach ($daySlots as $slot) {
            $time = $slot['start'] ?? $slot;
            $timeFormatted = $time instanceof \Carbon\Carbon ? $time->format('H:i') : $time;
            if (!in_array($timeFormatted, $bookedSlots)) {
                $availableSlots[] = [
                    'start_time' => $timeFormatted,
                    'end_time' => $slot['end'] ?? null,
                    'label' => isset($slot['label']) ? $slot['label'] : $timeFormatted,
                ];
            }
        }

        return response()->json([
            'date' => $date,
            'doctor_id' => $doctor->id,
            'slots' => $availableSlots,
        ]);
    }
}
