import { useState, useEffect } from 'react';
import cmsApi from '../../lib/cms-api';

export default function CmsHealthPackageManager() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const fetchData = () => {
        setLoading(true);
        cmsApi.admin.getHealthPackages({ search })
            .then((res) => setPackages(res.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [search]);

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const data = {
                title: editing.title,
                description: editing.description,
                included_services: editing.included_services,
                price: editing.price,
                original_price: editing.original_price || null,
                duration: editing.duration,
                status: editing.status || 'draft',
                is_featured: editing.is_featured || false,
            };
            if (editing.id) {
                await cmsApi.admin.updateHealthPackage(editing.id, data);
            } else {
                await cmsApi.admin.createHealthPackage(data);
            }
            setEditing(null);
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await cmsApi.admin.deleteHealthPackage(id);
            fetchData();
        } catch { alert('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Health Packages</h1>
                    <p className="text-sm text-gray-500">Manage health check-up packages</p>
                </div>
                <button onClick={() => setEditing({
                    title: '', description: '', included_services: '', price: 0, original_price: null, duration: '', status: 'draft', is_featured: false
                })} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                    + New Package
                </button>
            </div>

            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search packages..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4" />

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Featured</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {packages.map((pkg) => (
                                <tr key={pkg.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{pkg.title}</td>
                                    <td className="px-4 py-3 text-gray-500">Rs. {pkg.price.toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                            pkg.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                                        }`}>{pkg.status}</span>
                                    </td>
                                    <td className="px-4 py-3">{pkg.is_featured ? '⭐' : '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setEditing(pkg)} className="text-indigo-600 hover:text-indigo-800 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(pkg.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {packages.length === 0 && (
                                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No packages found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editing.id ? 'Edit Package' : 'New Package'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" value={editing.title || ''}
                                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price (Rs.)</label>
                                    <input type="number" value={editing.price || 0}
                                        onChange={(e) => setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Original Price</label>
                                    <input type="number" value={editing.original_price || ''}
                                        onChange={(e) => setEditing({ ...editing, original_price: parseFloat(e.target.value) || null })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                                    <input type="text" value={editing.duration || ''}
                                        onChange={(e) => setEditing({ ...editing, duration: e.target.value })}
                                        placeholder="e.g., 1 Year"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea value={editing.description || ''}
                                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                    rows={3}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Included Services</label>
                                <textarea value={editing.included_services || ''}
                                    onChange={(e) => setEditing({ ...editing, included_services: e.target.value })}
                                    rows={4}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select value={editing.status || 'draft'}
                                        onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 mt-6 text-sm font-medium text-gray-700">
                                        <input type="checkbox" checked={editing.is_featured || false}
                                            onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })}
                                            className="rounded border-gray-300" />
                                        Featured package
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                            <button onClick={handleSave} disabled={saving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
