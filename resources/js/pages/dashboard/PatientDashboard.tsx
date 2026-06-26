import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { fadeInUp, staggerContainer, cardHover } from '../../lib/animations';
import {
    Calendar,
    Clock,
    DollarSign,
    Bell,
    ArrowRight,
    FileText,
    Pill,
    FlaskConical,
    CreditCard,
    Phone,
    Heart,
    Weight,
    Ruler,
    Activity,
    AlertTriangle,
    CalendarCheck,
    ChevronRight,
    Download,
    Stethoscope,
    Sparkles,
    Shield,
} from 'lucide-react';

const appointment = {
    doctor: 'Dr. Anil Sharma',
    specialty: 'Cardiology',
    time: '10:30 AM',
    date: 'Today',
    room: 'Room 202',
    status: 'confirmed' as const,
};

const healthSummary = {
    bloodGroup: 'O+',
    height: '175 cm',
    weight: '72 kg',
    bmi: '23.5',
    allergies: ['Pollen', 'Penicillin'],
    chronic: ['None'],
};

const quickActions = [
    { label: 'Book Appointment', icon: CalendarCheck, gradient: 'from-blue-600 to-sky-500', path: '/appointments/book' },
    { label: 'View Prescription', icon: FileText, gradient: 'from-emerald-500 to-teal-500', path: '/prescriptions' },
    { label: 'Medical Records', icon: Pill, gradient: 'from-violet-500 to-purple-500', path: '/medical-records' },
    { label: 'Lab Reports', icon: FlaskConical, gradient: 'from-amber-500 to-orange-500', path: '/lab-reports' },
    { label: 'Pay Bills', icon: CreditCard, gradient: 'from-rose-500 to-pink-500', path: '/billing' },
    { label: 'Emergency', icon: Phone, gradient: 'from-red-500 to-rose-600', path: '/emergency' },
];

const labReports = [
    { name: 'Complete Blood Count', status: 'completed' as const, date: '24 Jun 2026', doctor: 'Dr. Sharma' },
    { name: 'Urine Analysis', status: 'pending' as const, date: '25 Jun 2026', doctor: 'Dr. Patel' },
    { name: 'MRI Brain', status: 'scheduled' as const, date: '28 Jun 2026', doctor: 'Dr. Gupta' },
    { name: 'Chest X-Ray', status: 'completed' as const, date: '20 Jun 2026', doctor: 'Dr. Sharma' },
];

const prescriptions = [
    { medicine: 'Amoxicillin 500mg', dosage: '3 times daily', doctor: 'Dr. Patel', date: '20 Jun 2026' },
    { medicine: 'Paracetamol 650mg', dosage: 'twice daily', doctor: 'Dr. Sharma', date: '18 Jun 2026' },
    { medicine: 'Vitamin D3 60K', dosage: 'weekly', doctor: 'Dr. Patel', date: '15 Jun 2026' },
];

const recentNotifications = [
    { message: 'Appointment confirmed with Dr. Sharma', time: '5 min ago', color: 'bg-emerald-500' },
    { message: 'Blood test results are ready', time: '1 hour ago', color: 'bg-blue-500' },
    { message: 'Prescription updated by Dr. Patel', time: '3 hours ago', color: 'bg-amber-500' },
];

const statusConfig = {
    confirmed: { variant: 'success' as const, label: 'Confirmed' },
    pending: { variant: 'warning' as const, label: 'Pending' },
    completed: { variant: 'success' as const, label: 'Ready' },
    scheduled: { variant: 'premium' as const, label: 'Scheduled' },
};

