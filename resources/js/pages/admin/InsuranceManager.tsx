import { useState, useEffect } from 'react';
import billingApi from '../../lib/billing-api';
import {
    ShieldCheck, Plus, Search, Loader2, XCircle, Building2,
    FileText, CheckCircle2, AlertCircle,
    Users,
} from 'lucide-react';

interface InsuranceCompany {
    id: number; name: string; code: string; contact_person: string | null;
    phone: string | null; email: string | null; address: string | null;
    coverage_percentage: number; is_active: boolean; created_at: string;
}

interface PatientPolicy {
    id: number; policy_number: string; coverage_type: string;
    coverage_limit: number | null; deductible: number | null;
    start_date: string; end_date: string; status: string;
    patient: { id: number; full_name: string; patient_id: string } | null;
    insurance_company: InsuranceCompany | null;
}

interface InsuranceClaim {
    id: number; claim_number: string; claimed_amount: number;
    approved_amount: number | null; status: string;
    notes: string | null; approved_date: string | null;
    patient_policy: PatientPolicy | null;
    bill: { id: number; bill_number: string; total: number } | null;
}

const claimStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
    draft: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-500/10' },
    submitted: { label: 'Submitted', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    approved: { label: 'Approved', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    rejected: { label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
    paid: { label: 'Paid', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-500/10' },
};

export default function InsuranceManager() {
    const [tab, setTab] = useState<'companies' | 'policies' | 'claims'>('companies');
    const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
    const [policies, setPolicies] = useState<PatientPolicy[]>([]);
    const [claims, setClaims] = useState<InsuranceClaim[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [showCompanyForm, setShowCompanyForm] = useState(false);
    const [showPolicyForm, setShowPolicyForm] = useState(false);
    const [showClaimForm, setShowClaimForm] = useState(false);
    const [editingCompany, setEditingCompany] = useState<InsuranceCompany | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};
            if (search) params.search = search;
            const [statsRes, companiesRes, policiesRes, claimsRes] = await Promise.all([
                billingApi.insurance.stats(),
                billingApi.insurance.companies(params),
                tab === 'policies' ? billingApi.insurance.policies() : Promise.resolve({ data: { data: [] } }),
                tab === 'claims' ? billingApi.insurance.claims() : Promise.resolve({ data: { data: [] } }),
            ]);
            setStats(statsRes.data);
            setCompanies(companiesRes.data.data || []);
            setPolicies(policiesRes.data.data || []);
            setClaims(claimsRes.data.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tab, search]);

    const tabs = [
        { key: 'companies', label: 'Insurance Companies', icon: Building2 },
        { key: 'policies', label: 'Patient Policies', icon: FileText },
        { key: 'claims', label: 'Claims', icon: ShieldCheck },
    ] as const;

    const handleSaveCompany = async (data: any) => {
        try {
            if (editingCompany) {
                await billingApi.insurance.updateCompany(editingCompany.id, data);
            } else {
                await billingApi.insurance.createCompany(data);
            }
            setShowCompanyForm(false);
            setEditingCompany(null);
            fetchData();
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <ShieldCheck className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Insurance Management</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Manage insurance companies, policies, and claims</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {tab === 'companies' && (
                        <button onClick={() => { setEditingCompany(null); setShowCompanyForm(true); }}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                            <Plus size={16} /> Add Company
                        </button>
                    )}
                    {tab === 'policies' && (
                        <button onClick={() => setShowPolicyForm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                            <Plus size={16} /> Register Policy
                        </button>
                    )}
                    {tab === 'claims' && (
                        <button onClick={() => setShowClaimForm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                            <Plus size={16} /> Submit Claim
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Insurance Companies', value: stats.companies_count, icon: Building2, color: 'from-indigo-500 to-purple-500' },
                        { label: 'Active Policies', value: stats.active_policies, icon: Users, color: 'from-emerald-500 to-teal-500' },
                        { label: 'Pending Claims', value: stats.pending_claims, icon: AlertCircle, color: 'from-amber-500 to-orange-500' },
                        { label: 'Approved Claims', value: stats.approved_claims, icon: CheckCircle2, color: 'from-green-500 to-emerald-500' },
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
                {tabs.map((t) => {
                    const Icon = t.icon;
                    return (
                        <button key={t.key} onClick={() => setTab(t.key)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                tab === t.key ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                    placeholder={tab === 'companies' ? 'Search companies...' : tab === 'policies' ? 'Search policies...' : 'Search claims...'}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>

            {/* Companies Tab */}
            {tab === 'companies' && (
                <div className="glass-card-solid rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                    ) : companies.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                            <p className="text-[var(--text-secondary)] font-medium">No insurance companies found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Company</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Code</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Contact</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Coverage</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                        <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((c) => (
                                        <tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                            <td className="px-4 py-3.5 font-semibold text-[var(--text-primary)]">{c.name}</td>
                                            <td className="px-4 py-3.5 text-[var(--text-secondary)] font-mono">{c.code}</td>
                                            <td className="px-4 py-3.5 text-[var(--text-secondary)]">
                                                {c.contact_person && <p>{c.contact_person}</p>}
                                                {c.phone && <p className="text-xs text-[var(--text-muted)]">{c.phone}</p>}
                                            </td>
                                            <td className="px-4 py-3.5 font-medium text-[var(--text-primary)]">{c.coverage_percentage}%</td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    c.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-gray-100 text-gray-500 dark:bg-gray-500/10'
                                                }`}>{c.is_active ? 'Active' : 'Inactive'}</span>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <button onClick={() => { setEditingCompany(c); setShowCompanyForm(true); }}
                                                    className="text-primary hover:text-primary-dark text-xs font-medium">Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Policies Tab */}
            {tab === 'policies' && (
                <div className="glass-card-solid rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                    ) : policies.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                            <p className="text-[var(--text-secondary)] font-medium">No policies registered</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Policy #</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Patient</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Company</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Type</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Valid</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {policies.map((p) => (
                                        <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                            <td className="px-4 py-3.5 font-semibold text-[var(--text-primary)] font-mono">{p.policy_number}</td>
                                            <td className="px-4 py-3.5 text-[var(--text-secondary)]">{p.patient?.full_name || '—'}</td>
                                            <td className="px-4 py-3.5 text-[var(--text-secondary)]">{p.insurance_company?.name || '—'}</td>
                                            <td className="px-4 py-3.5 capitalize text-[var(--text-secondary)]">{p.coverage_type}</td>
                                            <td className="px-4 py-3.5 text-xs text-[var(--text-muted)]">
                                                {new Date(p.start_date).toLocaleDateString()} - {new Date(p.end_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    p.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-gray-100 text-gray-500 dark:bg-gray-500/10'
                                                }`}>{p.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Claims Tab */}
            {tab === 'claims' && (
                <div className="glass-card-solid rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                    ) : claims.length === 0 ? (
                        <div className="p-12 text-center">
                            <ShieldCheck className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                            <p className="text-[var(--text-secondary)] font-medium">No claims filed</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Claim #</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Patient</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Bill</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Claimed</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Approved</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {claims.map((c) => {
                                        const s = claimStatusConfig[c.status] || claimStatusConfig.draft;
                                        return (
                                            <tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                                <td className="px-4 py-3.5 font-semibold text-[var(--text-primary)] font-mono">{c.claim_number}</td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)]">{c.patient_policy?.patient?.full_name || '—'}</td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)]">{c.bill?.bill_number || '—'}</td>
                                                <td className="px-4 py-3.5 font-medium text-[var(--text-primary)]">Rs. {c.claimed_amount.toLocaleString()}</td>
                                                <td className="px-4 py-3.5 font-medium text-[var(--text-primary)]">{c.approved_amount ? `Rs. ${c.approved_amount.toLocaleString()}` : '—'}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>{s.label}</span>
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

            {/* Company Form Modal */}
            {showCompanyForm && <CompanyFormModal
                company={editingCompany}
                onClose={() => { setShowCompanyForm(false); setEditingCompany(null); }}
                onSave={handleSaveCompany}
            />}
        </div>
    );
}

function CompanyFormModal({ company, onClose, onSave }: {
    company: InsuranceCompany | null;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}) {
    const [name, setName] = useState(company?.name || '');
    const [code, setCode] = useState(company?.code || '');
    const [contactPerson, setContactPerson] = useState(company?.contact_person || '');
    const [phone, setPhone] = useState(company?.phone || '');
    const [email, setEmail] = useState(company?.email || '');
    const [address, setAddress] = useState(company?.address || '');
    const [coverage, setCoverage] = useState(company?.coverage_percentage || 80);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSave({ name, code, contact_person: contactPerson || undefined, phone: phone || undefined, email: email || undefined, address: address || undefined, coverage_percentage: coverage });
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">{company ? 'Edit Company' : 'Add Insurance Company'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Company Name</label>
                            <input required value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Code</label>
                            <input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Contact Person</label>
                            <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Phone</label>
                            <input value={phone} onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Address</label>
                        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2}
                            className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Coverage Percentage: {coverage}%</label>
                        <input type="range" min={0} max={100} value={coverage} onChange={(e) => setCoverage(parseInt(e.target.value))}
                            className="w-full accent-indigo-500" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">Cancel</button>
                        <button type="submit" disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                            {company ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
