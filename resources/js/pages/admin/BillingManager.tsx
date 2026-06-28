import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import billingApi from '../../lib/billing-api';
import { filterOptions } from '../../lib/utils';
import {
    Receipt, Plus, Search, Loader2, Eye, XCircle, DollarSign,
    ArrowLeft, CheckCircle2, Printer, CreditCard, Wallet, Building2,
    Calendar, User, FileText, ChevronRight, TrendingUp, AlertCircle,
} from 'lucide-react';

interface BillItem { id: number; description: string; category: string | null; quantity: number; unit_price: number; total: number; }
interface Payment { id: number; amount: number; payment_method: string; transaction_id: string | null; status: string; paid_at: string; }
interface Bill { id: number; bill_number: string; patient: { id: number; full_name: string; patient_id: string } | null; subtotal: number; discount: number; tax: number; total: number; paid_amount: number; due_amount: number; status: string; items: BillItem[]; payments: Payment[]; created_at: string; }

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-500/10' },
    waiting_payment: { label: 'Waiting Payment', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    partially_paid: { label: 'Partially Paid', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    paid: { label: 'Paid', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    void: { label: 'Void', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
};

const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Wallet },
    { value: 'card', label: 'Card', icon: CreditCard },
    { value: 'esewa', label: 'eSewa', icon: Building2 },
    { value: 'khalti', label: 'Khalti', icon: Building2 },
    { value: 'connect_ips', label: 'ConnectIPS', icon: Building2 },
    { value: 'fonepay', label: 'FonePay', icon: Building2 },
];

export default function BillingManager() {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Bill | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [showPayment, setShowPayment] = useState<Bill | null>(null);
    const [stats, setStats] = useState<any>(null);

    const fetchBills = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const [billsRes, statsRes] = await Promise.all([
                billingApi.list(params),
                billingApi.stats(),
            ]);
            setBills(billsRes.data.data || []);
            setStats(statsRes.data);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBills(); }, [search, statusFilter]);

    const handleVoid = async (bill: Bill) => {
        const reason = prompt('Reason for voiding this bill:');
        if (reason === null) return;
        try {
            await billingApi.void(bill.id, reason || undefined);
            fetchBills();
            if (selected?.id === bill.id) setSelected(null);
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed to void'); }
    };

    const handlePayment = async (billId: number, data: any) => {
        try {
            await billingApi.recordPayment(billId, data);
            setShowPayment(null);
            fetchBills();
            const updated = await billingApi.show(billId);
            setSelected(updated.data.data);
        } catch (err: any) { alert(err?.response?.data?.message || 'Payment failed'); }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Receipt className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Billing</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Manage patient bills and payments</p>
                    </div>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-200">
                    <Plus size={16} /> New Bill
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Total Bills', value: stats.total_bills, icon: Receipt, color: 'from-blue-600 to-sky-500' },
                        { label: 'Paid', value: stats.paid_bills, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
                        { label: 'Pending', value: stats.pending_bills, icon: AlertCircle, color: 'from-amber-500 to-orange-500' },
                        { label: "Today's Revenue", value: `Rs. ${(stats.today_revenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'from-violet-500 to-purple-500' },
                        { label: 'Total Revenue', value: `Rs. ${(stats.total_revenue || 0).toLocaleString()}`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
                        { label: 'Outstanding', value: `Rs. ${(stats.outstanding_amount || 0).toLocaleString()}`, icon: Wallet, color: 'from-rose-500 to-pink-500' },
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

            {/* Filters */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by bill number or patient name..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
                </div>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option value="">All Status</option>
                    {Object.entries(statusConfig).map(([key, s]) => (
                        <option key={key} value={key}>{s.label}</option>
                    ))}
                </select>
            </div>

            {/* Bill List */}
            <div className="glass-card-solid rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                ) : bills.length === 0 ? (
                    <div className="p-12 text-center">
                        <Receipt className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                        <p className="text-[var(--text-secondary)] font-medium">No bills found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                    <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Bill #</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Patient</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Total</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Paid</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Due</th>
                                    <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                    <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bills.map((bill) => {
                                    const status = statusConfig[bill.status] || statusConfig.draft;
                                    return (
                                        <tr key={bill.id}
                                            onClick={() => setSelected(bill)}
                                            className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
                                            <td className="px-4 py-3.5 font-semibold text-[var(--text-primary)]">{bill.bill_number}</td>
                                            <td className="px-4 py-3.5 text-[var(--text-secondary)]">{bill.patient?.full_name || '—'}</td>
                                            <td className="px-4 py-3.5 font-semibold text-[var(--text-primary)]">Rs. {bill.total.toLocaleString()}</td>
                                            <td className="px-4 py-3.5 text-emerald-600 font-medium">Rs. {bill.paid_amount.toLocaleString()}</td>
                                            <td className="px-4 py-3.5 text-amber-600 font-medium">Rs. {bill.due_amount.toLocaleString()}</td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>{status.label}</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button onClick={(e) => { e.stopPropagation(); setSelected(bill); }}
                                                    className="text-primary hover:text-primary-dark text-xs font-medium">View</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Bill Detail Modal */}
            {selected && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-[var(--text-primary)]">{selected.bill_number}</h2>
                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${(statusConfig[selected.status] || statusConfig.draft).bg} ${(statusConfig[selected.status] || statusConfig.draft).color}`}>
                                        {(statusConfig[selected.status] || statusConfig.draft).label}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)] mt-1">
                                    Patient: {selected.patient?.full_name || '—'} ({selected.patient?.patient_id || '—'})
                                </p>
                                <p className="text-xs text-[var(--text-muted)]">{new Date(selected.created_at).toLocaleDateString()}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                                <XCircle size={18} className="text-[var(--text-muted)]" />
                            </button>
                        </div>

                        {/* Bill Items */}
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)] mb-3">Bill Items</h3>
                            <div className="space-y-2">
                                {selected.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]">
                                        <div>
                                            <p className="text-sm font-medium text-[var(--text-primary)]">{item.description}</p>
                                            <p className="text-xs text-[var(--text-muted)]">{item.quantity} x Rs. {item.unit_price.toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">Rs. {item.total.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 space-y-1 text-sm">
                                <div className="flex justify-between px-3 py-1.5"><span className="text-[var(--text-muted)]">Subtotal</span><span>Rs. {selected.subtotal.toLocaleString()}</span></div>
                                {selected.discount > 0 && <div className="flex justify-between px-3 py-1.5"><span className="text-[var(--text-muted)]">Discount</span><span className="text-red-500">-Rs. {selected.discount.toLocaleString()}</span></div>}
                                {selected.tax > 0 && <div className="flex justify-between px-3 py-1.5"><span className="text-[var(--text-muted)]">Tax</span><span>Rs. {selected.tax.toLocaleString()}</span></div>}
                                <div className="flex justify-between px-3 py-1.5 border-t border-[var(--border)] pt-2"><span className="font-semibold">Total</span><span className="font-bold text-lg">Rs. {selected.total.toLocaleString()}</span></div>
                            </div>
                        </div>

                        {/* Payments */}
                        {selected.payments.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)] mb-3">Payments</h3>
                                <div className="space-y-2">
                                    {selected.payments.map((p) => (
                                        <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/5">
                                            <div>
                                                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 capitalize">{p.payment_method}</p>
                                                {p.transaction_id && <p className="text-xs text-emerald-500">Txn: {p.transaction_id}</p>}
                                            </div>
                                            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Rs. {p.amount.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                            {selected.status === 'waiting_payment' && (
                                <button onClick={() => setShowPayment(selected)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                                    <DollarSign size={16} /> Record Payment
                                </button>
                            )}
                            {selected.status === 'draft' && (
                                <button onClick={async () => { try { await billingApi.finalize(selected.id); fetchBills(); } catch {} }}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-sky-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                                    <CheckCircle2 size={16} /> Finalize Bill
                                </button>
                            )}
                            {(selected.status === 'waiting_payment' || selected.status === 'partially_paid') && (
                                <button onClick={() => handleVoid(selected)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-all">
                                    <XCircle size={16} /> Void Bill
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPayment && (
                <PaymentModal bill={showPayment} onClose={() => setShowPayment(null)} onPay={handlePayment} />
            )}
        </div>
    );
}

function PaymentModal({ bill, onClose, onPay }: { bill: Bill; onClose: () => void; onPay: (id: number, data: any) => Promise<void> }) {
    const [amount, setAmount] = useState(bill.due_amount);
    const [method, setMethod] = useState('cash');
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onPay(bill.id, { amount, payment_method: method, transaction_id: transactionId || undefined });
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">Record Payment</h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">Bill: {bill.bill_number} — Due: Rs. {bill.due_amount.toLocaleString()}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Amount (Rs.)</label>
                        <input type="number" step="0.01" min="0.01" max={bill.due_amount} value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Payment Method</label>
                        <div className="grid grid-cols-3 gap-2">
                            {paymentMethods.map((pm) => {
                                const Icon = pm.icon;
                                return (
                                    <button key={pm.value} type="button" onClick={() => setMethod(pm.value)}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                                            method === pm.value ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-700' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-emerald-300'
                                        }`}>
                                        <Icon size={18} />
                                        {pm.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Transaction ID</label>
                        <input type="text" value={transactionId} onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Optional"
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">Cancel</button>
                        <button type="submit" disabled={loading || amount <= 0}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 size={16} />}
                            Record Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
