import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { fadeInUp } from '../../../lib/animations';
import {
    Calendar,
    Users,
    Stethoscope,
    Building2,
    IdCard,
    Pill,
    FlaskConical,
    Scan,
    Receipt,
    ShieldCheck,
    BarChart3,
    Settings,
    ScrollText,
    UserPlus,
    DoorOpen,
    Bell,
    FileText,
    ClipboardList,
    Search,
    StickyNote,
    Activity,
    Syringe,
    Heart,
    CreditCard,
    LayoutDashboard,
    type LucideIcon,
} from 'lucide-react';

interface ModuleInfo {
    icon: LucideIcon;
    description: string;
    color: string;
}

const moduleMap: Record<string, ModuleInfo> = {
    appointments: {
        icon: Calendar,
        description: 'Schedule, reschedule, and manage patient appointments across all departments.',
        color: 'from-blue-600 to-sky-500',
    },
    patients: {
        icon: Users,
        description: 'Register, search, and manage patient records and demographics.',
        color: 'from-emerald-500 to-teal-500',
    },
    doctors: {
        icon: Stethoscope,
        description: 'Manage doctor profiles, schedules, and department assignments.',
        color: 'from-violet-500 to-purple-500',
    },
    departments: {
        icon: Building2,
        description: 'Configure hospital departments, specializations, and services.',
        color: 'from-amber-500 to-orange-500',
    },
    staff: {
        icon: IdCard,
        description: 'Manage hospital staff, roles, permissions, and schedules.',
        color: 'from-rose-500 to-pink-500',
    },
    pharmacy: {
        icon: Pill,
        description: 'Manage medicines, inventory, dispensing, and pharmaceutical orders.',
        color: 'from-cyan-500 to-blue-500',
    },
    laboratory: {
        icon: FlaskConical,
        description: 'Manage lab tests, samples, results, and instrument integration.',
        color: 'from-green-500 to-emerald-500',
    },
    radiology: {
        icon: Scan,
        description: 'Manage imaging workflows, DICOM storage, and radiology reports.',
        color: 'from-indigo-500 to-violet-500',
    },
    billing: {
        icon: Receipt,
        description: 'Generate invoices, process payments, and manage financial transactions.',
        color: 'from-blue-600 to-blue-800',
    },
    insurance: {
        icon: ShieldCheck,
        description: 'Manage insurance claims, policies, and verification.',
        color: 'from-teal-500 to-cyan-500',
    },
    reports: {
        icon: BarChart3,
        description: 'View analytics, generate reports, and export data.',
        color: 'from-orange-500 to-red-500',
    },
    settings: {
        icon: Settings,
        description: 'Configure system settings, preferences, and integrations.',
        color: 'from-gray-500 to-slate-500',
    },
    'audit-logs': {
        icon: ScrollText,
        description: 'View system audit trails, user activity, and security logs.',
        color: 'from-red-500 to-rose-500',
    },
    'today-patients': {
        icon: Users,
        description: 'View and manage today&apos;s scheduled patients and consultations.',
        color: 'from-blue-500 to-indigo-500',
    },
    'patient-history': {
        icon: FileText,
        description: 'Access complete patient medical history and past encounters.',
        color: 'from-purple-500 to-pink-500',
    },
    prescriptions: {
        icon: ClipboardList,
        description: 'Create, manage, and fulfill patient prescriptions.',
        color: 'from-green-500 to-teal-500',
    },
    'lab-requests': {
        icon: FlaskConical,
        description: 'Submit and track laboratory test requests for patients.',
        color: 'from-yellow-500 to-amber-500',
    },
    'lab-reports': {
        icon: FlaskConical,
        description: 'View and download completed laboratory test reports.',
        color: 'from-emerald-500 to-green-500',
    },
    diagnosis: {
        icon: Search,
        description: 'Record and manage patient diagnoses and treatment plans.',
        color: 'from-violet-500 to-purple-500',
    },
    'medical-notes': {
        icon: StickyNote,
        description: 'Write and manage clinical notes, observations, and summaries.',
        color: 'from-blue-500 to-cyan-500',
    },
    surgery: {
        icon: Activity,
        description: 'Schedule and manage surgical procedures and operating rooms.',
        color: 'from-red-500 to-orange-500',
    },
    queue: {
        icon: Users,
        description: 'Manage patient flow, token system, and wait times.',
        color: 'from-amber-500 to-yellow-500',
    },
    admissions: {
        icon: DoorOpen,
        description: 'Manage patient admissions, discharges, and bed assignments.',
        color: 'from-blue-600 to-indigo-600',
    },
    notifications: {
        icon: Bell,
        description: 'View and manage system notifications and alerts.',
        color: 'from-rose-500 to-red-500',
    },
    'radiology-reports': {
        icon: Scan,
        description: 'View and download completed radiology reports and images.',
        color: 'from-indigo-500 to-blue-500',
    },
    'medical-records': {
        icon: FileText,
        description: 'Access your complete medical records and health history.',
        color: 'from-teal-500 to-green-500',
    },
    'patient-care': {
        icon: Heart,
        description: 'Manage patient care plans, assignments, and daily rounds.',
        color: 'from-red-400 to-rose-500',
    },
    vitals: {
        icon: Activity,
        description: 'Record and monitor patient vital signs and measurements.',
        color: 'from-green-400 to-emerald-500',
    },
    medication: {
        icon: Syringe,
        description: 'Administer and track patient medications and dosages.',
        color: 'from-cyan-400 to-blue-500',
    },
    'nurse-notes': {
        icon: StickyNote,
        description: 'Document nursing observations, interventions, and care notes.',
        color: 'from-pink-400 to-rose-500',
    },
    medicines: {
        icon: Pill,
        description: 'Manage medicine catalog, pricing, and inventory.',
        color: 'from-blue-400 to-cyan-500',
    },
    stock: {
        icon: Building2,
        description: 'Track inventory levels, manage stock, and place orders.',
        color: 'from-amber-400 to-orange-500',
    },
    'verify-prescriptions': {
        icon: ClipboardList,
        description: 'Verify and dispense prescribed medications to patients.',
        color: 'from-green-400 to-teal-500',
    },
    sales: {
        icon: CreditCard,
        description: 'View pharmacy sales transactions and revenue reports.',
        color: 'from-emerald-400 to-green-500',
    },
};

