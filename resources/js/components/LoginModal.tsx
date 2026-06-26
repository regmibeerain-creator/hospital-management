import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Step = 'credentials' | 'otp';

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
    const { login, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [step, setStep] = useState<Step>('credentials');
    const [form, setForm] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (step === 'otp') {
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
    }, [step]);

    useEffect(() => {
        if (!open) {
            setStep('credentials');
            setForm({ email: '', password: '' });
            setOtp(['', '', '', '', '', '']);
            setError('');
            setSuccess('');
        }
    }, [open]);

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
                onClose();
                navigate('/dashboard');
            }
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.requires_email_verification) {
                onClose();
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

        if (value && index === 5) {
            const fullCode = [...newOtp.slice(0, 5), value].join('');
            if (fullCode.length === 6) {
                setTimeout(() => {
                    const form = document.querySelector('#modal-otp-form') as HTMLFormElement;
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
            onClose();
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

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-8">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">H</span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="mt-1 text-sm text-gray-500">Sign in to your account</p>
                </div>

                {step === 'credentials' ? (
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
                        )}
                        <div>
                            <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <input
                                id="modal-email"
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
                            <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="modal-password"
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Enter your password"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                ) : (
                    <form id="modal-otp-form" className="space-y-5" onSubmit={handleOtpSubmit}>
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
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{error}</div>
                        )}
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">{success}</div>
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
        </div>
    );
}
