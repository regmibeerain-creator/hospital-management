import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import {
    Users,
    Calendar,
    Stethoscope,
    DollarSign,
    Bed,
    Ambulance,
    TrendingUp,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    UserPlus,
    Activity,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

const kpiData = [
    { label: 'Total Patients', value: '12,847', change: '+12.3%', icon: Users, gradient: 'from-blue-600 to-sky-500', up: true },
    { label: "Today's Patients", value: '184', change: '+8.1%', icon: UserPlus, gradient: 'from-emerald-500 to-teal-500', up: true },
    { label: 'Active Doctors', value: '48', change: '+2', icon: Stethoscope, gradient: 'from-violet-500 to-purple-500', up: true },
    { label: 'Appointments', value: '96', change: '+15.2%', icon: Calendar, gradient: 'from-amber-500 to-orange-500', up: true },
    { label: 'Revenue Today', value: '$24,850', change: '+18.4%', icon: DollarSign, gradient: 'from-green-500 to-emerald-500', up: true },
    { label: 'Available Beds', value: '142', change: '-8', icon: Bed, gradient: 'from-cyan-500 to-blue-500', up: false },
    { label: 'Emergency Cases', value: '12', change: '+3', icon: Ambulance, gradient: 'from-rose-500 to-red-500', up: true },
];

const appointmentData = [
    { name: 'Mon', appointments: 40 },
    { name: 'Tue', appointments: 55 },
    { name: 'Wed', appointments: 45 },
    { name: 'Thu', appointments: 70 },
    { name: 'Fri', appointments: 60 },
    { name: 'Sat', appointments: 35 },
    { name: 'Sun', appointments: 20 },
];

const revenueData = [
    { name: 'Jan', revenue: 40000 },
    { name: 'Feb', revenue: 45000 },
    { name: 'Mar', revenue: 38000 },
    { name: 'Apr', revenue: 52000 },
    { name: 'May', revenue: 48000 },
    { name: 'Jun', revenue: 56000 },
];

const patientGrowthData = [
    { name: 'Jan', patients: 8200 },
    { name: 'Feb', patients: 8800 },
    { name: 'Mar', patients: 9500 },
    { name: 'Apr', patients: 10200 },
    { name: 'May', patients: 11400 },
    { name: 'Jun', patients: 12847 },
];

const deptData = [
    { name: 'Cardiology', value: 320 },
    { name: 'Neurology', value: 210 },
    { name: 'Orthopedics', value: 280 },
    { name: 'Pediatrics', value: 190 },
    { name: 'ENT', value: 150 },
];

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

const recentPatients = [
    { name: 'Rahul Verma', id: '#P-2024-001', doctor: 'Dr. Sharma', dept: 'Cardiology', status: 'admitted' as const },
    { name: 'Priya Singh', id: '#P-2024-002', doctor: 'Dr. Patel', dept: 'Neurology', status: 'discharged' as const },
    { name: 'Amit Kumar', id: '#P-2024-003', doctor: 'Dr. Gupta', dept: 'Orthopedics', status: 'consultation' as const },
    { name: 'Sneha Reddy', id: '#P-2024-004', doctor: 'Dr. Sharma', dept: 'Cardiology', status: 'admitted' as const },
    { name: 'Vikram Joshi', id: '#P-2024-005', doctor: 'Dr. Patel', dept: 'Neurology', status: 'discharged' as const },
];

const recentPayments = [
    { patient: 'Rahul Verma', amount: '$12,500', method: 'Insurance', status: 'completed' as const },
    { patient: 'Priya Singh', amount: '$3,200', method: 'Cash', status: 'completed' as const },
    { patient: 'Amit Kumar', amount: '$8,700', method: 'Card', status: 'pending' as const },
    { patient: 'Sneha Reddy', amount: '$15,000', method: 'Insurance', status: 'completed' as const },
];

const statusStyles = {
    admitted: { variant: 'warning' as const, label: 'Admitted' },
    discharged: { variant: 'success' as const, label: 'Discharged' },
    consultation: { variant: 'default' as const, label: 'Consultation' },
    completed: { variant: 'success' as const, label: 'Completed' },
    pending: { variant: 'warning' as const, label: 'Pending' },
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass-card rounded-xl px-4 py-3 shadow-xl">
                <p className="text-xs font-medium text-[var(--text-muted)] mb-1">{label}</p>
                {payload.map((entry: any, i: number) => (
                    <p key={i} className="text-sm font-bold text-[var(--text-primary)]">
                        {entry.name}: {entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function AdminDashboard() {
    const [loading] = useState(false);

    if (loading) return <DashboardSkeleton />;

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">Hospital-wide analytics and performance metrics.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-3.5 py-2 rounded-xl border border-[var(--border)]">
                    <Calendar size={15} />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiData.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={kpi.label} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                            <Card>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1.5">
                                            <p className="text-sm font-medium text-[var(--text-secondary)]">{kpi.label}</p>
                                            <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{kpi.value}</p>
                                            <div className={`flex items-center gap-0.5 text-xs font-semibold ${kpi.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {kpi.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                                {kpi.change} vs last week
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${kpi.gradient} shadow-lg`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Charts Row */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Appointments This Week</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={appointmentData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-tertiary)' }} />
                                    <Bar dataKey="appointments" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Revenue Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Second Charts Row */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Patient Growth</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={patientGrowthData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="patients" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Department Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-72 flex items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deptData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {deptData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="hidden lg:block space-y-2.5">
                                {deptData.map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                        <span className="text-xs text-[var(--text-secondary)]">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Tables Row */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle>Recent Patients</CardTitle>
                        <Link to="/patients" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                            View All <ChevronRight size={15} />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)]">
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Patient</th>
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Doctor</th>
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider hidden md:table-cell">Department</th>
                                        <th className="text-right py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPatients.map((p) => (
                                        <motion.tr
                                            key={p.id}
                                            whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                                            className="border-b border-[var(--border)] last:border-0 transition-colors cursor-pointer"
                                        >
                                            <td className="py-3.5 px-5">
                                                <p className="font-semibold text-[var(--text-primary)]">{p.name}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{p.id}</p>
                                            </td>
                                            <td className="py-3.5 px-5 text-[var(--text-secondary)]">{p.doctor}</td>
                                            <td className="py-3.5 px-5 text-[var(--text-secondary)] hidden md:table-cell">{p.dept}</td>
                                            <td className="py-3.5 px-5 text-right">
                                                <Badge variant={statusStyles[p.status].variant}>{statusStyles[p.status].label}</Badge>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle>Recent Payments</CardTitle>
                        <Link to="/billing" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                            View All <ChevronRight size={15} />
                        </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)]">
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Patient</th>
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Amount</th>
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider hidden md:table-cell">Method</th>
                                        <th className="text-right py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentPayments.map((p, i) => (
                                        <motion.tr
                                            key={i}
                                            whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                                            className="border-b border-[var(--border)] last:border-0 transition-colors"
                                        >
                                            <td className="py-3.5 px-5">
                                                <p className="font-semibold text-[var(--text-primary)]">{p.patient}</p>
                                            </td>
                                            <td className="py-3.5 px-5 font-semibold text-[var(--text-primary)]">{p.amount}</td>
                                            <td className="py-3.5 px-5 text-[var(--text-secondary)] hidden md:table-cell">{p.method}</td>
                                            <td className="py-3.5 px-5 text-right">
                                                <Badge variant={statusStyles[p.status].variant}>{statusStyles[p.status].label}</Badge>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
