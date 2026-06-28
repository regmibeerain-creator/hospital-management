import { useState, useEffect } from 'react';
import phase6Api from '../../lib/phase6-api';
import phase9Api from '../../lib/phase9-api';
import {
    BarChart3, TrendingUp, Users, Calendar, DollarSign, Receipt,
    Pill, AlertTriangle, ShieldCheck, Loader2, Activity,
    Download, FileSpreadsheet,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

type ReportType = 'overview' | 'revenue' | 'appointments' | 'patients' | 'billing';

const reportTypes: { key: ReportType; label: string; icon: any; description: string }[] = [
    { key: 'overview', label: 'KPIs Overview', icon: BarChart3, description: 'Hospital-wide key performance indicators' },
    { key: 'revenue', label: 'Revenue Analysis', icon: TrendingUp, description: 'Revenue trends, payment methods, and billing summary' },
    { key: 'appointments', label: 'Appointments', icon: Calendar, description: 'Appointment volume, status breakdown, department workload' },
    { key: 'patients', label: 'Patient Analytics', icon: Users, description: 'Patient registrations, demographics, gender distribution' },
    { key: 'billing', label: 'Billing Details', icon: Receipt, description: 'Daily revenue, payment methods, category breakdown' },
];

export default function ReportsPage() {
    const [overview, setOverview] = useState<any>(null);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [appointmentData, setAppointmentData] = useState<any>(null);
    const [patientData, setPatientData] = useState<any>(null);
    const [billingData, setBillingData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeChart, setActiveChart] = useState<'revenue' | 'appointments' | 'billing'>('revenue');
    const [reportType, setReportType] = useState<ReportType>('overview');
    const [dateDays, setDateDays] = useState(30);

    useEffect(() => {
        setLoading(true);
        (async () => {
            try {
                const [ovRes, revRes, apptRes, patRes, billRes] = await Promise.all([
                    phase6Api.reports.overview(),
                    phase6Api.reports.revenueChart(6),
                    phase6Api.reports.appointments(dateDays),
                    phase6Api.reports.patients(dateDays),
                    phase6Api.reports.billing(dateDays),
                ]);
                setOverview(ovRes.data);
                setRevenueData(revRes.data.data || []);
                setAppointmentData(apptRes.data);
                setPatientData(patRes.data);
                setBillingData(billRes.data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, [dateDays]);

    const handleExportCsv = (data: any[], filename: string) => {
        phase9Api.exportCsv(data, filename);
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <BarChart3 className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports & Analytics</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Hospital-wide performance metrics and insights</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <select value={dateDays} onChange={(e) => setDateDays(Number(e.target.value))}
                        className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 90 days</option>
                        <option value={365}>Last year</option>
                    </select>
                </div>
            </div>

            {/* Report Type Selector */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {reportTypes.map((rt) => {
                    const Icon = rt.icon;
                    return (
                        <button key={rt.key} onClick={() => setReportType(rt.key)}
                            className={`text-left p-3 rounded-xl border transition-all ${
                                reportType === rt.key
                                    ? 'border-primary/30 bg-primary/5 shadow-sm'
                                    : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--text-muted)]'
                            }`}>
                            <Icon size={16} className={reportType === rt.key ? 'text-primary' : 'text-[var(--text-muted)]'} />
                            <p className={`text-xs font-medium mt-1.5 ${reportType === rt.key ? 'text-primary' : 'text-[var(--text-primary)]'}`}>{rt.label}</p>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-2">{rt.description}</p>
                        </button>
                    );
                })}
            </div>

            {/* ── KPI OVERVIEW ── */}
            {reportType === 'overview' && overview && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Key Performance Indicators</h2>
                        <button onClick={() => handleExportCsv(Object.entries(overview).map(([k, v]) => ({ metric: k, value: v })), 'kpi-overview')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all">
                            <Download size={13} /> Export CSV
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {[
                            { label: 'Total Patients', value: overview.total_patients, icon: Users, color: 'from-blue-500 to-sky-500' },
                            { label: 'Appointments Today', value: overview.appointments_today, icon: Calendar, color: 'from-violet-500 to-purple-500' },
                            { label: 'Total Revenue', value: `Rs. ${(overview.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
                            { label: 'Pending Bills', value: `Rs. ${(overview.pending_bills || 0).toLocaleString()}`, icon: Receipt, color: 'from-amber-500 to-orange-500' },
                            { label: 'Prescriptions', value: overview.total_prescriptions, icon: Pill, color: 'from-rose-500 to-pink-500' },
                            { label: 'Low Stock', value: overview.low_stock_items, icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
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
                </div>
            )}

            {/* ── REVENUE ANALYSIS ── */}
            {reportType === 'revenue' && (
                <div className="space-y-4">
                    {revenueData.length > 0 && (
                        <div className="glass-card-solid rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-[var(--text-primary)]">Monthly Revenue Trend</h2>
                                <button onClick={() => handleExportCsv(revenueData, 'monthly-revenue')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all">
                                    <Download size={13} /> CSV
                                </button>
                            </div>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#revGrad)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Monthly Revenue Table */}
                    <div className="glass-card-solid rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Monthly Revenue Details</h3>
                            <button onClick={() => handleExportCsv(revenueData, 'monthly-revenue-detail')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all">
                                <FileSpreadsheet size={13} /> Export CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                        <th className="text-left px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">Month</th>
                                        <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">Revenue</th>
                                        <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">Bill Count</th>
                                        <th className="text-right px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase">Avg. Bill Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueData.map((row: any) => (
                                        <tr key={row.month} className="border-b border-[var(--border)]">
                                            <td className="px-3 py-2 text-[var(--text-primary)] font-medium">{row.month}</td>
                                            <td className="px-3 py-2 text-right text-[var(--text-primary)]">Rs. {(row.revenue || 0).toLocaleString()}</td>
                                            <td className="px-3 py-2 text-right text-[var(--text-secondary)]">{row.bills || 0}</td>
                                            <td className="px-3 py-2 text-right text-[var(--text-secondary)]">
                                                Rs. {row.bills > 0 ? ((row.revenue / row.bills) || 0).toLocaleString() : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ── APPOINTMENTS ── */}
            {reportType === 'appointments' && appointmentData && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Appointment Analytics</h2>
                        <button onClick={() => handleExportCsv([
                            ...Object.entries(appointmentData.by_status || {}).map(([k, v]) => ({ status: k, count: v })),
                        ], 'appointment-stats')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all">
                            <Download size={13} /> Export CSV
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="glass-card-solid rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">By Status</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={Object.entries(appointmentData.by_status || {}).map(([k, v]) => ({ name: k, value: v }))}
                                        cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                                        {Object.keys(appointmentData.by_status || {}).map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="glass-card-solid rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">By Department</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={Object.entries(appointmentData.by_department || {}).map(([k, v]) => ({ name: k, count: v }))}
                                    layout="vertical" margin={{ left: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PATIENT ANALYTICS ── */}
            {reportType === 'patients' && patientData && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Patient Analytics</h2>
                        <button onClick={() => handleExportCsv(patientData.registrations || [], 'patient-registrations')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all">
                            <Download size={13} /> Export CSV
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="glass-card-solid rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Patient Registrations</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={patientData.registrations || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="glass-card-solid rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Gender Distribution</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={Object.entries(patientData.gender_distribution || {}).map(([k, v]) => ({ name: k, value: v }))}
                                        cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {Object.keys(patientData.gender_distribution || {}).map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {/* ── BILLING DETAILS ── */}
            {reportType === 'billing' && billingData && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Billing Details</h2>
                        <button onClick={() => handleExportCsv(billingData.daily_revenue || [], 'daily-revenue')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all">
                            <Download size={13} /> Export CSV
                        </button>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="glass-card-solid rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Payment Methods</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie data={Object.entries(billingData.payment_methods || {}).map(([k, v]) => ({ name: k, value: Number(v) }))}
                                        cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                        {Object.keys(billingData.payment_methods || {}).map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="glass-card-solid rounded-2xl p-6">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Revenue by Category</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={Object.entries(billingData.by_category || {}).map(([k, v]) => ({ name: k, revenue: Number(v) }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                    <Tooltip />
                                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Daily Revenue Line & Export */}
                    {billingData.daily_revenue?.length > 0 && (
                        <div className="glass-card-solid rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-[var(--text-primary)]">Daily Revenue</h3>
                                <button onClick={() => handleExportCsv(billingData.daily_revenue, 'daily-revenue-detail')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-all">
                                    <FileSpreadsheet size={13} /> Export CSV
                                </button>
                            </div>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={billingData.daily_revenue}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
