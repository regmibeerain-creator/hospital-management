import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import GlobalSearchModal from './GlobalSearchModal';
import {
    LayoutDashboard,
    User,
    Calendar,
    FileText,
    Pill,
    FlaskConical,
    Microscope,
    Users,
    Settings,
    Bell,
    Menu,
    X,
    LogOut,
    Sun,
    Moon,
    ChevronDown,
    Activity,
    Building2,
    ClipboardList,
    Hospital,
    Search,
} from 'lucide-react';

interface NavItem {
    label: string;
    icon: React.ReactNode;
    to: string;
    roles?: string[];
    children?: { label: string; to: string; roles?: string[] }[];
}

export default function AppLayout() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
    const [searchOpen, setSearchOpen] = useState(false);

    // Keyboard shortcut: Cmd/Ctrl + K to open search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const roleSlug = user?.role?.slug ?? 'patient';

    const navItems: NavItem[] = [
        { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, to: '/dashboard' },
        {
            label: 'Appointments',
            icon: <Calendar className="w-5 h-5" />,
            to: '/dashboard/appointments',
            roles: ['patient', 'receptionist', 'doctor', 'admin'],
            children: [
                { label: 'My Appointments', to: '/dashboard/appointments', roles: ['patient'] },
                { label: 'Book Appointment', to: '/dashboard/appointments/book', roles: ['patient'] },
            ],
        },
        {
            label: 'Medical Records',
            icon: <FileText className="w-5 h-5" />,
            to: '/dashboard/medical-records',
            roles: ['patient'],
        },
        {
            label: 'Prescriptions',
            icon: <Pill className="w-5 h-5" />,
            to: '/dashboard/prescriptions',
            roles: ['patient'],
        },
        {
            label: 'Lab Reports',
            icon: <FlaskConical className="w-5 h-5" />,
            to: '/dashboard/lab-reports',
            roles: ['patient'],
        },
        {
            label: 'Radiology Reports',
            icon: <Microscope className="w-5 h-5" />,
            to: '/dashboard/radiology-reports',
            roles: ['patient'],
        },
        {
            label: 'Patients',
            icon: <Users className="w-5 h-5" />,
            to: '/dashboard/patients',
            roles: ['admin', 'receptionist', 'doctor'],
        },
        {
            label: 'Departments',
            icon: <Building2 className="w-5 h-5" />,
            to: '/dashboard/departments',
            roles: ['admin'],
        },
        {
            label: 'CMS',
            icon: <ClipboardList className="w-5 h-5" />,
            to: '/admin/cms',
            roles: ['admin'],
            children: [
                { label: 'Dashboard', to: '/admin/cms' },
                { label: 'Pages', to: '/admin/cms/pages' },
                { label: 'Posts', to: '/admin/cms/posts' },
                { label: 'Categories', to: '/admin/cms/categories' },
                { label: 'FAQ', to: '/admin/cms/faq' },
                { label: 'Inquiries', to: '/admin/cms/inquiries' },
                { label: 'Media', to: '/admin/cms/media' },
                { label: 'Health Packages', to: '/admin/cms/health-packages' },
                { label: 'Hospital Profile', to: '/admin/cms/profile' },
            ],
        },
        {
            label: 'Settings',
            icon: <Settings className="w-5 h-5" />,
            to: '/dashboard/settings',
            roles: ['admin'],
        },
    ];

    const filteredNavItems = navItems.filter(
        (item) => !item.roles || item.roles.includes(roleSlug),
    );

    const toggleMenu = (label: string) => {
        setExpandedMenus((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const userInitials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col glass-sidebar transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-5 h-16 border-b border-[var(--border)] shrink-0">
                    <div className="w-10 h-10 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-sm overflow-hidden">
                        <img src="/images/logo.png" alt="Hospital Logo" className="w-full h-full object-contain rounded" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                            Birendranagar
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] leading-tight">
                            Municipal Hospital
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    {filteredNavItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const isExpanded = expandedMenus[item.label];
                        const filteredChildren = item.children?.filter(
                            (c) => !c.roles || c.roles.includes(roleSlug),
                        );

                        return (
                            <div key={item.label}>
                                {hasChildren ? (
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all duration-200 group"
                                    >
                                        <span className="text-[var(--text-muted)] group-hover:text-primary transition-colors">
                                            {item.icon}
                                        </span>
                                        <span className="flex-1 text-left">{item.label}</span>
                                        <ChevronDown
                                            className={`w-4 h-4 transition-transform duration-200 ${
                                                isExpanded ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                ) : (
                                    <NavLink
                                        to={item.to}
                                        onClick={() => setSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                                                isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                            }`
                                        }
                                    >
                                        <span className="group-hover:text-primary transition-colors">
                                            {item.icon}
                                        </span>
                                        {item.label}
                                    </NavLink>
                                )}
                                {hasChildren && isExpanded && filteredChildren && (
                                    <div className="ml-8 mt-1 space-y-1">
                                        {filteredChildren.map((child) => (
                                            <NavLink
                                                key={child.to}
                                                to={child.to}
                                                onClick={() => setSidebarOpen(false)}
                                                className={({ isActive }) =>
                                                    `block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                                        isActive
                                                            ? 'bg-primary/10 text-primary font-medium'
                                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                                                    }`
                                                }
                                            >
                                                {child.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Sidebar footer */}
                <div className="p-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-3 px-3 py-2 text-xs text-[var(--text-muted)]">
                        <Activity className="w-3.5 h-3.5" />
                        <span>v1.0.0</span>
                    </div>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="glass-nav h-16 flex items-center justify-between px-4 lg:px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors lg:hidden"
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                        <div className="hidden sm:flex items-center gap-1 text-sm text-[var(--text-muted)]">
                            <Hospital className="w-4 h-4" />
                            <span>/</span>
                            <span className="text-[var(--text-secondary)]">Dashboard</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Global Search */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--text-muted)] transition-all text-xs w-48"
                        >
                            <Search size={14} />
                            <span className="flex-1 text-left">Search...</span>
                            <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] font-mono text-[10px]">⌘K</kbd>
                        </button>
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors sm:hidden"
                        >
                            <Search size={18} />
                        </button>

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>

                        {/* User menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-sm font-semibold">
                                    {userInitials || 'U'}
                                </div>
                                <span className="hidden md:block text-sm font-medium text-[var(--text-primary)] max-w-[120px] truncate">
                                    {user?.name || 'User'}
                                </span>
                                <ChevronDown className="w-4 h-4 text-[var(--text-muted)] hidden md:block" />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 top-full mt-1 z-20 w-56 glass-card-solid rounded-xl shadow-lg border border-[var(--border)] py-1.5 animate-scale-in">
                                        <div className="px-4 py-2 border-b border-[var(--border)]">
                                            <p className="text-sm font-medium text-[var(--text-primary)]">
                                                {user?.name}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                                        </div>
                                        <NavLink
                                            to="/dashboard/profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                                        >
                                            <User className="w-4 h-4" />
                                            Profile
                                        </NavLink>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 dashboard-gradient">
                    <Outlet />
                </main>
            </div>

            {/* Global Search Modal */}
            <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
    );
}
