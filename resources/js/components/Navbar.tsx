import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Avatar,
    AvatarImage,
    AvatarFallback,
} from './ui/Avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
    Bell,
    Search,
    Menu,
    Moon,
    Sun,
    LogOut,
    User,
    ChevronDown,
    Sparkles,
} from 'lucide-react';

const notifications = [
    { title: 'Appointment Confirmed', desc: 'With Dr. Sharma tomorrow at 10:30 AM', time: '5 min ago' },
    { title: 'Lab Report Ready', desc: 'Blood test results available', time: '1 hour ago' },
    { title: 'Prescription Updated', desc: 'Dr. Patel updated your prescription', time: '3 hours ago' },
];

export default function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user, logout } = useAuth();
    const { dark, toggle: toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const notifCount = notifications.length;

    const breadcrumbs: { label: string; path?: string }[] = [];
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) {
        breadcrumbs.push({ label: 'Dashboard' });
    } else {
        breadcrumbs.push({ label: 'Home', path: '/dashboard' });
        parts.forEach((part, i) => {
            const label = part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
            if (i === parts.length - 1) breadcrumbs.push({ label });
            else breadcrumbs.push({ label, path: '/' + parts.slice(0, i + 1).join('/') });
        });
    }

    return (
        <header className="sticky top-0 z-30 glass-nav">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left */}
                <div className="flex items-center gap-3">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={onMenuClick}
                        className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] lg:hidden transition-colors"
                    >
                        <Menu size={20} />
                    </motion.button>
                    <nav className="hidden sm:flex items-center gap-1.5 text-sm">
                        {breadcrumbs.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-1.5">
                                {i > 0 && <span className="text-[var(--text-muted)]">/</span>}
                                {crumb.path ? (
                                    <Link
                                        to={crumb.path}
                                        className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-[var(--text-primary)] font-medium">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </nav>
                </div>

                {/* Right */}
                <div className="flex items-center gap-1">
                    {/* Search */}
                    <div className="hidden md:block">
                        <Input
                            icon={<Search size={15} />}
                            placeholder="Search patients, doctors..."
                            className="w-48 lg:w-60"
                        />
                    </div>

                    {/* Theme toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleTheme}
                    >
                        {dark ? <Sun size={18} /> : <Moon size={18} />}
                    </Button>

                    {/* Notifications */}
                    <div className="relative" ref={notifRef}>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setNotifOpen(!notifOpen)}
                            className="relative"
                        >
                            <Bell size={18} />
                            {notifCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    {notifCount}
                                </span>
                            )}
                        </Button>
                        <AnimatePresence>
                            {notifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-80 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-xl z-50"
                                >
                                    <div className="p-4 border-b border-[var(--border)]">
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">Notifications</p>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        {notifications.map((n, i) => (
                                            <button
                                                key={i}
                                                className="w-full text-left p-4 hover:bg-[var(--bg-tertiary)] border-b border-[var(--border)] last:border-0 transition-colors"
                                            >
                                                <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                                                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{n.desc}</p>
                                                <p className="text-[11px] text-[var(--text-muted)] mt-1">{n.time}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-[var(--border)]">
                                        <Link
                                            to="/notifications"
                                            className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium py-1"
                                            onClick={() => setNotifOpen(false)}
                                        >
                                            View all notifications
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* User dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2.5 pl-2 pr-3 h-10">
                                <Avatar className="h-8 w-8">
                                    {user?.avatar ? (
                                        <AvatarImage src={user.avatar} alt={user.name || ''} />
                                    ) : null}
                                    <AvatarFallback>
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden lg:block text-sm font-medium text-[var(--text-primary)]">
                                    {user?.name}
                                </span>
                                <ChevronDown size={14} className="hidden lg:block text-[var(--text-muted)]" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <p className="font-medium text-[var(--text-primary)]">{user?.name}</p>
                                <p className="text-xs font-normal text-[var(--text-secondary)] mt-0.5">{user?.email}</p>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => navigate('/profile')}>
                                <User size={16} />
                                Profile Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 hover:text-red-700">
                                <LogOut size={16} />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