export default function PatientDashboard() {
    const { user } = useAuth();
    const [loading] = useState(false);

    if (loading) return <DashboardSkeleton />;

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Welcome */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                            Welcome back, {user?.name?.split(' ')[0]}
                        </h1>
                        <Sparkles size={20} className="text-blue-500" />
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">Here&apos;s your health summary for today.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-3.5 py-2 rounded-xl border border-[var(--border)]">
                    <Calendar size={15} />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Upcoming Appointment', value: appointment.time, sub: appointment.doctor, icon: Calendar, gradient: 'from-blue-600 to-sky-500', badge: { ...statusConfig[appointment.status] } },
                    { label: 'Outstanding Bills', value: '$0.00', sub: 'All paid', icon: DollarSign, gradient: 'from-emerald-500 to-teal-500', badge: null },
                    { label: 'Pending Results', value: '1', sub: 'Lab reports', icon: FlaskConical, gradient: 'from-amber-500 to-orange-500', badge: null },
                    { label: 'Notifications', value: '3', sub: 'Unread', icon: Bell, gradient: 'from-rose-500 to-pink-500', badge: null },
                ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={stat.label} variants={fadeInUp}>
                            <Card>
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1.5">
                                            <p className="text-sm font-medium text-[var(--text-secondary)]">{stat.label}</p>
                                            <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{stat.value}</p>
                                            <p className="text-sm text-[var(--text-muted)]">{stat.sub}</p>
                                        </div>
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    {stat.badge && (
                                        <Badge variant={stat.badge.variant} className="mt-3">
                                            {stat.badge.label}
                                        </Badge>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={fadeInUp}>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <motion.div key={action.label} whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                                        <Link
                                            to={action.path}
                                            className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-[var(--border)] hover:border-[var(--border-accent)] bg-[var(--bg-secondary)] transition-all duration-200"
                                        >
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} shadow-md`}>
                                                <Icon className="w-5 h-5 text-white" />
                                            </div>
                                            <span className="text-xs font-semibold text-[var(--text-primary)] text-center leading-tight">
                                                {action.label}
                                            </span>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Appointment Timeline */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle>Today's Appointment</CardTitle>
                                <Link to="/appointments" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                                    View All <ChevronRight size={15} />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-500/5 dark:to-sky-500/5 border border-blue-100 dark:border-blue-500/10 p-5">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-sky-400/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                                    <div className="relative flex items-start gap-5">
                                        <div className="flex flex-col items-center min-w-[72px]">
                                            <span className="text-3xl font-bold text-blue-700 dark:text-blue-400 leading-none">10:30</span>
                                            <span className="text-xs font-medium text-blue-500 dark:text-blue-500 mt-0.5">AM</span>
                                            <div className="w-px h-full min-h-[4rem] bg-gradient-to-b from-blue-300 to-transparent mt-2 hidden sm:block" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <h3 className="font-semibold text-lg text-[var(--text-primary)]">{appointment.doctor}</h3>
                                                <Badge variant="default" dot>Confirmed</Badge>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)] mt-1">{appointment.specialty}</p>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-[var(--text-muted)]">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={14} />
                                                    {appointment.time}
                                                </span>
                                                <span>{appointment.room}</span>
                                            </div>
                                        </div>
                                        <Avatar name={appointment.doctor} size="xl" className="hidden sm:flex ring-4 ring-white dark:ring-gray-800 shadow-xl" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Lab Reports */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle>Recent Lab Reports</CardTitle>
                                <Link to="/lab-reports" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                                    View All <ChevronRight size={15} />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {labReports.map((report) => (
                                        <motion.div
                                            key={report.name}
                                            whileHover={{ x: 3 }}
                                            className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-tertiary)] transition-all duration-200 cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className={`w-2.5 h-2.5 rounded-full ${
                                                    report.status === 'completed' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' :
                                                    report.status === 'pending' ? 'bg-amber-500 shadow-sm shadow-amber-500/30' :
                                                    'bg-blue-500 shadow-sm shadow-blue-500/30'
                                                }`} />
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{report.name}</p>
                                                    <p className="text-xs text-[var(--text-muted)]">{report.date} · {report.doctor}</p>
                                                </div>
                                            </div>
                                            <Badge variant={statusConfig[report.status].variant}>
                                                {statusConfig[report.status].label}
                                            </Badge>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Prescriptions */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle>Recent Prescriptions</CardTitle>
                                <Link to="/prescriptions" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
                                    View All <ChevronRight size={15} />
                                </Link>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-[var(--border)]">
                                                <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Medicine</th>
                                                <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider hidden sm:table-cell">Dosage</th>
                                                <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Doctor</th>
                                                <th className="text-left py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
                                                <th className="text-right py-3.5 px-5 font-semibold text-[var(--text-muted)] text-xs uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {prescriptions.map((p) => (
                                                <motion.tr
                                                    key={p.medicine}
                                                    whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
                                                    className="border-b border-[var(--border)] last:border-0 transition-colors"
                                                >
                                                    <td className="py-3.5 px-5">
                                                        <p className="font-semibold text-[var(--text-primary)]">{p.medicine}</p>
                                                    </td>
                                                    <td className="py-3.5 px-5 text-[var(--text-secondary)] hidden sm:table-cell">{p.dosage}</td>
                                                    <td className="py-3.5 px-5 text-[var(--text-secondary)]">{p.doctor}</td>
                                                    <td className="py-3.5 px-5 text-[var(--text-muted)] hidden md:table-cell">{p.date}</td>
                                                    <td className="py-3.5 px-5 text-right">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-semibold text-xs bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <Download size={13} />
                                                            PDF
                                                        </motion.button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Right - 1/3 */}
                <div className="space-y-6">
                    {/* Health Summary */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Heart size={16} className="text-rose-500" />
                                    <CardTitle>Health Summary</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-0">
                                    {[
                                        { label: 'Blood Group', value: healthSummary.bloodGroup, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
                                        { label: 'Height', value: healthSummary.height, icon: Ruler, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                                        { label: 'Weight', value: healthSummary.weight, icon: Weight, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                                        { label: 'BMI', value: healthSummary.bmi, icon: Activity, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10' },
                                        { label: 'Allergies', value: healthSummary.allergies[0] === 'None' ? 'None' : healthSummary.allergies.join(', '), icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                                    ].map((item, i) => {
                                        const Icon = item.icon;
                                        return (
                                            <div key={item.label} className={`flex items-center justify-between py-3 ${i < 4 ? 'border-b border-[var(--border)]' : ''}`}>
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`p-1.5 rounded-lg ${item.bg}`}>
                                                        <Icon size={14} className={item.color} />
                                                    </div>
                                                    <span className="text-sm text-[var(--text-secondary)]">{item.label}</span>
                                                </div>
                                                <span className="text-sm font-semibold text-[var(--text-primary)]">{item.value}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Notifications */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle>Notifications</CardTitle>
                                <Link to="/notifications" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium transition-colors">
                                    View All
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {recentNotifications.map((n, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-start gap-3 p-3.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)]"
                                        >
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.color}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-[var(--text-primary)]">{n.message}</p>
                                                <p className="text-xs text-[var(--text-muted)] mt-0.5">{n.time}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Emergency */}
                    <motion.div variants={fadeInUp}>
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-5 shadow-xl shadow-rose-500/20">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="relative flex items-center gap-3">
                                <div className="p-2.5 bg-white/15 backdrop-blur rounded-xl">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white/90">Emergency Contact</p>
                                    <p className="text-xl font-bold text-white">+1-800-123-4567</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
