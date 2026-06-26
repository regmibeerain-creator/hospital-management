import { useState, useEffect } from 'react';
import cmsApi from '../../lib/cms-api';

export default function CmsInquiryManager() {
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewing, setViewing] = useState<any>(null);
    const [showUnread, setShowUnread] = useState(false);

    const fetchData = () => {
        setLoading(true);
        cmsApi.admin.getInquiries({ unread: showUnread || undefined })
            .then((res) => setInquiries(res.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [showUnread]);

    const handleView = async (inquiry: any) => {
        if (!inquiry.is_read) {
            try {
                const res = await cmsApi.admin.getInquiry(inquiry.id);
                setViewing(res.data.data);
                fetchData();
                return;
            } catch {}
        }
        setViewing(inquiry);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this inquiry?')) return;
        try {
            await cmsApi.admin.deleteInquiry(id);
            if (viewing?.id === id) setViewing(null);
            fetchData();
        } catch { alert('Failed to delete'); }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
                    <p className="text-sm text-gray-500">Contact form submissions</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input type="checkbox" checked={showUnread} onChange={(e) => setShowUnread(e.target.checked)}
                        className="rounded border-gray-300" />
                    Unread only
                </label>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-h-[70vh] overflow-y-auto">
                        {inquiries.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No inquiries found</div>
                        ) : (
                            inquiries.map((inq) => (
                                <button
                                    key={inq.id}
                                    onClick={() => handleView(inq)}
                                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                        viewing?.id === inq.id ? 'bg-indigo-50' : ''
                                    } ${!inq.is_read ? 'border-l-2 border-l-indigo-500' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`font-medium text-sm ${!inq.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {inq.name}
                                        </span>
                                        <span className="text-xs text-gray-400">{new Date(inq.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{inq.subject}</p>
                                </button>
                            ))
                        )}
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        {viewing ? (
                            <div>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{viewing.name}</h3>
                                        <p className="text-sm text-gray-500">{viewing.email}</p>
                                        {viewing.phone && <p className="text-sm text-gray-500">{viewing.phone}</p>}
                                    </div>
                                    <button onClick={() => handleDelete(viewing.id)} className="text-red-600 text-sm hover:text-red-800">Delete</button>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700">Subject</p>
                                    <p className="text-sm text-gray-900">{viewing.subject}</p>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700">Message</p>
                                    <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{viewing.message}</p>
                                </div>
                                <p className="mt-4 text-xs text-gray-400">Received {new Date(viewing.created_at).toLocaleString()}</p>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">Select an inquiry to view</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
