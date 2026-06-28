import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const [form, setForm] = useState({ password: '', password_confirmation: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await api.post('/reset-password', {
                email,
                password: form.password,
                password_confirmation: form.password_confirmation,
                // The token should be in the URL from the verify reset OTP step
                token: searchParams.get('token') || '',
            });
            navigate('/login?reset=success');
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                    'Failed to reset password. The link may have expired.',
            );
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center text-[var(--text-muted)]">
                    <p>Invalid password reset link.</p>
                    <Link to="/forgot-password" className="text-primary mt-2 block hover:underline">
                        Request a new reset
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
            <div className="w-full max-w-md animate-slide-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-blue-400 shadow-lg shadow-primary/25 mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Set New Password</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Choose a new password for <strong className="text-[var(--text-secondary)]">{email}</strong>
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-[var(--border)]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400 animate-scale-in">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                    placeholder="At least 8 characters"
                                    required
                                    minLength={8}
                                    className="w-full px-4 py-2.5 pr-11 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={form.password_confirmation}
                                onChange={(e) => setForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                                placeholder="Repeat your new password"
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                'Reset password'
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                    <Link to="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
