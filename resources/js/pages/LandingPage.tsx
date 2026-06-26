import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 flex items-center justify-center">
            <div className="max-w-2xl mx-auto px-6 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                    <span className="text-white text-3xl font-bold">H</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                    Hospital Management System
                </h1>
                <p className="mt-4 text-lg text-indigo-100">
                    Integrated healthcare platform for multi-hospital and multi-branch operations
                </p>
                <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/website"
                        className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-700 font-semibold text-lg rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
                    >
                        Visit Website
                    </Link>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center px-8 py-4 bg-indigo-500 text-white font-semibold text-lg rounded-xl hover:bg-indigo-400 transition-colors border border-indigo-400"
                    >
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
