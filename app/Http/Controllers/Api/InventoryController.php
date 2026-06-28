<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\StockMovement;
use App\Models\Asset;
use App\Models\MaintenanceLog;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    // ─── Inventory Items ───
    public function items(Request $request): JsonResponse
    {
        $query = InventoryItem::query();

        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('sku', 'like', "%{$s}%")
                  ->orWhere('category', 'like', "%{$s}%");
            });
        }

        if ($request->category) $query->where('category', $request->category);
        if ($request->low_stock) $query->lowStock();
        if ($request->reorder) $query->needsReorder();

        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    public function storeItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:inventory_items,sku',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:20',
            'unit_price' => 'required|numeric|min:0',
            'selling_price' => 'required|numeric|min:0',
            'current_stock' => 'sometimes|integer|min:0',
            'minimum_stock' => 'required|integer|min:0',
            'reorder_level' => 'required|integer|min:0',
            'manufacturer' => 'nullable|string|max:255',
            'supplier' => 'nullable|string|max:255',
        ]);

        $item = InventoryItem::create($validated);
        return response()->json(['message' => 'Item created.', 'data' => $item], 201);
    }

    public function updateItem(Request $request, InventoryItem $inventoryItem): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sku' => 'nullable|string|max:100|unique:inventory_items,sku,' . $inventoryItem->id,
            'category' => 'sometimes|string|max:100',
            'description' => 'nullable|string',
            'unit' => 'sometimes|string|max:20',
            'unit_price' => 'sometimes|numeric|min:0',
            'selling_price' => 'sometimes|numeric|min:0',
            'minimum_stock' => 'sometimes|integer|min:0',
            'reorder_level' => 'sometimes|integer|min:0',
            'manufacturer' => 'nullable|string|max:255',
            'supplier' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $inventoryItem->update($validated);
        return response()->json(['message' => 'Item updated.', 'data' => $inventoryItem]);
    }

    // ─── Stock Movements ───
    public function stockMovements(Request $request): JsonResponse
    {
        $query = StockMovement::with(['inventoryItem', 'createdBy']);
        if ($request->item_id) $query->where('inventory_item_id', $request->item_id);
        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    public function addStock(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'quantity' => 'required|integer|min:1',
            'type' => 'required|in:inbound,outbound,adjustment,return',
            'unit_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $item = InventoryItem::findOrFail($validated['inventory_item_id']);

        $movement = StockMovement::create([
            'inventory_item_id' => $validated['inventory_item_id'],
            'type' => $validated['type'],
            'quantity' => $validated['quantity'],
            'unit_price' => $validated['unit_price'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        // Update stock count
        if (in_array($validated['type'], ['inbound', 'return'])) {
            $item->increment('current_stock', $validated['quantity']);
        } else {
            $item->decrement('current_stock', $validated['quantity']);
        }

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'stock_movement_' . $validated['type'],
            'entity_type' => 'inventory_item',
            'entity_id' => $item->id,
            'new_values' => ['item' => $item->name, 'quantity' => $validated['quantity'], 'type' => $validated['type']],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Stock updated.',
            'data' => $movement->load('inventoryItem'),
        ], 201);
    }

    // ─── Assets ───
    public function assets(Request $request): JsonResponse
    {
        $query = Asset::query();
        if ($request->status) $query->where('status', $request->status);
        if ($request->category) $query->where('category', $request->category);
        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('asset_tag', 'like', "%{$s}%")
                  ->orWhere('serial_number', 'like', "%{$s}%");
            });
        }
        return response()->json($query->latest()->paginate($request->per_page ?? 20));
    }

    public function storeAsset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'asset_tag' => 'nullable|string|max:100|unique:assets,asset_tag',
            'category' => 'required|in:medical_equipment,furniture,vehicle,it_equipment,building,other',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'warranty_expiry' => 'nullable|date',
        ]);

        $asset = Asset::create($validated);
        return response()->json(['message' => 'Asset created.', 'data' => $asset], 201);
    }

    public function updateAsset(Request $request, Asset $asset): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'asset_tag' => 'nullable|string|max:100|unique:assets,asset_tag,' . $asset->id,
            'category' => 'sometimes|in:medical_equipment,furniture,vehicle,it_equipment,building,other',
            'model' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'status' => 'sometimes|in:active,maintenance,retired,disposed',
            'notes' => 'nullable|string',
            'warranty_expiry' => 'nullable|date',
        ]);

        $asset->update($validated);
        return response()->json(['message' => 'Asset updated.', 'data' => $asset]);
    }

    public function maintenanceLogs(Request $request, Asset $asset): JsonResponse
    {
        return response()->json([
            'data' => $asset->maintenanceLogs()->latest('maintenance_date')->get(),
        ]);
    }

    public function storeMaintenanceLog(Request $request, Asset $asset): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:routine,repair,inspection,calibration',
            'description' => 'required|string',
            'maintenance_date' => 'required|date',
            'next_maintenance_date' => 'nullable|date',
            'cost' => 'nullable|numeric|min:0',
            'performed_by' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $log = $asset->maintenanceLogs()->create($validated);

        // Update asset status if it's a repair
        if ($validated['type'] === 'repair') {
            $asset->update(['status' => 'maintenance']);
        }

        return response()->json(['message' => 'Maintenance log created.', 'data' => $log], 201);
    }

    public function inventoryStats(): JsonResponse
    {
        return response()->json([
            'total_items' => InventoryItem::count(),
            'low_stock_items' => InventoryItem::lowStock()->count(),
            'needs_reorder' => InventoryItem::needsReorder()->count(),
            'total_assets' => Asset::count(),
            'maintenance_assets' => Asset::where('status', 'maintenance')->count(),
            'stock_value' => InventoryItem::sum(\Illuminate\Support\Facades\DB::raw('current_stock * unit_price')),
        ]);
    }
}
