import api from './axios';

const phase7Api = {
    // ─── LIS Dashboard ───
    stats: () => api.get('/lis/stats'),

    // ─── Test Catalog ───
    catalog: {
        list: (params?: Record<string, any>) => api.get('/lis/catalog', { params }),
        create: (data: any) => api.post('/lis/catalog', data),
        update: (id: number, data: any) => api.put(`/lis/catalog/${id}`, data),
    },

    // ─── Orders ───
    orders: {
        list: (params?: Record<string, any>) => api.get('/lis/orders', { params }),
        create: (data: any) => api.post('/lis/orders', data),
        show: (id: number) => api.get(`/lis/orders/${id}`),
    },

    // ─── Samples ───
    samples: {
        list: (params?: Record<string, any>) => api.get('/lis/samples', { params }),
        collect: (data: any) => api.post('/lis/samples/collect', data),
        accession: (id: number) => api.post(`/lis/samples/${id}/accession`),
    },

    // ─── Results ───
    results: {
        pending: (params?: Record<string, any>) => api.get('/lis/results/pending', { params }),
        enter: (id: number, data: any) => api.post(`/lis/results/${id}/enter`, data),
        validate: (id: number) => api.post(`/lis/results/${id}/validate`),
        bulkValidate: (resultIds: number[]) => api.post('/lis/results/bulk-validate', { result_ids: resultIds }),
        amend: (id: number, data: any) => api.post(`/lis/results/${id}/amend`, data),
    },
};

export default phase7Api;
