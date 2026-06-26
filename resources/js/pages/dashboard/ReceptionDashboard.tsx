import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import {
    Users,
    UserPlus,
    Calendar,
    DoorOpen,
    CreditCard,
    LogOut,
    ChevronRight,
    Clock,
    Filter,
} from 'lucide-react';

const kpiData = [
    { label: "Today's Queue", value: '24', icon: Users, gradient: 'from-blue-600 to-sky-500', sub: '12 remaining' },
    { label: 'Walk-ins', value: '8', icon: UserPlus, gradient: 'from-emerald-500 to-teal-500', sub: 'Registered today' },
    { label: 'Appointments', value: '16', icon: Calendar, gradient: 'from-amber-500 to-orange-500', sub: '8 completed' },
    { label: 'Admissions', value: '3', icon: DoorOpen, gradient: 'from-violet-500 to-purple-500', sub: '2 pending' },
    { label: 'Payments', value: '12', icon: CreditCard, gradient: 'from-green-500 to-emerald-500', sub: '$8,240 today' },
    { label: 'Discharges', value: '5', icon: LogOut, gradient: 'from-cyan-500 to-blue-500', sub: 'Today' },
];

const queueData = [
    { token: 'A-101', patient: 'Rahul Verma', doctor: 'Dr. Sharma', dept: 'Cardiology', status: 'in-progress' as const, wait: '15 min' },
    { token: 'A-102', patient: 'Priya Singh', doctor: 'Dr. Patel', dept: 'Neurology', status: 'waiting' as const, wait: '20 min' },
    { token: 'A-103', patient: 'Amit Kumar', doctor: 'Dr. Gupta', dept: 'Orthopedics', status: 'waiting' as const, wait: '30 min' },
    { token: 'A-104', patient: 'Sneha Reddy', doctor: 'Dr. Sharma', dept: 'Cardiology', status: 'waiting' as const, wait: '35 min' },
    { token: 'W-001', patient: 'Vikram Joshi', doctor: 'Dr. Patel', dept: 'Neurology', status: 'waiting' as const, wait: '10 min', walkin: true },
    { token: 'W-002', patient: 'Neha Gupta', doctor: 'Dr. Verma', dept: 'ENT', status: 'waiting' as const, wait: '15 min', walkin: true },
];

export default function ReceptionDashboard() {
    const [loading] = useState(false);

    if (loading) return <DashboardSkeleton />;

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Reception Dashboard</h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">Front desk operations and queue overview.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-3.5 py-2 rounded-xl border border-[var(--border)]">
                    <Calendar size={15} />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpiData.map((kpi) => {
                    const Icon = kpi.icon;
                    return (
                        <motion.div key={kpi.label} whileHover={{ y: -2 }}>
                            <Card>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1.5">
                                            <p className="text-sm font-medium text-[var(--text-secondary)]">{kpi.label}</p>
                                            <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{kpi.value}</p>
                                            <p className="text-sm text-[var(--text-muted)]">{kpi.sub}</p>
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

            {/* Queue Table */}
            <motion.div variants={fadeInUp}>
                <Card>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Today's Queue</CardTitle>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5">Average wait time: ~20 minutes</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="default">{queueData.filter((q) => q.walkin).length} Walk-ins</Badge>
                            <Link to="/queue" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                                Manage <ChevronRight size={15} />
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)]">
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Token</th>
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Patient</th>
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider hidden md:table-cell">Doctor</th>
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider hidden lg:table-cell">Department</th>
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Status</th>
                                        <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Wait</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {queueData.map((q) => (
                                        <motion.tr
                                            key={q.token}
                                            whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                                            className="border-b border-[var(--border)] last:border-0 transition-colors"
                                        >
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[var(--text-primary)]">{q.token}</span>
                                                    {q.walkin && (
                                                        <Badge variant="warning" className="text-[10px] px-1.5">Walk-in</Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5 font-semibold text-[var(--text-primary)]">{q.patient}</td>
                                            <td className="py-3.5 px-5 text-[var(--text-secondary)] hidden md:table-cell">{q.doctor}</td>
                                            <td className="py-3.5 px-5 text-[var(--text-secondary)] hidden lg:table-cell">{q.dept}</td>
                                            <td className="py-3.5 px-5">
                                                <Badge variant={q.status === 'in-progress' ? 'default' : 'secondary'}>
                                                    {q.status === 'in-progress' ? 'In Progress' : 'Waiting'}
                                                </Badge>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                                    <Clock size={13} />
                                                    <span>{q.wait}</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Register Patient', icon: UserPlus, gradient: 'from-blue-600 to-sky-500', path: '/patients/register' },
                    { label: 'New Appointment', icon: Calendar, gradient: 'from-emerald-500 to-teal-500', path: '/appointments/book' },
                    { label: 'Process Billing', icon: CreditCard, gradient: 'from-amber-500 to-orange-500', path: '/billing' },
                    { label: 'Admit Patient', icon: DoorOpen, gradient: 'from-violet-500 to-purple-500', path: '/admissions' },
                ].map((action) => {
                    const Icon = action.icon;
                    return (
                        <motion.div key={action.label} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                            <Link
                                to={action.path}
                                className="flex items-center gap-3.5 p-4 rounded-2xl border border-[var(--border)] hover:border-[var(--border-accent)] bg-[var(--bg-secondary)] transition-all duration-200"
                            >
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} shadow-md`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-[var(--text-primary)]">{action.label}</span>
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </motion.div>
    );
}
