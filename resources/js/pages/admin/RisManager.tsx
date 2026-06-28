import { useState, useEffect, useCallback } from 'react';
import risApi from '../../lib/phase8-api';
import type { ImagingOrderData, ModalityScheduleData, StructuredReportData, RisStats } from '../../lib/phase8-api';
import {
    Scan, Plus, Search, Loader2, CheckCircle2, XCircle,
    AlertTriangle, Calendar, Clock, BookOpen, Edit3,
    Activity, Radio, TrendingUp, ArrowRight,
} from 'lucide-react';

const MODALITIES = ['X-Ray', 'CT', 'MRI', 'USG', 'Mammography', 'Fluoroscopy', 'DEXA'];
const PRIORITIES = ['routine', 'urgent', 'stat'] as const;

type Tab = 'dashboard' | 'orders' | 'schedule' | 'reporting' | 'signed';

export default function RisManager() {
    const [tab, setTab] = useState<Tab>('dashboard');
    const [stats, setStats] = useState<RisStats | null>(null);
    const [orders, setOrders] = useState<ImagingOrderData[]>([]);
    const [schedule, setSchedule] = useState<ModalityScheduleData[]>([]);
    const [reports, setReports] = useState<StructuredReportData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [modalityFilter, setModalityFilter] = useState('');
    const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);

    // Modal state
    const [showCreateOrder, setShowCreateOrder] = useState(false);
    const [showScheduleSlot, setShowScheduleSlot] = useState<ImagingOrderData | null>(null);
    const [showAcquireStudy, setShowAcquireStudy] = useState<ImagingOrderData | null>(null);
    const [showStartReport, setShowStartReport] = useState<ImagingOrderData | null>(null);
    const [showReportEditor, setShowReportEditor] = useState<StructuredReportData | null>(null);
    const [showSignReport, setShowSignReport] = useState<StructuredReportData | null>(null);
    const [showAmendReport, setShowAmendReport] = useState<StructuredReportData | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<ImagingOrderData | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 3000); };

    const fetchStats = useCallback(async () => {
        try {
            const res = await risApi.stats();
            setStats(res.data);
        } catch { /* ignore */ }
    }, []);

    const fetchOrders = useCallback(async () => {
        try {
            const params: Record<string, any> = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            if (modalityFilter) params.modality = modalityFilter;
            const res = await risApi.orders(params);
            setOrders(res.data?.data || []);
        } catch { /* ignore */ }
    }, [search, statusFilter, modalityFilter]);

    const fetchSchedule = useCallback(async () => {
        try {
            const params: Record<string, any> = { date: scheduleDate };
            if (modalityFilter) params.modality = modalityFilter;
            const res = await risApi.schedule(params);
            setSchedule(res.data?.data || []);
        } catch { /* ignore */ }
    }, [scheduleDate, modalityFilter]);

    const fetchReports = useCallback(async () => {
        try {
            const params: Record<string, any> = {};
            if (tab === 'signed') params.status = 'signed';
            if (tab === 'reporting') params.status = 'draft';
            const res = await risApi.reports(params);
            setReports(res.data?.data || []);
        } catch { /* ignore */ }
    }, [tab]);

    useEffect(() => {
        if (tab === 'dashboard') { setLoading(true); Promise.all([fetchStats()]).finally(() => setLoading(false)); }
    }, [tab, fetchStats]);

    useEffect(() => {
        if (tab === 'orders') { setLoading(true); fetchOrders().finally(() => setLoading(false)); }
    }, [tab, fetchOrders]);

    useEffect(() => {
        if (tab === 'schedule') { setLoading(true); fetchSchedule().finally(() => setLoading(false)); }
    }, [tab, fetchSchedule]);

    useEffect(() => {
        if (tab === 'reporting' || tab === 'signed') { setLoading(true); fetchReports().finally(() => setLoading(false)); }
    }, [tab, fetchReports]);

    // ── Handlers ──

    const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget));
        setSubmitting(true);
        try {
            await risApi.storeOrder(data);
            setShowCreateOrder(false);
            showSuccess('Imaging order created.');
            if (tab === 'orders') fetchOrders();
            if (tab === 'dashboard') fetchStats();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed to create order'); }
        finally { setSubmitting(false); }
    };

    const handleScheduleSlot = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!showScheduleSlot) return;
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        setSubmitting(true);
        try {
            await risApi.scheduleSlot({
                imaging_order_id: showScheduleSlot.id,
                modality: data.modality,
                scheduled_at: data.scheduled_at,
                duration_minutes: parseInt(data.duration_minutes as string),
                room: data.room || undefined,
                preparation_notes: data.preparation_notes || undefined,
            });
            setShowScheduleSlot(null);
            showSuccess('Slot scheduled.');
            fetchOrders();
            fetchSchedule();
            fetchStats();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed to schedule'); }
        finally { setSubmitting(false); }
    };

    const handleAcquireStudy = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!showAcquireStudy) return;
        const form = e.currentTarget;
        const data = Object.fromEntries(new FormData(form));
        setSubmitting(true);
        try {
            await risApi.acquireStudy({
                imaging_order_id: showAcquireStudy.id,
                modality: data.modality,
                study_uid: data.study_uid || undefined,
                series_count: parseInt(data.series_count as string) || 0,
                instance_count: parseInt(data.instance_count as string) || 0,
                acquisition_notes: data.acquisition_notes || undefined,
                quality: data.quality || undefined,
            });
            setShowAcquireStudy(null);
            showSuccess('Study acquired.');
            fetchOrders();
            fetchStats();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed to record study'); }
        finally { setSubmitting(false); }
    };

    const handleStartReport = async (order: ImagingOrderData) => {
        if (!order) return;
        setSubmitting(true);
        try {
            await risApi.startReport({
                imaging_order_id: order.id,
                report_title: `${order.study_type} — ${order.body_part || order.study_type}`,
            });
            setShowStartReport(null);
            showSuccess('Report started. Enter findings to continue.');
            fetchOrders();
            fetchReports();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed to start report'); }
        finally { setSubmitting(false); }
    };

    const handleUpdateReport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!showReportEditor) return;
        const data = Object.fromEntries(new FormData(e.currentTarget));
        setSubmitting(true);
        try {
            await risApi.updateReport(showReportEditor.id, data);
            showSuccess('Report updated.');
            fetchReports();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed to update report'); }
        finally { setSubmitting(false); }
    };

    const handleSignReport = async () => {
        if (!showSignReport) return;
        setSubmitting(true);
        try {
            await risApi.signReport(showSignReport.id, {
                is_double_read: false,
            });
            setShowSignReport(null);
            showSuccess('Report signed and released.');
            fetchReports();
            fetchOrders();
            fetchStats();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed to sign report'); }
        finally { setSubmitting(false); }
    };

    const handleAmendReport = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!showAmendReport) return;
        const data = Object.fromEntries(new FormData(e.currentTarget));
        setSubmitting(true);
        try {
            await risApi.amendReport(showAmendReport.id, data);
            setShowAmendReport(null);
            showSuccess('Report amended.');
            fetchReports();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed to amend report'); }
        finally { setSubmitting(false); }
    };

    // ── UI ──

    const tabs = [
        { id: 'dashboard' as Tab, label: 'Dashboard', icon: TrendingUp },
        { id: 'orders' as Tab, label: 'Orders', icon: Scan },
        { id: 'schedule' as Tab, label: 'Schedule', icon: Calendar },
        { id: 'reporting' as Tab, label: 'Reporting', icon: Edit3 },
        { id: 'signed' as Tab, label: 'Signed Reports', icon: BookOpen },
    ];

    const statusBadge = (status: string) => {
        const colors: Record<string, string> = {
            ordered: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
            scheduled: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10',
            acquired: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10',
            reporting: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
            signed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
            delivered: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10',
        };
        return (
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-50 text-gray-600'}`}>
                {status}
            </span>
        );
    };

    const priorityBadge = (priority: string) => {
        const colors: Record<string, string> = {
            routine: 'bg-gray-50 text-gray-600 dark:bg-gray-500/10',
            urgent: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10',
            stat: 'bg-red-50 text-red-600 dark:bg-red-500/10',
        };
        return (
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colors[priority] || ''}`}>
                {priority}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Success Toast */}
            {successMsg && (
                <div className="fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 shadow-lg border border-emerald-200 dark:border-emerald-500/20 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-right">
                    <CheckCircle2 size={16} /> {successMsg}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Scan className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">RIS / PACS</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Radiology Information System</p>
                    </div>
                </div>
                <button onClick={() => setShowCreateOrder(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                    <Plus size={16} /> New Imaging Order
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-tertiary)] w-fit">
                {tabs.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white dark:bg-gray-800 shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}>
                            <Icon size={15} />
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {/* ── DASHBOARD TAB ── */}
            {tab === 'dashboard' && (
                <>
                    {loading ? (
                        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                    ) : stats && (
                        <div className="space-y-6">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {[
                                    { label: 'Total Orders', value: stats.total_orders, icon: Scan, color: 'from-blue-500 to-indigo-500' },
                                    { label: 'Pending', value: stats.pending_orders, icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
                                    { label: 'Unreported', value: stats.unreported_studies, icon: Edit3, color: 'from-rose-500 to-pink-500' },
                                    { label: 'Signed Today', value: stats.signed_today, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
                                    { label: 'Scheduled Today', value: stats.scheduled_today, icon: Calendar, color: 'from-purple-500 to-violet-500' },
                                    { label: 'In Progress', value: stats.in_progress, icon: Activity, color: 'from-cyan-500 to-sky-500' },
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

                            {/* Modality Breakdown */}
                            <div className="glass-card-solid rounded-2xl p-5">
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Orders by Modality</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {stats.orders_by_modality.map((m) => (
                                        <div key={m.study_type} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
                                                <Radio size={14} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-[var(--text-muted)]">{m.study_type}</p>
                                                <p className="text-lg font-bold text-[var(--text-primary)]">{m.total}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {stats.avg_turnaround_hours !== null && (
                                    <p className="text-xs text-[var(--text-muted)] mt-3">
                                        Avg. turnaround: <strong className="text-[var(--text-primary)]">{stats.avg_turnaround_hours.toFixed(1)} hours</strong>
                                    </p>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="glass-card-solid rounded-2xl p-5">
                                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Quick Actions</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: 'New Order', icon: Plus, action: () => setShowCreateOrder(true), color: 'from-indigo-500 to-violet-500' },
                                        { label: 'View Schedule', icon: Calendar, action: () => setTab('schedule'), color: 'from-purple-500 to-pink-500' },
                                        { label: 'Pending Reports', icon: Edit3, action: () => setTab('reporting'), color: 'from-amber-500 to-orange-500' },
                                        { label: 'Signed Reports', icon: BookOpen, action: () => setTab('signed'), color: 'from-emerald-500 to-teal-500' },
                                    ].map((btn) => {
                                        const Icon = btn.icon;
                                        return (
                                            <button key={btn.label} onClick={btn.action}
                                                className={`flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r ${btn.color} text-white text-sm font-medium hover:shadow-lg transition-all`}>
                                                <Icon size={16} />
                                                {btn.label}
                                                <ArrowRight size={14} className="ml-auto opacity-60" />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── ORDERS TAB ── */}
            {tab === 'orders' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="relative flex-1 max-w-sm">
                            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by order #, patient, or study..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">All Statuses</option>
                            <option value="ordered">Ordered</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="acquired">Acquired</option>
                            <option value="reporting">Reporting</option>
                            <option value="signed">Signed</option>
                        </select>
                        <select value={modalityFilter} onChange={(e) => setModalityFilter(e.target.value)}
                            className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">All Modalities</option>
                            {MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    {/* Orders Table */}
                    <div className="glass-card-solid rounded-2xl overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                        ) : orders.length === 0 ? (
                            <div className="p-12 text-center">
                                <Scan className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                                <p className="text-[var(--text-secondary)] font-medium">No imaging orders found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Order #</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Patient</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Study</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Priority</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Date</th>
                                            <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                                <td className="px-4 py-3.5 font-mono text-xs font-semibold text-[var(--text-primary)]">{order.order_number}</td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                                                    {order.patient ? `${order.patient.first_name} ${order.patient.last_name}` : '—'}
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="font-medium text-[var(--text-primary)]">{order.study_type}</span>
                                                    {order.body_part && <span className="text-[var(--text-muted)] ml-1">({order.body_part})</span>}
                                                </td>
                                                <td className="px-4 py-3.5">{priorityBadge(order.priority)}</td>
                                                <td className="px-4 py-3.5">{statusBadge(order.status)}</td>
                                                <td className="px-4 py-3.5 text-xs text-[var(--text-muted)]">{new Date(order.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button onClick={() => setSelectedOrder(order)}
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-[var(--bg-tertiary)] transition-colors">View</button>
                                                        {order.status === 'ordered' && (
                                                            <button onClick={() => setShowScheduleSlot(order)}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-500 to-violet-500 text-white hover:shadow-md transition-all">Schedule</button>
                                                        )}
                                                        {order.status === 'acquired' && (
                                                            <button onClick={() => { setShowStartReport(order); handleStartReport(order); }}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-md transition-all">Report</button>
                                                        )}
                                                        {(order.status === 'ordered' || order.status === 'scheduled') && (
                                                            <button onClick={() => setShowAcquireStudy(order)}
                                                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-500 to-sky-500 text-white hover:shadow-md transition-all">Acquire</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── SCHEDULE TAB ── */}
            {tab === 'schedule' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)}
                                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <select value={modalityFilter} onChange={(e) => setModalityFilter(e.target.value)}
                            className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="">All Modalities</option>
                            {MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>

                    <div className="glass-card-solid rounded-2xl overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                        ) : schedule.length === 0 ? (
                            <div className="p-12 text-center">
                                <Calendar className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                                <p className="text-[var(--text-secondary)] font-medium">No scheduled slots for this date</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Time</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Modality</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Patient</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Room</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Duration</th>
                                            <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schedule.map((slot) => (
                                            <tr key={slot.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                                <td className="px-4 py-3.5">
                                                    <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                                                        <Clock size={13} className="text-[var(--text-muted)]" />
                                                        {new Date(slot.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10">
                                                        <Radio size={12} /> {slot.modality}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)]">{(slot as any).imaging_order?.patient ? `${(slot as any).imaging_order.patient.first_name} ${(slot as any).imaging_order.patient.last_name}` : '—'}</td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)]">{slot.room || '—'}</td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)]">{slot.duration_minutes} min</td>
                                                <td className="px-4 py-3.5">{statusBadge(slot.status)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── REPORTING TAB ── */}
            {tab === 'reporting' && (
                <div className="glass-card-solid rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                    ) : reports.length === 0 ? (
                        <div className="p-12 text-center">
                            <Edit3 className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                            <p className="text-[var(--text-secondary)] font-medium">No pending reports</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Report</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Patient</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Radiologist</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                        <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                            <td className="px-4 py-3.5 font-semibold text-[var(--text-primary)]">{report.report_title}</td>
                                            <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                                                {(report as any).imaging_order?.patient ? `${(report as any).imaging_order.patient.first_name} ${(report as any).imaging_order.patient.last_name}` : '—'}
                                            </td>
                                            <td className="px-4 py-3.5 text-[var(--text-secondary)]">{report.primary_reader?.name || '—'}</td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${report.status === 'draft' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => setShowReportEditor(report)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-[var(--bg-tertiary)] transition-colors">
                                                        {report.findings ? 'Edit' : 'Enter Findings'}
                                                    </button>
                                                    {report.findings && report.impression && (
                                                        <button onClick={() => setShowSignReport(report)}
                                                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-md transition-all">
                                                            Sign & Release
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── SIGNED REPORTS TAB ── */}
            {tab === 'signed' && (
                <div className="glass-card-solid rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                    ) : reports.length === 0 ? (
                        <div className="p-12 text-center">
                            <BookOpen className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                            <p className="text-[var(--text-secondary)] font-medium">No signed reports yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Report</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Patient</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Radiologist</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Signed</th>
                                        <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((report) => (
                                        <tr key={report.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                            <td className="px-4 py-3.5 font-semibold text-[var(--text-primary)]">{report.report_title}</td>
                                            <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                                                {(report as any).imaging_order?.patient ? `${(report as any).imaging_order.patient.first_name} ${(report as any).imaging_order.patient.last_name}` : '—'}
                                            </td>
                                            <td className="px-4 py-3.5 text-[var(--text-secondary)]">{report.primary_reader?.name || '—'}</td>
                                            <td className="px-4 py-3.5 text-xs text-[var(--text-muted)]">
                                                {report.signed_at ? new Date(report.signed_at).toLocaleString() : '—'}
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => { setShowReportEditor(report); }}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-primary hover:bg-[var(--bg-tertiary)] transition-colors">View</button>
                                                    <button onClick={() => setShowAmendReport(report)}
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-md transition-all">Amend</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── MODALS ── */}

            {/* Create Order Modal */}
            {showCreateOrder && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateOrder(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">New Imaging Order</h2>
                        <form onSubmit={handleCreateOrder} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Patient ID</label>
                                <input name="patient_id" required placeholder="Enter patient ID"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Modality / Study Type</label>
                                    <select name="study_type" required
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        <option value="">Select...</option>
                                        {MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Body Part</label>
                                    <input name="body_part" placeholder="e.g. Chest, Abdomen, Brain"
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Priority</label>
                                <select name="priority" required
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                                    {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Clinical History</label>
                                <textarea name="clinical_history" rows={2} placeholder="Relevant clinical history..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowCreateOrder(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">Cancel</button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Create Order
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Schedule Slot Modal */}
            {showScheduleSlot && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowScheduleSlot(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Schedule Modality Slot</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            {showScheduleSlot.study_type} — {showScheduleSlot.patient?.first_name} {showScheduleSlot.patient?.last_name}
                        </p>
                        <form onSubmit={handleScheduleSlot} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Modality</label>
                                    <select name="modality" required defaultValue={showScheduleSlot.study_type}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                                        {MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Duration (min)</label>
                                    <input name="duration_minutes" type="number" defaultValue={30} min={5} max={480} required
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Date & Time</label>
                                <input name="scheduled_at" type="datetime-local" required
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Room</label>
                                <input name="room" placeholder="e.g. Room 101, CT Suite"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Preparation Notes</label>
                                <textarea name="preparation_notes" rows={2} placeholder="Patient preparation instructions..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowScheduleSlot(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">Cancel</button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Schedule
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Acquire Study Modal */}
            {showAcquireStudy && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAcquireStudy(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Record Study Acquisition</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">
                            {showAcquireStudy.study_type} — {showAcquireStudy.patient?.first_name} {showAcquireStudy.patient?.last_name}
                        </p>
                        <form onSubmit={handleAcquireStudy} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Modality</label>
                                <select name="modality" required defaultValue={showAcquireStudy.study_type}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                                    {MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">DICOM Study UID</label>
                                <input name="study_uid" placeholder="1.2.840.10008.5.1.4.1.1.2..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Series Count</label>
                                    <input name="series_count" type="number" defaultValue={0} min={0}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Instance Count</label>
                                    <input name="instance_count" type="number" defaultValue={0} min={0}
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Image Quality</label>
                                <select name="quality"
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                                    <option value="">Not specified</option>
                                    <option value="acceptable">Acceptable</option>
                                    <option value="suboptimal">Suboptimal</option>
                                    <option value="repeat">Repeat Required</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Acquisition Notes</label>
                                <textarea name="acquisition_notes" rows={2} placeholder="Any notes about the acquisition..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAcquireStudy(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">Cancel</button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Record Study
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Report Editor Modal (structured findings/impression/recommendation) */}
            {showReportEditor && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowReportEditor(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">{showReportEditor.report_title}</h2>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {(showReportEditor as any).imaging_order?.patient?.first_name} {(showReportEditor as any).imaging_order?.patient?.last_name}
                                    {' — '}Status: {showReportEditor.status}
                                </p>
                            </div>
                            <button onClick={() => setShowReportEditor(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                                <XCircle size={18} className="text-[var(--text-muted)]" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateReport} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Technique</label>
                                <textarea name="technique" rows={2} defaultValue={showReportEditor.technique || ''} placeholder="e.g. Non-contrast axial and coronal images..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Findings *</label>
                                <textarea name="findings" rows={5} defaultValue={showReportEditor.findings || ''} placeholder="Describe the imaging findings..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-mono" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Impression *</label>
                                    <textarea name="impression" rows={3} defaultValue={showReportEditor.impression || ''} placeholder="Diagnostic impression..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Recommendation</label>
                                    <textarea name="recommendation" rows={3} defaultValue={showReportEditor.recommendation || ''} placeholder="Follow-up recommendations..."
                                        className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Comparison with Prior</label>
                                <textarea name="comparison" rows={2} defaultValue={showReportEditor.comparison || ''} placeholder="Comparison with prior studies..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowReportEditor(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">
                                    {showReportEditor.status === 'signed' ? 'Close' : 'Cancel'}
                                </button>
                                {showReportEditor.status !== 'signed' && (
                                    <button type="submit" disabled={submitting}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                        Save Report
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sign Report Modal */}
            {showSignReport && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowSignReport(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Sign & Release Report</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">{showSignReport.report_title}</p>
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 mb-4">
                            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">By signing, you confirm that this report is accurate and complete.</p>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
                                <p className="text-xs text-[var(--text-muted)] mb-1">Findings</p>
                                <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap line-clamp-3">{showSignReport.findings}</p>
                            </div>
                            {showSignReport.impression && (
                                <div className="p-3 rounded-lg bg-[var(--bg-tertiary)]">
                                    <p className="text-xs text-[var(--text-muted)] mb-1">Impression</p>
                                    <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap line-clamp-2">{showSignReport.impression}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setShowSignReport(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">Cancel</button>
                            <button onClick={handleSignReport} disabled={submitting}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                                Sign & Release
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Amend Report Modal */}
            {showAmendReport && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowAmendReport(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Amend Report</h2>
                        <p className="text-sm text-[var(--text-secondary)] mb-4">{showAmendReport.report_title}</p>
                        <form onSubmit={handleAmendReport} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Amended Findings</label>
                                <textarea name="findings" rows={4} defaultValue={showAmendReport.findings || ''} required
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Amended Impression</label>
                                <textarea name="impression" rows={2} defaultValue={showAmendReport.impression || ''}
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Reason for Amendment *</label>
                                <textarea name="amendment_reason" rows={2} required minLength={10} placeholder="Explain why this report is being amended (min 10 characters)..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowAmendReport(null)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">Cancel</button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                    Submit Amendment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedOrder.order_number}</h2>
                                    {priorityBadge(selectedOrder.priority)}
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {selectedOrder.study_type}{selectedOrder.body_part ? ` (${selectedOrder.body_part})` : ''}
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                                <XCircle size={18} className="text-[var(--text-muted)]" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                <p className="text-xs text-[var(--text-muted)]">Patient</p>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                    {selectedOrder.patient ? `${selectedOrder.patient.first_name} ${selectedOrder.patient.last_name}` : '—'}
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                <p className="text-xs text-[var(--text-muted)]">Status</p>
                                <p className="mt-1">{statusBadge(selectedOrder.status)}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                <p className="text-xs text-[var(--text-muted)]">Referring Doctor</p>
                                <p className="text-sm font-medium text-[var(--text-primary)]">{selectedOrder.referring_doctor?.name || '—'}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                <p className="text-xs text-[var(--text-muted)]">Created</p>
                                <p className="text-sm font-medium text-[var(--text-primary)]">{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {selectedOrder.clinical_history && (
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5 mb-4">
                                <p className="text-xs text-blue-500 mb-0.5">Clinical History</p>
                                <p className="text-sm text-blue-900 dark:text-blue-300">{selectedOrder.clinical_history}</p>
                            </div>
                        )}

                        {selectedOrder.report && selectedOrder.report.findings && (
                            <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-2">
                                    Report {selectedOrder.report.status === 'signed' ? '(Signed)' : '(Draft)'}
                                </p>
                                <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed line-clamp-6">{selectedOrder.report.findings}</p>
                                {selectedOrder.report.impression && (
                                    <>
                                        <p className="text-xs text-[var(--text-muted)] font-medium mt-3 mb-1">Impression</p>
                                        <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">{selectedOrder.report.impression}</p>
                                    </>
                                )}
                            </div>
                        )}

                        {!selectedOrder.report && (
                            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 text-center">
                                <p className="text-sm text-amber-600 dark:text-amber-400">Report not yet started.</p>
                            </div>
                        )}

                        <div className="flex gap-2 mt-4">
                            {selectedOrder.status === 'ordered' && (
                                <button onClick={() => { setSelectedOrder(null); setShowScheduleSlot(selectedOrder); }}
                                    className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-medium hover:shadow-md transition-all">Schedule</button>
                            )}
                            {selectedOrder.status === 'acquired' && !selectedOrder.report && (
                                <button onClick={() => { setSelectedOrder(null); setShowStartReport(selectedOrder); handleStartReport(selectedOrder); }}
                                    className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium hover:shadow-md transition-all">Start Report</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
