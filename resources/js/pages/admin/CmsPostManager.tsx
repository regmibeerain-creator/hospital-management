import { useState, useEffect } from 'react';
import cmsApi from '../../lib/cms-api';

interface Post {
    id: number;
    title: string;
    slug: string;
    status: string;
    category?: { id: number; name: string } | null;
    published_at: string | null;
}

interface Category {
    id: number;
    name: string;
}

export default function CmsPostManager() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState('');

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            cmsApi.admin.getPosts({ search }),
            cmsApi.admin.getCategories(),
        ])
            .then(([postsRes, catRes]) => {
                setPosts(postsRes.data.data || []);
                setCategories(catRes.data.data || []);
            })
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
                excerpt: editing.excerpt,
                content: editing.content,
                category_id: editing.category_id || null,
                status: editing.status || 'draft',
            };
            if (editing.id) {
                await cmsApi.admin.updatePost(editing.id, data);
            } else {
                await cmsApi.admin.createPost(data);
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
            await cmsApi.admin.deletePost(id);
            fetchData();
        } catch { alert('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
                    <p className="text-sm text-gray-500">Manage blog and news articles</p>
                </div>
                <button
                    onClick={() => setEditing({ title: '', excerpt: '', content: '', category_id: null, status: 'draft' })}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                    + New Post
                </button>
            </div>

            <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search posts..."
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
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>
                                    <td className="px-4 py-3 text-gray-500">{post.category?.name || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                            post.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                                        }`}>
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setEditing(post)} className="text-indigo-600 hover:text-indigo-800 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {posts.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No posts found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editing.id ? 'Edit Post' : 'New Post'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Title</label>
                                <input type="text" value={editing.title || ''}
                                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select value={editing.category_id || ''}
                                        onChange={(e) => setEditing({ ...editing, category_id: parseInt(e.target.value) || null })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="">No category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select value={editing.status || 'draft'}
                                        onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="draft">Draft</option>
                                        <option value="published">Published</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                                <textarea value={editing.excerpt || ''}
                                    onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                                    rows={2}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Content (HTML)</label>
                                <textarea value={editing.content || ''}
                                    onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                                    rows={10}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
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
