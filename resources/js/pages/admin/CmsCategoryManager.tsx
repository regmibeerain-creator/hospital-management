import { useState, useEffect } from 'react';
import cmsApi from '../../lib/cms-api';

export default function CmsCategoryManager() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);

    const fetchData = () => {
        setLoading(true);
        cmsApi.admin.getCategories()
            .then((res) => setCategories(res.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const data = { name: editing.name, description: editing.description, sort_order: editing.sort_order || 0 };
            if (editing.id) {
                await cmsApi.admin.updateCategory(editing.id, data);
            } else {
                await cmsApi.admin.createCategory(data);
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
        if (!confirm('Delete this category?')) return;
        try {
            await cmsApi.admin.deleteCategory(id);
            fetchData();
        } catch { alert('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-500">Manage blog post categories</p>
                </div>
                <button onClick={() => setEditing({ name: '', description: '', sort_order: 0 })}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">+ New Category</button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Posts</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                                    <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                                    <td className="px-4 py-3 text-gray-500">{cat.posts_count || 0}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setEditing(cat)} className="text-indigo-600 hover:text-indigo-800 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editing.id ? 'Edit Category' : 'New Category'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" value={editing.name || ''}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea value={editing.description || ''}
                                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                    rows={2}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                                <input type="number" value={editing.sort_order || 0}
                                    onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
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
