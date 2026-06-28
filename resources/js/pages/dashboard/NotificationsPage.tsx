import { useState, useEffect } from 'react';
import phase6Api from '../../lib/phase6-api';
import {
    Bell, CheckCheck, Trash2, Loader2, Info, CheckCircle2,
    AlertTriangle, XCircle, Clock, ExternalLink,
} from 'lucide-react';

interface Notification {
    id: number; type: string; title: string; body: string | null;
    action_url: string | null; action_label: string | null;
    read_at: string | null; created_at: string;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
    info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    success: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    warning: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    danger: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [notifRes, countRes] = await Promise.all([
                phase6Api.notifications.list({ per_page: 50 }),
                phase6Api.notifications.unreadCount(),
            ]);
            setNotifications(notifRes.data.data || []);
            setUnreadCount(countRes.data.count);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleMarkRead = async (id: number) => {
        try {
            await phase6Api.notifications.markRead(id);
            fetchData();
        } catch (err: any) { alert('Failed'); }
    };

    const handleMarkAllRead = async () => {
        try {
            await phase6Api.notifications.markAllRead();
            fetchData();
        } catch (err: any) { alert('Failed'); }
    };

    const handleDismiss = async (id: number) => {
        try {
            await phase6Api.notifications.dismiss(id);
            fetchData();
        } catch (err: any) { alert('Failed'); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Bell className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
                        </p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                        <CheckCheck size={16} /> Mark All Read
                    </button>
                )}
            </div>

            {/* Notification List */}
            <div className="space-y-2">
                {loading ? (
                    <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                ) : notifications.length === 0 ? (
                    <div className="glass-card-solid rounded-2xl p-12 text-center">
                        <Bell className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                        <p className="text-[var(--text-secondary)] font-medium">No notifications</p>
                        <p className="text-sm text-[var(--text-muted)] mt-1">You're all caught up!</p>
                    </div>
                ) : (
                    notifications.map((notif) => {
                        const config = typeConfig[notif.type] || typeConfig.info;
                        const Icon = config.icon;
                        const isUnread = !notif.read_at;
                        return (
                            <div key={notif.id}
                                className={`glass-card-solid rounded-xl p-4 transition-all ${
                                    isUnread ? 'border-l-4 border-l-blue-500' : 'opacity-70'
                                }`}>
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
                                        <Icon size={16} className={config.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className={`text-sm font-medium ${isUnread ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                    {notif.title}
                                                    {isUnread && <span className="ml-2 w-2 h-2 rounded-full bg-blue-500 inline-block" />}
                                                </p>
                                                {notif.body && (
                                                    <p className="text-sm text-[var(--text-muted)] mt-0.5">{notif.body}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                {notif.action_url && (
                                                    <a href={notif.action_url}
                                                        className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                                                        <ExternalLink size={14} />
                                                    </a>
                                                )}
                                                {isUnread && (
                                                    <button onClick={() => handleMarkRead(notif.id)}
                                                        className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-blue-500">
                                                        <CheckCheck size={14} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDismiss(notif.id)}
                                                    className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <Clock size={11} className="text-[var(--text-muted)]" />
                                            <span className="text-[10px] text-[var(--text-muted)]">
                                                {new Date(notif.created_at).toLocaleDateString('en-US', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
