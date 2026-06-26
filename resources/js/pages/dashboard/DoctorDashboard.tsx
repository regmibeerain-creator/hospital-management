import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import {
    Calendar,
    Users,
    Clock,
    CheckCircle2,
    FlaskConical,
    ChevronRight,
    ClipboardList,
    FileText,
    Activity,
    Search,
    Stethoscope,
} from 'lucide-react';

const kpiData = [
    { label: "Today's Appointments", value: '12', icon: Calendar, gradient: 'from-blue-600 to-sky-500', sub: '4 remaining' },
    { label: 'Waiting Patients', value: '4', icon: Users, gradient: 'from-amber-500 to-orange-500', sub: 'Avg 12 min wait' },
    { label: 'Completed', value: '8', icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500', sub: 'Today' },
    { label: 'Pending Reports', value: '6', icon: FlaskConical, gradient: 'from-rose-500 to-pink-500', sub: 'Requires review' },
];

const todayAppointments = [
    { time: '09:00 AM', patient: 'Rahul Verma', type: 'Follow-up', status: 'completed' as const, room: '101', age: 45, gender: 'M' },
    { time: '09:30 AM', patient: 'Priya Singh', type: 'New Patient', status: 'in-progress' as const, room: '102', age: 32, gender: 'F' },
    { time: '10:00 AM', patient: 'Amit Kumar', type: 'Consultation', status: 'waiting' as const, room: '103', age: 58, gender: 'M' },
    { time: '10:30 AM', patient: 'Sneha Reddy', type: 'Follow-up', status: 'waiting' as const, room: '101', age: 28, gender: 'F' },
    { time: '11:00 AM', patient: 'Vikram Joshi', type: 'New Patient', status: 'scheduled' as const, room: '102', age: 52, gender: 'M' },
    { time: '11:30 AM', patient: 'Neha Gupta', type: 'Consultation', status: 'scheduled' as const, room: '103', age: 35, gender: 'F' },
];

const recentPatients = [
    { name: 'Rahul Verma', age: 45, diagnosis: 'Hypertension', lastVisit: '24 Jun 2026', gender: 'M' },
    { name: 'Priya Singh', age: 32, diagnosis: 'Migraine', lastVisit: '23 Jun 2026', gender: 'F' },
    { name: 'Amit Kumar', age: 58, diagnosis: 'Arthritis', lastVisit: '22 Jun 2026', gender: 'M' },
    { name: 'Sneha Reddy', age: 28, diagnosis: 'Allergic Rhinitis', lastVisit: '21 Jun 2026', gender: 'F' },
];

const pendingLabRequests = [
    { patient: 'Rahul Verma', test: 'Complete Blood Count', urgency: 'urgent' as const, ordered: '26 Jun 2026' },
    { patient: 'Priya Singh', test: 'MRI Brain', urgency: 'normal' as const, ordered: '25 Jun 2026' },
    { patient: 'Amit Kumar', test: 'X-Ray Knee (AP/Lat)', urgency: 'normal' as const, ordered: '25 Jun 2026' },
];

const statusConfig = {
    completed: { variant: 'success' as const, label: 'Completed' },
    'in-progress': { variant: 'default' as const, label: 'In Progress' },
    waiting: { variant: 'warning' as const, label: 'Waiting' },
    scheduled: { variant: 'secondary' as const, label: 'Scheduled' },
};

export default function DoctorDashboard() {
    const { user } = useAuth();
    const [loading] = useState(false);

    if (loading) return <DashboardSkeleton />;

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                        Welcome, Dr. {user?.name?.split(' ').pop()}
                    </h1>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">Your clinical schedule for today.</p>
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

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Appointment Timeline */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle>Today's Schedule</CardTitle>
                                <Link to="/appointments" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                                    Full Schedule <ChevronRight size={15} />
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-[var(--border)]">
                                    {todayAppointments.map((apt) => (
                                        <motion.div
                                            key={apt.time}
                                            whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                                            className="flex items-center gap-4 px-5 py-4 transition-colors cursor-pointer"
                                        >
                                            <div className="min-w-[72px]">
                                                <span className="text-sm font-semibold text-[var(--text-primary)]">{apt.time}</span>
                                            </div>
                                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${
                                                apt.status === 'completed' ? 'bg-emerald-500 shadow-emerald-500/30' :
                                                apt.status === 'in-progress' ? 'bg-blue-500 shadow-blue-500/30 pulse-glow' :
                                                apt.status === 'waiting' ? 'bg-amber-500 shadow-amber-500/30' :
                                                'bg-gray-300 dark:bg-gray-600'
                                            }`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2.5">
                                                    <span className="font-semibold text-[var(--text-primary)]">{apt.patient}</span>
                                                    <span className="text-xs text-[var(--text-muted)]">{apt.age}y · {apt.gender}</span>
                                                    <Badge variant={statusConfig[apt.status].variant}>
                                                        {statusConfig[apt.status].label}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-[var(--text-secondary)] mt-0.5">{apt.type} · Room {apt.room}</p>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="hidden sm:inline-flex text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-4 py-2 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                                            >
                                                Start
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Pending Lab Requests */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle>Pending Lab Requests</CardTitle>
                                <Link to="/lab-requests" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                                    View All <ChevronRight size={15} />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {pendingLabRequests.map((req, i) => (
                                        <motion.div
                                            key={i}
                                            whileHover={{ x: 3 }}
                                            className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:border-[var(--border-accent)] transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className={`p-2.5 rounded-xl ${
                                                    req.urgency === 'urgent' ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-[var(--bg-tertiary)]'
                                                }`}>
                                                    <FlaskConical className={`w-4 h-4 ${
                                                        req.urgency === 'urgent' ? 'text-rose-500' : 'text-[var(--text-muted)]'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{req.test}</p>
                                                    <p className="text-xs text-[var(--text-muted)]">{req.patient} · {req.ordered}</p>
                                                </div>
                                            </div>
                                            <Badge variant={req.urgency === 'urgent' ? 'danger' : 'secondary'}>
                                                {req.urgency}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Right - 1/3 */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {[
                                    { label: 'Write Prescription', icon: ClipboardList, gradient: 'from-blue-600 to-sky-500' },
                                    { label: 'View Patient History', icon: FileText, gradient: 'from-emerald-500 to-teal-500' },
                                    { label: 'Order Lab Test', icon: FlaskConical, gradient: 'from-amber-500 to-orange-500' },
                                    { label: 'Clinical Notes', icon: Activity, gradient: 'from-violet-500 to-purple-500' },
                                ].map((action) => {
                                    const Icon = action.icon;
                                    return (
                                        <motion.button
                                            key={action.label}
                                            whileHover={{ x: 3 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-accent)] hover:shadow-sm transition-all text-left bg-[var(--bg-secondary)]"
                                        >
                                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} shadow-md`}>
                                                <Icon className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="text-sm font-semibold text-[var(--text-primary)]">{action.label}</span>
                                        </motion.button>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Recent Patients */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle>Recent Patients</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {recentPatients.map((p) => (
                                    <motion.div
                                        key={p.name}
                                        whileHover={{ x: 3 }}
                                        className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                                    >
                                        <Avatar name={p.name} size="md" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</p>
                                            <p className="text-xs text-[var(--text-secondary)]">{p.diagnosis}</p>
                                        </div>
                                        <span className="text-xs text-[var(--text-muted)]">{p.age}y</span>
                                    </motion.div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
