import { useState, useEffect } from 'react';
import phase7Api from '../../lib/phase7-api';
import {
    FlaskConical, Plus, Search, Loader2, CheckCircle2, XCircle,
    AlertTriangle, Beaker, Syringe, ClipboardList, Microscope,
    TrendingUp, Activity,
} from 'lucide-react';

interface TestCatalogItem {
    id: number; test_name: string; test_code: string; department: string | null;
    specimen_type: string | null; unit: string | null;
    reference_range_low: number | null; reference_range_high: number | null;
    reference_range_text: string | null; price: number; is_active: boolean;
}

interface LabOrder {
    id: number; order_number: string; priority: string; status: string;
    clinical_notes: string | null; created_at: string;
    patient: { id: number; first_name: string; last_name: string; patient_id: string } | null;
    doctor: { id: number; name: string } | null;
    lab_sample: { id: number; accession_number: string } | null;
    results: LabResult[];
}

interface LabResult {
    id: number; result_value: number | null; result_text: string | null;
    unit: string | null; flag: string | null; status: string;
    test_catalog: TestCatalogItem | null;
}

interface LabSample {
    id: number; accession_number: string; specimen_type: string;
    status: string; collected_at: string | null; rejection_reason: string | null;
    patient: { id: number; first_name: string; last_name: string; patient_id: string } | null;
}

const orderStatusConfig: Record<string, { label: string; bg: string; color: string }> = {
    ordered: { label: 'Ordered', bg: 'bg-blue-50 dark:bg-blue-500/10', color: 'text-blue-600' },
    collected: { label: 'Collected', bg: 'bg-amber-50 dark:bg-amber-500/10', color: 'text-amber-600' },
    in_progress: { label: 'In Progress', bg: 'bg-indigo-50 dark:bg-indigo-500/10', color: 'text-indigo-600' },
    completed: { label: 'Completed', bg: 'bg-emerald-50 dark:bg-emerald-500/10', color: 'text-emerald-600' },
    cancelled: { label: 'Cancelled', bg: 'bg-red-50 dark:bg-red-500/10', color: 'text-red-600' },
};

const sampleStatusConfig: Record<string, { label: string; bg: string; color: string }> = {
    ordered: { label: 'Ordered', bg: 'bg-gray-100 dark:bg-gray-500/10', color: 'text-gray-600' },
    collected: { label: 'Collected', bg: 'bg-amber-50 dark:bg-amber-500/10', color: 'text-amber-600' },
    accessioned: { label: 'Accessioned', bg: 'bg-indigo-50 dark:bg-indigo-500/10', color: 'text-indigo-600' },
    in_progress: { label: 'In Progress', bg: 'bg-blue-50 dark:bg-blue-500/10', color: 'text-blue-600' },
    validated: { label: 'Validated', bg: 'bg-emerald-50 dark:bg-emerald-500/10', color: 'text-emerald-600' },
    released: { label: 'Released', bg: 'bg-green-50 dark:bg-green-500/10', color: 'text-green-600' },
    rejected: { label: 'Rejected', bg: 'bg-red-50 dark:bg-red-500/10', color: 'text-red-600' },
};

