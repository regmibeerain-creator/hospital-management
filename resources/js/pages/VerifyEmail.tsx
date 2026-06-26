import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Step = 'prompt' | 'otp';

export default function VerifyEmail() {
    const { verifyOtp, resendOtp } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [step, setStep] = useState<Step>('prompt');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (step === 'otp') {
            setTimeout(() => otpRefs.current[0]?.focus(), 100);
        }
    }, [step]);

    if (!email) {
        navigate('/login');
        return null;
    }

    const handleSendCode = async () => {
        setSending(true);
        setError('');
        try {
            await resendOtp(email, 'email_verification');
            setSent(true);
            setStep('otp');
            setSuccess('A 6-digit verification code has been sent to your email.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send verification code.');
        } finally {
            setSending(false);
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
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setVerifying(true);

        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            setVerifying(false);
            return;
        }

        try {
            await verifyOtp(email, code, 'email_verification');
            navigate('/login', {
                state: { message: 'Email verified successfully! You can now sign in.' },
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired code.');
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setSuccess('');
        setOtp(['', '', '', '', '', '']);
        try {
            await resendOtp(email, 'email_verification');
            setSuccess('A new code has been sent to your email.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend code.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    {step === 'prompt' ? (
                        <div className="text-center">
                            {/* Mail Icon */}
                            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>

                            <h2 className="mt-6 text-2xl font-bold text-gray-900">Verify your email</h2>
                            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                                Your email address <strong className="text-gray-900">{email}</strong> has not been verified yet.
                                We'll send a 6-digit verification code to your email.
                            </p>

                            {error && (
                                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                                    {error}
                                </div>
                            )}

                            <div className="mt-8 space-y-4">
                                <button
                                    onClick={handleSendCode}
                                    disabled={sending}
                                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {sending ? 'Sending...' : 'Send verification code'}
                                </button>

                                <Link
                                    to="/login"
                                    className="block w-full py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-center transition-colors"
                                >
                                    Back to login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleVerify}>
                            <div className="text-center">
                                <div className="mx-auto w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-gray-900">Enter verification code</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    A 6-digit code was sent to <strong>{email}</strong>
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
                                disabled={verifying}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {verifying ? 'Verifying...' : 'Verify email'}
                            </button>

                            <div className="flex items-center justify-between text-sm">
                                <button
                                    type="button"
                                    onClick={() => { setStep('prompt'); setOtp(['', '', '', '', '', '']); setError(''); setSuccess(''); }}
                                    className="font-medium text-gray-500 hover:text-gray-700"
                                >
                                    &larr; Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Resend code
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
