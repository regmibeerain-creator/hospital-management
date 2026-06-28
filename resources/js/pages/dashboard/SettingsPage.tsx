import { useState, useEffect } from 'react';
import phase6Api from '../../lib/phase6-api';
import {
    Settings, Save, Loader2, Globe, DollarSign, Bell, Calendar,
    ShieldCheck, RefreshCw, CheckCircle2,
} from 'lucide-react';

const groupConfig: Record<string, { label: string; icon: any; color: string }> = {
    general: { label: 'General', icon: Globe, color: 'from-blue-500 to-sky-500' },
    billing: { label: 'Billing', icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
    notification: { label: 'Notifications', icon: Bell, color: 'from-violet-500 to-purple-500' },
    appointment: { label: 'Appointments', icon: Calendar, color: 'from-amber-500 to-orange-500' },
    pharmacy: { label: 'Pharmacy', icon: ShieldCheck, color: 'from-rose-500 to-pink-500' },
};

const defaultSettings = [
    { key: 'hospital_name', value: 'Birendranagar Municipal Hospital', group: 'general', type: 'text', description: 'Hospital display name' },
    { key: 'hospital_address', value: '', group: 'general', type: 'text', description: 'Hospital address' },
    { key: 'hospital_phone', value: '', group: 'general', type: 'text', description: 'Primary contact number' },
    { key: 'hospital_email', value: '', group: 'general', type: 'text', description: 'Hospital email address' },
    { key: 'appointment_buffer_minutes', value: '15', group: 'appointment', type: 'number', description: 'Minutes between appointment slots' },
    { key: 'max_daily_appointments', value: '50', group: 'appointment', type: 'number', description: 'Max appointments per doctor per day' },
    { key: 'currency', value: 'NPR', group: 'billing', type: 'text', description: 'Default currency code' },
    { key: 'tax_rate', value: '0', group: 'billing', type: 'number', description: 'Default tax rate (%)' },
    { key: 'enable_sms_notifications', value: 'true', group: 'notification', type: 'boolean', description: 'Send SMS reminders' },
    { key: 'enable_email_notifications', value: 'true', group: 'notification', type: 'boolean', description: 'Send email notifications' },
    { key: 'low_stock_threshold', value: '10', group: 'pharmacy', type: 'number', description: 'Low stock alert threshold' },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeGroup, setActiveGroup] = useState('general');

    useEffect(() => {
        (async () => {
            try {
                const res = await phase6Api.settings.all();
                const existing = res.data.data || {};
                // Merge with defaults for any missing keys
                const merged: Record<string, any> = { ...existing };
                for (const def of defaultSettings) {
                    if (!merged[def.group]?.[def.key]) {
                        if (!merged[def.group]) merged[def.group] = {};
                        merged[def.group][def.key] = { key: def.key, value: def.value, type: def.type, description: def.description };
                    }
                }
                setSettings(merged);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        })();
    }, []);

    const handleChange = (group: string, key: string, value: string) => {
        setSettings((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                [key]: { ...prev[group]?.[key], value },
            },
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const allSettings: any[] = [];
            Object.entries(settings).forEach(([group, items]) => {
                Object.entries(items as Record<string, any>).forEach(([key, setting]) => {
                    allSettings.push({
                        key,
                        value: setting.value,
                        group,
                        type: setting.type,
                        description: setting.description,
                    });
                });
            });
            await phase6Api.settings.update(allSettings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed to save'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>;

    const groups = Object.keys(groupConfig).filter(g => settings[g]);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-600 to-slate-600 flex items-center justify-center shadow-lg shadow-gray-500/20">
                        <Settings className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">System Settings</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Configure hospital-wide preferences</p>
                    </div>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gray-600 to-slate-600 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                    {saved ? 'Saved' : 'Save Settings'}
                </button>
            </div>

            {/* Group Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-tertiary)] w-fit flex-wrap">
                {groups.map((g) => {
                    const config = groupConfig[g] || { label: g, icon: Settings, color: 'from-gray-500 to-slate-500' };
                    const Icon = config.icon;
                    return (
                        <button key={g} onClick={() => setActiveGroup(g)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                                activeGroup === g ? 'bg-white dark:bg-gray-800 shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}>
                            <Icon size={15} /> {config.label}
                        </button>
                    );
                })}
            </div>

            {/* Settings Form */}
            {settings[activeGroup] && (
                <div className="glass-card-solid rounded-2xl p-6 space-y-5">
                    {Object.entries(settings[activeGroup] as Record<string, any>).map(([key, setting]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                                {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </label>
                            {setting.description && (
                                <p className="text-xs text-[var(--text-muted)] mb-2">{setting.description}</p>
                            )}
                            {setting.type === 'boolean' ? (
                                <label className="inline-flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={setting.value === 'true' || setting.value === true}
                                        onChange={(e) => handleChange(activeGroup, key, e.target.checked ? 'true' : 'false')}
                                        className="w-5 h-5 rounded border-[var(--border)] accent-gray-600" />
                                    <span className="text-sm text-[var(--text-secondary)]">Enabled</span>
                                </label>
                            ) : setting.type === 'number' ? (
                                <input type="number" value={setting.value}
                                    onChange={(e) => handleChange(activeGroup, key, e.target.value)}
                                    className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            ) : (
                                <input type="text" value={setting.value}
                                    onChange={(e) => handleChange(activeGroup, key, e.target.value)}
                                    className="w-full max-w-lg px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
