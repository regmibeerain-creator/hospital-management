import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { MailCheck, Loader2, AlertCircle } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email') || '';
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        // If there's a signed URL, verify automatically
        const id = searchParams.get('id');
        const hash = searchParams.get('hash');
        const signature = searchParams.get('signature');
        const expires = searchParams.get('expires');

        if (id && hash && signature && expires) {
            setStatus('loading');
            const verifyUrl = `/email/verify/${id}?hash=${hash}&signature=${signature}&expires=${expires}`;
            api.get(verifyUrl)
                .then(() => {
                    setStatus('success');
                    setMessage('Email verified successfully!');
                })
                .catch((err) => {
                    setStatus('error');
                    setMessage(err?.response?.data?.message || 'Verification link is invalid or expired.');
                });
        } else if (email) {
            setStatus('idle');
        } else {
            setStatus('error');
            setMessage('No verification information provided.');
        }
    }, []);

    const handleResend = async () => {
        setResending(true);
        try {
            await api.post('/resend-verification', { email });
            setMessage('Verification email resent. Please check your inbox.');
            setStatus('idle');
        } catch (err: any) {
            setMessage(err?.response?.data?.message || 'Failed to resend verification email.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
            <div className="w-full max-w-md animate-slide-in text-center">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-[var(--border)]">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-[var(--text-secondary)]">Verifying your email...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                                <MailCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">{message}</h2>
                            <p className="text-sm text-[var(--text-muted)]">
                                You can now sign in to your account.
                            </p>
                            <Link
                                to="/login"
                                className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary/25 transition-all duration-200"
                            >
                                Sign in
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">Verification failed</h2>
                            <p className="text-sm text-[var(--text-muted)]">{message}</p>
                            {email && (
                                <button
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="mt-2 text-sm text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
                                >
                                    {resending ? 'Resending...' : 'Resend verification email'}
                                </button>
                            )}
                        </div>
                    )}

                    {status === 'idle' && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                                <MailCheck className="w-8 h-8 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                Check your email
                            </h2>
                            <p className="text-sm text-[var(--text-muted)]">
                                We sent a verification link to <strong className="text-[var(--text-secondary)]">{email}</strong>.
                                Click the link in the email to verify your account.
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="mt-2 text-sm text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
                            >
                                {resending ? 'Resending...' : 'Resend verification email'}
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-sm text-[var(--text-muted)] mt-6">
                    <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
