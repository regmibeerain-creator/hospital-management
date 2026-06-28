import { useState, useEffect } from 'react';
import billingApi from '../../lib/billing-api';
import {
    Package, Plus, Search, Loader2, PackageOpen, AlertTriangle,
    Building2, Wrench, ClipboardList, ArrowDownCircle, ArrowUpCircle, RotateCcw,
    XCircle, DollarSign, RefreshCw,
} from 'lucide-react';

interface InventoryItem {
    id: number; name: string; sku: string | null; category: string;
    unit: string; unit_price: number; selling_price: number;
    current_stock: number; minimum_stock: number; reorder_level: number;
    is_active: boolean; created_at: string;
}

interface StockMovement {
    id: number; type: string; quantity: number; unit_price: number | null;
    notes: string | null; created_at: string;
    inventory_item: InventoryItem | null;
    created_by: { id: number; name: string } | null;
}

interface Asset {
    id: number; name: string; asset_tag: string | null; category: string;
    model: string | null; serial_number: string | null; manufacturer: string | null;
    purchase_date: string | null; purchase_price: number | null;
    location: string | null; status: string; warranty_expiry: string | null;
}

interface MaintenanceLog {
    id: number; type: string; description: string; maintenance_date: string;
    next_maintenance_date: string | null; cost: number | null;
    performed_by: string | null; notes: string | null;
}

const movementTypeConfig: Record<string, { label: string; icon: any; color: string }> = {
    inbound: { label: 'Inbound', icon: ArrowDownCircle, color: 'text-emerald-600' },
    outbound: { label: 'Outbound', icon: ArrowUpCircle, color: 'text-amber-600' },
    adjustment: { label: 'Adjustment', icon: RefreshCw, color: 'text-blue-600' },
    return: { label: 'Return', icon: RotateCcw, color: 'text-purple-600' },
};

