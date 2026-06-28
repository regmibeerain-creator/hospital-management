import { useLocation, Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function ModulePage() {
    const location = useLocation();
    const path = location.pathname;

    return (
        <div className="flex flex-col items-center justify-center py-20 animate-slide-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-400/20 flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Module Under Development</h2>
            <p className="text-sm text-[var(--text-muted)] mt-2 max-w-md text-center">
                The <strong className="text-[var(--text-secondary)]">{path}</strong> module is currently being built and will be available soon.
            </p>
            <Link
                to="/dashboard"
                className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-all"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>
        </div>
    );
}
