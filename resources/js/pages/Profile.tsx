import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
    const { user, updateProfile, changePassword } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [mobileNumber, setMobileNumber] = useState(user?.mobile_number || '');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [pwForm, setPwForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMessage, setPwMessage] = useState('');
    const [pwError, setPwError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        setError('');

        try {
            const formData = new FormData();
            formData.append('name', name);
            if (mobileNumber) formData.append('mobile_number', mobileNumber);
            if (avatar) formData.append('avatar', avatar);

            await updateProfile(formData);
            setMessage('Profile updated successfully.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwSaving(true);
        setPwMessage('');
        setPwError('');

        if (pwForm.new_password !== pwForm.new_password_confirmation) {
            setPwError('Passwords do not match.');
            setPwSaving(false);
            return;
        }

        try {
            await changePassword(pwForm.current_password, pwForm.new_password, pwForm.new_password_confirmation);
            setPwMessage('Password changed successfully.');
            setPwForm({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err: any) {
            setPwError(err.response?.data?.message || 'Failed to change password.');
        } finally {
            setPwSaving(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Manage your account information and password.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>

                {message && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                        {error}
                    </div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="" className="w-20 h-20 object-cover" />
                                ) : user?.avatar ? (
                                    <img src={user.avatar} alt="" className="w-20 h-20 object-cover" />
                                ) : (
                                    <span className="text-blue-600 font-bold text-2xl">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
                            >
                                <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                            {user?.role && (
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-full">
                                    {user.role.name}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input
                                type="tel"
                                value={mobileNumber}
                                onChange={(e) => setMobileNumber(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Member Since</label>
                            <input
                                type="text"
                                value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
                                disabled
                                className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>

                {pwMessage && (
                    <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
                        {pwMessage}
                    </div>
                )}
                {pwError && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                        {pwError}
                    </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                            type="password"
                            value={pwForm.current_password}
                            onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                value={pwForm.new_password}
                                onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                value={pwForm.new_password_confirmation}
                                onChange={(e) => setPwForm({ ...pwForm, new_password_confirmation: e.target.value })}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={pwSaving}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {pwSaving ? 'Changing...' : 'Change password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