const assetStatusConfig: Record<string, { label: string; color: string; bg: string }> = {
    active: { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    maintenance: { label: 'Maintenance', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    retired: { label: 'Retired', color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-500/10' },
    disposed: { label: 'Disposed', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-500/10' },
};

export default function InventoryManager() {
    const [tab, setTab] = useState<'items' | 'movements' | 'assets'>('items');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [showItemForm, setShowItemForm] = useState(false);
    const [showStockForm, setShowStockForm] = useState(false);
    const [showAssetForm, setShowAssetForm] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params: Record<string, any> = {};
            if (search) params.search = search;
            const calls: Promise<any>[] = [
                billingApi.inventory.stats(),
            ];
            if (tab === 'items') calls.push(billingApi.inventory.items(params));
            if (tab === 'movements') calls.push(billingApi.inventory.stockMovements(params));
            if (tab === 'assets') calls.push(billingApi.inventory.assets(params));

            const [statsRes, ...rest] = await Promise.all(calls);
            setStats(statsRes.data);

            if (tab === 'items') setItems(rest[0]?.data?.data || []);
            if (tab === 'movements') setMovements(rest[0]?.data?.data || []);
            if (tab === 'assets') setAssets(rest[0]?.data?.data || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, [tab, search]);

    const tabs = [
        { key: 'items', label: 'Inventory Items', icon: Package },
        { key: 'movements', label: 'Stock Movements', icon: ClipboardList },
        { key: 'assets', label: 'Assets', icon: Building2 },
    ] as const;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <Package className="w-5.5 h-5.5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Inventory Management</h1>
                        <p className="text-sm text-[var(--text-secondary)]">Manage stock items, track movements, and assets</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {tab === 'items' && (
                        <>
                            <button onClick={() => setShowStockForm(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium text-sm hover:bg-[var(--bg-tertiary)] transition-all">
                                <RefreshCw size={16} /> Add Stock
                            </button>
                            <button onClick={() => setShowItemForm(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                                <Plus size={16} /> New Item
                            </button>
                        </>
                    )}
                    {tab === 'assets' && (
                        <button onClick={() => setShowAssetForm(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium text-sm hover:shadow-lg transition-all">
                            <Plus size={16} /> New Asset
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                        { label: 'Total Items', value: stats.total_items, icon: Package, color: 'from-teal-500 to-cyan-500' },
                        { label: 'Low Stock', value: stats.low_stock_items, icon: AlertTriangle, color: 'from-amber-500 to-orange-500' },
                        { label: 'Needs Reorder', value: stats.needs_reorder, icon: PackageOpen, color: 'from-rose-500 to-pink-500' },
                        { label: 'Total Assets', value: stats.total_assets, icon: Building2, color: 'from-blue-500 to-indigo-500' },
                        { label: 'In Maintenance', value: stats.maintenance_assets, icon: Wrench, color: 'from-purple-500 to-violet-500' },
                        { label: 'Stock Value', value: `Rs. ${(stats.stock_value || 0).toLocaleString()}`, icon: DollarSign, color: 'from-emerald-500 to-teal-500' },
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
                                tab === t.key ? 'bg-white dark:bg-gray-800 shadow-sm text-teal-600' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                    placeholder="Search by name, SKU, or category..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" />
            </div>

            {/* Items Tab */}
            {tab === 'items' && (
                <div className="glass-card-solid rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                    ) : items.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                            <p className="text-[var(--text-secondary)] font-medium">No inventory items found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Item</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">SKU</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Category</th>
                                        <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Stock</th>
                                        <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Unit Price</th>
                                        <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Min</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => {
                                        const isLow = item.current_stock <= item.minimum_stock;
                                        const needsReorder = item.current_stock <= item.reorder_level;
                                        return (
                                            <tr key={item.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                                <td className="px-4 py-3.5 font-semibold text-[var(--text-primary)]">{item.name}</td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)] font-mono text-xs">{item.sku || '—'}</td>
                                                <td className="px-4 py-3.5 text-[var(--text-secondary)]">{item.category}</td>
                                                <td className={`px-4 py-3.5 text-right font-bold ${isLow ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                                                    {item.current_stock} {item.unit}
                                                    {isLow && <AlertTriangle size={12} className="inline ml-1 text-red-500" />}
                                                </td>
                                                <td className="px-4 py-3.5 text-right text-[var(--text-secondary)]">Rs. {item.unit_price.toLocaleString()}</td>
                                                <td className="px-4 py-3.5 text-right text-[var(--text-muted)]">{item.minimum_stock}</td>
                                                <td className="px-4 py-3.5">
                                                    {needsReorder ? (
                                                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 dark:bg-red-500/10">Reorder</span>
                                                    ) : isLow ? (
                                                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 dark:bg-amber-500/10">Low</span>
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

            {/* Movements Tab */}
            {tab === 'movements' && (
                <div className="glass-card-solid rounded-2xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                    ) : movements.length === 0 ? (
                        <div className="p-12 text-center">
                            <ClipboardList className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                            <p className="text-[var(--text-secondary)] font-medium">No stock movements recorded</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[var(--border)] bg-[var(--bg-tertiary)]">
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Date</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Item</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Type</th>
                                        <th className="text-right px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Quantity</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">Notes</th>
                                        <th className="text-left px-4 py-3.5 font-semibold text-[var(--text-muted)] text-xs uppercase">By</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.map((m) => {
                                        const config = movementTypeConfig[m.type] || movementTypeConfig.inbound;
                                        const Icon = config.icon;
                                        return (
                                            <tr key={m.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-tertiary)] transition-colors">
                                                <td className="px-4 py-3.5 text-xs text-[var(--text-muted)]">{new Date(m.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-3.5 font-medium text-[var(--text-primary)]">{m.inventory_item?.name || '—'}</td>
                                                <td className="px-4 py-3.5">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.color}`}>
                                                        <Icon size={12} /> {config.label}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 text-right font-bold text-[var(--text-primary)]">{m.quantity}</td>
                                                <td className="px-4 py-3.5 text-xs text-[var(--text-muted)] max-w-[200px] truncate">{m.notes || '—'}</td>
                                                <td className="px-4 py-3.5 text-xs text-[var(--text-secondary)]">{m.created_by?.name || '—'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Assets Tab */}
            {tab === 'assets' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {loading ? (
                            <div className="col-span-full p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                        ) : assets.length === 0 ? (
                            <div className="col-span-full p-12 text-center">
                                <Building2 className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
                                <p className="text-[var(--text-secondary)] font-medium">No assets registered</p>
                            </div>
                        ) : assets.map((asset) => {
                            const s = assetStatusConfig[asset.status] || assetStatusConfig.active;
                            return (
                                <div key={asset.id}
                                    onClick={() => setSelectedAsset(asset)}
                                    className="glass-card-solid rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                                                <Building2 size={16} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">{asset.name}</p>
                                                {asset.asset_tag && <p className="text-[10px] font-mono text-[var(--text-muted)]">{asset.asset_tag}</p>}
                                            </div>
                                        </div>
                                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.color}`}>{s.label}</span>
                                    </div>
                                    <div className="space-y-1 text-xs text-[var(--text-secondary)]">
                                        <div className="flex justify-between"><span>Category</span><span className="font-medium capitalize">{asset.category.replace('_', ' ')}</span></div>
                                        {asset.model && <div className="flex justify-between"><span>Model</span><span className="font-medium">{asset.model}</span></div>}
                                        {asset.location && <div className="flex justify-between"><span>Location</span><span className="font-medium">{asset.location}</span></div>}
                                        {asset.purchase_price && <div className="flex justify-between"><span>Price</span><span className="font-medium">Rs. {asset.purchase_price.toLocaleString()}</span></div>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Asset Detail Modal */}
            {selectedAsset && <AssetDetailModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} />}
        </div>
    );
}

function AssetDetailModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
    const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLogForm, setShowLogForm] = useState(false);
    const s = assetStatusConfig[asset.status] || assetStatusConfig.active;

    useEffect(() => {
        setLoading(true);
        billingApi.inventory.maintenanceLogs(asset.id)
            .then((res) => setMaintenanceLogs(res.data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [asset.id]);

    const handleAddLog = async (data: any) => {
        try {
            await billingApi.inventory.createMaintenanceLog(asset.id, data);
            setShowLogForm(false);
            const res = await billingApi.inventory.maintenanceLogs(asset.id);
            setMaintenanceLogs(res.data.data || []);
        } catch (err: any) { alert(err?.response?.data?.message || 'Failed'); }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold text-[var(--text-primary)]">{asset.name}</h2>
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.color}`}>{s.label}</span>
                        </div>
                        {asset.asset_tag && <p className="text-sm font-mono text-[var(--text-muted)] mt-1">{asset.asset_tag}</p>}
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-tertiary)]">
                        <XCircle size={18} className="text-[var(--text-muted)]" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                        { label: 'Category', value: asset.category.replace('_', ' ') },
                        { label: 'Model', value: asset.model || '—' },
                        { label: 'Serial Number', value: asset.serial_number || '—' },
                        { label: 'Manufacturer', value: asset.manufacturer || '—' },
                        { label: 'Location', value: asset.location || '—' },
                        { label: 'Purchase Date', value: asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : '—' },
                        { label: 'Purchase Price', value: asset.purchase_price ? `Rs. ${asset.purchase_price.toLocaleString()}` : '—' },
                        { label: 'Warranty Expiry', value: asset.warranty_expiry ? new Date(asset.warranty_expiry).toLocaleDateString() : '—' },
                    ].map((f) => (
                        <div key={f.label} className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-0.5">{f.label}</p>
                            <p className="text-sm font-medium text-[var(--text-primary)]">{f.value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-[var(--text-primary)]">Maintenance Logs</h3>
                    <button onClick={() => setShowLogForm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-medium hover:shadow-lg transition-all">
                        <Plus size={14} /> Add Log
                    </button>
                </div>

                {loading ? (
                    <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>
                ) : maintenanceLogs.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)] text-center py-4">No maintenance logs for this asset.</p>
                ) : (
                    <div className="space-y-2">
                        {maintenanceLogs.map((log) => (
                            <div key={log.id} className="p-3 rounded-xl border border-[var(--border)]">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-semibold capitalize text-[var(--text-primary)]">{log.type}</span>
                                    <span className="text-[10px] text-[var(--text-muted)]">{new Date(log.maintenance_date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-sm text-[var(--text-secondary)]">{log.description}</p>
                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--text-muted)]">
                                    {log.performed_by && <span>By: {log.performed_by}</span>}
                                    {log.cost && <span>Cost: Rs. {log.cost.toLocaleString()}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
