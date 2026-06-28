<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\Doctor;
use App\Models\Appointment;
use App\Models\Prescription;
use App\Models\MedicalReport;
use App\Models\Bill;
use App\Models\User;
use App\Models\ImagingOrder;
use App\Models\CmsPost;
use App\Models\CmsPage;
use App\Models\ImagingOrder;
use App\Models\CmsPost;
use App\Models\CmsPage;
use App\Models\InventoryItem;
use App\Models\InsuranceClaim;
use App\Models\ModalitySchedule;
use App\Models\LabTestOrder;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SearchController extends Controller
{
    /**
     * Global search across all modules.
     */
    public function search(Request $request): JsonResponse
    {
        $q = $request->input('q');
        $module = $request->input('module'); // optional filter
        $limit = $request->input('limit', 10);

        if (!$q || strlen(trim($q)) < 2) {
            return response()->json(['data' => [], 'total' => 0]);
        }

        $results = [];
        $total = 0;

        // ── Patients ──
        if (!$module || $module === 'patients') {
            $patients = Patient::where(function ($query) use ($q) {
                $query->where('patient_id', 'like', "%{$q}%")
                    ->orWhere('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$q}%"]);
            })->limit($limit)->get(['id', 'patient_id', 'first_name', 'last_name', 'phone', 'gender']);

            foreach ($patients as $p) {
                $results[] = [
                    'type' => 'patient',
                    'id' => $p->id,
                    'title' => $p->full_name,
                    'subtitle' => "ID: {$p->patient_id} | {$p->phone}",
                    'url' => "/dashboard/patients/{$p->id}",
                    'badge' => $p->gender,
                ];
            }
            $total += $patients->count();
        }

        // ── Doctors ──
        if (!$module || $module === 'doctors') {
            $doctors = Doctor::with('user', 'department')
                ->where(function ($query) use ($q) {
                    $query->whereHas('user', fn($u) => $u->where('name', 'like', "%{$q}%"))
                        ->orWhere('specialization', 'like', "%{$q}%")
                        ->orWhere('qualification', 'like', "%{$q}%");
                })->limit($limit)->get();

            foreach ($doctors as $d) {
                $results[] = [
                    'type' => 'doctor',
                    'id' => $d->id,
                    'title' => $d->user?->name ?? 'Unknown',
                    'subtitle' => $d->specialization . ($d->department ? " | {$d->department->name}" : ''),
                    'url' => "/dashboard/doctors/{$d->id}",
                    'badge' => 'Doctor',
                ];
            }
            $total += $doctors->count();
        }

        // ── Appointments ──
        if (!$module || $module === 'appointments') {
            $appointments = Appointment::with(['patient', 'doctor.user'])
                ->where(function ($query) use ($q) {
                    $query->whereHas('patient', fn($p) => $p->where('first_name', 'like', "%{$q}%")
                        ->orWhere('last_name', 'like', "%{$q}%")
                        ->orWhere('patient_id', 'like', "%{$q}%"))
                        ->orWhere('status', 'like', "%{$q}%")
                        ->orWhere('symptoms', 'like', "%{$q}%");
                })->limit($limit)->get();

            foreach ($appointments as $a) {
                $results[] = [
                    'type' => 'appointment',
                    'id' => $a->id,
                    'title' => ($a->patient ? $a->patient->full_name : 'Unknown') . ' with ' . ($a->doctor?->user?->name ?? 'Unknown'),
                    'subtitle' => $a->appointment_date?->toDateString() . ' | ' . ucfirst($a->status),
                    'url' => "/dashboard/appointments/{$a->id}",
                    'badge' => $a->status,
                ];
            }
            $total += $appointments->count();
        }

        // ── Prescriptions ──
        if (!$module || $module === 'prescriptions') {
            $prescriptions = Prescription::with(['patient', 'doctor.user'])
                ->where(function ($query) use ($q) {
                    $query->whereHas('patient', fn($p) => $p->where('first_name', 'like', "%{$q}%")
                        ->orWhere('last_name', 'like', "%{$q}%"))
                        ->orWhere('diagnosis', 'like', "%{$q}%")
                        ->orWhere('notes', 'like', "%{$q}%");
                })->limit($limit)->get();

            foreach ($prescriptions as $pr) {
                $results[] = [
                    'type' => 'prescription',
                    'id' => $pr->id,
                    'title' => 'Prescription — ' . ($pr->patient ? $pr->patient->full_name : 'Unknown'),
                    'subtitle' => ($pr->doctor?->user?->name ?? 'Unknown') . ' | ' . ($pr->diagnosis ?: ''),
                    'url' => "/dashboard/prescriptions/{$pr->id}",
                    'badge' => $pr->status,
                ];
            }
            $total += $prescriptions->count();
        }

        // ── Lab Reports / Medical Reports ──
        if (!$module || $module === 'reports') {
            $reports = MedicalReport::with(['patient', 'doctor.user'])
                ->where(function ($query) use ($q) {
                    $query->where('report_title', 'like', "%{$q}%")
                        ->orWhere('description', 'like', "%{$q}%")
                        ->orWhereHas('patient', fn($p) => $p->where('first_name', 'like', "%{$q}%")
                        ->orWhere('last_name', 'like', "%{$q}%"));
                })->limit($limit)->get();

            foreach ($reports as $r) {
                $results[] = [
                    'type' => 'report',
                    'id' => $r->id,
                    'title' => $r->report_title,
                    'subtitle' => ($r->patient ? $r->patient->full_name : 'Unknown') . ' | ' . ucfirst($r->report_type),
                    'url' => "/dashboard/medical-records",
                    'badge' => $r->report_type,
                ];
            }
            $total += $reports->count();
        }

        // ── Billing ──
        if (!$module || $module === 'bills') {
            $bills = Bill::with('patient')
                ->where(function ($query) use ($q) {
                    $query->where('bill_number', 'like', "%{$q}%")
                        ->orWhereHas('patient', fn($p) => $p->where('first_name', 'like', "%{$q}%")
                        ->orWhere('last_name', 'like', "%{$q}%")
                        ->orWhere('patient_id', 'like', "%{$q}%"));
                })->limit($limit)->get();

            foreach ($bills as $b) {
                $results[] = [
                    'type' => 'bill',
                    'id' => $b->id,
                    'title' => $b->bill_number,
                    'subtitle' => ($b->patient ? $b->patient->full_name : 'Unknown') . ' | Rs. ' . number_format($b->total, 2),
                    'url' => "/dashboard/billing",
                    'badge' => $b->status,
                ];
            }
            $total += $bills->count();
        }

        // ── CMS Content ──
        if (!$module || $module === 'cms') {
            // Blog posts
            $posts = CmsPost::where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('content', 'like', "%{$q}%")
                    ->orWhere('excerpt', 'like', "%{$q}%");
            })->limit($limit)->get();

            foreach ($posts as $post) {
                $results[] = [
                    'type' => 'cms_post',
                    'id' => $post->id,
                    'title' => $post->title,
                    'subtitle' => 'Blog post' . ($post->published_at ? ' | Published' : ' | Draft'),
                    'url' => '/admin/cms/posts',
                    'badge' => 'CMS',
                ];
            }
            $total += $posts->count();

            // Pages
            $pages = CmsPage::where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                    ->orWhere('content', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            })->limit($limit)->get();

            foreach ($pages as $page) {
                $results[] = [
                    'type' => 'cms_page',
                    'id' => $page->id,
                    'title' => $page->title,
                    'subtitle' => 'Page — ' . $page->slug,
                    'url' => '/admin/cms/pages',
                    'badge' => 'CMS',
                ];
            }
            $total += $pages->count();
        }

        // ── Users ──
        if (!$module || $module === 'users') {
            $users = User::with('role')
                ->where(function ($query) use ($q) {
                    $query->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                })->limit($limit)->get();

            foreach ($users as $u) {
                $results[] = [
                    'type' => 'user',
                    'id' => $u->id,
                    'title' => $u->name,
                    'subtitle' => $u->email . ($u->role ? ' | ' . $u->role->name : ''),
                    'url' => '/dashboard/settings',
                    'badge' => 'User',
                ];
            }
            $total += $users->count();
        }

        // Sort by relevance (more specific matches first - simple prioritization)
        // Group by type for structured response
        $grouped = collect($results)->groupBy('type')->map(function ($items) {
            return [
                'results' => $items->take(10)->values()->toArray(),
                'count' => $items->count(),
            ];
        });

        return response()->json([
            'data' => $results,
            'grouped' => $grouped,
            'total' => $total,
            'query' => $q,
        ]);
    /**
     * Management dashboard stats — real-time KPIs across all modules.
     */
    public function managementStats(): JsonResponse
    {
        $now = now();
        $today = $now->copy()->startOfDay();
        $monthStart = $now->copy()->startOfMonth();
        $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

        // Patient metrics
        $totalPatients = Patient::count();
        $newPatientsToday = Patient::where('created_at', '>=', $today)->count();
        $newPatientsThisMonth = Patient::where('created_at', '>=', $monthStart)->count();
        $newPatientsLastMonth = Patient::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();

        // Appointment metrics
        $appointmentsToday = Appointment::whereDate('appointment_date', today())->count();
        $appointmentsCompleted = Appointment::whereDate('appointment_date', today())->where('status', 'completed')->count();
        $appointmentsCancelled = Appointment::whereDate('appointment_date', today())->where('status', 'cancelled')->count();
        $appointmentsThisMonth = Appointment::where('created_at', '>=', $monthStart)->count();
        $appointmentsLastMonth = Appointment::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
        $noShowRate = Appointment::whereDate('appointment_date', today())->count() > 0
            ? round((Appointment::whereDate('appointment_date', today())->where('status', 'no_show')->count() / max(Appointment::whereDate('appointment_date', today())->count(), 1)) * 100, 1)
            : 0;

        // Revenue metrics
        $revenueToday = Payment::where('status', 'completed')->whereDate('paid_at', today())->sum('amount');
        $revenueThisMonth = Payment::where('status', 'completed')->where('paid_at', '>=', $monthStart)->sum('amount');
        $revenueLastMonth = Payment::where('status', 'completed')->whereBetween('paid_at', [$lastMonthStart, $lastMonthEnd])->sum('amount');
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $pendingBills = Bill::whereIn('status', ['waiting_payment', 'partially_paid'])->sum('due_amount');

        // Billing
        $billsToday = Bill::whereDate('created_at', today())->count();
        $paidToday = Bill::where('status', 'paid')->whereDate('updated_at', today())->count();

        // Clinical metrics
        $prescriptionsToday = Prescription::whereDate('created_at', today())->count();
        $totalPrescriptions = Prescription::count();

        // Lab metrics
        $labOrdersPending = LabTestOrder::whereIn('status', ['ordered', 'collected'])->count();
        $labResultsToday = LabTestOrder::where('status', 'validated')->whereDate('updated_at', today())->count();

        // Imaging metrics
        $imagingPending = ImagingOrder::whereIn('status', ['ordered', 'scheduled'])->count();
        $imagingSignedToday = ImagingOrder::where('status', 'signed')->whereDate('updated_at', today())->count();
        $scheduledToday = ModalitySchedule::whereDate('scheduled_at', today())->where('status', 'scheduled')->count();

        // Pharmacy / Inventory
        $lowStockItems = InventoryItem::lowStock()->count();
        $totalMedicines = InventoryItem::where('category', 'medicine')->count();

        // Insurance
        $pendingClaims = InsuranceClaim::whereIn('status', ['draft', 'submitted'])->count();

        // Users
        $activeUsers = User::where('email_verified_at', '!=', null)->count();
        $totalUsers = User::count();

        // Patients by gender
        $genderDist = Patient::select('gender', DB::raw('count(*) as count'))
            ->whereNotNull('gender')
            ->groupBy('gender')
            ->pluck('count', 'gender');

        // Appointments by status (today)
        $apptStatuses = Appointment::whereDate('appointment_date', today())
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        // Monthly revenue trend (last 6 months)
        $monthlyRevenue = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $start = $date->copy()->startOfMonth();
            $end = $date->copy()->endOfMonth();
            $monthlyRevenue[] = [
                'month' => $date->format('M Y'),
                'revenue' => (float) Payment::where('status', 'completed')
                    ->whereBetween('paid_at', [$start, $end])
                    ->sum('amount'),
                'bills' => Bill::where('status', 'paid')
                    ->whereBetween('updated_at', [$start, $end])
                    ->count(),
            ];
        }

        // Department workload (appointments by department this month)
        $deptWorkload = Appointment::where('appointments.created_at', '>=', $monthStart)
            ->join('doctors', 'appointments.doctor_id', '=', 'doctors.id')
            ->join('departments', 'doctors.department_id', '=', 'departments.id')
            ->select('departments.name', DB::raw('count(*) as count'))
            ->groupBy('departments.name')
            ->orderByDesc('count')
            ->get();

        return response()->json([
            // Summary KPIs
            'total_patients' => $totalPatients,
            'new_patients_today' => $newPatientsToday,
            'new_patients_this_month' => $newPatientsThisMonth,
            'new_patients_last_month' => $newPatientsLastMonth,
            'patient_growth_percent' => $newPatientsLastMonth > 0
                ? round((($newPatientsThisMonth - $newPatientsLastMonth) / $newPatientsLastMonth) * 100, 1)
                : 0,

            'appointments_today' => $appointmentsToday,
            'appointments_completed' => $appointmentsCompleted,
            'appointments_cancelled' => $appointmentsCancelled,
            'appointments_this_month' => $appointmentsThisMonth,
            'appointments_last_month' => $appointmentsLastMonth,
            'appointment_growth_percent' => $appointmentsLastMonth > 0
                ? round((($appointmentsThisMonth - $appointmentsLastMonth) / $appointmentsLastMonth) * 100, 1)
                : 0,
            'no_show_rate' => $noShowRate,

            'revenue_today' => $revenueToday,
            'revenue_this_month' => $revenueThisMonth,
            'revenue_last_month' => $revenueLastMonth,
            'revenue_growth_percent' => $revenueLastMonth > 0
                ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
                : 0,
            'total_revenue' => $totalRevenue,
            'pending_bills' => $pendingBills,
            'bills_today' => $billsToday,
            'paid_today' => $paidToday,

            'prescriptions_today' => $prescriptionsToday,
            'total_prescriptions' => $totalPrescriptions,
            'lab_orders_pending' => $labOrdersPending,
            'lab_results_today' => $labResultsToday,
            'imaging_pending' => $imagingPending,
            'imaging_signed_today' => $imagingSignedToday,
            'scheduled_today' => $scheduledToday,

            'low_stock_items' => $lowStockItems,
            'total_medicines' => $totalMedicines,
            'pending_claims' => $pendingClaims,
            'active_users' => $activeUsers,
            'total_users' => $totalUsers,

            // Charts data
            'monthly_revenue' => $monthlyRevenue,
            'gender_distribution' => $genderDist,
            'appointment_statuses_today' => $apptStatuses,
            'department_workload' => $deptWorkload,
        ]);
    }
}