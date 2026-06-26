import { useState, useEffect, useRef } from 'react';
import cmsApi from '../../lib/cms-api';

export default function CmsMediaManager() {
    const [media, setMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [typeFilter, setTypeFilter] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const fetchMedia = () => {
        setLoading(true);
        cmsApi.admin.getMedia({ type: typeFilter || undefined })
            .then((res) => setMedia(res.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchMedia(); }, [typeFilter]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            await cmsApi.admin.uploadMedia(formData);
            fetchMedia();
        } catch { alert('Upload failed'); }
        finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this file?')) return;
        try {
            await cmsApi.admin.deleteMedia(id);
            fetchMedia();
        } catch { alert('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Media Gallery</h1>
                    <p className="text-sm text-gray-500">Manage uploaded files and images</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        <option value="">All types</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                        <option value="document">Documents</option>
                    </select>
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                    >
                        {uploading ? 'Uploading...' : '+ Upload'}
                    </button>
                    <input ref={fileRef} type="file" onChange={handleUpload} className="hidden" />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : media.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">No media uploaded yet</p>
                    <button onClick={() => fileRef.current?.click()} className="mt-2 text-indigo-600 text-sm">Upload your first file</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {media.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group relative">
                            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                                {item.file_type === 'image' ? (
                                    <img src={item.url} alt={item.alt_text || item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                ) : (
                                    <span className="text-4xl">
                                        {item.file_type === 'video' ? '🎬' : '📄'}
                                    </span>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <button onClick={() => handleDelete(item.id)} className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600">
                                    Delete
                                </button>
                            </div>
                            <div className="p-2">
                                <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">{item.formatted_size}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
