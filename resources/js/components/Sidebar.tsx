import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { staggerFast, slideInLeft } from '../lib/animations';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Stethoscope,
    Building2,
    Shield,
    IdCard,
    Pill,
    FlaskConical,
    Scan,
    Receipt,
    ShieldCheck,
    Package,
    BarChart3,
    Globe,
    Settings,
    ScrollText,
    CalendarPlus,
    FileText,
    ClipboardList,
    UserCircle,
    Bell,
    Search,
    Activity,
    StickyNote,
    UserPlus,
    DoorOpen,
    Syringe,
    Heart,
    CreditCard,
    Microscope,
    ChevronLeft,
    ChevronRight,
    X,
    type LucideIcon,
} from 'lucide-react';

interface SidebarItem {
    label: string;
    icon: LucideIcon;
    path: string;
    badge?: number;
}

interface SidebarSection {
    label: string;
    items: SidebarItem[];
}

const menuConfig: Record<string, SidebarSection[]> = {
    admin: [
        {
            label: 'Main',
            items: [
                { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                { label: 'Appointments', icon: Calendar, path: '/dashboard/appointments' },
                { label: 'Patients', icon: Users, path: '/dashboard/patients' },
                { label: 'Doctors', icon: Stethoscope, path: '/dashboard/doctors' },
                { label: 'Departments', icon: Building2, path: '/dashboard/departments' },
            ],
        },
        {
            label: 'Management',
            items: [
                { label: 'Staff', icon: IdCard, path: '/dashboard/staff' },
                { label: 'Pharmacy', icon: Pill, path: '/dashboard/pharmacy' },
                { label: 'Laboratory', icon: FlaskConical, path: '/dashboard/laboratory' },
                { label: 'LIS', icon: Microscope, path: '/dashboard/lis' },
                { label: 'Radiology', icon: Scan, path: '/dashboard/radiology' },
                { label: 'RIS/PACS', icon: Activity, path: '/dashboard/ris' },
            ],
        },
        {
            label: 'Finance',
            items: [
                { label: 'Billing', icon: Receipt, path: '/dashboard/billing' },
                { label: 'Insurance', icon: ShieldCheck, path: '/dashboard/insurance' },
                { label: 'Inventory', icon: Package, path: '/dashboard/inventory' },
                { label: 'Reports', icon: BarChart3, path: '/dashboard/reports' },
            ],
        },
        {
            label: 'System',
            items: [
                { label: 'CMS', icon: Globe, path: '/admin/cms' },
                { label: 'Settings', icon: Settings, path: '/dashboard/settings' },
                { label: 'Audit Logs', icon: ScrollText, path: '/dashboard/audit-logs' },
            ],
        },
    ],
    doctor: [
        {
            label: 'Main',
            items: [
                { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                { label: "Today's Patients", icon: Users, path: '/dashboard/today-patients' },
                { label: 'Appointments', icon: Calendar, path: '/dashboard/appointments' },
                { label: 'Patient History', icon: FileText, path: '/dashboard/patient-history' },
                { label: 'Prescriptions', icon: ClipboardList, path: '/dashboard/prescriptions' },
            ],
        },
        {
            label: 'Clinical',
            items: [
                { label: 'Lab Requests', icon: FlaskConical, path: '/dashboard/lab-requests' },
                { label: 'Diagnosis', icon: Search, path: '/dashboard/diagnosis' },
                { label: 'Medical Notes', icon: StickyNote, path: '/dashboard/medical-notes' },
                { label: 'Surgery Schedule', icon: Activity, path: '/dashboard/surgery' },
            ],
        },
    ],
    patient: [
        {
            label: 'Main',
            items: [
                { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                { label: 'Book Appointment', icon: CalendarPlus, path: '/dashboard/appointments/book' },
                { label: 'My Appointments', icon: Calendar, path: '/dashboard/appointments' },
                { label: 'Medical Records', icon: FileText, path: '/dashboard/medical-records' },
                { label: 'Prescriptions', icon: ClipboardList, path: '/dashboard/prescriptions' },
            ],
        },
        {
            label: 'Reports',
            items: [
                { label: 'Lab Reports', icon: FlaskConical, path: '/dashboard/lab-reports' },
                { label: 'Radiology Reports', icon: Scan, path: '/dashboard/radiology-reports' },
            ],
        },
        {
            label: 'Finance',
            items: [
                { label: 'Billing & Payments', icon: Receipt, path: '/dashboard/billing' },
                { label: 'Insurance', icon: ShieldCheck, path: '/dashboard/insurance' },
            ],
        },
        {
            label: 'Account',
            items: [
                { label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
                { label: 'Profile', icon: UserCircle, path: '/dashboard/profile' },
            ],
        },
    ],
    receptionist: [
        {
            label: 'Main',
            items: [
                { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                { label: 'Register Patient', icon: UserPlus, path: '/dashboard/patients/register' },
                { label: 'Appointments', icon: Calendar, path: '/dashboard/appointments' },
                { label: 'Queue Management', icon: Users, path: '/dashboard/queue' },
            ],
        },
        {
            label: 'Operations',
            items: [
                { label: 'Billing', icon: Receipt, path: '/dashboard/billing' },
                { label: 'Admissions', icon: DoorOpen, path: '/dashboard/admissions' },
            ],
        },
    ],
    nurse: [
        {
            label: 'Main',
            items: [
                { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                { label: 'Patient Care', icon: Heart, path: '/dashboard/patient-care' },
                { label: 'Vitals', icon: Activity, path: '/dashboard/vitals' },
            ],
        },
        {
            label: 'Tasks',
            items: [
                { label: 'Medication Admin', icon: Syringe, path: '/dashboard/medication' },
                { label: 'Nurse Notes', icon: StickyNote, path: '/dashboard/nurse-notes' },
            ],
        },
    ],
    pharmacist: [
        {
            label: 'Main',
            items: [
                { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
                { label: 'Medicines', icon: Pill, path: '/dashboard/medicines' },
                { label: 'Stock', icon: Building2, path: '/dashboard/stock' },
                { label: 'Verify Prescriptions', icon: ClipboardList, path: '/dashboard/verify-prescriptions' },
                { label: 'Sales', icon: CreditCard, path: '/dashboard/sales' },
            ],
        },
    ],
};

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    mobileOpen: boolean;
    onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
    const { user } = useAuth();
    const location = useLocation();
    const roleSlug = user?.role?.slug || 'patient';
    const sections = menuConfig[roleSlug] || menuConfig.patient;

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const sidebarInner = (
        <div
            className={cn(
                'h-full flex flex-col glass-sidebar transition-all duration-300 ease-out',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--border)] shrink-0">
                <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0 overflow-hidden">
                        <img src="/images/logo.png" alt="Hospital Logo" className="w-full h-full object-cover rounded-lg" />
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="font-semibold text-[var(--text-primary)] truncate"
                            >
                                Birendranagar Municipal Hospital
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Link>
                <button
                    onClick={onToggle}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] hidden lg:block transition-colors"
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-5 px-2.5 space-y-6">
                {sections.map((section) => (
                    <div key={section.label}>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]"
                                >
                                    {section.label}
                                </motion.p>
                            )}
                        </AnimatePresence>
                        <motion.ul
                            className="space-y-0.5"
                            variants={staggerFast}
                            initial="hidden"
                            animate="visible"
                        >
                            {section.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                return (
                                    <motion.li key={item.path} variants={slideInLeft}>
                                        <Link
                                            to={item.path}
                                            onClick={onMobileClose}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                                active
                                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                                            )}
                                        >
                                            <Icon
                                                size={20}
                                                className={cn(
                                                    'flex-shrink-0 transition-colors',
                                                    active && 'text-blue-600 dark:text-blue-400'
                                                )}
                                            />
                                            <AnimatePresence>
                                                {!collapsed && (
                                                    <motion.span
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="truncate"
                                                    >
                                                        {item.label}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                            {!collapsed && item.badge && (
                                                <span className="ml-auto bg-gradient-to-r from-blue-600 to-sky-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    </motion.li>
                                );
                            })}
                        </motion.ul>
                    </div>
                ))}
            </nav>

            {/* User */}
            <div className="border-t border-[var(--border)] p-3 shrink-0">
                <Link
                    to="/dashboard/profile"
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <AnimatePresence>
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="min-w-0"
                            >
                                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                                    {user?.name}
                                </p>
                                <p className="text-[11px] text-[var(--text-muted)] truncate capitalize">
                                    {user?.role?.name || 'User'}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>
            </div>
        </div>
    );

    return (
        <>
            <aside className="hidden lg:block h-full">{sidebarInner}</aside>
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 lg:hidden"
                    >
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onMobileClose} />
                        <motion.aside
                            initial={{ x: -288 }}
                            animate={{ x: 0 }}
                            exit={{ x: -288 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed left-0 top-0 h-full z-50 shadow-2xl"
                        >
                            {sidebarInner}
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
