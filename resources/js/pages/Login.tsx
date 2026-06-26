import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Step = 'credentials' | 'otp';

export default function Login() {
    const { login, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const formRef = useRef<HTMLDivElement>(null);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [showLogin, setShowLogin] = useState(true);
    const [step, setStep] = useState<Step>('credentials');
    const [form, setForm] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(location.state?.message || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoaded(true);
        if (location.state?.message) {
            window.history.replaceState({}, document.title);
        }
    }, []);

    useEffect(() => {
        if (step === 'otp') {
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
    }, [step]);

    const handleOpenLogin = () => {
        setShowLogin(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { requires_otp } = await login(form.email, form.password);
            if (requires_otp) {
                setStep('otp');
                setSuccess('A verification code has been sent to your email.');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.requires_email_verification) {
                navigate('/verify-email', { state: { email: form.email } });
                return;
            }
            setError(data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits are entered
        if (value && index === 5) {
            const fullCode = [...newOtp.slice(0, 5), value].join('');
            if (fullCode.length === 6) {
                setTimeout(() => {
                    const form = document.querySelector('#otp-form') as HTMLFormElement;
                    form?.requestSubmit();
                }, 150);
            }
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            setLoading(false);
            return;
        }

        try {
            await verifyOtp(form.email, code, 'login');
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setSuccess('');
        try {
            await resendOtp(form.email, 'login');
            setSuccess('A new code has been sent to your email.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend code.');
        }
    };

    const handleBackToCredentials = () => {
        setStep('credentials');
        setOtp(['', '', '', '', '', '']);
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50">
            {/* Hero / Branding Section */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-md w-full text-center">
                    {/* Logo Icon */}
                    <div
                        className={`mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-sky-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200/50 transition-all duration-700 ease-out ${
                            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}
                    >
                        <span className="text-white font-bold text-3xl">H</span>
                    </div>

                    {/* Title */}
                    <h1
                        className={`mt-8 text-3xl sm:text-4xl font-bold text-gray-900 transition-all duration-700 ease-out delay-150 ${
                            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}
                    >
                        Hospital Management System
                    </h1>

                    {/* Subtitle */}
                    <p
                        className={`mt-4 text-base text-gray-500 max-w-sm mx-auto leading-relaxed transition-all duration-700 ease-out delay-300 ${
                            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}
                    >
                        Streamline patient care, appointments, and hospital operations — all in one place.
                    </p>

                    {/* Stats */}
                    <div
                        className={`mt-10 flex justify-center gap-4 transition-all duration-700 ease-out delay-[450ms] ${
                            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                        }`}
                    >
                        <div className="text-center px-4">
                            <p className="text-2xl font-bold text-blue-600">500+</p>
                            <p className="text-xs text-gray-500 mt-1">Patients</p>
                        </div>
                        <div className="w-px bg-gray-200" />
                        <div className="text-center px-4">
                            <p className="text-2xl font-bold text-blue-600">50+</p>
                            <p className="text-xs text-gray-500 mt-1">Doctors</p>
                        </div>
                        <div className="w-px bg-gray-200" />
                        <div className="text-center px-4">
                            <p className="text-2xl font-bold text-blue-600">24/7</p>
                            <p className="text-xs text-gray-500 mt-1">Support</p>
                        </div>
                    </div>

                    {/* Login Portal Button */}
                    {!showLogin && (
                        <div
                            className={`mt-12 transition-all duration-700 ease-out delay-[600ms] ${
                                loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                            }`}
                        >
                            <button
                                onClick={handleOpenLogin}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Login Portal
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Login Form Section (slides in) */}
            <div
                ref={formRef}
                className={`transition-all duration-500 ease-in-out ${
                    showLogin
                        ? 'max-h-[1200px] opacity-100 translate-y-0'
                        : 'max-h-0 opacity-0 translate-y-4 overflow-hidden'
                }`}
            >
                <div className="px-4 sm:px-6 lg:px-8 pb-16">
                    <div className="max-w-md mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
                                <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
                            </div>

                            {step === 'credentials' ? (
                                <form className="space-y-5" onSubmit={handleSubmit}>
                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email address
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="you@hospital.com"
                                            autoFocus
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                            Password
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            placeholder="Enter your password"
                                        />
                                    </div>

                                    <div className="flex items-center justify-end">
                                        <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                            Forgot your password?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? 'Signing in...' : 'Sign in'}
                                    </button>

                                    <p className="text-center text-sm text-gray-600">
                                        Don&apos;t have an account?{' '}
                                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                            Sign up
                                        </Link>
                                    </p>
                                </form>
                            ) : (
                                <form id="otp-form" className="space-y-5" onSubmit={handleOtpSubmit}>
                                    <div className="text-center">
                                        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h3 className="mt-3 text-lg font-semibold text-gray-900">Two-factor authentication</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Enter the 6-digit code sent to <strong>{form.email}</strong>
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                                            {error}
                                        </div>
                                    )}
                                    {success && (
                                        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
                                            {success}
                                        </div>
                                    )}

                                    <div className="flex justify-center gap-2">
                                        {otp.map((digit, index) => (
                                            <input
                                                key={index}
                                                ref={(el) => { otpRefs.current[index] = el; }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                            />
                                        ))}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {loading ? 'Verifying...' : 'Verify code'}
                                    </button>

                                    <div className="flex items-center justify-between text-sm">
                                        <button
                                            type="button"
                                            onClick={handleBackToCredentials}
                                            className="font-medium text-gray-500 hover:text-gray-700"
                                        >
                                            &larr; Back
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            className="font-medium text-blue-600 hover:text-blue-500"
                                        >
                                            Resend code
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <p className="mt-6 text-center text-xs text-gray-400">
                            &copy; {new Date().getFullYear()} Hospital Management System. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
