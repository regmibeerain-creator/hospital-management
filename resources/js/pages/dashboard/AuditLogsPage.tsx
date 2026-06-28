import { useState, useEffect } from 'react';
import phase6Api from '../../lib/phase6-api';
import {
    ScrollText, Search, Loader2, XCircle, User,
    Code, Globe,
} from 'lucide-react';

interface AuditLog {
    id: number; action: string; entity_type: string; entity_id: number;
    old_values: any; new_values: any; ip_address: string | null;
    user_agent: string | null; created_at: string;
    user: { id: number; name: string; email: string } | null;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = { per_page: 50 };
            if (search) params.search = search;
            const res = await phase6Api.auditLogs.list(params);
            setLogs(res.data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center shadow-lg shadow-gray-500/20">
                    <ScrollText className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Audit Logs</h1>
                    <p className="text-sm text-[var(--text-secondary)]">Track all system activity and changes</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by action or entity..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>

            {/* Log List */}
            <div className="glass-card-solid rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <ScrollText className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                        <p className="text-[var(--text-secondary)] font-medium">No audit logs found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[var(--border)]">
                        {logs.map((log) => (
                            <div key={log.id}
                                className="p-4 hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
                                onClick={() => setSelectedLog(log)}>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-lg bg-[var(--bg-tertiary)] shrink-0">
                                        <ScrollText size={15} className="text-[var(--text-muted)]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                                                {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </p>
                                            <span className="text-xs text-[var(--text-muted)] shrink-0">
                                                {new Date(log.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-secondary)] flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <User size={11} /> {log.user?.name || 'System'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Code size={11} /> {log.entity_type}.{log.entity_id}
                                            </span>
                                            {log.ip_address && (
                                                <span className="flex items-center gap-1">
                                                    <Globe size={11} /> {log.ip_address}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                                    {selectedLog.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </h2>
                                <p className="text-xs text-[var(--text-muted)]">{new Date(selectedLog.created_at).toLocaleString()}</p>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                                <XCircle size={18} className="text-[var(--text-muted)]" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                    <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase">Entity</p>
                                    <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{selectedLog.entity_type}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                    <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase">Entity ID</p>
                                    <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">#{selectedLog.entity_id}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                    <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase">User</p>
                                    <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{selectedLog.user?.name || 'System'}</p>
                                </div>
                                <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                    <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase">IP Address</p>
                                    <p className="text-sm font-medium text-[var(--text-primary)] mt-0.5">{selectedLog.ip_address || '—'}</p>
                                </div>
                            </div>

                            {selectedLog.new_values && (
                                <div>
                                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Changes</p>
                                    <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                        <pre className="text-xs text-[var(--text-primary)] whitespace-pre-wrap font-mono leading-relaxed">
                                            {JSON.stringify(selectedLog.new_values, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {selectedLog.user_agent && (
                                <div>
                                    <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">User Agent</p>
                                    <p className="text-xs text-[var(--text-muted)] break-all">{selectedLog.user_agent}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
