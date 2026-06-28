import api from './axios';

export interface SearchResult {
    type: string;
    id: number;
    title: string;
    subtitle: string;
    url: string;
    badge: string | null;
}

export interface SearchResponse {
    data: SearchResult[];
    grouped: Record<string, { results: SearchResult[]; count: number }>;
    total: number;
    query: string;
}

export interface ManagementStats {
    // Patients
    total_patients: number;
    new_patients_today: number;
    new_patients_this_month: number;
    new_patients_last_month: number;
    patient_growth_percent: number;

    // Appointments
    appointments_today: number;
    appointments_completed: number;
    appointments_cancelled: number;
    appointments_this_month: number;
    appointments_last_month: number;
    appointment_growth_percent: number;
    no_show_rate: number;

    // Revenue
    revenue_today: number;
    revenue_this_month: number;
    revenue_last_month: number;
    revenue_growth_percent: number;
    total_revenue: number;
    pending_bills: number;
    bills_today: number;
    paid_today: number;

    // Clinical
    prescriptions_today: number;
    total_prescriptions: number;
    lab_orders_pending: number;
    lab_results_today: number;
    imaging_pending: number;
    imaging_signed_today: number;
    scheduled_today: number;

    // Inventory
    low_stock_items: number;
    total_medicines: number;
    pending_claims: number;
    active_users: number;
    total_users: number;

    // Charts
    monthly_revenue: { month: string; revenue: number; bills: number }[];
    gender_distribution: Record<string, number>;
    appointment_statuses_today: Record<string, number>;
    department_workload: { name: string; count: number }[];
}

const phase9Api = {
    // Global search
    search: (q: string, module?: string, limit?: number) =>
        api.get<SearchResponse>('/search', { params: { q, module, limit } }),

    // Management dashboard
    managementStats: () =>
        api.get<ManagementStats>('/admin/dashboard/stats'),

    // CSV Export helper (generates CSV and triggers download)
    exportCsv: (data: Record<string, any>[], filename: string) => {
        if (!data || data.length === 0) return;

        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row =>
                headers.map(h => {
                    const val = row[h];
                    const str = String(val ?? '');
                    // Escape commas and quotes
                    return str.includes(',') || str.includes('"') || str.includes('\n')
                        ? `"${str.replace(/"/g, '""')}"`
                        : str;
                }).join(',')
            ),
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    },
};

export default phase9Api;
