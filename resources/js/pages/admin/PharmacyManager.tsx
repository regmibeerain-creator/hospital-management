import { useState, useEffect } from 'react';
import phase4Api from '../../lib/phase4-api';
import {
    Pill, Search, Loader2, CheckCircle2, XCircle, ClipboardList,
    AlertTriangle, Package,
} from 'lucide-react';

interface PrescriptionItem {
    id: number; medicine_name: string; dosage: string | null;
    frequency: string | null; duration: string | null;
    instructions: string | null; quantity: number;
    is_required_medicine: boolean;
}

interface Prescription {
    id: number; diagnosis: string | null; notes: string | null;
    follow_up_date: string | null; status: string; created_at: string;
    patient: { id: number; first_name: string; last_name: string; patient_id: string } | null;
    doctor: { id: number; name: string; specialization: string | null } | null;
    items: PrescriptionItem[];
}

interface Medicine {
    id: number; name: string; sku: string | null; current_stock: number;
    unit: string; selling_price: number; minimum_stock: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    dispensed: { label: 'Dispensed', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    completed: { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
};

export default function PharmacyManager() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'prescriptions' | 'medicines'>('prescriptions');
    const [stats, setStats] = useState<any>(null);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [dispensing, setDispensing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};
            if (search) params.search = search;
            const [statsRes, rxRes, medRes] = await Promise.all([
                phase4Api.pharmacy.stats(),
                tab === 'prescriptions' ? phase4Api.pharmacy.prescriptions(params) : Promise.resolve({ data: { data: [] } }),
                tab === 'medicines' ? phase4Api.pharmacy.medicines() : Promise.resolve({ data: { data: [] } }),
            ]);
            setStats(statsRes.data);
            setPrescriptions(rxRes.data.data || []);
            setMedicines(medRes.data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tab, search]);

