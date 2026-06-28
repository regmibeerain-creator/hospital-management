import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { User, Camera, Loader2, Save, Lock } from 'lucide-react';

export default function Profile() {
    const { user, setUser } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        mobile_number: user?.mobile_number || '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Password change
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            let response;
            if (avatarFile) {
                const formData = new FormData();
                formData.append('name', form.name);
                formData.append('mobile_number', form.mobile_number);
                formData.append('avatar', avatarFile);
                response = await api.post('/profile', formData);
            } else {
                response = await api.post('/profile', {
                    name: form.name,
                    mobile_number: form.mobile_number,
                });
            }
            setUser(response.data.user || response.data);
            setMessage('Profile updated successfully.');
            setAvatarFile(null);
            setAvatarPreview(null);
        } catch {
            setMessage('Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            setPasswordMessage('Passwords do not match.');
            return;
        }
        setChangingPassword(true);
        setPasswordMessage('');
        try {
            await api.post('/profile/change-password', {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
                new_password_confirmation: passwordForm.new_password_confirmation,
            });
            setPasswordMessage('Password changed successfully.');
            setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err: any) {
            setPasswordMessage(err?.response?.data?.message || 'Failed to change password.');
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-slide-in">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Profile Settings</h1>

            {/* Profile Info */}
            <div className="glass-card-solid rounded-2xl p-6">
                <div className="flex items-center gap-6 mb-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-10 h-10" />
                            )}
                        </div>
                        <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors shadow-sm">
                            <Camera className="w-4 h-4 text-[var(--text-secondary)]" />
                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        </label>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-[var(--text-primary)]">{user?.name}</h2>
                        <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
                        {user?.role && (
                            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {user.role.name}
                            </span>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                Mobile Number
                            </label>
                            <input
                                type="tel"
                                value={form.mobile_number}
                                onChange={(e) => setForm((p) => ({ ...p, mobile_number: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                            Email
                        </label>
                        <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] text-[var(--text-muted)] cursor-not-allowed"
                        />
                    </div>

                    {message && (
                        <div
                            className={`p-3 rounded-xl text-sm ${
                                message.includes('success')
                                    ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                    : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                            }`}
                        >
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save changes
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Change Password */}
            <div className="glass-card-solid rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">Change Password</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={passwordForm.current_password}
                            onChange={(e) => setPasswordForm((p) => ({ ...p, current_password: e.target.value }))}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.new_password}
                                onChange={(e) => setPasswordForm((p) => ({ ...p, new_password: e.target.value }))}
                                required
                                minLength={8}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={passwordForm.new_password_confirmation}
                                onChange={(e) => setPasswordForm((p) => ({ ...p, new_password_confirmation: e.target.value }))}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                            />
                        </div>
                    </div>

                    {passwordMessage && (
                        <div
                            className={`p-3 rounded-xl text-sm ${
                                passwordMessage.includes('success')
                                    ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20'
                                    : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                            }`}
                        >
                            {passwordMessage}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={changingPassword}
                        className="px-6 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {changingPassword ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Changing...
                            </>
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                Change password
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