function getModuleKey(pathname: string): string {
    const segments = pathname.replace(/^\/dashboard\//, '').split('/');
    return segments[0] || 'dashboard';
}

function toTitleCase(slug: string): string {
    return slug
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export default function ModulePage() {
    const location = useLocation();
    const key = getModuleKey(location.pathname);
    const info = moduleMap[key];
    const title = toTitleCase(key);
    const Icon = info?.icon || LayoutDashboard;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="space-y-2"
            >
                <div className="flex items-center gap-3">
                    <div
                        className={cn(
                            'w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg',
                            info?.color || 'from-blue-600 to-sky-500'
                        )}
                    >
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                            {title}
                        </h1>
                        <p className="text-sm text-[var(--text-muted)]">
                            {info?.description || 'Module page'}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Placeholder card */}
            <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-sm overflow-hidden"
            >
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div
                        className={cn(
                            'w-20 h-20 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg',
                            info?.color || 'from-blue-600 to-sky-500'
                        )}
                    >
                        <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                            {title} Module
                        </h2>
                        <p className="text-[var(--text-muted)] max-w-md">
                            This module is under development and will be available soon.
                            Check back for updates.
                        </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                            Coming Soon
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                            /dashboard/{key}
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Quick actions hint */}
            <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 space-y-2 shadow-sm"
                    >
                        <div className="w-8 h-8 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500/50" />
                        </div>
                        <h3 className="font-medium text-sm text-[var(--text-primary)]">
                            Quick Action {i}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">
                            Feature coming soon
                        </p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
