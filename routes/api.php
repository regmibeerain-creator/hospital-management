<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Cms\CmsCategoryController;
use App\Http\Controllers\Api\Cms\CmsDashboardController;
use App\Http\Controllers\Api\Cms\CmsFaqController;
use App\Http\Controllers\Api\Cms\CmsHealthPackageController;
use App\Http\Controllers\Api\Cms\CmsHospitalProfileController;
use App\Http\Controllers\Api\Cms\CmsInquiryController;
use App\Http\Controllers\Api\Cms\CmsMediaController;
use App\Http\Controllers\Api\Cms\CmsPageController;
use App\Http\Controllers\Api\Cms\CmsPostController;
use App\Http\Controllers\Api\Cms\PublicCmsController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\DeviceLogController;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\LoginLogController;
use App\Http\Controllers\Api\MedicalReportController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Auth routes
Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->name('verify-otp');
Route::post('/resend-otp', [AuthController::class, 'resendOtp'])->name('resend-otp');
Route::post('/resend-verification', [AuthController::class, 'resendEmailVerification'])->name('resend-verification');

Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('password.forgot');
Route::post('/verify-reset-otp', [AuthController::class, 'verifyResetOtp'])->name('password.verify-reset-otp');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.reset');

Route::get('/email/verify/{id}', [AuthController::class, 'verifyEmail'])
    ->name('verification.verify');

