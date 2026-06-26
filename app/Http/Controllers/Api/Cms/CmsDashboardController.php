<?php

namespace App\Http\Controllers\Api\Cms;

use App\Http\Controllers\Controller;
use App\Models\CmsInquiry;
use App\Models\CmsPage;
use App\Models\CmsPost;
use App\Models\CmsHealthPackage;
use App\Models\CmsMedia;
use Illuminate\Http\JsonResponse;

class CmsDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'pages_count' => CmsPage::count(),
            'posts_count' => CmsPost::count(),
            'published_posts' => CmsPost::published()->count(),
            'health_packages_count' => CmsHealthPackage::count(),
            'media_count' => CmsMedia::count(),
            'unread_inquiries' => CmsInquiry::unread()->count(),
            'total_inquiries' => CmsInquiry::count(),
        ]);
    }
}
