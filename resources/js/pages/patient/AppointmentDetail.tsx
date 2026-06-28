import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback } from '../../components/ui/Avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../components/ui/dialog';
import { Skeleton } from '../../components/ui/Skeleton';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import bprApi from '../../lib/bpr-api';
import type { Appointment } from '../../lib/bpr-api';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Stethoscope,
    XCircle,
    Loader2,
    FileText,
    Pill,
    FlaskConical,
    Scan,
    Activity,
    Download,
    Info,
    ClipboardList,
    ChevronRight,
    AlertCircle,
    User,
    Phone,
    Mail,
    CalendarCheck,
} from 'lucide-react';

const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary'; label: string; color: string }> = {
    scheduled: { variant: 'default', label: 'Scheduled', color: 'bg-blue-500' },
    confirmed: { variant: 'success', label: 'Confirmed', color: 'bg-emerald-500' },
    checked_in: { variant: 'warning', label: 'Checked In', color: 'bg-amber-500' },
    completed: { variant: 'outline', label: 'Completed', color: 'bg-gray-400' },
    cancelled: { variant: 'danger', label: 'Cancelled', color: 'bg-red-500' },
    no_show: { variant: 'danger', label: 'No Show', color: 'bg-red-500' },
};

const reportTypeConfig: Record<string, { icon: React.ElementType; gradient: string }> = {
    lab: { icon: FlaskConical, gradient: 'from-amber-500 to-orange-500' },
    radiology: { icon: Scan, gradient: 'from-indigo-500 to-violet-500' },
    pathology: { icon: Activity, gradient: 'from-rose-500 to-pink-500' },
    surgery: { icon: Activity, gradient: 'from-red-500 to-rose-500' },
    other: { icon: FileText, gradient: 'from-gray-500 to-slate-500' },
};

const dayMapping: Record<string, string> = {
    'daily': 'Daily',
    'once daily': 'Once Daily',
    'twice daily': 'Twice Daily',
    'thrice daily': 'Thrice Daily',
    'three times daily': 'Three Times Daily',
    'four times daily': 'Four Times Daily',
    'every morning': 'Every Morning',
    'every evening': 'Every Evening',
    'every night': 'Every Night',
    'as needed': 'As Needed (PRN)',
    'weekly': 'Weekly',
    'monthly': 'Monthly',
};

function formatFrequency(freq: string | null): string {
    if (!freq) return '—';
    return dayMapping[freq.toLowerCase()] || freq;
}

