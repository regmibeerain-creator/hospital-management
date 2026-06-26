import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPassword() {
    const { resetPassword } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;
    const resetToken = location.state?.reset_token;

    const [form, setForm] = useState({
        password: '',
        password_confirmation: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (!email || !resetToken) {
        navigate('/forgot-password');
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (form.password.length < 8) {
            setError('Password must be at least 8 characters.');
            setLoading(false);
            return;
        }

        if (form.password !== form.password_confirmation) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            await resetPassword(email, resetToken, form.password, form.password_confirmation);
            setSuccess('Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">H</span>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Set new password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Enter your new password below.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Min. 8 characters"
                            />
                        </div>
                        <div>
                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                                Confirm New Password
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                required
                                value={form.password_confirmation}
                                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                placeholder="Repeat your password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!success}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Resetting...' : 'Reset password'}
                    </button>

                    <p className="text-center text-sm text-gray-600">
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Back to sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
