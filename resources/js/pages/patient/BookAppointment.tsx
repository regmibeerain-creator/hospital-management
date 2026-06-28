import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback } from '../../components/ui/Avatar';
import { ScrollArea } from '../../components/ui/scroll-area';
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
import type { Doctor, AvailableSlot } from '../../lib/bpr-api';
import {
    Search,
    Stethoscope,
    MapPin,
    Clock,
    DollarSign,
    Award,
    ChevronRight,
    Calendar,
    CheckCircle2,
    Loader2,
    X,
    Sparkles,
    ArrowLeft,
} from 'lucide-react';

export default function BookAppointment() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [specialization, setSpecialization] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [slots, setSlots] = useState<AvailableSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [symptoms, setSymptoms] = useState('');
    const [booking, setBooking] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const fetchDoctors = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {};
            if (search) params.search = search;
            if (specialization) params.specialization = specialization;
            params.per_page = 50;
            const res = await bprApi.doctors.list(params);
            setDoctors(res.data.data);
        } catch (err) {
            console.error('Failed to load doctors', err);
        } finally {
            setLoading(false);
        }
    }, [search, specialization]);

    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]);

    const fetchSlots = useCallback(async (doctorId: number, date: string) => {
        if (!date) return;
        setLoadingSlots(true);
        setSelectedSlot(null);
        try {
            const res = await bprApi.doctors.availableSlots(doctorId, date);
            setSlots(res.data.slots);
        } catch (err) {
            console.error('Failed to load slots', err);
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    }, []);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            fetchSlots(selectedDoctor.id, selectedDate);
        }
    }, [selectedDoctor, selectedDate, fetchSlots]);

    const handleBook = async () => {
        if (!selectedDoctor || !selectedDate || !selectedSlot) return;
        setBooking(true);
        try {
            await bprApi.appointments.book({
                doctor_id: selectedDoctor.id,
                appointment_date: selectedDate,
                start_time: selectedSlot,
                symptoms: symptoms || undefined,
            });
            setShowConfirm(false);
            setShowSuccess(true);
            setTimeout(() => {
                navigate('/dashboard/appointments');
            }, 2000);
        } catch (err: any) {
            console.error('Booking failed', err);
            alert(err?.response?.data?.message || 'Failed to book appointment. Please try again.');
        } finally {
            setBooking(false);
        }
    };

    const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))] as string[];
    const minDate = new Date().toISOString().split('T')[0];

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Calendar className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Book Appointment</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Find a doctor and schedule your visit</p>
                </div>
            </motion.div>

            {!showSuccess ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left - Doctor Selection */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Search & Filters */}
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    icon={<Search size={15} />}
                                    placeholder="Search doctors by name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <select
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                className="h-10 px-3.5 rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                            >
                                <option value="">All Specializations</option>
                                {specializations.map((s) => (
                                    <option key={s} value={s!}>{s}</option>
                                ))}
                            </select>
                        </motion.div>

                        {/* Doctor List */}
                        <ScrollArea className="h-[600px]">
                            <div className="space-y-3 pr-3">
                                {loading ? (
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="shimmer h-28 rounded-2xl" />
                                        ))}
                                    </div>
                                ) : doctors.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Stethoscope className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                                        <p className="text-[var(--text-secondary)] font-medium">No doctors found</p>
                                        <p className="text-sm text-[var(--text-muted)] mt-1">Try adjusting your search or filters</p>
                                    </div>
                                ) : (
                                    doctors.map((doctor) => {
                                        const isSelected = selectedDoctor?.id === doctor.id;
                                        return (
                                            <motion.div
                                                key={doctor.id}
                                                variants={fadeInUp}
                                                whileHover={{ y: -2 }}
                                                onClick={() => {
                                                    setSelectedDoctor(doctor);
                                                    setSelectedDate('');
                                                    setSelectedSlot(null);
                                                    setSlots([]);
                                                }}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                                                    isSelected
                                                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5 shadow-md'
                                                        : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-blue-300 hover:shadow-sm'
                                                }`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <Avatar className="h-14 w-14 ring-2 ring-[var(--border)]">
                                                        <AvatarFallback>{doctor.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="font-semibold text-[var(--text-primary)]">{doctor.name}</h3>
                                                            {doctor.experience_years > 0 && (
                                                                <Badge variant="default">
                                                                    <Award size={11} className="mr-1" />
                                                                    {doctor.experience_years}+ yrs
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-sm text-[var(--text-secondary)]">
                                                            <Stethoscope size={14} />
                                                            <span>{doctor.specialization || 'General'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                                                            <span className="flex items-center gap-1">
                                                                <DollarSign size={12} />
                                                                Fee: ${doctor.consultation_fee}
                                                            </span>
                                                            {doctor.qualification && (
                                                                <span className="flex items-center gap-1 truncate">
                                                                    <Award size={12} />
                                                                    {doctor.qualification}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ChevronRight
                                                        size={18}
                                                        className={`mt-1 transition-colors ${
                                                            isSelected ? 'text-blue-500' : 'text-[var(--text-muted)]'
                                                        }`}
                                                    />
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Right - Booking Panel */}
                    <div className="space-y-4">
                        <motion.div variants={fadeInUp}>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle>Book Appointment</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {!selectedDoctor ? (
                                        <div className="text-center py-8">
                                            <Stethoscope className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
                                            <p className="text-sm text-[var(--text-secondary)]">Select a doctor to book</p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Selected Doctor */}
                                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-500/5 dark:to-sky-500/5 border border-blue-100 dark:border-blue-500/10">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarFallback>{selectedDoctor.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-sm text-[var(--text-primary)]">{selectedDoctor.name}</p>
                                                        <p className="text-xs text-[var(--text-secondary)]">{selectedDoctor.specialization || 'General'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Date Picker */}
                                            <div>
                                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Select Date</label>
                                                <Input
                                                    icon={<Calendar size={15} />}
                                                    type="date"
                                                    value={selectedDate}
                                                    min={minDate}
                                                    onChange={(e) => setSelectedDate(e.target.value)}
                                                />
                                            </div>

                                            {/* Time Slots */}
                                            {selectedDate && (
                                                <div>
                                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Available Slots</label>
                                                    {loadingSlots ? (
                                                        <div className="flex items-center justify-center py-6">
                                                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                                        </div>
                                                    ) : slots.length === 0 ? (
                                                        <div className="text-center py-4 rounded-xl bg-[var(--bg-tertiary)]">
                                                            <Clock className="w-6 h-6 mx-auto text-[var(--text-muted)] mb-1" />
                                                            <p className="text-xs text-[var(--text-secondary)]">No slots available</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {slots.map((slot) => (
                                                                <button
                                                                    key={slot.start_time}
                                                                    onClick={() => setSelectedSlot(slot.start_time)}
                                                                    className={`py-2.5 px-2 rounded-xl text-xs font-medium border transition-all ${
                                                                        selectedSlot === slot.start_time
                                                                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                                                                            : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-blue-300 hover:bg-blue-50/50'
                                                                    }`}
                                                                >
                                                                    {slot.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Symptoms */}
                                            {selectedSlot && (
                                                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                                                        Symptoms (optional)
                                                    </label>
                                                    <textarea
                                                        value={symptoms}
                                                        onChange={(e) => setSymptoms(e.target.value)}
                                                        rows={3}
                                                        placeholder="Briefly describe your symptoms..."
                                                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-tertiary)] px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all resize-none"
                                                    />
                                                </motion.div>
                                            )}

                                            {/* Book Button */}
                                            <Button
                                                className="w-full"
                                                disabled={!selectedSlot || booking}
                                                onClick={() => setShowConfirm(true)}
                                            >
                                                {booking ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Calendar className="w-4 h-4" />
                                                )}
                                                {booking ? 'Booking...' : 'Confirm Booking'}
                                            </Button>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            ) : (
                /* Success Message */
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Card>
                        <CardContent className="py-16 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20"
                            >
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Appointment Booked!</h2>
                            <p className="text-[var(--text-secondary)] mb-2">
                                Your appointment with <strong>{selectedDoctor?.name}</strong> has been confirmed.
                            </p>
                            <p className="text-sm text-[var(--text-muted)]">
                                Redirecting to your appointments...
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Appointment</DialogTitle>
                        <DialogDescription>Please review your appointment details below.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)]">
                            <Stethoscope size={16} className="text-blue-500" />
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">{selectedDoctor?.name}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{selectedDoctor?.specialization || 'General'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-tertiary)]">
                            <Calendar size={16} className="text-emerald-500" />
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">{selectedDate}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{selectedSlot}</p>
                            </div>
                        </div>
                        {symptoms && (
                            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                <p className="text-xs text-[var(--text-secondary)] mb-1">Symptoms</p>
                                <p className="text-sm text-[var(--text-primary)]">{symptoms}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                        <Button onClick={handleBook} disabled={booking}>
                            {booking && <Loader2 className="w-4 h-4 animate-spin" />}
                            Confirm & Book
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