export default function AppointmentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState<Appointment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        const fetchAppointment = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const res = await bprApi.appointments.show(parseInt(id));
                setAppointment(res.data);
            } catch (err: any) {
                if (err?.response?.status === 404) {
                    setError('Appointment not found.');
                } else {
                    setError('Failed to load appointment details.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAppointment();
    }, [id]);

    const handleCancel = async () => {
        if (!appointment) return;
        setCancelling(true);
        try {
            const res = await bprApi.appointments.cancel(appointment.id, {
                cancellation_reason: cancelReason || undefined,
            });
            setAppointment(res.data.appointment);
            setShowCancelDialog(false);
            setCancelReason('');
        } catch (err) {
            console.error('Cancel failed', err);
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="shimmer h-8 w-48 rounded-lg" />
                <div className="shimmer h-48 rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="shimmer h-64 rounded-2xl" />
                    <div className="shimmer h-64 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
                    <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
                    <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{error || 'Appointment not found'}</h2>
                    <p className="text-[var(--text-secondary)] mb-6">The appointment you're looking for doesn't exist or you don't have access.</p>
                    <Button onClick={() => navigate('/dashboard/appointments')}>
                        <ArrowLeft size={16} />
                        Back to My Appointments
                    </Button>
                </motion.div>
            </div>
        );
    }

    const statusInfo = statusConfig[appointment.status] || statusConfig.scheduled;
    const aptDate = new Date(appointment.appointment_date + 'T' + (appointment.start_time || '00:00'));
    const reports = appointment.medical_reports || [];
    const prescriptions = appointment.prescriptions || [];

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-4xl mx-auto space-y-6">
            {/* Back Navigation */}
            <motion.div variants={fadeInUp}>
                <button
                    onClick={() => navigate('/dashboard/appointments')}
                    className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to My Appointments
                </button>
            </motion.div>

            {/* Header Card */}
            <motion.div variants={fadeInUp}>
                <Card className="overflow-hidden">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-sky-600/5" />
                        <CardContent className="relative p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                                        <CalendarCheck className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Appointment #{appointment.id}</h1>
                                            <Badge variant={statusInfo.variant} dot>
                                                {statusInfo.label}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-secondary)] flex-wrap">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={15} />
                                                {aptDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={15} />
                                                {appointment.start_time}
                                                {appointment.end_time && ` - ${appointment.end_time}`}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] mt-2">
                                            Booked on {new Date(appointment.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {appointment.can_be_cancelled && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setShowCancelDialog(true)}
                                        >
                                            <XCircle size={15} />
                                            Cancel Appointment
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left - 2/3: Doctor & Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Doctor Info */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <Stethoscope size={16} className="text-blue-500" />
                                    <CardTitle>Doctor & Schedule</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-5">
                                    <Avatar className="h-16 w-16 ring-2 ring-[var(--border)]">
                                        <AvatarFallback>{appointment.doctor?.name?.charAt(0) || 'D'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                                            {appointment.doctor?.name || 'Doctor'}
                                        </h3>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            {appointment.doctor?.specialization || 'General'}
                                        </p>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                                            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                                <p className="text-[10px] text-[var(--text-muted)] uppercase font-medium">Date</p>
                                                <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">
                                                    {aptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                                <p className="text-[10px] text-[var(--text-muted)] uppercase font-medium">Time</p>
                                                <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{appointment.start_time}</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                                <p className="text-[10px] text-[var(--text-muted)] uppercase font-medium">Type</p>
                                                <p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5 capitalize">{appointment.appointment_type}</p>
                                            </div>
                                        </div>
                                        {appointment.doctor?.qualification && (
                                            <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                                                <Info size={11} />
                                                <span>{appointment.doctor.qualification}</span>
                                                {appointment.doctor.experience_years > 0 && (
                                                    <span>· {appointment.doctor.experience_years}+ years experience</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Symptoms & Notes */}
                    {appointment.symptoms && (
                        <motion.div variants={fadeInUp}>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle>Symptoms</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-[var(--text-primary)] leading-relaxed">{appointment.symptoms}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {appointment.cancellation_reason && (
                        <motion.div variants={fadeInUp}>
                            <Card className="border-red-200 dark:border-red-500/20">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={16} className="text-red-500" />
                                        <CardTitle className="text-red-600 dark:text-red-400">Cancellation Reason</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-red-700 dark:text-red-300">{appointment.cancellation_reason}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* Medical Reports */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText size={16} className="text-amber-500" />
                                    <CardTitle>Medical Reports ({reports.length})</CardTitle>
                                </div>
                                <Link
                                    to="/dashboard/medical-records"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                                >
                                    View All <ChevronRight size={15} />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {reports.length === 0 ? (
                                    <div className="text-center py-8">
                                        <FileText className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
                                        <p className="text-sm text-[var(--text-secondary)]">No reports linked to this appointment</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {reports.map((report) => {
                                            const typeInfo = reportTypeConfig[report.report_type] || reportTypeConfig.other;
                                            const TypeIcon = typeInfo.icon;
                                            return (
                                                <motion.div
                                                    key={report.id}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--border-accent)] hover:bg-[var(--bg-tertiary)] transition-all duration-200"
                                                >
                                                    <div className="flex items-center gap-3.5">
                                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeInfo.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                                                            <TypeIcon className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-[var(--text-primary)]">{report.report_title}</p>
                                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text-secondary)]">
                                                                <span>{new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                                <Badge variant="secondary">
                                                                    {report.report_type.charAt(0).toUpperCase() + report.report_type.slice(1)}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        {report.file_path && (
                                                            <Button variant="ghost" size="sm">
                                                                <Download size={14} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Prescriptions */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ClipboardList size={16} className="text-emerald-500" />
                                    <CardTitle>Prescriptions ({prescriptions.length})</CardTitle>
                                </div>
                                <Link
                                    to="/dashboard/prescriptions"
                                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                                >
                                    View All <ChevronRight size={15} />
                                </Link>
                            </CardHeader>
                            <CardContent>
                                {prescriptions.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ClipboardList className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
                                        <p className="text-sm text-[var(--text-secondary)]">No prescriptions linked to this appointment</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {prescriptions.map((prescription) => (
                                            <motion.div
                                                key={prescription.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)]"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Pill size={15} className="text-emerald-500" />
                                                        <p className="font-semibold text-sm text-[var(--text-primary)]">
                                                            Prescription #{prescription.id}
                                                        </p>
                                                        <Badge variant={
                                                            prescription.status === 'active' ? 'success' :
                                                            prescription.status === 'completed' ? 'secondary' : 'danger'
                                                        }>
                                                            {prescription.status}
                                                        </Badge>
                                                    </div>
                                                    <span className="text-xs text-[var(--text-muted)]">
                                                        {prescription.items?.length || 0} medicines
                                                    </span>
                                                </div>

                                                {prescription.diagnosis && (
                                                    <p className="text-sm text-[var(--text-secondary)] mb-3">
                                                        <span className="font-medium text-[var(--text-primary)]">Diagnosis:</span> {prescription.diagnosis}
                                                    </p>
                                                )}

                                                <div className="space-y-1.5">
                                                    {prescription.items?.map((item) => (
                                                        <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <Pill size={12} className="text-emerald-500 shrink-0" />
                                                                <span className="text-sm font-medium text-[var(--text-primary)]">{item.medicine_name}</span>
                                                                {item.dosage && (
                                                                    <span className="text-xs text-[var(--text-muted)]">{item.dosage}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] shrink-0">
                                                                {item.frequency && <span>{formatFrequency(item.frequency)}</span>}
                                                                {item.duration && <span>for {item.duration}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {prescription.follow_up_date && (
                                                    <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                                                        <Calendar size={11} />
                                                        Follow-up: {new Date(prescription.follow_up_date).toLocaleDateString('en-US', {
                                                            month: 'long', day: 'numeric', year: 'numeric',
                                                        })}
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Right - 1/3: Patient Info & Quick Actions */}
                <div className="space-y-6">
                    {/* Patient Info */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-2">
                                    <User size={16} className="text-blue-500" />
                                    <CardTitle>Patient Information</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>{appointment.patient?.full_name?.charAt(0) || 'P'}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm text-[var(--text-primary)]">
                                                {appointment.patient?.full_name || 'Patient'}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">ID: {appointment.patient?.patient_id}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-1">
                                        {appointment.patient?.phone && (
                                            <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                                                <Phone size={14} className="text-[var(--text-muted)]" />
                                                <span>{appointment.patient.phone}</span>
                                            </div>
                                        )}
                                        {appointment.patient?.email && (
                                            <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                                                <Mail size={14} className="text-[var(--text-muted)]" />
                                                <span className="truncate">{appointment.patient.email}</span>
                                            </div>
                                        )}
                                        {appointment.patient?.gender && (
                                            <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)]">
                                                <User size={14} className="text-[var(--text-muted)]" />
                                                <span className="capitalize">{appointment.patient.gender}</span>
                                                {appointment.patient.blood_group && (
                                                    <Badge variant="outline">{appointment.patient.blood_group}</Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link to="/dashboard/appointments/book">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Calendar className="w-4 h-4" />
                                        Book Another Appointment
                                    </Button>
                                </Link>
                                <Link to="/dashboard/medical-records">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="w-4 h-4" />
                                        View All Medical Reports
                                    </Button>
                                </Link>
                                <Link to="/dashboard/prescriptions">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ClipboardList className="w-4 h-4" />
                                        View All Prescriptions
                                    </Button>
                                </Link>
                                {appointment.can_be_cancelled && (
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                                        onClick={() => setShowCancelDialog(true)}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Cancel This Appointment
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Status Timeline */}
                    <motion.div variants={fadeInUp}>
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle>Appointment Timeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-0">
                                    {[
                                        { label: 'Booked', time: new Date(appointment.created_at), done: true },
                                        { label: 'Scheduled', time: aptDate, done: appointment.status !== 'scheduled' },
                                        { label: statusInfo.label, time: null, done: appointment.status === 'completed' || appointment.status === 'checked_in' || appointment.status === 'confirmed' },
                                    ].map((step, i) => (
                                        <div key={step.label} className="flex items-start gap-3 pb-4 last:pb-0 relative">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full border-2 ${
                                                    step.done ? 'bg-emerald-500 border-emerald-500' : 'bg-[var(--bg-secondary)] border-[var(--border)]'
                                                } z-10`} />
                                                {i < 2 && (
                                                    <div className={`w-0.5 h-full absolute top-3 left-[5px] ${
                                                        step.done ? 'bg-emerald-500/30' : 'bg-[var(--border)]'
                                                    }`} />
                                                )}
                                            </div>
                                            <div className="pt-0.5">
                                                <p className={`text-sm font-medium ${
                                                    step.done ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                                                }`}>
                                                    {step.label}
                                                </p>
                                                {step.time && (
                                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                                        {step.time.toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric',
                                                            ...(step.label === 'Booked' ? { hour: '2-digit', minute: '2-digit' } : {}),
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            {/* Cancel Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your appointment with {appointment.doctor?.name} on{' '}
                            {aptDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {appointment.start_time}?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-[var(--text-secondary)]">
                            Reason for cancellation (optional)
                        </label>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                            placeholder="Let us know why you're cancelling..."
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Keep Appointment</Button>
                        <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                            {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                            Yes, Cancel Appointment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
