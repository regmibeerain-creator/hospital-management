import api from './axios';

const billingApi = {
    // ─── Billing ───
    stats: () => api.get('/billing/stats'),
    list: (params?: Record<string, any>) => api.get('/billing', { params }),
    show: (id: number) => api.get(`/billing/${id}`),
    create: (data: any) => api.post('/billing', data),
    addItem: (billId: number, data: any) => api.post(`/billing/${billId}/items`, data),
    removeItem: (billId: number, itemId: number) => api.delete(`/billing/${billId}/items/${itemId}`),
    recordPayment: (billId: number, data: any) => api.post(`/billing/${billId}/payments`, data),
    finalize: (billId: number) => api.post(`/billing/${billId}/finalize`),
    void: (billId: number, reason?: string) => api.post(`/billing/${billId}/void`, { reason }),

    // ─── Insurance ───
    insurance: {
        stats: () => api.get('/insurance/stats'),
        companies: (params?: Record<string, any>) => api.get('/insurance/companies', { params }),
        createCompany: (data: any) => api.post('/insurance/companies', data),
        updateCompany: (id: number, data: any) => api.put(`/insurance/companies/${id}`, data),
        policies: (params?: Record<string, any>) => api.get('/insurance/policies', { params }),
        createPolicy: (data: any) => api.post('/insurance/policies', data),
        claims: (params?: Record<string, any>) => api.get('/insurance/claims', { params }),
        submitClaim: (data: any) => api.post('/insurance/claims', data),
        approveClaim: (id: number, data: any) => api.post(`/insurance/claims/${id}/approve`, data),
    },

    // ─── Inventory ───
    inventory: {
        stats: () => api.get('/inventory/stats'),
        items: (params?: Record<string, any>) => api.get('/inventory/items', { params }),
        createItem: (data: any) => api.post('/inventory/items', data),
        updateItem: (id: number, data: any) => api.put(`/inventory/items/${id}`, data),
        stockMovements: (params?: Record<string, any>) => api.get('/inventory/stock-movements', { params }),
        addStock: (data: any) => api.post('/inventory/stock-movements', data),
        assets: (params?: Record<string, any>) => api.get('/inventory/assets', { params }),
        createAsset: (data: any) => api.post('/inventory/assets', data),
        updateAsset: (id: number, data: any) => api.put(`/inventory/assets/${id}`, data),
        maintenanceLogs: (assetId: number) => api.get(`/inventory/assets/${assetId}/maintenance`),
        createMaintenanceLog: (assetId: number, data: any) => api.post(`/inventory/assets/${assetId}/maintenance`, data),
    },
};

export default billingApi;