    const handleDispense = async (prescription: Prescription) => {
        setDispensing(true);
        try {
            const items = prescription.items.map(item => ({
                id: item.id,
                dispensed_quantity: item.quantity,
            }));
            await phase4Api.pharmacy.dispense(prescription.id, { items });
            setSelectedPrescription(null);
            fetchData();
        } catch (err: any) { alert(err?.response?.data?.message || 'Dispensing failed'); }
        finally { setDispensing(false); }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Pill className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Pharmacy</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Manage prescriptions and medicine inventory</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Pending Prescriptions', value: stats.pending_prescriptions, icon: ClipboardList, color: 'from-amber-500 to-orange-500' },
                        { label: 'Dispensed Today', value: stats.dispensed_today, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
                        { label: 'Low Stock Medicines', value: stats.low_stock_medicines, icon: AlertTriangle, color: 'from-rose-500 to-pink-500' },
                        { label: 'Total Medicines', value: stats.total_medicines, icon: Pill, color: 'from-blue-500 to-indigo-500' },
                    ].map((s) => {
                        const Icon = s.icon;
                        return (
                            <div key={s.label} className="glass-card-solid rounded-xl p-3.5">
                                <div className="flex items-center justify-between mb-1.5">
                                    <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{s.label}</p>
                                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${s.color} shadow-sm`}>
                                        <Icon size={12} className="text-white" />
                                    </div>
                                </div>
                                <p className="text-lg font-bold text-[var(--text-primary)]">{s.value}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-tertiary)] w-fit">
                {[
                    { key: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
                    { key: 'medicines', label: 'Medicine Stock', icon: Package },
                ].map((t) => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} onClick={() => setTab(t.key as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                tab === t.key ? 'bg-white dark:bg-gray-800 shadow-sm text-emerald-600' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}>
                            <Icon size={15} /> {t.label}
                        </button>
                    );
                })}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder={tab === 'prescriptions' ? 'Search by patient name...' : 'Search medicines...'}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>

            {/* Prescriptions Tab */}
            {tab === 'prescriptions' && (
                <div className="glass-card-solid rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                    ) : prescriptions.length === 0 ? (
                        <div className="p-12 text-center">
                            <ClipboardList className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                            <p className="text-[var(--text-secondary)] font-medium">No prescriptions found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">#</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Patient</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Doctor</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Items</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Date</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                        <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {prescriptions.map((rx) => {
                                        const s = statusConfig[rx.status] || statusConfig.active;
                                        return (
                                            <tr key={rx.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                                <td className="px-4 py-3.5 font-semibold text-[var(--text-primary)]">#{rx.id}</td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                                                    {rx.patient ? `${rx.patient.first_name} ${rx.patient.last_name}` : '—'}
                                                </td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)]">{rx.doctor?.name || '—'}</td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)]">{rx.items?.length || 0} items</td>
                                                <td className="px-4 py-3.5 text-xs text-[var(--text-muted)]">
                                                    {new Date(rx.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3.5"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>{s.label}</span></td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <button onClick={() => setSelectedPrescription(rx)}
                                                        className="text-primary text-xs font-medium hover:underline">View &amp; Dispense</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Medicines Tab */}
            {tab === 'medicines' && (
                <div className="glass-card-solid rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                    ) : medicines.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                            <p className="text-[var(--text-secondary)] font-medium">No medicines found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Medicine</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">SKU</th>
                                        <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Stock</th>
                                        <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Price</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicines.map((med) => {
                                        const isLow = med.current_stock <= med.minimum_stock;
                                        return (
                                            <tr key={med.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                                <td className="px-4 py-3.5 font-semibold text-[var(--text-primary)]">{med.name}</td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)] font-mono text-xs">{med.sku || '—'}</td>
                                                <td className={`px-4 py-3.5 text-right font-bold ${isLow ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                                                    {med.current_stock} {med.unit}
                                                </td>
                                                <td className="px-4 py-3.5 text-right text-[var(--text-secondary)]">Rs. {med.selling_price.toLocaleString()}</td>
                                                <td className="px-4 py-3.5">
                                                    {isLow ? (
                                                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-500/10">Low Stock</span>
                                                    ) : (
                                                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">In Stock</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Dispense Modal */}
            {selectedPrescription && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPrescription(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Prescription #{selectedPrescription.id}</h2>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {selectedPrescription.patient ? `${selectedPrescription.patient.first_name} ${selectedPrescription.patient.last_name}` : '—'}
                                    {' — '}
                                    Dr. {selectedPrescription.doctor?.name || '—'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedPrescription(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                                <XCircle size={18} className="text-[var(--text-muted)]" />
                            </button>
                        </div>

                        {selectedPrescription.diagnosis && (
                            <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] mb-4">
                                <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-0.5">Diagnosis</p>
                                <p className="text-sm text-[var(--text-primary)]">{selectedPrescription.diagnosis}</p>
                            </div>
                        )}

                        <h3 className="font-semibold text-[var(--text-primary)] mb-3">Medicines</h3>
                        <div className="space-y-2 mb-4">
                            {selectedPrescription.items.map((item) => (
                                <div key={item.id} className="p-3 rounded-xl border border-[var(--border)]">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">{item.medicine_name}</p>
                                            <p className="text-xs text-[var(--text-muted)]">
                                                {item.dosage && `${item.dosage} — `}
                                                {item.frequency && `${item.frequency}`}
                                                {item.duration && ` for ${item.duration}`}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-[var(--text-primary)]">x{item.quantity}</span>
                                    </div>
                                    {item.instructions && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 bg-blue-50 dark:bg-blue-500/5 rounded-lg p-2">
                                            {item.instructions}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {selectedPrescription.status === 'active' && (
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => { setSelectedPrescription(null); }}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">
                                    Cancel
                                </button>
                                <button onClick={() => handleDispense(selectedPrescription)}
                                    disabled={dispensing}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                                    {dispensing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                                    Dispense All
                                </button>
                            </div>
                        )}
                        {selectedPrescription.status !== 'active' && (
                            <p className="text-sm text-[var(--text-muted)] text-center py-2">
                                This prescription has already been {selectedPrescription.status}.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
