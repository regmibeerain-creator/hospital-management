import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cmsApi from '../../lib/cms-api';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string | null;
    published_at: string;
    category: { id: number; name: string; slug: string } | null;
}

interface Package {
    id: number;
    title: string;
    slug: string;
    description: string;
    price: number;
    original_price: number | null;
    discount_percent: number | null;
    duration: string | null;
}

interface Profile {
    hospital_name: string;
    tagline: string;
    logo: string | null;
}

export default function PublicHomePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [packages, setPackages] = useState<Package[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        Promise.all([
            cmsApi.public.getHospitalProfile(),
            cmsApi.public.getPosts({ featured: true, per_page: 3 }),
            cmsApi.public.getHealthPackages({ featured: true, per_page: 3 }),
        ])
            .then(([profileRes, postsRes, packagesRes]) => {
                setProfile(profileRes.data?.data ?? null);
                setPosts(postsRes.data.data || []);
                setPackages(packagesRes.data.data || []);
            })
            .catch(() => {})
            .finally(() => setLoaded(true));
    }, []);

    return (
        <div className={`min-h-screen transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{profile?.hospital_name?.charAt(0) || 'H'}</span>
                            </div>
                            <span className="font-semibold text-gray-900">{profile?.hospital_name || 'Hospital'}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
                            <Link to="/website/blog" className="text-sm text-gray-600 hover:text-gray-900">Blog</Link>
                            <Link to="/website/faq" className="text-sm text-gray-600 hover:text-gray-900">FAQ</Link>
                            <Link to="/website/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact</Link>
                            <Link to="/website/health-packages" className="text-sm text-gray-600 hover:text-gray-900">Packages</Link>
                            <Link to="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Login</Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                            {profile?.tagline || 'Your Health, Our Priority'}
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-indigo-100 leading-relaxed max-w-2xl">
                            We provide comprehensive healthcare services with state-of-the-art facilities,
                            experienced doctors, and compassionate care. Your well-being is at the heart of everything we do.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link
to="/website/contact"
                                className="inline-flex items-center px-6 py-3 bg-white text-indigo-700 font-medium rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
                            >
                                Book Appointment
                            </Link>
                            <Link
to="/website/health-packages"
                                className="inline-flex items-center px-6 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-400 transition-colors border border-indigo-400"
                            >
                                View Health Packages
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <section className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { number: '500+', label: 'Happy Patients' },
                            { number: '50+', label: 'Expert Doctors' },
                            { number: '15+', label: 'Departments' },
                            { number: '24/7', label: 'Emergency Care' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl font-bold text-indigo-600">{stat.number}</p>
                                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
                        <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                            Comprehensive healthcare services tailored to meet your needs
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: 'Emergency Care', desc: '24/7 emergency services with rapid response teams', icon: '🚑' },
                            { title: 'Outpatient Services', desc: 'Consultations with specialists across all departments', icon: '👨‍⚕️' },
                            { title: 'Inpatient Care', desc: 'Comfortable wards with round-the-clock nursing care', icon: '🏥' },
                            { title: 'Diagnostics', desc: 'Advanced laboratory and imaging facilities', icon: '🔬' },
                            { title: 'Pharmacy', desc: 'Fully stocked pharmacy with prescription services', icon: '💊' },
                            { title: 'Health Packages', desc: 'Comprehensive health check-up and wellness packages', icon: '❤️' },
                        ].map((service) => (
                            <div key={service.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <span className="text-3xl">{service.icon}</span>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">{service.title}</h3>
                                <p className="mt-2 text-sm text-gray-500">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Blog Posts */}
            {posts.length > 0 && (
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900">Latest Updates</h2>
                            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">News and articles from our hospital</p>
                        </div>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <Link
                                    key={post.id}
                                    to={`/website/blog/${post.slug}`}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
                                >
                                    <div className="h-48 bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center">
                                        {post.featured_image ? (
                                            <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl text-indigo-300">📄</span>
                                        )}
                                    </div>
                                    <div className="p-5">
                                        {post.category && (
                                            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                                {post.category.name}
                                            </span>
                                        )}
                                        <h3 className="mt-2 font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <Link to="/website/blog" className="text-indigo-600 font-medium hover:text-indigo-700">View all articles →</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Health Packages */}
            {packages.length > 0 && (
                <section className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold text-gray-900">Health Packages</h2>
                            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">Comprehensive health check-up packages</p>
                        </div>
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                            {packages.map((pkg) => (
                                <Link
                                    key={pkg.id}
                                    to={`/website/health-packages/${pkg.slug}`}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group"
                                >
                                    {pkg.discount_percent && (
                                        <span className="inline-block px-2 py-1 text-xs font-bold text-green-700 bg-green-50 rounded-full">
                                            {pkg.discount_percent}% OFF
                                        </span>
                                    )}
                                    <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                        {pkg.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{pkg.description}</p>
                                    <div className="mt-4 flex items-baseline gap-2">
                                        <span className="text-2xl font-bold text-indigo-600">Rs. {pkg.price.toLocaleString()}</span>
                                        {pkg.original_price && (
                                            <span className="text-sm text-gray-400 line-through">Rs. {pkg.original_price.toLocaleString()}</span>
                                        )}
                                    </div>
                                    {pkg.duration && (
                                        <p className="mt-1 text-xs text-gray-400">Valid for {pkg.duration}</p>
                                    )}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-8 text-center">
                            <Link to="/website/health-packages" className="text-indigo-600 font-medium hover:text-indigo-700">View all packages →</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-white font-semibold">{profile?.hospital_name || 'Hospital'}</h3>
                            <p className="mt-2 text-sm">Providing quality healthcare services since 2020.</p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Quick Links</h3>
                            <ul className="mt-2 space-y-2 text-sm">
                                <li><Link to="/website/blog" className="hover:text-white">Blog</Link></li>
                                <li><Link to="/website/faq" className="hover:text-white">FAQ</Link></li>
                                <li><Link to="/website/contact" className="hover:text-white">Contact</Link></li>
                                <li><Link to="/website/health-packages" className="hover:text-white">Health Packages</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Contact</h3>
                            <ul className="mt-2 space-y-2 text-sm">
                                <li>{profile?.address || 'Kathmandu, Nepal'}</li>
                                <li>{profile?.phone || '+977-1-4XXXXXX'}</li>
                                <li>{profile?.email || 'info@hospital.com'}</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
                        &copy; {new Date().getFullYear()} {profile?.hospital_name || 'Hospital'}. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
