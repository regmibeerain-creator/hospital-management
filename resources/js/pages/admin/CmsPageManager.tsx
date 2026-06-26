import { useState, useEffect } from 'react';
import cmsApi from '../../lib/cms-api';

interface Page {
    id: number;
    title: string;
    slug: string;
    status: string;
    updated_at: string;
}

export default function CmsPageManager() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<Page> & { content?: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const fetchPages = () => {
        setLoading(true);
        cmsApi.admin.getPages({ search })
            .then((res) => setPages(res.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPages(); }, [search]);

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const data = { title: editing.title, content: editing.content, status: editing.status || 'draft' };
            if (editing.id) {
                await cmsApi.admin.updatePage(editing.id, data);
            } else {
                await cmsApi.admin.createPage(data);
            }
            setEditing(null);
            fetchPages();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure?')) return;
        try {
            await cmsApi.admin.deletePage(id);
            fetchPages();
        } catch { alert('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
                    <p className="text-sm text-gray-500">Manage static pages</p>
                </div>
                <button
                    onClick={() => setEditing({ title: '', content: '', status: 'draft' })}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                    + New Page
                </button>
            </div>

            <input
                type="text"
                placeholder="Search pages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4"
            />

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
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map((page) => (
                                <tr key={page.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{page.title}</td>
                                    <td className="px-4 py-3 text-gray-500">/{page.slug}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                            page.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                                        }`}>
                                            {page.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setEditing(page)} className="text-indigo-600 hover:text-indigo-800 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(page.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {pages.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No pages found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editing.id ? 'Edit Page' : 'New Page'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text" value={editing.title || ''}
                                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Content (HTML)</label>
                                <textarea
                                    value={editing.content || ''}
                                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                                    rows={12}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={editing.status || 'draft'}
                                    onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
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
