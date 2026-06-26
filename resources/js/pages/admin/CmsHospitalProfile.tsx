import { useState, useEffect } from 'react';
import cmsApi from '../../lib/cms-api';

export default function CmsHospitalProfile() {
    const [form, setForm] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        cmsApi.admin.getHospitalProfile()
            .then((res) => {
                if (res.data?.data) {
                    setForm(res.data.data);
                } else {
                    setForm({
                        hospital_name: '',
                        tagline: '',
                        about: '',
                        mission: '',
                        vision: '',
                        address: '',
                        phone: '',
                        email: '',
                        website: '',
                        logo: '',
                        favicon: '',
                        social_links: {},
                    });
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await cmsApi.admin.updateHospitalProfile(form);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hospital Profile</h1>
                    <p className="text-sm text-gray-500">Manage hospital information displayed on the public website</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
                    {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hospital Name</label>
                            <input type="text" value={form.hospital_name || ''}
                                onChange={(e) => setForm({ ...form, hospital_name: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tagline</label>
                            <input type="text" value={form.tagline || ''}
                                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">About</label>
                        <textarea value={form.about || ''}
                            onChange={(e) => setForm({ ...form, about: e.target.value })}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mission</label>
                            <textarea value={form.mission || ''}
                                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Vision</label>
                            <textarea value={form.vision || ''}
                                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Address</label>
                            <input type="text" value={form.address || ''}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="text" value={form.phone || ''}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" value={form.email || ''}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Website</label>
                            <input type="text" value={form.website || ''}
                                onChange={(e) => setForm({ ...form, website: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Logo URL</label>
                            <input type="text" value={form.logo || ''}
                                onChange={(e) => setForm({ ...form, logo: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Favicon URL</label>
                            <input type="text" value={form.favicon || ''}
                                onChange={(e) => setForm({ ...form, favicon: e.target.value })}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
