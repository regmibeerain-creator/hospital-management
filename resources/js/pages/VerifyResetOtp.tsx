import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyResetOtp() {
    const { verifyResetOtp, resendOtp } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;
    const resetToken = location.state?.reset_token;

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    if (!email || !resetToken) {
        navigate('/forgot-password');
        return null;
    }

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const otp = code.join('');
        if (otp.length !== 6) {
            setError('Please enter the complete 6-digit code.');
            setLoading(false);
            return;
        }

        try {
            const result = await verifyResetOtp(email, otp, resetToken);
            navigate('/reset-password', {
                state: { email, reset_token: result.reset_token },
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        try {
            await resendOtp(email, 'password_reset');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend code.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">H</span>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Check your email</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter the reset code sent to <strong>{email}</strong>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-center gap-2">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verifying...' : 'Verify code'}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        Didn&apos;t receive the code?{' '}
                        <button
                            type="button"
                            onClick={handleResend}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Resend code
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
