<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InsuranceCompany;
use App\Models\PatientPolicy;
use App\Models\InsuranceClaim;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InsuranceController extends Controller
{
    // ─── Insurance Companies ───
    public function companies(Request $request): JsonResponse
    {
        $query = InsuranceCompany::query();
        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")->orWhere('code', 'like', "%{$s}%");
            });
        }
        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    public function storeCompany(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:insurance_companies,code',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'coverage_percentage' => 'required|numeric|min:0|max:100',
        ]);

        $company = InsuranceCompany::create($validated);
        return response()->json(['message' => 'Insurance company created.', 'data' => $company], 201);
    }

    public function updateCompany(Request $request, InsuranceCompany $insuranceCompany): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:50|unique:insurance_companies,code,' . $insuranceCompany->id,
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'coverage_percentage' => 'sometimes|numeric|min:0|max:100',
            'is_active' => 'boolean',
        ]);

        $insuranceCompany->update($validated);
        return response()->json(['message' => 'Insurance company updated.', 'data' => $insuranceCompany]);
    }

    // ─── Patient Policies ───
    public function policies(Request $request): JsonResponse
    {
        $query = PatientPolicy::with(['patient', 'insuranceCompany']);
        if ($request->patient_id) $query->where('patient_id', $request->patient_id);
        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    public function storePolicy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'insurance_company_id' => 'required|exists:insurance_companies,id',
            'policy_number' => 'required|string|max:255',
            'coverage_type' => 'required|in:individual,family,group',
            'coverage_limit' => 'nullable|numeric|min:0',
            'deductible' => 'nullable|numeric|min:0',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'notes' => 'nullable|string',
        ]);

        $policy = PatientPolicy::create($validated);
        return response()->json(['message' => 'Policy registered.', 'data' => $policy->load(['patient', 'insuranceCompany'])], 201);
    }

    // ─── Claims ───
    public function claims(Request $request): JsonResponse
    {
        $query = InsuranceClaim::with(['patientPolicy.patient', 'patientPolicy.insuranceCompany', 'bill']);
        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    public function submitClaim(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_policy_id' => 'required|exists:patient_policies,id',
            'bill_id' => 'required|exists:bills,id',
            'claimed_amount' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string',
        ]);

        $policy = PatientPolicy::findOrFail($validated['patient_policy_id']);
        if (!$policy->isValid()) {
            return response()->json(['message' => 'Policy is not active or has expired.'], 422);
        }

        $claim = InsuranceClaim::create([
            'patient_policy_id' => $validated['patient_policy_id'],
            'bill_id' => $validated['bill_id'],
            'claim_number' => InsuranceClaim::generateClaimNumber(),
            'claimed_amount' => $validated['claimed_amount'],
            'status' => 'draft',
            'notes' => $validated['notes'] ?? null,
            'processed_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Claim submitted.', 'data' => $claim->load(['patientPolicy.patient', 'patientPolicy.insuranceCompany', 'bill'])], 201);
    }

    public function approveClaim(Request $request, InsuranceClaim $insuranceClaim): JsonResponse
    {
        $validated = $request->validate([
            'approved_amount' => 'required|numeric|min:0|max:' . $insuranceClaim->claimed_amount,
        ]);

        $insuranceClaim->update([
            'approved_amount' => $validated['approved_amount'],
            'status' => 'approved',
            'approved_date' => now(),
        ]);

        return response()->json(['message' => 'Claim approved.', 'data' => $insuranceClaim->load(['patientPolicy.patient', 'bill'])]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'companies_count' => InsuranceCompany::count(),
            'active_policies' => PatientPolicy::where('status', 'active')->count(),
            'pending_claims' => InsuranceClaim::whereIn('status', ['draft', 'submitted'])->count(),
            'approved_claims' => InsuranceClaim::where('status', 'approved')->count(),
        ]);
    }
}