const flagConfig: Record<string, { label: string; color: string; bg: string }> = {
    normal: { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    high: { label: 'High', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    low: { label: 'Low', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    critical_high: { label: 'Critical High', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
    critical_low: { label: 'Critical Low', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
};

export default function LisManager() {
    const [tab, setTab] = useState<'dashboard' | 'orders' | 'samples' | 'catalog'>('dashboard');
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Data
    const [orders, setOrders] = useState<LabOrder[]>([]);
    const [samples, setSamples] = useState<LabSample[]>([]);
    const [catalogItems, setCatalogItems] = useState<TestCatalogItem[]>([]);
    const [pendingResults, setPendingResults] = useState<LabResult[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
    const [showCreateOrder, setShowCreateOrder] = useState(false);
    const [showCollectForm, setShowCollectForm] = useState(false);
    const [enteringResult, setEnteringResult] = useState<LabResult | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};
            if (search) params.search = search;
            const [statsRes, ordersRes, samplesRes, catalogRes, pendingRes] = await Promise.all([
                phase7Api.stats(),
                tab === 'orders' ? phase7Api.orders.list(params) : Promise.resolve({ data: { data: [] } }),
                tab === 'samples' ? phase7Api.samples.list(params) : Promise.resolve({ data: { data: [] } }),
                tab === 'catalog' ? phase7Api.catalog.list(params) : Promise.resolve({ data: { data: [] } }),
                phase7Api.results.pending(),
            ]);
            setStats(statsRes.data);
            setOrders(ordersRes.data.data || []);
            setSamples(samplesRes.data.data || []);
            setCatalogItems(catalogRes.data.data || []);
            setPendingResults(pendingRes.data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tab, search]);

    const tabs = [
        { key: 'dashboard' as const, label: 'Dashboard', icon: Activity },
        { key: 'orders' as const, label: 'Orders', icon: ClipboardList },
        { key: 'samples' as const, label: 'Samples', icon: Syringe },
        { key: 'catalog' as const, label: 'Test Catalog', icon: Microscope },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <FlaskConical className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Laboratory Information System</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Full lab workflow — orders, samples, results, validation</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {(tab === 'orders' || tab === 'dashboard') && (
                        <button onClick={() => setShowCreateOrder(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                            <Plus size={16} /> New Order
                        </button>
                    )}
                    {(tab === 'samples' || tab === 'dashboard') && (
                        <button onClick={() => setShowCollectForm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">
                            <Syringe size={16} /> Collect Sample
                        </button>
                    )}
                    {tab === 'catalog' && (
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                            <Plus size={16} /> Add Test
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-tertiary)] w-fit">
                {tabs.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                tab === t.key ? 'bg-white dark:bg-gray-800 shadow-sm text-cyan-600' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}>
                            <Icon size={15} /> {t.label}
                        </button>
                    );
                })}
            </div>

            {/* === DASHBOARD TAB === */}
            {tab === 'dashboard' && (
                <div className="space-y-4">
                    {stats && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {[
                                { label: 'Catalog Tests', value: stats.total_catalog_tests, icon: Microscope, color: 'from-blue-500 to-sky-500' },
                                { label: 'Pending Orders', value: stats.pending_orders, icon: ClipboardList, color: 'from-amber-500 to-orange-500' },
                                { label: 'Collected Samples', value: stats.collected_samples, icon: Syringe, color: 'from-indigo-500 to-violet-500' },
                                { label: 'Pending Results', value: stats.pending_results, icon: AlertTriangle, color: 'from-rose-500 to-pink-500' },
                                { label: 'Awaiting Validation', value: stats.awaiting_validation, icon: CheckCircle2, color: 'from-purple-500 to-fuchsia-500' },
                                { label: 'Completed Today', value: stats.completed_today, icon: TrendingUp, color: 'from-emerald-500 to-teal-500' },
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

                    {/* Pending results quick view */}
                    {pendingResults.length > 0 && (
                        <div className="glass-card-solid rounded-2xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-[var(--border)]">
                                <h2 className="font-semibold text-[var(--text-primary)]">
                                    Pending Results ({pendingResults.length})
                                </h2>
                            </div>
                            <div className="divide-y divide-[var(--border)]">
                                {pendingResults.slice(0, 10).map((r) => (
                                    <div key={r.id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                                        <span className="text-[var(--text-secondary)]">{r.test_catalog?.test_name || 'Test'}</span>
                                        <button onClick={() => setEnteringResult(r)}
                                            className="text-xs font-medium text-primary hover:underline">Enter Result</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick links */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'New Order', icon: Plus, onClick: () => setShowCreateOrder(true), color: 'from-cyan-500 to-blue-500' },
                            { label: 'Collect Sample', icon: Syringe, onClick: () => setShowCollectForm(true), color: 'from-indigo-500 to-violet-500' },
                            { label: 'Enter Results', icon: Beaker, onClick: () => setTab('orders'), color: 'from-amber-500 to-orange-500' },
                            { label: 'Validate Results', icon: CheckCircle2, onClick: () => setTab('orders'), color: 'from-emerald-500 to-teal-500' },
                        ].map((q) => {
                            const Icon = q.icon;
                            return (
                                <button key={q.label} onClick={q.onClick}
                                    className="glass-card-solid rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-all">
                                    <div className={`p-2 rounded-xl bg-gradient-to-br ${q.color} shadow-sm`}>
                                        <Icon size={18} className="text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-[var(--text-primary)]">{q.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* === ORDERS TAB === */}
            {tab === 'orders' && (
                <>
                    <div className="relative max-w-md">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by order number or patient..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>

                    <div className="glass-card-solid rounded-2xl overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                        ) : orders.length === 0 ? (
                            <div className="p-12 text-center">
                                <ClipboardList className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                                <p className="text-[var(--text-secondary)] font-medium">No lab orders found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Order #</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Patient</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Doctor</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Priority</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                            <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => {
                                            const s = orderStatusConfig[order.status] || orderStatusConfig.ordered;
                                            return (
                                                <tr key={order.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                                    <td className="px-4 py-3.5 font-mono font-semibold text-[var(--text-primary)]">{order.order_number}</td>
                                                    <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                                                        {order.patient ? `${order.patient.first_name} ${order.patient.last_name}` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-[var(--text-secondary)]">{order.doctor?.name || '—'}</td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                                                            order.priority === 'stat' ? 'bg-red-50 text-red-600' :
                                                            order.priority === 'urgent' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-gray-100 text-gray-600'
                                                        }`}>{order.priority}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>{s.label}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        <button onClick={() => setSelectedOrder(order)}
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-[var(--bg-tertiary)]">View</button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* === SAMPLES TAB === */}
            {tab === 'samples' && (
                <>
                    <div className="relative max-w-md">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by accession number or patient..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>

                    <div className="glass-card-solid rounded-2xl overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                        ) : samples.length === 0 ? (
                            <div className="p-12 text-center">
                                <Syringe className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                                <p className="text-[var(--text-secondary)] font-medium">No samples collected yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Accession #</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Patient</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Specimen</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Collected</th>
                                            <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {samples.map((sample) => {
                                            const s = sampleStatusConfig[sample.status] || sampleStatusConfig.ordered;
                                            return (
                                                <tr key={sample.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                                    <td className="px-4 py-3.5 font-mono font-semibold text-[var(--text-primary)]">{sample.accession_number}</td>
                                                    <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                                                        {sample.patient ? `${sample.patient.first_name} ${sample.patient.last_name}` : '—'}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-[var(--text-secondary)] capitalize">{sample.specimen_type}</td>
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>{s.label}</span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-xs text-[var(--text-muted)]">
                                                        {sample.collected_at ? new Date(sample.collected_at).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="px-4 py-3.5 text-right">
                                                        {sample.status === 'collected' && (
                                                            <span className="text-xs text-[var(--text-muted)]">Awaiting accession</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* === CATALOG TAB === */}
            {tab === 'catalog' && (
                <>
                    <div className="relative max-w-md">
                        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search test catalog..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {loading ? (
                            <div className="col-span-full p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                        ) : catalogItems.length === 0 ? (
                            <div className="col-span-full p-12 text-center">
                                <Microscope className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                                <p className="text-[var(--text-secondary)] font-medium">No tests in catalog</p>
                            </div>
                        ) : catalogItems.map((test) => (
                            <div key={test.id} className="glass-card-solid rounded-xl p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">{test.test_name}</p>
                                        <p className="text-xs font-mono text-[var(--text-muted)]">{test.test_code}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                        test.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                    }`}>{test.is_active ? 'Active' : 'Inactive'}</span>
                                </div>
                                <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                                    {test.department && <div className="flex justify-between"><span>Department</span><span className="font-medium capitalize">{test.department}</span></div>}
                                    {test.specimen_type && <div className="flex justify-between"><span>Specimen</span><span className="font-medium capitalize">{test.specimen_type}</span></div>}
                                    <div className="flex justify-between">
                                        <span>Reference Range</span>
                                        <span className="font-medium">
                                            {test.reference_range_text || (test.reference_range_low !== null && test.reference_range_high !== null
                                                ? `${test.reference_range_low} - ${test.reference_range_high} ${test.unit || ''}`
                                                : '—')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between"><span>Price</span><span className="font-medium">Rs. {test.price.toLocaleString()}</span></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Create Order Modal */}
            {showCreateOrder && (
                <CreateOrderModal onClose={() => setShowCreateOrder(false)} onCreated={() => { setShowCreateOrder(false); fetchData(); }} />
            )}

            {/* Collect Sample Modal */}
            {showCollectForm && (
                <CollectSampleModal onClose={() => setShowCollectForm(false)} onCreated={() => { setShowCollectForm(false); fetchData(); }} />
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)] font-mono">{selectedOrder.order_number}</h2>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Patient: {selectedOrder.patient ? `${selectedOrder.patient.first_name} ${selectedOrder.patient.last_name}` : '—'}
                                    {' — '}Dr. {selectedOrder.doctor?.name || '—'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                                <XCircle size={18} className="text-[var(--text-muted)]" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Results table */}
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)] mb-2">Tests & Results</h3>
                                <div className="space-y-2">
                                    {selectedOrder.results.map((r) => {
                                        const flag = r.flag ? (flagConfig[r.flag] || null) : null;
                                        return (
                                            <div key={r.id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)]">
                                                <div>
                                                    <p className="text-sm font-medium text-[var(--text-primary)]">{r.test_catalog?.test_name || 'Test'}</p>
                                                    {r.result_value !== null && (
                                                        <p className="text-sm text-[var(--text-secondary)]">
                                                            {r.result_value} {r.unit || ''}
                                                            {flag && <span className={`ml-2 inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${flag.bg} ${flag.color}`}>{flag.label}</span>}
                                                        </p>
                                                    )}
                                                    {r.result_text && <p className="text-xs text-[var(--text-muted)]">{r.result_text}</p>}
                                                </div>
                                                <div className="text-right">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                        r.status === 'validated' ? 'bg-emerald-50 text-emerald-600' :
                                                        r.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                                                        'bg-gray-100 text-gray-500'
                                                    }`}>{r.status}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {selectedOrder.clinical_notes && (
                                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5">
                                    <p className="text-xs text-blue-500 mb-0.5">Clinical Notes</p>
                                    <p className="text-sm text-blue-900 dark:text-blue-300">{selectedOrder.clinical_notes}</p>
                                </div>
                            )}

                            {selectedOrder.lab_sample && (
                                <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                    <p className="text-xs text-[var(--text-muted)]">Sample: <span className="font-mono font-medium text-[var(--text-primary)]">{selectedOrder.lab_sample.accession_number}</span></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Enter Result Modal */}
            {enteringResult && (
                <EnterResultModal result={enteringResult} onClose={() => setEnteringResult(null)} onSubmitted={() => { setEnteringResult(null); fetchData(); }} />
            )}
        </div>
    );
}

function CreateOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [patientId, setPatientId] = useState('');
    const [priority, setPriority] = useState('routine');
    const [clinicalNotes, setClinicalNotes] = useState('');
    const [selectedTests, setSelectedTests] = useState<number[]>([]);
    const [catalog, setCatalog] = useState<TestCatalogItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        phase7Api.catalog.list({ per_page: 200 })
            .then(res => setCatalog(res.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const toggleTest = (id: number) => {
        setSelectedTests(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const handleSubmit = async () => {
        if (!patientId || selectedTests.length === 0) return;
        setSubmitting(true);
        try {
            await phase7Api.orders.create({
                patient_id: parseInt(patientId),
                priority,
                clinical_notes: clinicalNotes || undefined,
                tests: selectedTests.map(id => ({ catalog_id: id })),
            });
            onCreated();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    const departments = [...new Set(catalog.filter(c => c.is_active).map(c => c.department).filter(Boolean))];

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">New Lab Order</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Patient ID</label>
                            <input value={patientId} onChange={(e) => setPatientId(e.target.value)} required
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Priority</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                                <option value="routine">Routine</option>
                                <option value="urgent">Urgent</option>
                                <option value="stat">STAT</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Clinical Notes</label>
                        <textarea value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} rows={2}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Select Tests</label>
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : catalog.length === 0 ? (
                            <p className="text-sm text-[var(--text-muted)]">No tests in catalog. Add tests first.</p>
                        ) : (
                            <div className="space-y-1 max-h-60 overflow-y-auto">
                                {departments.map(dept => (
                                    <div key={dept}>
                                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider px-1 py-1">{dept}</p>
                                        {catalog.filter(c => c.is_active && c.department === dept).map(test => (
                                            <label key={test.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] cursor-pointer">
                                                <input type="checkbox" checked={selectedTests.includes(test.id)}
                                                    onChange={() => toggleTest(test.id)}
                                                    className="w-4 h-4 rounded border-[var(--border)] accent-cyan-500" />
                                                <span className="text-sm text-[var(--text-primary)]">{test.test_name}</span>
                                                <span className="text-xs text-[var(--text-muted)] font-mono ml-auto">{test.test_code}</span>
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)]">Cancel</button>
                        <button onClick={handleSubmit} disabled={submitting || !patientId || selectedTests.length === 0}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                            Create Order ({selectedTests.length} tests)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CollectSampleModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
    const [patientId, setPatientId] = useState('');
    const [specimenType, setSpecimenType] = useState('blood');
    const [orderIds, setOrderIds] = useState<number[]>([]);
    const [orders, setOrders] = useState<LabOrder[]>([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        phase7Api.orders.list({ status: 'ordered', per_page: 50 })
            .then(res => setOrders(res.data.data || []))
            .catch(() => {});
    }, []);

    const toggleOrder = (id: number) => {
        setOrderIds(prev => prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]);
    };

    const handleSubmit = async () => {
        if (!patientId || orderIds.length === 0) return;
        setSubmitting(true);
        try {
            await phase7Api.samples.collect({ patient_id: parseInt(patientId), specimen_type: specimenType, order_ids: orderIds });
            onCreated();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Collect Sample</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Patient ID</label>
                        <input value={patientId} onChange={(e) => setPatientId(e.target.value)} required
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Specimen Type</label>
                        <select value={specimenType} onChange={(e) => setSpecimenType(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                            {['blood', 'urine', 'stool', 'sputum', 'swab', 'csf', 'tissue', 'other'].map(t => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Select Orders</label>
                        {orders.length === 0 ? (
                            <p className="text-sm text-[var(--text-muted)]">No pending orders.</p>
                        ) : (
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                                {orders.map(order => (
                                    <label key={order.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] cursor-pointer">
                                        <input type="checkbox" checked={orderIds.includes(order.id)}
                                            onChange={() => toggleOrder(order.id)}
                                            className="w-4 h-4 rounded border-[var(--border)] accent-cyan-500" />
                                        <span className="text-sm text-[var(--text-primary)] font-mono">{order.order_number}</span>
                                        <span className="text-xs text-[var(--text-secondary)]">
                                            {order.patient ? `${order.patient.first_name} ${order.patient.last_name}` : ''}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)]">Cancel</button>
                        <button onClick={handleSubmit} disabled={submitting || !patientId || orderIds.length === 0}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Syringe size={16} />}
                            Collect Sample
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EnterResultModal({ result, onClose, onSubmitted }: { result: LabResult; onClose: () => void; onSubmitted: () => void }) {
    const [value, setValue] = useState(result.result_value?.toString() || '');
    const [textValue, setTextValue] = useState(result.result_text || '');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await phase7Api.results.enter(result.id, {
                result_value: value ? parseFloat(value) : null,
                result_text: textValue || undefined,
                notes: notes || undefined,
            });
            onSubmitted();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); }
        finally { setSubmitting(false); }
    };

    const isNumeric = result.test_catalog?.unit || result.test_catalog?.reference_range_low !== null || result.test_catalog?.reference_range_high !== null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Enter Result</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">{result.test_catalog?.test_name || 'Test'}</p>

                <div className="space-y-4">
                    {result.test_catalog?.reference_range_low !== null && (
                        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-xs text-[var(--text-secondary)]">
                            Reference Range: {result.test_catalog.reference_range_low} - {result.test_catalog.reference_range_high} {result.test_catalog.unit || ''}
                        </div>
                    )}

                    {isNumeric ? (
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Value ({result.test_catalog?.unit || ''})</label>
                            <input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Result (Text)</label>
                            <textarea value={textValue} onChange={(e) => setTextValue(e.target.value)} rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Notes</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)]">Cancel</button>
                        <button onClick={handleSubmit} disabled={submitting || (!value && !textValue)}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                            Submit Result
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
