import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import { fadeInUp, staggerContainer } from '../../lib/animations';
import bprApi from '../../lib/bpr-api';
import type { MedicalReport } from '../../lib/bpr-api';
import {
    FileText,
    FlaskConical,
    Scan,
    Activity,
    Download,
    Eye,
    Loader2,
    Calendar,
    Stethoscope,
    ChevronRight,
    FolderOpen,
} from 'lucide-react';

const typeConfig: Record<string, { label: string; icon: React.ElementType; gradient: string }> = {
    lab: { label: 'Lab Reports', icon: FlaskConical, gradient: 'from-amber-500 to-orange-500' },
    radiology: { label: 'Radiology Reports', icon: Scan, gradient: 'from-indigo-500 to-violet-500' },
    pathology: { label: 'Pathology Reports', icon: Activity, gradient: 'from-rose-500 to-pink-500' },
    surgery: { label: 'Surgery Reports', icon: Activity, gradient: 'from-red-500 to-rose-500' },
    other: { label: 'Other Reports', icon: FileText, gradient: 'from-gray-500 to-slate-500' },
};

const pathToType: Record<string, string> = {
    'lab-reports': 'lab',
    'radiology-reports': 'radiology',
    'medical-records': 'all',
};

export default function MedicalReports() {
    const location = useLocation();
    const currentPath = location.pathname.split('/').pop() || '';

    const [reports, setReports] = useState<MedicalReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeType, setActiveType] = useState(pathToType[currentPath] || 'all');
    const [summary, setSummary] = useState<Record<string, number> | null>(null);
    const [detailModal, setDetailModal] = useState<MedicalReport | null>(null);

    const fetchReports = async (type?: string) => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {};
            if (type && type !== 'all') params.report_type = type;
            params.per_page = 50;
            const res = await bprApi.medicalReports.list(params);
            setReports(res.data.data);
        } catch (err) {
            console.error('Failed to load reports', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await bprApi.medicalReports.summary();
            setSummary(res.data.by_type);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        fetchSummary();
    }, []);

    useEffect(() => {
        fetchReports(activeType);
    }, [activeType]);

    const reportTypes = [
        { value: 'all', label: 'All Reports', icon: FolderOpen, gradient: 'from-blue-600 to-sky-500', count: reports.length },
        ...Object.entries(typeConfig).map(([key, config]) => ({
            value: key,
            label: config.label,
            icon: config.icon,
            gradient: config.gradient,
            count: summary?.[key] || 0,
        })),
    ];

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <motion.div variants={fadeInUp} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <FileText className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Medical Reports</h1>
                    <p className="text-sm text-[var(--text-secondary)]">View and download your medical reports</p>
                </div>
            </motion.div>

            {/* Type Cards */}
            <motion.div variants={fadeInUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {reportTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                        <button
                            key={type.value}
                            onClick={() => setActiveType(type.value)}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                                activeType === type.value
                                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5 shadow-md'
                                    : 'border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--border-accent)] hover:shadow-sm'
                            }`}
                        >
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-2 shadow-sm`}>
                                <Icon className="w-4.5 h-4.5 text-white" />
                            </div>
                            <p className="text-xs font-semibold text-[var(--text-primary)] leading-tight">{type.label}</p>
                            <p className="text-lg font-bold text-[var(--text-primary)] mt-1">{type.count}</p>
                        </button>
                    );
                })}
            </motion.div>

            {/* Report List */}
            <motion.div variants={fadeInUp}>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>
                            {reportTypes.find((t) => t.value === activeType)?.label || 'All Reports'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="shimmer h-20 rounded-xl" />
                                ))}
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                                <p className="text-[var(--text-secondary)] font-medium">No reports found</p>
                                <p className="text-sm text-[var(--text-muted)] mt-1">Your medical reports will appear here once available.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {reports.map((report) => {
                                    const typeInfo = typeConfig[report.report_type] || typeConfig.other;
                                    const TypeIcon = typeInfo.icon;

                                    return (
                                        <motion.div
                                            key={report.id}
                                            variants={fadeInUp}
                                            whileHover={{ x: 3 }}
                                            className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] hover:border-[var(--border-accent)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-all duration-200 cursor-pointer group"
                                            onClick={() => setDetailModal(report)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeInfo.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                                                    <TypeIcon className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm text-[var(--text-primary)]">
                                                        {report.report_title}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)]">
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={11} />
                                                            {new Date(report.created_at).toLocaleDateString('en-US', {
                                                                month: 'short', day: 'numeric', year: 'numeric',
                                                            })}
                                                        </span>
                                                        {report.doctor && (
                                                            <span className="flex items-center gap-1">
                                                                <Stethoscope size={11} />
                                                                {report.doctor.name}
                                                            </span>
                                                        )}
                                                        <Badge variant="secondary">
                                                            {typeInfo.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setDetailModal(report);
                                                    }}
                                                >
                                                    <Eye size={15} />
                                                    View
                                                </Button>
                                                {report.file_path && (
                                                    <Button variant="ghost" size="sm">
                                                        <Download size={15} />
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

            {/* Detail Modal */}
            <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
                <DialogContent className="sm:max-w-lg">
                    {detailModal && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{detailModal.report_title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                                        typeConfig[detailModal.report_type]?.gradient || 'from-gray-500 to-slate-500'
                                    } flex items-center justify-center`}>
                                        {(() => {
                                            const Icon = typeConfig[detailModal.report_type]?.icon || FileText;
                                            return <Icon className="w-5 h-5 text-white" />;
                                        })()}
                                    </div>
                                    <div>
                                        <Badge variant="secondary">
                                            {typeConfig[detailModal.report_type]?.label || 'Other'}
                                        </Badge>
                                        <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                            {new Date(detailModal.created_at).toLocaleDateString('en-US', {
                                                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {detailModal.doctor && (
                                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                        <p className="text-xs text-[var(--text-muted)] mb-1">Reported by</p>
                                        <p className="text-sm font-medium text-[var(--text-primary)]">{detailModal.doctor.name}</p>
                                        <p className="text-xs text-[var(--text-secondary)]">{detailModal.doctor.specialization}</p>
                                    </div>
                                )}

                                {detailModal.description && (
                                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                        <p className="text-xs text-[var(--text-muted)] mb-1">Description</p>
                                        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{detailModal.description}</p>
                                    </div>
                                )}

                                {detailModal.notes && (
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                                        <p className="text-xs text-blue-500 mb-1">Clinical Notes</p>
                                        <p className="text-sm text-blue-900 dark:text-blue-300">{detailModal.notes}</p>
                                    </div>
                                )}

                                {detailModal.file_path && (
                                    <Button className="w-full" variant="gradient">
                                        <Download size={16} />
                                        Download Report
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
