import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import phase9Api from '../lib/phase9-api';
import type { ManagementStats } from '../lib/phase9-api';
import {
    LayoutDashboard, Calendar, User, FileText, Activity, ArrowRight,
    Users, Stethoscope, DollarSign, Pill, AlertTriangle, ShieldCheck,
    TrendingUp, Loader2, Clock, Syringe, Scan, FlaskConical,
    Receipt, BarChart3, Heart,
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

export default function Dashboard() {
    const { user } = useAuth();
    const roleSlug = user?.role?.slug || 'patient';
    const [stats, setStats] = useState<ManagementStats | null>(null);
    const [loading, setLoading] = useState(true);
    // Date range display hint - current view shows real-time data
    const [dateRange, setDateRange] = useState('today');
    const rangeLabels: Record<string, string> = {
        today: 'Real-time metrics for today',
        week: 'Real-time metrics for this week',
        month: 'Real-time metrics for this month',
    };

    useEffect(() => {
        if (roleSlug === 'admin') {
            setLoading(true);
            phase9Api.managementStats()
                .then((res) => setStats(res.data))
                .catch(() => {})
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [roleSlug]);

    // ── PATIENT DASHBOARD ──
    if (roleSlug === 'patient') {
        return <PatientDashboard user={user} />;
    }

    // ── DOCTOR DASHBOARD ──
    if (roleSlug === 'doctor') {
        return <DoctorDashboard user={user} />;
    }

    // ── ADMIN / STAFF MANAGEMENT DASHBOARD ──
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        Birendranagar Municipal Hospital
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">
                        Welcome back, {user?.name?.split(' ')[0] || 'Admin'}
                    </p>
                </div>
                <div className="flex items-center gap-2">                        {['today', 'week', 'month'].map((range) => (
                            <button key={range} onClick={() => setDateRange(range)}
                                title={rangeLabels[range]}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    dateRange === range
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                                }`}>
                                {range.charAt(0).toUpperCase() + range.slice(1)}
                            </button>
                        ))}
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
            ) : stats ? (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Patients Today', value: stats.new_patients_today, sub: `+${stats.patient_growth_percent}% vs last month`, icon: Users, color: 'from-blue-500 to-sky-500' },
                            { label: 'Appointments Today', value: stats.appointments_today, sub: `${stats.appointments_completed} completed`, icon: Calendar, color: 'from-violet-500 to-purple-500' },
                            { label: "Today's Revenue", value: `Rs. ${(stats.revenue_today || 0).toLocaleString()}`, sub: `+${stats.revenue_growth_percent}% vs last month`, icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
                            { label: 'Pending Bills', value: `Rs. ${(stats.pending_bills || 0).toLocaleString()}`, sub: `${stats.bills_today} bills today`, icon: Receipt, color: 'from-amber-500 to-orange-500' },
                            { label: 'Low Stock Items', value: stats.low_stock_items, sub: `${stats.total_medicines} total medicines`, icon: AlertTriangle, color: 'from-rose-500 to-pink-500' },
                            { label: 'Lab Orders Pending', value: stats.lab_orders_pending, sub: `${stats.lab_results_today} results today`, icon: FlaskConical, color: 'from-cyan-500 to-sky-500' },
                            { label: 'Imaging Pending', value: stats.imaging_pending, sub: `${stats.scheduled_today} scheduled today`, icon: Scan, color: 'from-indigo-500 to-violet-500' },
                            { label: 'Prescriptions Today', value: stats.prescriptions_today, sub: `Active: ${stats.low_stock_items} low stock`, icon: Pill, color: 'from-green-500 to-emerald-500' },
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
                                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.sub}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Second row KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Total Patients', value: stats.total_patients.toLocaleString(), sub: `${stats.new_patients_this_month} this month`, icon: Users, color: 'from-blue-500 to-indigo-500' },
                            { label: 'Total Revenue', value: `Rs. ${(stats.total_revenue || 0).toLocaleString()}`, sub: `Rs. ${(stats.revenue_this_month || 0).toLocaleString()} this month`, icon: TrendingUp, color: 'from-emerald-500 to-green-500' },
                            { label: 'Appt. No-Show Rate', value: `${stats.no_show_rate}%`, sub: `${stats.appointments_this_month} this month`, icon: Clock, color: 'from-amber-500 to-yellow-500' },
                            { label: 'Pending Claims', value: stats.pending_claims, sub: `${stats.active_users} active users`, icon: ShieldCheck, color: 'from-violet-500 to-purple-500' },
                        ].map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className="glass-card-solid rounded-xl p-3.5">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${s.color} shadow-sm`}>
                                            <Icon size={12} className="text-white" />
                                        </div>
                                        <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{s.label}</p>
                                    </div>
                                    <p className="text-lg font-bold text-[var(--text-primary)]">{s.value}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{s.sub}</p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Monthly Revenue Trend */}
                        <div className="glass-card-solid rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Revenue Trend (6 Months)</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={stats.monthly_revenue}>
                                    <defs>
                                        <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                    <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="url(#revGrad2)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Appointments Status Today */}
                        <div className="glass-card-solid rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Appointments Today</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={Object.entries(stats.appointment_statuses_today || {}).map(([k, v]) => ({ name: k, value: v }))}
                                        cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {Object.keys(stats.appointment_statuses_today || {}).map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Department Workload */}
                        <div className="glass-card-solid rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Department Workload (This Month)</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={stats.department_workload || []} layout="vertical" margin={{ left: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={90} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Patient Gender Distribution */}
                        <div className="glass-card-solid rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Patient Gender Distribution</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={Object.entries(stats.gender_distribution || {}).map(([k, v]) => ({ name: k, value: v }))}
                                        cx="50%" cy="50%" outerRadius={100} paddingAngle={3} dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {Object.keys(stats.gender_distribution || {}).map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Navigation */}
                    <div className="glass-card-solid rounded-2xl p-5">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Quick Navigation</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { label: 'Billing', icon: Receipt, href: '/dashboard/billing', color: 'from-emerald-500 to-teal-500' },
                                { label: 'Reports & Analytics', icon: BarChart3, href: '/dashboard/reports', color: 'from-violet-500 to-purple-500' },
                                { label: 'LIS Dashboard', icon: FlaskConical, href: '/dashboard/lis', color: 'from-cyan-500 to-sky-500' },
                                { label: 'RIS Dashboard', icon: Scan, href: '/dashboard/ris', color: 'from-indigo-500 to-violet-500' },
                            ].map((btn) => {
                                const Icon = btn.icon;
                                return (
                                    <Link key={btn.label} to={btn.href}
                                        className={`flex items-center gap-2.5 p-3 rounded-xl bg-gradient-to-r ${btn.color} text-white text-sm font-medium hover:shadow-lg transition-all`}>
                                        <Icon size={16} />
                                        {btn.label}
                                        <ArrowRight size={14} className="ml-auto opacity-60" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-12 text-center">
                    <LayoutDashboard className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                    <p className="text-[var(--text-secondary)] font-medium">Unable to load dashboard data</p>
                </div>
            )}
        </div>
    );
}

// ── Patient Dashboard ──
function PatientDashboard({ user }: { user: any }) {
    const statCards = [
        { label: 'Upcoming Appointments', value: '—', icon: Calendar, color: 'from-blue-500 to-blue-600', href: '/dashboard/appointments' },
        { label: 'Medical Reports', value: '—', icon: FileText, color: 'from-amber-500 to-orange-600', href: '/dashboard/medical-records' },
        { label: 'Prescriptions', value: '—', icon: Pill, color: 'from-emerald-500 to-green-600', href: '/dashboard/prescriptions' },
        { label: 'Profile', value: '—', icon: User, color: 'from-violet-500 to-purple-600', href: '/dashboard/profile' },
    ];

    const quickActions = [
        { label: 'Book Appointment', href: '/dashboard/appointments/book', icon: Calendar, description: 'Schedule a visit with a doctor' },
        { label: 'View Reports', href: '/dashboard/medical-records', icon: FileText, description: 'Access your medical reports' },
        { label: 'My Profile', href: '/dashboard/profile', icon: User, description: 'Update your personal details' },
    ];

    return (
        <div className="space-y-6 animate-slide-in">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    Welcome back, {user?.name?.split(' ')[0] || 'Patient'}
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                    Your health overview at Birendranagar Municipal Hospital
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <Link key={card.label} to={card.href}
                            className="glass-card-solid rounded-2xl p-5 glass-card-hover group">
                            <div className="flex items-start justify-between">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <ArrowRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                            </div>
                            <p className="text-2xl font-bold text-[var(--text-primary)] mt-4">{card.value}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">{card.label}</p>
                        </Link>
                    );
                })}
            </div>

            <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {quickActions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link key={action.label} to={action.href}
                                className="glass-card-solid rounded-2xl p-5 glass-card-hover">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center mb-4">
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-[var(--text-primary)]">{action.label}</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1">{action.description}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ── Doctor Dashboard ──
function DoctorDashboard({ user }: { user: any }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                    Welcome, Dr. {user?.name?.split(' ').slice(1).join(' ') || user?.name}
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">Today's clinical overview</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: "Today's Patients", value: '—', icon: Users, color: 'from-blue-500 to-sky-500', href: '/dashboard/today-patients' },
                    { label: 'Pending Lab Results', value: '—', icon: FlaskConical, color: 'from-amber-500 to-orange-500', href: '/dashboard/lab-requests' },
                    { label: 'Pending Imaging', value: '—', icon: Scan, color: 'from-violet-500 to-purple-500', href: '/dashboard/lab-requests' },
                    { label: 'Active Prescriptions', value: '—', icon: Pill, color: 'from-emerald-500 to-teal-500', href: '/dashboard/prescriptions' },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <Link key={s.label} to={s.href} className="glass-card-solid rounded-xl p-3.5 glass-card-hover">
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{s.label}</p>
                                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${s.color} shadow-sm`}>
                                    <Icon size={12} className="text-white" />
                                </div>
                            </div>
                            <p className="text-lg font-bold text-[var(--text-primary)]">{s.value}</p>
                        </Link>
                    );
                })}
            </div>

            <div className="glass-card-solid rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: "Today's Schedule", icon: Calendar, href: '/dashboard/appointments', desc: 'View your appointments' },
                        { label: 'Patient History', icon: FileText, href: '/dashboard/patient-history', desc: 'Search patient records' },
                        { label: 'Medical Notes', icon: Activity, href: '/dashboard/medical-notes', desc: 'Document clinical notes' },
                    ].map((a) => {
                        const Icon = a.icon;
                        return (
                            <Link key={a.label} to={a.href} className="glass-card-solid rounded-2xl p-5 glass-card-hover">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center mb-4">
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-semibold text-[var(--text-primary)]">{a.label}</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1">{a.desc}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
