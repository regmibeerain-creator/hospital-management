<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PrescriptionResource;
use App\Models\Prescription;
use App\Models\InventoryItem;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PharmacyController extends Controller
{
    /**
     * List prescriptions for pharmacy staff (pending / to be dispensed).
     */
    public function prescriptions(Request $request): JsonResponse
    {
        $query = Prescription::with(['patient', 'doctor.user', 'items'])
            ->latest();

        if ($request->status) {
            $query->where('status', $request->status);
        } else {
            $query->whereIn('status', ['active', 'dispensed']);
        }

        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->whereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$s}%")
                    ->orWhere('last_name', 'like', "%{$s}%")
                    ->orWhere('patient_id', 'like', "%{$s}%"))
                  ->orWhere('id', 'like', "%{$s}%");
            });
        }

        return response()->json(
            $query->paginate($request->per_page ?? 20)
        );
    }

    /**
     * View a single prescription for dispensing.
     */
    public function showPrescription(Prescription $prescription): JsonResponse
    {
        $prescription->load(['patient', 'doctor.user', 'items', 'appointment']);
        return response()->json(['data' => $prescription]);
    }

    /**
     * Dispense a prescription — mark items as dispensed, record audit, reduce stock.
     */
    public function dispense(Request $request, Prescription $prescription): JsonResponse
    {
        if ($prescription->status !== 'active') {
            return response()->json(['message' => 'Prescription is not in active status.'], 422);
        }

        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:prescription_items,id',
            'items.*.dispensed_quantity' => 'required|integer|min:1',
            'items.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $dispensedItems = [];

        foreach ($validated['items'] as $itemData) {
            $item = $prescription->items()->findOrFail($itemData['id']);

            // Reduce inventory stock if linked to an inventory item
            if (!empty($itemData['inventory_item_id'])) {
                $inventoryItem = InventoryItem::findOrFail($itemData['inventory_item_id']);
                if ($inventoryItem->current_stock < $itemData['dispensed_quantity']) {
                    return response()->json([
                        'message' => "Insufficient stock for {$inventoryItem->name}. Available: {$inventoryItem->current_stock}",
                    ], 422);
                }
                $inventoryItem->decrement('current_stock', $itemData['dispensed_quantity']);
                $dispensedItems[] = [
                    'item' => $item->medicine_name,
                    'qty' => $itemData['dispensed_quantity'],
                    'from' => $inventoryItem->name,
                ];
            } else {
                $dispensedItems[] = [
                    'item' => $item->medicine_name,
                    'qty' => $itemData['dispensed_quantity'],
                ];
            }
        }

        $prescription->update([
            'status' => 'dispensed',
            'notes' => $prescription->notes . ($validated['notes'] ? "\nPharmacy: {$validated['notes']}" : ''),
        ]);

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'prescription_dispensed',
            'entity_type' => 'prescription',
            'entity_id' => $prescription->id,
            'new_values' => ['prescription_id' => $prescription->id, 'items' => $dispensedItems],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Prescription dispensed successfully.',
            'data' => $prescription->load(['patient', 'doctor.user', 'items']),
        ]);
    }

    /**
     * Mark a prescription as completed (all items taken by patient).
     */
    public function complete(Prescription $prescription): JsonResponse
    {
        if ($prescription->status !== 'dispensed') {
            return response()->json(['message' => 'Prescription must be dispensed first.'], 422);
        }

        $prescription->update(['status' => 'completed']);
        return response()->json(['message' => 'Prescription marked as completed.', 'data' => $prescription]);
    }

    /**
     * Search medicines in inventory.
     */
    public function medicines(Request $request): JsonResponse
    {
        $query = InventoryItem::where('category', 'medicine');

        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('sku', 'like', "%{$s}%");
            });
        }

        return response()->json(
            $query->where('is_active', true)->latest()->paginate($request->per_page ?? 50)
        );
    }

    /**
     * Pharmacy dashboard stats.
     */
    public function stats(): JsonResponse
    {
        return response()->json([
            'pending_prescriptions' => Prescription::where('status', 'active')->count(),
            'dispensed_today' => Prescription::where('status', 'dispensed')
                ->whereDate('updated_at', today())->count(),
            'low_stock_medicines' => InventoryItem::where('category', 'medicine')
                ->lowStock()->count(),
            'total_medicines' => InventoryItem::where('category', 'medicine')->count(),
        ]);
    }
}
