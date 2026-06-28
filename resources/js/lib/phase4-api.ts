import api from './axios';

const phase4Api = {
    // ─── Pharmacy ───
    pharmacy: {
        stats: () => api.get('/pharmacy/stats'),
        prescriptions: (params?: Record<string, any>) => api.get('/pharmacy/prescriptions', { params }),
        showPrescription: (id: number) => api.get(`/pharmacy/prescriptions/${id}`),
        dispense: (id: number, data: any) => api.post(`/pharmacy/prescriptions/${id}/dispense`, data),
        complete: (id: number) => api.post(`/pharmacy/prescriptions/${id}/complete`),
        medicines: (params?: Record<string, any>) => api.get('/pharmacy/medicines', { params }),
    },

    // ─── Laboratory ───
    laboratory: {
        stats: () => api.get('/laboratory/stats'),
        tests: (params?: Record<string, any>) => api.get('/laboratory/tests', { params }),
        createTest: (data: any) => api.post('/laboratory/tests', data),
        showTest: (id: number) => api.get(`/laboratory/tests/${id}`),
        enterResults: (id: number, data: any) => api.post(`/laboratory/tests/${id}/results`, data),
    },

    // ─── Radiology ───
    radiology: {
        stats: () => api.get('/radiology/stats'),
        orders: (params?: Record<string, any>) => api.get('/radiology/orders', { params }),
        createOrder: (data: any) => api.post('/radiology/orders', data),
        showOrder: (id: number) => api.get(`/radiology/orders/${id}`),
        enterResults: (id: number, data: any) => api.post(`/radiology/orders/${id}/results`, data),
    },
};

export default phase4Api;
