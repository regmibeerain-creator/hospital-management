import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { fadeIn } from '../lib/animations';

export default function AppLayout() {
    const [collapsed, setCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const [mobileOpen, setMobileOpen] = useState(false);

    const toggleCollapsed = () => {
        setCollapsed((prev: boolean) => {
            const next = !prev;
            localStorage.setItem('sidebar_collapsed', JSON.stringify(next));
            return next;
        });
    };

    return (
        <div className="min-h-screen flex dashboard-gradient">
            <Sidebar
                collapsed={collapsed}
                onToggle={toggleCollapsed}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Navbar onMenuClick={() => setMobileOpen(true)} />
                <motion.main
                    key={location?.pathname}
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                    className={cn('flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-6')}
                >
                    <Outlet />
                </motion.main>
            </div>
        </div>
    );
}

