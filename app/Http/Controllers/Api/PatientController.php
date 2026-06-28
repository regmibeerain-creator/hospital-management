<?php

namespace App\Http\Controllers\Api;

use App\Models\Department;
use App\Models\Patient;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PatientController
{
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $query = $request->input('q');

        $patients = Patient::where('patient_id', 'like', "%{$query}%")
            ->orWhere('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('phone', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$query}%"])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'data' => $patients,
            'total' => $patients->count(),
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'blood_group' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
        ]);

        // Generate unique patient ID
        $lastPatient = Patient::orderBy('id', 'desc')->first();
        $nextId = $lastPatient ? $lastPatient->id + 1 : 1;
        $validated['patient_id'] = 'PAT-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);

        // Check for duplicate by phone or email
        if (!empty($validated['phone'])) {
            $duplicate = Patient::where('phone', $validated['phone'])->first();
            if ($duplicate) {
                return response()->json([
                    'message' => 'A patient with this phone number already exists.',
                    'duplicate' => $duplicate,
                ], 409);
            }
        }
        if (!empty($validated['email'])) {
            $duplicate = Patient::where('email', $validated['email'])->first();
            if ($duplicate) {
                return response()->json([
                    'message' => 'A patient with this email already exists.',
                    'duplicate' => $duplicate,
                ], 409);
            }
        }

        $patient = Patient::create($validated);

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'created',
            'entity_type' => 'patient',
            'entity_id' => $patient->id,
            'description' => "Patient {$patient->full_name} ({$patient->patient_id}) registered",
        ]);

        return response()->json([
            'message' => 'Patient registered successfully.',
            'data' => $patient,
        ], 201);
    }

    public function index(Request $request)
    {
        $query = Patient::query();

        if ($request->has('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('patient_id', 'like', "%{$s}%")
                  ->orWhere('first_name', 'like', "%{$s}%")
                  ->orWhere('last_name', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%");
            });
        }

        return response()->json(
            $query->orderBy('created_at', 'desc')->paginate($request->input('per_page', 20))
        );
    }

    public function show(Patient $patient)
    {
        $patient->load(['appointments' => function ($q) {
            $q->latest()->limit(10);
        }, 'medicalReports', 'prescriptions']);

        return response()->json(['data' => $patient]);
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
            'blood_group' => 'nullable|string|max:10',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'emergency_contact_name' => 'nullable|string|max:255',
            'emergency_contact_phone' => 'nullable|string|max:20',
        ]);

        $patient->update($validated);

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'updated',
            'entity_type' => 'patient',
            'entity_id' => $patient->id,
            'description' => "Patient {$patient->full_name} ({$patient->patient_id}) updated",
        ]);

        return response()->json([
            'message' => 'Patient updated successfully.',
            'data' => $patient,
        ]);
    }
}
