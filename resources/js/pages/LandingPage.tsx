import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src="/images/hero-bg.png"
                    alt=""
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/85 via-indigo-800/75 to-indigo-950/90" />
            </div>
            <div className="relative max-w-2xl mx-auto px-6 text-center">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 p-2 ring-1 ring-white/20 shadow-2xl">
                    <img src="/images/logo.png" alt="Hospital Logo" className="w-full h-full object-contain drop-shadow-lg" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight drop-shadow-lg">
                    Birendranagar Municipal Hospital
                </h1>
                <p className="mt-4 text-lg text-blue-200 font-light">
                    Integrated healthcare platform for multi-hospital and multi-branch operations
                </p>
                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/website"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold text-lg rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        Visit Website
                    </Link>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500/20 backdrop-blur-sm text-white font-semibold text-lg rounded-xl hover:bg-blue-500/30 transition-all border border-white/20 hover:border-white/30"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
