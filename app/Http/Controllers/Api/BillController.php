<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Payment;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BillController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Bill::with(['patient', 'items', 'payments']);

        if ($request->search) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('bill_number', 'like', "%{$s}%")
                  ->orWhereHas('patient', fn ($p) => $p->where('first_name', 'like', "%{$s}%")
                      ->orWhere('last_name', 'like', "%{$s}%")
                      ->orWhere('patient_id', 'like', "%{$s}%"));
            });
        }

        if ($request->status) $query->where('status', $request->status);
        if ($request->date_from) $query->whereDate('created_at', '>=', $request->date_from);
        if ($request->date_to) $query->whereDate('created_at', '<=', $request->date_to);

        return response()->json(
            $query->latest()->paginate($request->per_page ?? 20)
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'episode_id' => 'nullable|exists:appointments,id',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.category' => 'nullable|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.reference_id' => 'nullable|integer',
            'items.*.reference_type' => 'nullable|string',
        ]);

        $bill = Bill::create([
            'bill_number' => Bill::generateBillNumber(),
            'patient_id' => $validated['patient_id'],
            'episode_id' => $validated['episode_id'] ?? null,
            'discount' => $validated['discount'] ?? 0,
            'tax' => $validated['tax'] ?? 0,
            'notes' => $validated['notes'] ?? null,
            'status' => 'draft',
            'created_by' => $request->user()->id,
        ]);

        foreach ($validated['items'] as $item) {
            $total = $item['quantity'] * $item['unit_price'];
            BillItem::create([
                'bill_id' => $bill->id,
                'description' => $item['description'],
                'category' => $item['category'] ?? null,
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total' => $total,
                'reference_id' => $item['reference_id'] ?? null,
                'reference_type' => $item['reference_type'] ?? null,
            ]);
        }

        $bill->recalculate();

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'bill_created',
            'entity_type' => 'bill',
            'entity_id' => $bill->id,
            'new_values' => ['bill_number' => $bill->bill_number, 'total' => $bill->total],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Bill created successfully.',
            'data' => $bill->load(['patient', 'items', 'payments']),
        ], 201);
    }

    public function show(Bill $bill): JsonResponse
    {
        return response()->json([
            'data' => $bill->load(['patient', 'items', 'payments.processedBy', 'createdBy']),
        ]);
    }

    public function addItem(Request $request, Bill $bill): JsonResponse
    {
        if ($bill->status !== 'draft') {
            return response()->json(['message' => 'Cannot modify a non-draft bill.'], 422);
        }

        $validated = $request->validate([
            'description' => 'required|string',
            'category' => 'nullable|string',
            'quantity' => 'required|numeric|min:0.01',
            'unit_price' => 'required|numeric|min:0',
        ]);

        $total = $validated['quantity'] * $validated['unit_price'];
        $bill->items()->create([
            'description' => $validated['description'],
            'category' => $validated['category'] ?? null,
            'quantity' => $validated['quantity'],
            'unit_price' => $validated['unit_price'],
            'total' => $total,
        ]);

        $bill->recalculate();

        return response()->json(['message' => 'Item added.', 'data' => $bill->load('items', 'payments')]);
    }

    public function removeItem(Bill $bill, BillItem $item): JsonResponse
    {
        if ($bill->status !== 'draft') {
            return response()->json(['message' => 'Cannot modify a non-draft bill.'], 422);
        }

        $item->delete();
        $bill->recalculate();

        return response()->json(['message' => 'Item removed.', 'data' => $bill->load('items', 'payments')]);
    }

    public function recordPayment(Request $request, Bill $bill): JsonResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,esewa,khalti,connect_ips,fonepay,insurance',
            'transaction_id' => 'nullable|string',
            'reference_number' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $payment = Payment::create([
            'bill_id' => $bill->id,
            'amount' => $validated['amount'],
            'payment_method' => $validated['payment_method'],
            'transaction_id' => $validated['transaction_id'] ?? null,
            'reference_number' => $validated['reference_number'] ?? null,
            'status' => 'completed',
            'notes' => $validated['notes'] ?? null,
            'processed_by' => $request->user()->id,
            'paid_at' => now(),
        ]);

        $bill->recalculate();

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'payment_recorded',
            'entity_type' => 'payment',
            'entity_id' => $payment->id,
            'new_values' => ['bill_number' => $bill->bill_number, 'amount' => $payment->amount, 'method' => $payment->payment_method],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Payment recorded successfully.',
            'data' => $bill->load(['patient', 'items', 'payments.processedBy']),
        ]);
    }

    public function void(Request $request, Bill $bill): JsonResponse
    {
        if (!$bill->canBeVoided()) {
            return response()->json(['message' => 'This bill cannot be voided.'], 422);
        }

        $reason = $request->validate(['reason' => 'nullable|string|max:500'])['reason'] ?? 'No reason provided.';

        $bill->update(['status' => 'void', 'notes' => ($bill->notes ? $bill->notes . "\n" : '') . 'Voided: ' . $reason]);

        AuditLog::log([
            'user_id' => $request->user()->id,
            'action' => 'bill_voided',
            'entity_type' => 'bill',
            'entity_id' => $bill->id,
            'new_values' => ['status' => 'void'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Bill voided.', 'data' => $bill->load('items', 'payments')]);
    }

    public function finalize(Bill $bill): JsonResponse
    {
        if ($bill->status !== 'draft') {
            return response()->json(['message' => 'Bill is not in draft status.'], 422);
        }

        $bill->update(['status' => 'waiting_payment']);
        return response()->json(['message' => 'Bill finalized.', 'data' => $bill->load('items', 'payments')]);
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'total_bills' => Bill::count(),
            'paid_bills' => Bill::where('status', 'paid')->count(),
            'pending_bills' => Bill::whereIn('status', ['draft', 'waiting_payment'])->count(),
            'total_revenue' => Bill::where('status', 'paid')->sum('total'),
            'today_revenue' => Bill::where('status', 'paid')->whereDate('updated_at', today())->sum('total'),
            'outstanding_amount' => Bill::whereIn('status', ['waiting_payment', 'partially_paid'])->sum('due_amount'),
        ]);
    }
}
