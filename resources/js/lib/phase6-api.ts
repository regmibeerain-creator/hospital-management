import api from './axios';

const phase6Api = {
    // ─── Notifications ───
    notifications: {
        list: (params?: Record<string, any>) => api.get('/notifications', { params }),
        unreadCount: () => api.get('/notifications/unread-count'),
        markRead: (id: number) => api.post(`/notifications/${id}/read`),
        markAllRead: () => api.post('/notifications/mark-all-read'),
        dismiss: (id: number) => api.delete(`/notifications/${id}`),
    },

    // ─── Reports & Analytics ───
    reports: {
        overview: () => api.get('/reports/overview'),
        revenueChart: (months?: number) => api.get('/reports/revenue-chart', { params: { months } }),
        appointments: (days?: number) => api.get('/reports/appointments', { params: { days } }),
        patients: (days?: number) => api.get('/reports/patients', { params: { days } }),
        billing: (days?: number) => api.get('/reports/billing', { params: { days } }),
    },

    // ─── System Settings ───
    settings: {
        all: () => api.get('/settings'),
        update: (settings: any[]) => api.put('/settings', { settings }),
        byGroup: (group: string) => api.get(`/settings/${group}`),
    },

    // ─── Audit Logs ───
    auditLogs: {
        list: (params?: Record<string, any>) => api.get('/audit-logs', { params }),
        my: (params?: Record<string, any>) => api.get('/audit-logs/my', { params }),
        show: (id: number) => api.get(`/audit-logs/${id}`),
    },
};

export default phase6Api;
