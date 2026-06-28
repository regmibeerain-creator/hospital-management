<?php

namespace App\Http\Controllers\Api;

use App\Models\Department;
use Illuminate\Http\Request;
use App\Models\AuditLog;

class DepartmentController
{
    public function index(Request $request)
    {
        $query = Department::with('headDoctor');

        if ($request->has('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('code', 'like', "%{$s}%");
            });
        }

        return response()->json(
            $query->orderBy('name')->paginate($request->input('per_page', 20))
        );
    }

    public function list()
    {
        return response()->json([
            'data' => Department::active()->orderBy('name')->get(['id', 'name', 'code']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:20|unique:departments,code',
            'description' => 'nullable|string',
            'head_doctor_id' => 'nullable|exists:doctors,id',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $department = Department::create($validated);

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'created',
            'entity_type' => 'department',
            'entity_id' => $department->id,
            'description' => "Department {$department->name} ({$department->code}) created",
        ]);

        return response()->json([
            'message' => 'Department created successfully.',
            'data' => $department->load('headDoctor'),
        ], 201);
    }

    public function show(Department $department)
    {
        return response()->json([
            'data' => $department->load(['headDoctor', 'doctors' => function ($q) {
                $q->with('user');
            }]),
        ]);
    }

    public function update(Request $request, Department $department)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'code' => 'sometimes|string|max:20|unique:departments,code,' . $department->id,
            'description' => 'nullable|string',
            'head_doctor_id' => 'nullable|exists:doctors,id',
            'location' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'is_active' => 'boolean',
        ]);

        $department->update($validated);

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'updated',
            'entity_type' => 'department',
            'entity_id' => $department->id,
            'description' => "Department {$department->name} updated",
        ]);

        return response()->json([
            'message' => 'Department updated successfully.',
            'data' => $department->load('headDoctor'),
        ]);
    }

    public function destroy(Request $request, Department $department)
    {
        if ($department->doctors()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete department with active doctors. Please reassign doctors first.',
            ], 409);
        }

        $name = $department->name;
        $department->delete();

        AuditLog::create([
            'user_id' => $request->user()?->id,
            'action' => 'deleted',
            'entity_type' => 'department',
            'entity_id' => $department->id,
            'description' => "Department {$name} deleted",
        ]);

        return response()->json(['message' => 'Department deleted successfully.']);
    }
}
