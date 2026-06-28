import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Users, Stethoscope, Calendar, FileText, Receipt,
    Globe, Loader2, User, X, Pill, Activity, ArrowRight,
    FlaskConical, Scan,
} from 'lucide-react';
import phase9Api from '../lib/phase9-api';
import type { SearchResult } from '../lib/phase9-api';

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
    patient: { icon: Users, color: 'from-blue-500 to-sky-500', label: 'Patients' },
    doctor: { icon: Stethoscope, color: 'from-emerald-500 to-teal-500', label: 'Doctors' },
    appointment: { icon: Calendar, color: 'from-violet-500 to-purple-500', label: 'Appointments' },
    prescription: { icon: Pill, color: 'from-rose-500 to-pink-500', label: 'Prescriptions' },
    report: { icon: FileText, color: 'from-amber-500 to-orange-500', label: 'Reports' },
    bill: { icon: Receipt, color: 'from-green-500 to-emerald-500', label: 'Bills' },
    cms_post: { icon: Globe, color: 'from-indigo-500 to-violet-500', label: 'CMS Posts' },
    cms_page: { icon: Globe, color: 'from-indigo-500 to-violet-500', label: 'CMS Pages' },
    user: { icon: User, color: 'from-gray-500 to-slate-500', label: 'Users' },
};

const moduleOptions = [
    { value: '', label: 'All Modules' },
    { value: 'patients', label: 'Patients' },
    { value: 'doctors', label: 'Doctors' },
    { value: 'appointments', label: 'Appointments' },
    { value: 'prescriptions', label: 'Prescriptions' },
    { value: 'reports', label: 'Reports' },
    { value: 'bills', label: 'Bills' },
    { value: 'cms', label: 'CMS' },
    { value: 'users', label: 'Users' },
];

interface GlobalSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [grouped, setGrouped] = useState<Record<string, { results: SearchResult[]; count: number }>>({});
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [module, setModule] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setResults([]);
            setGrouped({});
            setTotal(0);
            setSelectedIndex(-1);
        }
    }, [isOpen]);

    const doSearch = useCallback(async (q: string, mod: string) => {
        if (q.trim().length < 2) {
            setResults([]);
            setGrouped({});
            setTotal(0);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const res = await phase9Api.search(q, mod || undefined);
            setResults(res.data.data || []);
            setGrouped(res.data.grouped || {});
            setTotal(res.data.total || 0);
            setSelectedIndex(-1);
        } catch { /* ignore */ }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => doSearch(query, module), 300);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [query, module, doSearch]);

    const handleSelect = (result: SearchResult) => {
        onClose();
        navigate(result.url);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    const flattenedResults = results;
    const hasResults = flattenedResults.length > 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Input */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)]">
                    <Search size={18} className="text-[var(--text-muted)] shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search patients, doctors, appointments, reports..."
                        className="flex-1 bg-transparent text-[var(--text-primary)] text-base placeholder:text-[var(--text-muted)] focus:outline-none"
                    />
                    <select
                        value={module}
                        onChange={(e) => setModule(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] focus:outline-none"
                    >
                        {moduleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)]">
                        <X size={16} className="text-[var(--text-muted)]" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {loading && (
                        <div className="p-8 text-center">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                        </div>
                    )}

                    {!loading && query.length >= 2 && !hasResults && (
                        <div className="p-8 text-center">
                            <Search className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
                            <p className="text-[var(--text-secondary)] font-medium">No results found</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1">Try a different search term</p>
                        </div>
                    )}

                    {!loading && query.length < 2 && (
                        <div className="p-8 text-center">
                            <Search className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-2" />
                            <p className="text-sm text-[var(--text-muted)]">Type at least 2 characters to search</p>
                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                                <kbd className="px-2 py-1 rounded bg-[var(--bg-tertiary)] font-mono">↑</kbd>
                                <kbd className="px-2 py-1 rounded bg-[var(--bg-tertiary)] font-mono">↓</kbd>
                                <span>Navigate</span>
                                <kbd className="px-2 py-1 rounded bg-[var(--bg-tertiary)] font-mono">Enter</kbd>
                                <span>Open</span>
                                <kbd className="px-2 py-1 rounded bg-[var(--bg-tertiary)] font-mono">Esc</kbd>
                                <span>Close</span>
                            </div>
                        </div>
                    )}

                    {!loading && hasResults && (
                        <div>
                            {/* Grouped results */}
                            {Object.entries(grouped).map(([type, group]) => {
                                const config = typeConfig[type] || { icon: Search, color: 'from-gray-500 to-slate-500', label: type };
                                const Icon = config.icon;
                                return (
                                    <div key={type}>
                                        <div className="flex items-center gap-2 px-5 py-2 bg-[var(--bg-tertiary)]">
                                            <div className={`p-1 rounded bg-gradient-to-br ${config.color}`}>
                                                <Icon size={12} className="text-white" />
                                            </div>
                                            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                                {config.label}
                                            </span>
                                            <span className="text-[10px] text-[var(--text-muted)] ml-auto">{group.count}</span>
                                        </div>
                                        {group.results.map((result) => {
                                            const idx = flattenedResults.indexOf(result);
                                            const isSelected = idx === selectedIndex;
                                            return (                                                    <button
                                                        key={`${result.type}-${result.id}`}
                                                        onClick={() => handleSelect(result)}
                                                        onMouseEnter={() => setSelectedIndex(idx)}
                                                        className={`group w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                                                            isSelected
                                                                ? 'bg-primary/5 text-primary'
                                                                : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                                                        }`}
                                                    >
                                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${typeConfig[result.type]?.color || 'from-gray-500 to-slate-500'} flex items-center justify-center shrink-0`}>
                                                        {(() => {
                                                            const Ic = typeConfig[result.type]?.icon || Search;
                                                            return <Ic size={14} className="text-white" />;
                                                        })()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{result.title}</p>
                                                        <p className="text-xs text-[var(--text-muted)] truncate">{result.subtitle}</p>
                                                    </div>
                                                    {result.badge && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-muted)] capitalize shrink-0">
                                                            {result.badge}
                                                        </span>
                                                    )}
                                                    <ArrowRight size={14} className="text-[var(--text-muted)] shrink-0 opacity-0 group-hover:opacity-100" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                );
                            })}

                            {/* Footer */}
                            <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between">
                                <p className="text-xs text-[var(--text-muted)]">
                                    Found <strong className="text-[var(--text-secondary)]">{total}</strong> results
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">
                                    <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] font-mono">↑↓</kbd> Navigate
                                    {' '}<kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] font-mono">↵</kbd> Open
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
