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
use App\Http\Controllers\Api\DeviceLogController;
use App\Http\Controllers\Api\LoginLogController;
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

    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/admin/users', function () {
            return \App\Models\User::with('role')->paginate(20);
        })->name('admin.users');
    });
});
