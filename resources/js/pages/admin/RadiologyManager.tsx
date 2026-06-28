import { useState, useEffect } from 'react';
import phase4Api from '../../lib/phase4-api';
import {
    Scan, Plus, Search, Loader2, CheckCircle2, XCircle, FileText,
    AlertTriangle,
} from 'lucide-react';

interface RadiologyOrder {
    id: number; report_title: string; report_type: string;
    description: string | null; file_path: string | null;
    notes: string | null; created_at: string; updated_at: string;
    patient: { id: number; first_name: string; last_name: string; patient_id: string } | null;
    doctor: { id: number; name: string; specialization: string | null } | null;
}

export default function RadiologyManager() {
    const [orders, setOrders] = useState<RadiologyOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showResultsForm, setShowResultsForm] = useState<RadiologyOrder | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<RadiologyOrder | null>(null);
    const [resultsText, setResultsText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};
            if (search) params.search = search;
            const [statsRes, ordersRes] = await Promise.all([
                phase4Api.radiology.stats(),
                phase4Api.radiology.orders(params),
            ]);
            setStats(statsRes.data);
            setOrders(ordersRes.data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [search]);

    const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        try {
            await phase4Api.radiology.createOrder(data);
            setShowCreateForm(false);
            fetchData();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed to create order'); }
    };

    const handleSubmitResults = async () => {
        if (!showResultsForm || !resultsText.trim()) return;
        setSubmitting(true);
        try {
            await phase4Api.radiology.enterResults(showResultsForm.id, { description: resultsText });
            setShowResultsForm(null);
            setResultsText('');
            setSelectedOrder(null);
            fetchData();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed to submit report'); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Scan className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Radiology</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Manage imaging orders and reports</p>
                    </div>
                </div>
                <button onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                    <Plus size={16} /> New Imaging Order
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: 'Total Orders', value: stats.total_orders, icon: FileText, color: 'from-blue-500 to-indigo-500' },
                        { label: 'Pending', value: stats.pending_orders, icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
                        { label: 'Completed Today', value: stats.completed_today, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
                    ].map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="glass-card-solid rounded-xl p-3.5">
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{s.label}</p>
                                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${s.color} shadow-sm`}>
                                        <Icon size={12} className="text-white" />
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-[var(--text-primary)]">{s.value}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by imaging type or patient..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>

            {/* Orders List */}
            <div className="glass-card-solid rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center">
                        <Scan className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                        <p className="text-[var(--text-secondary)] font-medium">No radiology orders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                    <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Imaging</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Patient</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Doctor</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Date</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                    <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const hasResults = !!order.description;
                                    return (
                                        <tr key={order.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                            <td className="px-4 py-3.5 font-semibold text-[var(--text-primary)]">{order.report_title}</td>
                                            <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                                                {order.patient ? `${order.patient.first_name} ${order.patient.last_name}` : '—'}
                                            </td>
                                            <td className="px-4 py-3.5 text-[var(--text-secondary)]">{order.doctor?.name || '—'}</td>
                                            <td className="px-4 py-3.5 text-xs text-[var(--text-muted)]">{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td className="px-4 py-3.5">
                                                {hasResults ? (
                                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">Completed</span>
                                                ) : (
                                                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 dark:bg-amber-500/10">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => setSelectedOrder(order)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-[var(--bg-tertiary)] transition-colors">View</button>
                                                    {!hasResults && (
                                                        <button onClick={() => { setShowResultsForm(order); setResultsText(''); }}
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:shadow-md transition-all">Enter Results</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Order Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateForm(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">New Imaging Order</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Patient ID</label>
                                <input name="patient_id" required placeholder="Enter patient ID"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Imaging Type</label>
                                <input name="report_title" required placeholder="e.g. Chest X-Ray, CT Abdomen, MRI Brain"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Clinical Notes</label>
                                <textarea name="notes" rows={3} placeholder="Clinical history or specific instructions..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateForm(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">Cancel</button>
                                <button type="submit"
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm hover:shadow-lg transition-all">Create Order</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Enter Results Modal */}
            {showResultsForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowResultsForm(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Enter Radiology Results</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">{showResultsForm.report_title}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Findings / Report</label>
                                <textarea value={resultsText} onChange={(e) => setResultsText(e.target.value)}
                                    rows={8} required placeholder="Describe the imaging findings..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono text-sm" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowResultsForm(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">Cancel</button>
                                <button onClick={handleSubmitResults} disabled={submitting || !resultsText.trim()}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                                    Submit Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedOrder.report_title}</h2>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {selectedOrder.patient ? `${selectedOrder.patient.first_name} ${selectedOrder.patient.last_name}` : '—'}
                                    {' — '}{selectedOrder.doctor?.name || '—'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                                <XCircle size={18} className="text-[var(--text-muted)]" />
                            </button>
                        </div>

                        {selectedOrder.description ? (
                            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-2">Findings</p>
                                <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{selectedOrder.description}</p>
                            </div>
                        ) : (
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 text-center">
                                <p className="text-sm text-amber-600 dark:text-amber-400">Report pending — results not yet entered.</p>
                            </div>
                        )}

                        {selectedOrder.notes && (
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5 mt-3">
                                <p className="text-xs text-blue-500 mb-0.5">Clinical Notes</p>
                                <p className="text-sm text-blue-900 dark:text-blue-300">{selectedOrder.notes}</p>
                            </div>
                        )}

                        <p className="text-xs text-[var(--text-muted)] mt-3">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
