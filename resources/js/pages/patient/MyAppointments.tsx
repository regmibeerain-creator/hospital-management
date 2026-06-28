import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '../../components/ui/dialog';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import bprApi from '../../lib/bpr-api';
import type { Appointment } from '../../lib/bpr-api';
import {
    Calendar,
    Clock,
    Stethoscope,
    XCircle,
    Loader2,
    ChevronRight,
} from 'lucide-react';

const statusConfig: Record<string, { variant: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary'; label: string }> = {
    scheduled: { variant: 'default', label: 'Scheduled' },
    confirmed: { variant: 'success', label: 'Confirmed' },
    checked_in: { variant: 'warning', label: 'Checked In' },
    completed: { variant: 'outline', label: 'Completed' },
    cancelled: { variant: 'danger', label: 'Cancelled' },
    no_show: { variant: 'danger', label: 'No Show' },
};

const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-500',
    confirmed: 'bg-emerald-500',
    checked_in: 'bg-amber-500',
    completed: 'bg-gray-400',
    cancelled: 'bg-red-500',
    no_show: 'bg-red-500',
};

export default function MyAppointments() {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [cancelModal, setCancelModal] = useState<Appointment | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    const fetchAppointments = async (scope?: 'upcoming' | 'past') => {
        setLoading(true);
        try {
            const res = await bprApi.appointments.my(scope ? { scope } : {});
            setAppointments(res.data.data);
        } catch (err) {
            console.error('Failed to load appointments', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments(activeTab === 'upcoming' ? 'upcoming' : 'past');
    }, [activeTab]);

    const handleCancel = async () => {
        if (!cancelModal) return;
        setCancelling(true);
        try {
            await bprApi.appointments.cancel(cancelModal.id, {
                cancellation_reason: cancelReason || undefined,
            });
            setCancelModal(null);
            setCancelReason('');
            fetchAppointments(activeTab === 'upcoming' ? 'upcoming' : 'past');
        } catch (err) {
            console.error('Cancel failed', err);
        } finally {
            setCancelling(false);
        }
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Calendar className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">My Appointments</h1>
                    <p className="text-sm text-[var(--text-secondary)]">View and manage your appointments</p>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={fadeInUp}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                        <TabsTrigger value="past">Past</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-4 space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="shimmer h-32 rounded-2xl" />
                                ))}
                            </div>
                        ) : appointments.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <Calendar className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                                    <p className="text-[var(--text-secondary)] font-medium">
                                        No {activeTab} appointments
                                    </p>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">
                                        {activeTab === 'upcoming' ? 'Book your first appointment to get started.' : 'Your past appointments will appear here.'}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            appointments.map((apt, i) => {
                                const statusInfo = statusConfig[apt.status] || statusConfig.scheduled;
                                const day = new Date(apt.appointment_date + 'T' + (apt.start_time || '00:00'));
                                const isCancellable = apt.can_be_cancelled;

                                return (
                                    <motion.div
                                        key={apt.id}
                                        variants={fadeInUp}
                                        className="group cursor-pointer"
                                        onClick={() => navigate(`/dashboard/appointments/${apt.id}`)}
                                    >
                                        <Card
                                            className="hover:border-[var(--border-accent)] transition-all duration-200"
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex items-start gap-4">
                                                    {/* Date Badge */}
                                                    <div className="hidden sm:flex flex-col items-center min-w-[60px] py-2 px-3 rounded-xl bg-[var(--bg-tertiary)]">
                                                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase">
                                                            {day.toLocaleDateString('en-US', { month: 'short' })}
                                                        </span>
                                                        <span className="text-2xl font-bold text-[var(--text-primary)]">
                                                            {day.getDate()}
                                                        </span>
                                                    </div>

                                                    {/* Doctor Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="font-semibold text-[var(--text-primary)]">
                                                                {apt.doctor?.name || 'Doctor'}
                                                            </h3>
                                                            <Badge variant={statusInfo.variant}>
                                                                {statusInfo.label}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1.5 text-sm text-[var(--text-secondary)] flex-wrap">
                                                            <span className="flex items-center gap-1.5">
                                                                <Stethoscope size={14} />
                                                                {apt.doctor?.specialization || 'General'}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock size={14} />
                                                                {apt.start_time}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar size={14} />
                                                                {new Date(apt.appointment_date).toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                })}
                                                            </span>
                                                        </div>
                                                        {apt.symptoms && (
                                                            <p className="text-sm text-[var(--text-muted)] mt-2 truncate">
                                                                <span className="font-medium">Symptoms:</span> {apt.symptoms}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                                        {isCancellable && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                                onClick={() => setCancelModal(apt)}
                                                            >
                                                                <XCircle size={15} />
                                                                Cancel
                                                            </Button>
                                                        )}
                                                        <ChevronRight size={18} className="text-[var(--text-muted)]" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* Cancel Modal */}
            <Dialog open={!!cancelModal} onOpenChange={() => setCancelModal(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Appointment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel your appointment with {cancelModal?.doctor?.name} on{' '}
                            {cancelModal ? new Date(cancelModal.appointment_date).toLocaleDateString() : ''} at {cancelModal?.start_time}?
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
                        <Button variant="outline" onClick={() => setCancelModal(null)}>Keep Appointment</Button>
                        <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                            {cancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                            Yes, Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
