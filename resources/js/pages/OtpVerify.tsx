import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { Shield, Loader2, ArrowLeft } from 'lucide-react';

export default function OtpVerify() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const type = searchParams.get('type') || 'login';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (timer > 0 && !canResend) {
            const interval = setInterval(() => setTimer((t) => t - 1), 1000);
            return () => clearInterval(interval);
        }
        if (timer === 0) setCanResend(true);
    }, [timer, canResend]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await api.post('/verify-otp', { email, code, type });
            if (type === 'password_reset') {
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            const endpoint = type === 'password_reset' ? '/forgot-password' : '/resend-otp';
            const payload = type === 'password_reset' ? { email } : { email, type };
            await api.post(endpoint, payload);
            setTimer(30);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch {
            setError('Failed to resend code. Please try again.');
        } finally {
            setResending(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center text-[var(--text-muted)]">
                    <p>Invalid verification link.</p>
                    <button onClick={() => navigate('/login')} className="text-primary mt-2 hover:underline">
                        Go to login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
            <div className="w-full max-w-md animate-slide-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-400 shadow-lg shadow-primary/25 mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Verify Your Identity</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Enter the 6-digit code sent to{' '}
                        <span className="font-medium text-[var(--text-secondary)]">{email}</span>
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-[var(--border)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 animate-scale-in">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-center gap-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Verify'
                            )}
                        </button>

                        <div className="text-center">
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="text-sm text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
                                >
                                    {resending ? 'Sending...' : 'Resend code'}
                                </button>
                            ) : (
                                <p className="text-sm text-[var(--text-muted)]">
                                    Resend code in <span className="font-medium text-[var(--text-secondary)]">{timer}s</span>
                                </p>
                            )}
                        </div>
                    </form>
                </div>

                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mx-auto"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
            </div>
        </div>
    );
}
