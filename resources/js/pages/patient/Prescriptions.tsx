import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../../components/ui/dialog';

import { fadeInUp, staggerContainer } from '../../lib/animations';
import bprApi from '../../lib/bpr-api';
import type { Prescription } from '../../lib/bpr-api';
import {
    ClipboardList,
    Pill,
    Calendar,
    Stethoscope,
    ChevronRight,
    Clock,
    Info,
    Download,
} from 'lucide-react';

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'secondary'; label: string; color: string }> = {
    active: { variant: 'success', label: 'Active', color: 'text-emerald-500' },
    completed: { variant: 'secondary', label: 'Completed', color: 'text-gray-400' },
    cancelled: { variant: 'danger', label: 'Cancelled', color: 'text-red-500' },
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

export default function Prescriptions() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [detailModal, setDetailModal] = useState<Prescription | null>(null);

    const fetchPrescriptions = async (status?: string) => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {};
            if (status === 'active') {
                const res = await bprApi.prescriptions.active();
                setPrescriptions(res.data.data);
                return;
            }
            if (status && status !== 'all') params.status = status;
            params.per_page = 50;
            const res = await bprApi.prescriptions.list(params);
            setPrescriptions(res.data.data);
        } catch (err) {
            console.error('Failed to load prescriptions', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrescriptions(activeTab);
    }, [activeTab]);

    const getMedicineCount = (prescription: Prescription): number => {
        return prescription.items?.length || 0;
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <ClipboardList className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Prescriptions</h1>
                    <p className="text-sm text-[var(--text-secondary)]">View and manage your prescriptions</p>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={fadeInUp}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-4 space-y-3">
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="shimmer h-28 rounded-2xl" />
                                ))}
                            </div>
                        ) : prescriptions.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <ClipboardList className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                                    <p className="text-[var(--text-secondary)] font-medium">No prescriptions found</p>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">Your prescriptions will appear here once prescribed by your doctor.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            prescriptions.map((prescription) => {
                                const statusInfo = statusConfig[prescription.status] || statusConfig.active;

                                return (
                                    <motion.div
                                        key={prescription.id}
                                        variants={fadeInUp}
                                        className="group"
                                    >
                                        <Card
                                            className="cursor-pointer hover:border-[var(--border-accent)] transition-all duration-200 overflow-hidden"
                                            onClick={() => setDetailModal(prescription)}
                                        >
                                            <CardContent className="p-0">
                                                <div className="p-5">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <h3 className="font-semibold text-[var(--text-primary)]">
                                                                    Prescription #{prescription.id}
                                                                </h3>
                                                                <Badge variant={statusInfo.variant}>
                                                                    {statusInfo.label}
                                                                </Badge>
                                                                <Badge variant="outline">
                                                                    {getMedicineCount(prescription)} medicines
                                                                </Badge>
                                                            </div>

                                                            <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-secondary)] flex-wrap">
                                                                <span className="flex items-center gap-1.5">
                                                                    <Stethoscope size={14} />
                                                                    {prescription.doctor?.name || 'Doctor'}
                                                                </span>
                                                                <span className="flex items-center gap-1.5">
                                                                    <Calendar size={14} />
                                                                    {new Date(prescription.created_at).toLocaleDateString('en-US', {
                                                                        month: 'short', day: 'numeric', year: 'numeric',
                                                                    })}
                                                                </span>
                                                            </div>

                                                            {prescription.diagnosis && (
                                                                <p className="text-sm text-[var(--text-muted)] mt-2 truncate">
                                                                    <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
                                                                </p>
                                                            )}

                                                            {prescription.follow_up_date && (
                                                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                                                                    <Clock size={11} />
                                                                    Follow-up: {new Date(prescription.follow_up_date).toLocaleDateString('en-US', {
                                                                        month: 'short', day: 'numeric', year: 'numeric',
                                                                    })}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <ChevronRight size={18} className="text-[var(--text-muted)] mt-1 shrink-0" />
                                                    </div>
                                                </div>

                                                {/* Medicine Preview */}
                                                {prescription.items && prescription.items.length > 0 && (
                                                    <div className="border-t border-[var(--border)] bg-[var(--bg-tertiary)] px-5 py-2.5">
                                                        <div className="flex items-center gap-3 overflow-x-auto">
                                                            <Pill size={14} className="text-[var(--text-muted)] shrink-0" />
                                                            {prescription.items.slice(0, 3).map((item) => (
                                                                <span key={item.id} className="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap px-2.5 py-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                                                                    {item.medicine_name}
                                                                    {item.dosage && ` ${item.dosage}`}
                                                                </span>
                                                            ))}
                                                            {prescription.items.length > 3 && (
                                                                <span className="text-xs text-[var(--text-muted)] font-medium shrink-0">
                                                                    +{prescription.items.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })
                        )}
                    </TabsContent>
                </Tabs>
            </motion.div>

            {/* Detail Modal */}
            <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
                <DialogContent className="sm:max-w-2xl">
                    {detailModal && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <DialogTitle>Prescription #{detailModal.id}</DialogTitle>
                                        <DialogDescription>
                                            Prescribed by {detailModal.doctor?.name || 'Doctor'} on{' '}
                                            {new Date(detailModal.created_at).toLocaleDateString('en-US', {
                                                month: 'long', day: 'numeric', year: 'numeric',
                                            })}
                                        </DialogDescription>
                                    </div>
                                    <Badge variant={statusConfig[detailModal.status]?.variant || 'secondary'}>
                                        {statusConfig[detailModal.status]?.label || detailModal.status}
                                    </Badge>
                                </div>
                            </DialogHeader>

                            <div className="space-y-4">
                                {/* Diagnosis */}
                                {detailModal.diagnosis && (
                                    <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                        <p className="text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wider">Diagnosis</p>
                                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{detailModal.diagnosis}</p>
                                    </div>
                                )}

                                {/* Medicines */}
                                <div>
                                    <p className="text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider flex items-center gap-1.5">
                                        <Pill size={12} />
                                        Prescribed Medicines ({detailModal.items?.length || 0})
                                    </p>
                                    <div className="space-y-2">
                                        {detailModal.items?.map((item, index) => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, x: -8 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="p-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <Pill size={14} className="text-emerald-500 shrink-0" />
                                                            <p className="font-semibold text-sm text-[var(--text-primary)]">
                                                                {item.medicine_name}
                                                            </p>
                                                            {item.is_required_medicine && (
                                                                <Badge variant="warning" className="text-[10px] px-1.5 py-0">Required</Badge>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5">
                                                            {item.dosage && (
                                                                <div className="text-center p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                                                                    <p className="text-[10px] text-[var(--text-muted)] uppercase">Dosage</p>
                                                                    <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{item.dosage}</p>
                                                                </div>
                                                            )}
                                                            {item.frequency && (
                                                                <div className="text-center p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                                                                    <p className="text-[10px] text-[var(--text-muted)] uppercase">Frequency</p>
                                                                    <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">
                                                                        {formatFrequency(item.frequency)}
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {item.duration && (
                                                                <div className="text-center p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                                                                    <p className="text-[10px] text-[var(--text-muted)] uppercase">Duration</p>
                                                                    <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{item.duration}</p>
                                                                </div>
                                                            )}
                                                            {item.quantity > 0 && (
                                                                <div className="text-center p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                                                                    <p className="text-[10px] text-[var(--text-muted)] uppercase">Qty</p>
                                                                    <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{item.quantity}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {item.instructions && (
                                                            <div className="mt-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                                                                <p className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                                                    <Info size={10} />
                                                                    {item.instructions}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Follow-up */}
                                {detailModal.notes && (
                                    <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]">
                                        <p className="text-xs text-[var(--text-muted)] mb-1 font-medium uppercase tracking-wider">Notes</p>
                                        <p className="text-sm text-[var(--text-primary)]">{detailModal.notes}</p>
                                    </div>
                                )}

                                {detailModal.follow_up_date && (
                                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
                                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wider mb-1">Follow-up Appointment</p>
                                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                            {new Date(detailModal.follow_up_date).toLocaleDateString('en-US', {
                                                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button variant="outline" className="flex-1">
                                        <Download size={14} />
                                        Download PDF
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
