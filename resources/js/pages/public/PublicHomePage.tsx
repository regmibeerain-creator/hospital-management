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
            <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-1 overflow-hidden ring-1 ring-blue-100">
                                <img src="/images/logo.png" alt="Hospital Logo" className="w-full h-full object-contain rounded" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-semibold text-gray-900 leading-tight">{profile?.hospital_name || 'Birendranagar Municipal Hospital'}</span>
                                <span className="text-[11px] text-gray-400 leading-tight">सुर्खेत, नेपाल</span>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <Link to="/" className="text-sm font-medium text-blue-600 border-b-2 border-blue-600 pb-0.5">Home</Link>
                            <Link to="/website/blog" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Blog</Link>
                            <Link to="/website/faq" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">FAQ</Link>
                            <Link to="/website/contact" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Contact</Link>
                            <Link to="/website/health-packages" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Packages</Link>
                            <Link
                                to="/login"
                                className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-500 rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md shadow-blue-500/20"
                            >
                                Login
                            </Link>
                        </div>
                        {/* Mobile menu button */}
                        <Link
                            to="/login"
                            className="md:hidden inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-500 rounded-lg"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative text-white overflow-hidden min-h-[600px] flex items-center">
                {/* Background Image */}
                <div className="absolute inset-0">
                    <img
                        src="/images/hero-bg.png"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    {/* Modern gradient overlay for better contrast and visual depth */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-950/85 via-blue-900/70 to-indigo-950/60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-transparent" />
                </div>

                {/* Decorative elements */}
                <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10 text-sm text-blue-200 mb-6">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span>24/7 Emergency Services Available</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
                            {profile?.tagline || 'Your Health, Our Priority'}
                        </h1>
                        <p className="mt-6 text-lg sm:text-xl text-blue-100 leading-relaxed max-w-2xl">
                            We provide comprehensive healthcare services with state-of-the-art facilities,
                            experienced doctors, and compassionate care. Your well-being is at the heart of everything we do.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Link
                                to="/website/contact"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-0.5"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Book Appointment
                            </Link>
                            <Link
                                to="/website/health-packages"
                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-500/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-blue-500/30 transition-all border border-white/20 hover:border-white/30"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
                            <h3 className="text-white font-semibold">{profile?.hospital_name || 'Birendranagar Municipal Hospital'}</h3>
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
                                <li className="flex items-center gap-2"><span>📍</span> Katkuwa, Birendranagar Municipality-7, Surkhet, Nepal</li>
                                <li className="flex items-center gap-2"><span>📞</span> +977-83-524403</li>
                                <li className="flex items-center gap-2"><span>🚑</span> Ambulance: 9745502222</li>
                                <li className="flex items-center gap-2"><span>✉️</span> info@birendranagarmun.gov.np</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-sm">
                                &copy; {new Date().getFullYear()} {profile?.hospital_name || 'Birendranagar Municipal Hospital'}. All rights reserved.
                            </p>
                            <div className="flex items-center gap-4">
                                <a
                                    href="https://www.facebook.com/nagarhospitalskt/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                    <span className="group-hover:underline">Follow us on Facebook</span>
                                </a>
                                <span className="text-gray-600">|</span>
                                <span className="text-xs text-gray-500">Birendranagar NAGAR hospital</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
