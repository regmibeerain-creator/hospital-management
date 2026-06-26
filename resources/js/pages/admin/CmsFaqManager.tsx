import { useState, useEffect } from 'react';
import cmsApi from '../../lib/cms-api';

export default function CmsFaqManager() {
    const [faqs, setFaqs] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any>(null);
    const [catEditing, setCatEditing] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'faqs' | 'categories'>('faqs');

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            cmsApi.admin.getFaqs(),
            cmsApi.admin.getFaqCategories(),
        ])
            .then(([faqsRes, catRes]) => {
                setFaqs(faqsRes.data.data || []);
                setCategories(catRes.data.data || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleSaveFaq = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const data = {
                question: editing.question,
                answer: editing.answer,
                faq_category_id: editing.faq_category_id || null,
                status: editing.status || 'published',
                sort_order: editing.sort_order || 0,
            };
            if (editing.id) {
                await cmsApi.admin.updateFaq(editing.id, data);
            } else {
                await cmsApi.admin.createFaq(data);
            }
            setEditing(null);
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveCategory = async () => {
        if (!catEditing) return;
        setSaving(true);
        try {
            const data = { name: catEditing.name, description: catEditing.description, sort_order: catEditing.sort_order || 0 };
            if (catEditing.id) {
                await cmsApi.admin.updateFaqCategory(catEditing.id, data);
            } else {
                await cmsApi.admin.createFaqCategory(data);
            }
            setCatEditing(null);
            fetchData();
        } catch (e: any) {
            alert(e.response?.data?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this FAQ?')) return;
        try {
            await cmsApi.admin.deleteFaq(id);
            fetchData();
        } catch { alert('Failed to delete'); }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Delete this category and all its FAQs?')) return;
        try {
            await cmsApi.admin.deleteFaqCategory(id);
            fetchData();
        } catch { alert('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">FAQ Management</h1>
                    <p className="text-sm text-gray-500">Manage frequently asked questions</p>
                </div>
                <button
                    onClick={() => setEditing({ question: '', answer: '', faq_category_id: null, status: 'published', sort_order: 0 })}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                    + New FAQ
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button onClick={() => setActiveTab('faqs')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        activeTab === 'faqs' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                    }`}>FAQs ({faqs.length})</button>
                <button onClick={() => setActiveTab('categories')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        activeTab === 'categories' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200'
                    }`}>Categories ({categories.length})</button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : activeTab === 'faqs' ? (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Question</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faqs.map((faq) => (
                                <tr key={faq.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{faq.question}</td>
                                    <td className="px-4 py-3 text-gray-500">{faq.category?.name || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                                            faq.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                                        }`}>{faq.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setEditing(faq)} className="text-indigo-600 hover:text-indigo-800 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(faq.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {faqs.length === 0 && (
                                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No FAQs found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">{cat.name}</h3>
                                    <p className="text-xs text-gray-500">{cat.faqs?.length || 0} FAQs</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setCatEditing(cat)} className="text-indigo-600 text-xs hover:text-indigo-800">Edit</button>
                                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-600 text-xs hover:text-red-800">Delete</button>
                                </div>
                            </div>
                            {cat.description && <p className="mt-2 text-xs text-gray-500">{cat.description}</p>}
                        </div>
                    ))}
                    <button
                        onClick={() => setCatEditing({ name: '', description: '', sort_order: 0 })}
                        className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-4 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                    >
                        + Add Category
                    </button>
                </div>
            )}

            {/* FAQ Edit Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{editing.id ? 'Edit FAQ' : 'New FAQ'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select value={editing.faq_category_id || ''}
                                    onChange={(e) => setEditing({ ...editing, faq_category_id: parseInt(e.target.value) || null })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                    <option value="">No category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Question</label>
                                <input type="text" value={editing.question || ''}
                                    onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Answer</label>
                                <textarea value={editing.answer || ''}
                                    onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                                    rows={5}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select value={editing.status || 'published'}
                                        onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                                    <input type="number" value={editing.sort_order || 0}
                                        onChange={(e) => setEditing({ ...editing, sort_order: parseInt(e.target.value) || 0 })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                            <button onClick={handleSaveFaq} disabled={saving}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm">
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Edit Modal */}
            {catEditing && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">{catEditing.id ? 'Edit Category' : 'New Category'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input type="text" value={catEditing.name || ''}
                                    onChange={(e) => setCatEditing({ ...catEditing, name: e.target.value })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea value={catEditing.description || ''}
                                    onChange={(e) => setCatEditing({ ...catEditing, description: e.target.value })}
                                    rows={2}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Sort Order</label>
                                <input type="number" value={catEditing.sort_order || 0}
                                    onChange={(e) => setCatEditing({ ...catEditing, sort_order: parseInt(e.target.value) || 0 })}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <button onClick={() => setCatEditing(null)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
                            <button onClick={handleSaveCategory} disabled={saving}
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
