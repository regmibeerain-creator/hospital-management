import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cmsApi from '../../lib/cms-api';

interface Stats {
    pages_count: number;
    posts_count: number;
    published_posts: number;
    health_packages_count: number;
    media_count: number;
    unread_inquiries: number;
    total_inquiries: number;
}

export default function CmsDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cmsApi.admin.getDashboardStats()
            .then((res) => setStats(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const modules = [
        { name: 'Pages', path: '/admin/cms/pages', count: stats?.pages_count, icon: '📄', color: 'bg-blue-50 text-blue-700' },
        { name: 'Blog Posts', path: '/admin/cms/posts', count: stats?.posts_count, icon: '✍️', color: 'bg-purple-50 text-purple-700' },
        { name: 'FAQ', path: '/admin/cms/faq', count: null, icon: '❓', color: 'bg-amber-50 text-amber-700' },
        { name: 'Inquiries', path: '/admin/cms/inquiries', count: stats?.unread_inquiries, icon: '📧', color: 'bg-green-50 text-green-700', badge: stats?.unread_inquiries },
        { name: 'Media Gallery', path: '/admin/cms/media', count: stats?.media_count, icon: '🖼️', color: 'bg-pink-50 text-pink-700' },
        { name: 'Health Packages', path: '/admin/cms/health-packages', count: stats?.health_packages_count, icon: '❤️', color: 'bg-red-50 text-red-700' },
        { name: 'Hospital Profile', path: '/admin/cms/profile', count: null, icon: '🏥', color: 'bg-indigo-50 text-indigo-700' },
    ];

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">CMS Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your website content</p>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Posts</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.posts_count || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Published</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">{stats?.published_posts || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Unread Inquiries</p>
                    <p className="mt-1 text-2xl font-bold text-amber-600">{stats?.unread_inquiries || 0}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Media Files</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{stats?.media_count || 0}</p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {modules.map((mod) => (
                    <Link
                        key={mod.name}
                        to={mod.path}
                        className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{mod.icon}</span>
                                <div>
                                    <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{mod.name}</p>
                                    {mod.count !== null && (
                                        <p className="text-sm text-gray-500">{mod.count} items</p>
                                    )}
                                </div>
                            </div>
                            {mod.badge && mod.badge > 0 ? (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-red-700 bg-red-50 rounded-full">
                                    {mod.badge} new
                                </span>
                            ) : (
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
