<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\MedicalReport;
use App\Models\Prescription;
use App\Models\InventoryItem;
use App\Models\InsuranceClaim;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function overview(): JsonResponse
    {
        $now = now();
        $monthStart = $now->copy()->startOfMonth();

        return response()->json([
            'total_patients' => Patient::count(),
            'patients_this_month' => Patient::where('created_at', '>=', $monthStart)->count(),
            'total_appointments' => Appointment::count(),
            'appointments_this_month' => Appointment::where('created_at', '>=', $monthStart)->count(),
            'appointments_today' => Appointment::whereDate('scheduled_date', today())->count(),
            'total_revenue' => Bill::where('status', 'paid')->sum('total'),
            'revenue_this_month' => Bill::where('status', 'paid')->where('updated_at', '>=', $monthStart)->sum('total'),
            'pending_bills' => Bill::whereIn('status', ['waiting_payment', 'partially_paid'])->sum('due_amount'),
            'total_prescriptions' => Prescription::count(),
            'low_stock_items' => InventoryItem::lowStock()->count(),
            'pending_claims' => InsuranceClaim::whereIn('status', ['draft', 'submitted'])->count(),
        ]);
    }

    public function revenueChart(Request $request): JsonResponse
    {
        $months = $request->input('months', 6);
        $data = [];

        for ($i = $months - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $start = $date->copy()->startOfMonth();
            $end = $date->copy()->endOfMonth();

            $data[] = [
                'month' => $date->format('M Y'),
                'revenue' => Bill::where('status', 'paid')
                    ->whereBetween('updated_at', [$start, $end])
                    ->sum('total'),
                'bills' => Bill::where('status', 'paid')
                    ->whereBetween('updated_at', [$start, $end])
                    ->count(),
            ];
        }

        return response()->json(['data' => $data]);
    }

    public function appointmentStats(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        $start = Carbon::now()->subDays($days);

        $statuses = Appointment::where('created_at', '>=', $start)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $byDepartment = Appointment::where('appointments.created_at', '>=', $start)
            ->join('doctors', 'appointments.doctor_id', '=', 'doctors.id')
            ->join('departments', 'doctors.department_id', '=', 'departments.id')
            ->select('departments.name', DB::raw('count(*) as count'))
            ->groupBy('departments.name')
            ->pluck('count', 'name');

        return response()->json([
            'by_status' => $statuses,
            'by_department' => $byDepartment,
        ]);
    }

    public function patientStats(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        $start = Carbon::now()->subDays($days);

        $registrations = Patient::where('created_at', '>=', $start)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $genderDist = Patient::select('gender', DB::raw('count(*) as count'))
            ->whereNotNull('gender')
            ->groupBy('gender')
            ->pluck('count', 'gender');

        return response()->json([
            'registrations' => $registrations,
            'gender_distribution' => $genderDist,
        ]);
    }

    public function billingSummary(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        $start = Carbon::now()->subDays($days);

        $dailyRevenue = Bill::where('status', 'paid')
            ->where('updated_at', '>=', $start)
            ->select(DB::raw('DATE(updated_at) as date'), DB::raw('SUM(total) as revenue'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $methodDist = DB::table('payments')
            ->join('bills', 'payments.bill_id', '=', 'bills.id')
            ->where('payments.status', 'completed')
            ->where('payments.paid_at', '>=', $start)
            ->select('payments.payment_method', DB::raw('SUM(payments.amount) as total'))
            ->groupBy('payments.payment_method')
            ->pluck('total', 'payment_method');

        // Top revenue by department
        $byDepartment = DB::table('bills')
            ->join('bill_items', 'bills.id', '=', 'bill_items.bill_id')
            ->where('bills.status', 'paid')
            ->where('bills.updated_at', '>=', $start)
            ->select('bill_items.category', DB::raw('SUM(bill_items.total) as total'))
            ->whereNotNull('bill_items.category')
            ->groupBy('bill_items.category')
            ->pluck('total', 'category');

        return response()->json([
            'daily_revenue' => $dailyRevenue,
            'payment_methods' => $methodDist,
            'by_category' => $byDepartment,
        ]);
    }
}
