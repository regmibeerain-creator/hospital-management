import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cmsApi from '../../lib/cms-api';

interface HealthPackage {
    id: number;
    title: string;
    slug: string;
    description: string;
    included_services: string;
    price: number;
    original_price: number | null;
    discount_percent: number | null;
    duration: string | null;
    featured_image: string | null;
    is_featured: boolean;
}

export default function HealthPackages() {
    const [packages, setPackages] = useState<HealthPackage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cmsApi.public.getHealthPackages({ per_page: 50 })
            .then((res) => setPackages(res.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link to="/website" className="font-semibold text-gray-900">← Back to Home</Link>
                    <span className="font-semibold text-gray-900">Health Packages</span>
                    <Link to="/login" className="text-sm text-indigo-600">Login</Link>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <h1 className="text-3xl font-bold text-gray-900">Health Packages</h1>
                <p className="mt-2 text-gray-500">Comprehensive health check-up and wellness packages tailored for you</p>

                {loading ? (
                    <div className="mt-12 flex justify-center">
                        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : packages.length === 0 ? (
                    <div className="mt-12 text-center py-12 bg-white rounded-xl border border-gray-200">
                        <p className="text-gray-500">No health packages available yet.</p>
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {packages.map((pkg) => (
                            <div key={pkg.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                                {pkg.featured_image && (
                                    <div className="h-48 overflow-hidden">
                                        <img src={pkg.featured_image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                )}
                                <div className="p-6">
                                    {pkg.discount_percent && (
                                        <span className="inline-block px-2.5 py-1 text-xs font-bold text-green-700 bg-green-50 rounded-full">
                                            Save {pkg.discount_percent}%
                                        </span>
                                    )}
                                    <h2 className="mt-3 text-xl font-semibold text-gray-900">{pkg.title}</h2>
                                    {pkg.description && (
                                        <p className="mt-2 text-sm text-gray-500 line-clamp-3">{pkg.description}</p>
                                    )}
                                    <div className="mt-4 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-indigo-600">Rs. {pkg.price.toLocaleString()}</span>
                                        {pkg.original_price && (
                                            <span className="text-sm text-gray-400 line-through">Rs. {pkg.original_price.toLocaleString()}</span>
                                        )}
                                    </div>
                                    {pkg.duration && (
                                        <p className="mt-1 text-xs text-gray-400">Valid for {pkg.duration}</p>
                                    )}
                                    {pkg.included_services && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">Included Services</p>
                                            <p className="mt-1 text-sm text-gray-500 line-clamp-3">{pkg.included_services}</p>
                                        </div>
                                    )}
                                    <Link
                                        to="/website/contact"
                                        className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                    >
                                        Enquire Now
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