// Public CMS routes (no auth required)
Route::prefix('cms')->name('cms.')->group(function () {
    Route::get('/hospital-profile', [PublicCmsController::class, 'hospitalProfile'])->name('hospital-profile');
    Route::get('/pages', [PublicCmsController::class, 'pages'])->name('pages');
    Route::get('/pages/{slug}', [PublicCmsController::class, 'page'])->name('page');
    Route::get('/posts', [PublicCmsController::class, 'posts'])->name('posts');
    Route::get('/posts/{slug}', [PublicCmsController::class, 'post'])->name('post');
    Route::get('/categories', [PublicCmsController::class, 'categories'])->name('categories');
    Route::get('/faqs', [PublicCmsController::class, 'faqs'])->name('faqs');
    Route::get('/health-packages', [PublicCmsController::class, 'healthPackages'])->name('health-packages');
    Route::get('/health-packages/{slug}', [PublicCmsController::class, 'healthPackage'])->name('health-package');
    Route::get('/media', [PublicCmsController::class, 'media'])->name('media');
    Route::post('/inquiries', [PublicCmsController::class, 'submitInquiry'])->name('inquiries.submit');
});

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/user', function (Request $request) {
        return $request->user()->load('role');
    })->name('user');

    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/change-password', [ProfileController::class, 'changePassword'])->name('profile.change-password');

    Route::get('/login-logs', [LoginLogController::class, 'index'])->name('login-logs.index');
    Route::get('/login-logs/{loginLog}', [LoginLogController::class, 'show'])->name('login-logs.show');

    Route::get('/device-logs', [DeviceLogController::class, 'index'])->name('device-logs.index');
    Route::get('/device-logs/{deviceLog}', [DeviceLogController::class, 'show'])->name('device-logs.show');

    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');
    Route::get('/audit-logs/my', [AuditLogController::class, 'myLogs'])->name('audit-logs.my');
    Route::get('/audit-logs/{auditLog}', [AuditLogController::class, 'show'])->name('audit-logs.show');

    // CMS Admin routes (authenticated + admin role)
    Route::prefix('cms/admin')->name('cms.admin.')->middleware('role:admin')->group(function () {
        Route::get('/dashboard', [CmsDashboardController::class, 'stats'])->name('dashboard');

        // Pages
        Route::apiResource('pages', CmsPageController::class)->except('create', 'edit');

        // Posts
        Route::apiResource('posts', CmsPostController::class)->except('create', 'edit');

        // Categories
        Route::apiResource('categories', CmsCategoryController::class)->except('create', 'edit');

        // FAQs
        Route::get('faqs/categories', [CmsFaqController::class, 'categories'])->name('faq-categories.index');
        Route::post('faqs/categories', [CmsFaqController::class, 'storeCategory'])->name('faq-categories.store');
        Route::put('faqs/categories/{faqCategory}', [CmsFaqController::class, 'updateCategory'])->name('faq-categories.update');
        Route::delete('faqs/categories/{faqCategory}', [CmsFaqController::class, 'destroyCategory'])->name('faq-categories.destroy');
        Route::apiResource('faqs', CmsFaqController::class)->except('create', 'edit');

        // Inquiries
        Route::get('inquiries/stats', [CmsInquiryController::class, 'stats'])->name('inquiries.stats');
        Route::post('inquiries/{inquiry}/mark-read', [CmsInquiryController::class, 'markRead'])->name('inquiries.mark-read');
        Route::apiResource('inquiries', CmsInquiryController::class)->only('index', 'show', 'destroy');

        // Media
        Route::post('media', [CmsMediaController::class, 'store'])->name('media.store');
        Route::put('media/{media}', [CmsMediaController::class, 'update'])->name('media.update');
        Route::delete('media/{media}', [CmsMediaController::class, 'destroy'])->name('media.destroy');
        Route::get('media', [CmsMediaController::class, 'index'])->name('media.index');

        // Health Packages
        Route::apiResource('health-packages', CmsHealthPackageController::class)->except('create', 'edit');

        // Hospital Profile
        Route::get('hospital-profile', [CmsHospitalProfileController::class, 'show'])->name('hospital-profile');
        Route::put('hospital-profile', [CmsHospitalProfileController::class, 'update'])->name('hospital-profile.update');
    });

    // BPR - Appointments (authenticated patient routes)
    Route::prefix('appointments')->name('appointments.')->group(function () {
        Route::get('/my', [AppointmentController::class, 'myAppointments'])->name('my');
        Route::post('/book', [AppointmentController::class, 'book'])->name('book');
        Route::get('/{appointment}', [AppointmentController::class, 'show'])->name('show');
        Route::post('/{appointment}/cancel', [AppointmentController::class, 'cancel'])->name('cancel');
    });

    // BPR - Doctors listing
    Route::get('/doctors', [DoctorController::class, 'index'])->name('doctors.index');
    Route::get('/doctors/{doctor}', [DoctorController::class, 'show'])->name('doctors.show');
    Route::get('/doctors/{doctor}/available-slots', [DoctorController::class, 'availableSlots'])->name('doctors.available-slots');

    // BPR - Medical Reports (patient view)
    Route::prefix('medical-reports')->name('medical-reports.')->group(function () {
        Route::get('/', [MedicalReportController::class, 'index'])->name('index');
        Route::get('/summary', [MedicalReportController::class, 'summary'])->name('summary');
        Route::get('/{medicalReport}', [MedicalReportController::class, 'show'])->name('show');
    });

    // BPR - Prescriptions (patient view)
    Route::prefix('prescriptions')->name('prescriptions.')->group(function () {
        Route::get('/', [PrescriptionController::class, 'index'])->name('index');
        Route::get('/active', [PrescriptionController::class, 'active'])->name('active');
        Route::get('/{prescription}', [PrescriptionController::class, 'show'])->name('show');
    });

    // BPR - Departments
    Route::get('/departments/list', [DepartmentController::class, 'list'])->name('departments.list');
    Route::get('/departments', [DepartmentController::class, 'index'])->name('departments.index');
    Route::post('/departments', [DepartmentController::class, 'store'])->name('departments.store');
    Route::get('/departments/{department}', [DepartmentController::class, 'show'])->name('departments.show');
    Route::put('/departments/{department}', [DepartmentController::class, 'update'])->name('departments.update');
    Route::delete('/departments/{department}', [DepartmentController::class, 'destroy'])->name('departments.destroy');

    // BPR - Patients
    Route::get('/patients/search', [PatientController::class, 'search'])->name('patients.search');
    Route::get('/patients', [PatientController::class, 'index'])->name('patients.index');
    Route::post('/patients', [PatientController::class, 'register'])->name('patients.register');
    Route::get('/patients/{patient}', [PatientController::class, 'show'])->name('patients.show');
    Route::put('/patients/{patient}', [PatientController::class, 'update'])->name('patients.update');

    // ─── Billing ───
    Route::prefix('billing')->name('billing.')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\BillController::class, 'stats'])->name('stats');
        Route::get('/', [\App\Http\Controllers\Api\BillController::class, 'index'])->name('index');
        Route::post('/', [\App\Http\Controllers\Api\BillController::class, 'store'])->name('store');
        Route::get('/{bill}', [\App\Http\Controllers\Api\BillController::class, 'show'])->name('show');
        Route::post('/{bill}/items', [\App\Http\Controllers\Api\BillController::class, 'addItem'])->name('items.add');
        Route::delete('/{bill}/items/{item}', [\App\Http\Controllers\Api\BillController::class, 'removeItem'])->name('items.remove');
        Route::post('/{bill}/payments', [\App\Http\Controllers\Api\BillController::class, 'recordPayment'])->name('payments.store');
        Route::post('/{bill}/finalize', [\App\Http\Controllers\Api\BillController::class, 'finalize'])->name('finalize');
        Route::post('/{bill}/void', [\App\Http\Controllers\Api\BillController::class, 'void'])->name('void');
    });

    // ─── Insurance ───
    Route::prefix('insurance')->name('insurance.')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\InsuranceController::class, 'stats'])->name('stats');
        // Companies
        Route::get('/companies', [\App\Http\Controllers\Api\InsuranceController::class, 'companies'])->name('companies');
        Route::post('/companies', [\App\Http\Controllers\Api\InsuranceController::class, 'storeCompany'])->name('companies.store');
        Route::put('/companies/{insuranceCompany}', [\App\Http\Controllers\Api\InsuranceController::class, 'updateCompany'])->name('companies.update');
        // Policies
        Route::get('/policies', [\App\Http\Controllers\Api\InsuranceController::class, 'policies'])->name('policies');
        Route::post('/policies', [\App\Http\Controllers\Api\InsuranceController::class, 'storePolicy'])->name('policies.store');
        // Claims
        Route::get('/claims', [\App\Http\Controllers\Api\InsuranceController::class, 'claims'])->name('claims');
        Route::post('/claims', [\App\Http\Controllers\Api\InsuranceController::class, 'submitClaim'])->name('claims.submit');
        Route::post('/claims/{insuranceClaim}/approve', [\App\Http\Controllers\Api\InsuranceController::class, 'approveClaim'])->name('claims.approve');
    });

    // ─── Inventory ───
    Route::prefix('inventory')->name('inventory.')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\InventoryController::class, 'inventoryStats'])->name('stats');
        // Items
        Route::get('/items', [\App\Http\Controllers\Api\InventoryController::class, 'items'])->name('items');
        Route::post('/items', [\App\Http\Controllers\Api\InventoryController::class, 'storeItem'])->name('items.store');
        Route::put('/items/{inventoryItem}', [\App\Http\Controllers\Api\InventoryController::class, 'updateItem'])->name('items.update');
        // Stock
        Route::get('/stock-movements', [\App\Http\Controllers\Api\InventoryController::class, 'stockMovements'])->name('stock-movements');
        Route::post('/stock-movements', [\App\Http\Controllers\Api\InventoryController::class, 'addStock'])->name('stock-movements.store');
        // Assets
        Route::get('/assets', [\App\Http\Controllers\Api\InventoryController::class, 'assets'])->name('assets');
        Route::post('/assets', [\App\Http\Controllers\Api\InventoryController::class, 'storeAsset'])->name('assets.store');
        Route::put('/assets/{asset}', [\App\Http\Controllers\Api\InventoryController::class, 'updateAsset'])->name('assets.update');
        // Maintenance
        Route::get('/assets/{asset}/maintenance', [\App\Http\Controllers\Api\InventoryController::class, 'maintenanceLogs'])->name('assets.maintenance');
        Route::post('/assets/{asset}/maintenance', [\App\Http\Controllers\Api\InventoryController::class, 'storeMaintenanceLog'])->name('assets.maintenance.store');
    });

    // ─── Pharmacy (staff) ───
    Route::prefix('pharmacy')->name('pharmacy.')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\PharmacyController::class, 'stats'])->name('stats');
        Route::get('/prescriptions', [\App\Http\Controllers\Api\PharmacyController::class, 'prescriptions'])->name('prescriptions');
        Route::get('/prescriptions/{prescription}', [\App\Http\Controllers\Api\PharmacyController::class, 'showPrescription'])->name('prescriptions.show');
        Route::post('/prescriptions/{prescription}/dispense', [\App\Http\Controllers\Api\PharmacyController::class, 'dispense'])->name('prescriptions.dispense');
        Route::post('/prescriptions/{prescription}/complete', [\App\Http\Controllers\Api\PharmacyController::class, 'complete'])->name('prescriptions.complete');
        Route::get('/medicines', [\App\Http\Controllers\Api\PharmacyController::class, 'medicines'])->name('medicines');
    });

    // ─── Laboratory (staff) ───
    Route::prefix('laboratory')->name('laboratory.')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\LaboratoryController::class, 'stats'])->name('stats');
        Route::get('/tests', [\App\Http\Controllers\Api\LaboratoryController::class, 'tests'])->name('tests');
        Route::post('/tests', [\App\Http\Controllers\Api\LaboratoryController::class, 'storeTest'])->name('tests.store');
        Route::get('/tests/{medicalReport}', [\App\Http\Controllers\Api\LaboratoryController::class, 'showTest'])->name('tests.show');
        Route::post('/tests/{medicalReport}/results', [\App\Http\Controllers\Api\LaboratoryController::class, 'enterResults'])->name('tests.results');
    });

    // ─── Radiology (staff) ───
    Route::prefix('radiology')->name('radiology.')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\RadiologyController::class, 'stats'])->name('stats');
        Route::get('/orders', [\App\Http\Controllers\Api\RadiologyController::class, 'orders'])->name('orders');
        Route::post('/orders', [\App\Http\Controllers\Api\RadiologyController::class, 'storeOrder'])->name('orders.store');
        Route::get('/orders/{medicalReport}', [\App\Http\Controllers\Api\RadiologyController::class, 'showOrder'])->name('orders.show');
        Route::post('/orders/{medicalReport}/results', [\App\Http\Controllers\Api\RadiologyController::class, 'enterResults'])->name('orders.results');
    });

    // ─── Notifications ───
    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\NotificationController::class, 'index'])->name('index');
        Route::get('/unread-count', [\App\Http\Controllers\Api\NotificationController::class, 'unreadCount'])->name('unread-count');
        Route::post('/{notification}/read', [\App\Http\Controllers\Api\NotificationController::class, 'markRead'])->name('mark-read');
        Route::post('/mark-all-read', [\App\Http\Controllers\Api\NotificationController::class, 'markAllRead'])->name('mark-all-read');
        Route::delete('/{notification}', [\App\Http\Controllers\Api\NotificationController::class, 'destroy'])->name('destroy');
    });

    // ─── Reports & Analytics ───
    Route::prefix('reports')->name('reports.')->middleware('role:admin')->group(function () {
        Route::get('/overview', [\App\Http\Controllers\Api\ReportController::class, 'overview'])->name('overview');
        Route::get('/revenue-chart', [\App\Http\Controllers\Api\ReportController::class, 'revenueChart'])->name('revenue-chart');
        Route::get('/appointments', [\App\Http\Controllers\Api\ReportController::class, 'appointmentStats'])->name('appointments');
        Route::get('/patients', [\App\Http\Controllers\Api\ReportController::class, 'patientStats'])->name('patients');
        Route::get('/billing', [\App\Http\Controllers\Api\ReportController::class, 'billingSummary'])->name('billing');
    });

    // ─── System Settings ───
    Route::prefix('settings')->name('settings.')->middleware('role:admin')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\SettingsController::class, 'index'])->name('index');
        Route::put('/', [\App\Http\Controllers\Api\SettingsController::class, 'update'])->name('update');
        Route::get('/{group}', [\App\Http\Controllers\Api\SettingsController::class, 'getByGroup'])->name('group');
    });

    // ─── LIS - Laboratory Information System ───
    Route::prefix('lis')->name('lis.')->group(function () {
        // Dashboard
        Route::get('/stats', [\App\Http\Controllers\Api\LisController::class, 'stats'])->name('stats');

        // Test Catalog
        Route::get('/catalog', [\App\Http\Controllers\Api\LisController::class, 'catalogIndex'])->name('catalog.index');
        Route::post('/catalog', [\App\Http\Controllers\Api\LisController::class, 'catalogStore'])->name('catalog.store');
        Route::put('/catalog/{labTestCatalog}', [\App\Http\Controllers\Api\LisController::class, 'catalogUpdate'])->name('catalog.update');

        // Test Orders
        Route::get('/orders', [\App\Http\Controllers\Api\LisController::class, 'orders'])->name('orders');
        Route::post('/orders', [\App\Http\Controllers\Api\LisController::class, 'storeOrder'])->name('orders.store');
        Route::get('/orders/{labTestOrder}', [\App\Http\Controllers\Api\LisController::class, 'showOrder'])->name('orders.show');

        // Samples
        Route::get('/samples', [\App\Http\Controllers\Api\LisController::class, 'samples'])->name('samples');
        Route::post('/samples/collect', [\App\Http\Controllers\Api\LisController::class, 'collectSample'])->name('samples.collect');
        Route::post('/samples/{labSample}/accession', [\App\Http\Controllers\Api\LisController::class, 'accessionSample'])->name('samples.accession');

        // Results
        Route::get('/results/pending', [\App\Http\Controllers\Api\LisController::class, 'pendingResults'])->name('results.pending');
        Route::post('/results/{labTestResult}/enter', [\App\Http\Controllers\Api\LisController::class, 'enterResult'])->name('results.enter');
        Route::post('/results/{labTestResult}/validate', [\App\Http\Controllers\Api\LisController::class, 'validateResult'])->name('results.validate');
        Route::post('/results/bulk-validate', [\App\Http\Controllers\Api\LisController::class, 'bulkValidate'])->name('results.bulk-validate');
        Route::post('/results/{labTestResult}/amend', [\App\Http\Controllers\Api\LisController::class, 'amendResult'])->name('results.amend');
    });

    // ─── RIS/PACS - Radiology Information System ───
    Route::prefix('ris')->name('ris.')->group(function () {
        // Dashboard
        Route::get('/stats', [\App\Http\Controllers\Api\RisController::class, 'stats'])->name('stats');
        Route::get('/modalities', [\App\Http\Controllers\Api\RisController::class, 'modalities'])->name('modalities');

        // Imaging Orders
        Route::get('/orders', [\App\Http\Controllers\Api\RisController::class, 'orders'])->name('orders');
        Route::post('/orders', [\App\Http\Controllers\Api\RisController::class, 'storeOrder'])->name('orders.store');
        Route::get('/orders/{imagingOrder}', [\App\Http\Controllers\Api\RisController::class, 'showOrder'])->name('orders.show');
        Route::put('/orders/{imagingOrder}', [\App\Http\Controllers\Api\RisController::class, 'updateOrder'])->name('orders.update');

        // Modality Scheduling
        Route::get('/schedule', [\App\Http\Controllers\Api\RisController::class, 'scheduleIndex'])->name('schedule');
        Route::post('/schedule', [\App\Http\Controllers\Api\RisController::class, 'scheduleSlot'])->name('schedule.store');
        Route::put('/schedule/{modalitySchedule}', [\App\Http\Controllers\Api\RisController::class, 'updateSchedule'])->name('schedule.update');

        // Imaging Studies
        Route::get('/studies', [\App\Http\Controllers\Api\RisController::class, 'studies'])->name('studies');
        Route::post('/studies', [\App\Http\Controllers\Api\RisController::class, 'acquireStudy'])->name('studies.acquire');
        Route::put('/studies/{imagingStudy}', [\App\Http\Controllers\Api\RisController::class, 'updateStudy'])->name('studies.update');

        // Structured Reports
        Route::get('/reports', [\App\Http\Controllers\Api\RisController::class, 'reports'])->name('reports');
        Route::post('/reports', [\App\Http\Controllers\Api\RisController::class, 'startReport'])->name('reports.start');
        Route::put('/reports/{structuredReport}', [\App\Http\Controllers\Api\RisController::class, 'updateReport'])->name('reports.update');
        Route::post('/reports/{structuredReport}/sign', [\App\Http\Controllers\Api\RisController::class, 'signReport'])->name('reports.sign');
        Route::post('/reports/{structuredReport}/amend', [\App\Http\Controllers\Api\RisController::class, 'amendReport'])->name('reports.amend');
    });

    // ─── Global Search ───
    Route::get('/search', [\App\Http\Controllers\Api\SearchController::class, 'search'])->name('search');

    // ─── Management Dashboard (admin) ───
    Route::prefix('admin/dashboard')->name('admin.dashboard.')->middleware('role:admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Api\SearchController::class, 'managementStats'])->name('stats');
    });

    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/users', function () {
            return \App\Models\User::with('role')->paginate(20);
        })->name('admin.users');
    });
});
