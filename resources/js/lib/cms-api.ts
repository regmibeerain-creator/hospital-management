import api from './axios';

const cmsApi = {
    // Public endpoints
    public: {
        getHospitalProfile: () => api.get('/cms/hospital-profile'),
        getPages: () => api.get('/cms/pages'),
        getPage: (slug: string) => api.get(`/cms/pages/${slug}`),
        getPosts: (params?: { category?: string; featured?: boolean; per_page?: number }) =>
            api.get('/cms/posts', { params }),
        getPost: (slug: string) => api.get(`/cms/posts/${slug}`),
        getCategories: () => api.get('/cms/categories'),
        getFaqs: () => api.get('/cms/faqs'),
        getHealthPackages: (params?: { featured?: boolean; per_page?: number }) =>
            api.get('/cms/health-packages', { params }),
        getHealthPackage: (slug: string) => api.get(`/cms/health-packages/${slug}`),
        getMedia: () => api.get('/cms/media'),
        submitInquiry: (data: { name: string; email: string; phone?: string; subject: string; message: string }) =>
            api.post('/cms/inquiries', data),
    },

    // Admin endpoints
    admin: {
        getDashboardStats: () => api.get('/cms/admin/dashboard'),
        // Pages
        getPages: (params?: { search?: string }) => api.get('/cms/admin/pages', { params }),
        getPage: (id: number) => api.get(`/cms/admin/pages/${id}`),
        createPage: (data: any) => api.post('/cms/admin/pages', data),
        updatePage: (id: number, data: any) => api.put(`/cms/admin/pages/${id}`, data),
        deletePage: (id: number) => api.delete(`/cms/admin/pages/${id}`),
        // Posts
        getPosts: (params?: any) => api.get('/cms/admin/posts', { params }),
        getPost: (id: number) => api.get(`/cms/admin/posts/${id}`),
        createPost: (data: any) => api.post('/cms/admin/posts', data),
        updatePost: (id: number, data: any) => api.put(`/cms/admin/posts/${id}`, data),
        deletePost: (id: number) => api.delete(`/cms/admin/posts/${id}`),
        // Categories
        getCategories: () => api.get('/cms/admin/categories'),
        createCategory: (data: any) => api.post('/cms/admin/categories', data),
        updateCategory: (id: number, data: any) => api.put(`/cms/admin/categories/${id}`, data),
        deleteCategory: (id: number) => api.delete(`/cms/admin/categories/${id}`),
        // FAQs
        getFaqs: () => api.get('/cms/admin/faqs'),
        getFaq: (id: number) => api.get(`/cms/admin/faqs/${id}`),
        createFaq: (data: any) => api.post('/cms/admin/faqs', data),
        updateFaq: (id: number, data: any) => api.put(`/cms/admin/faqs/${id}`, data),
        deleteFaq: (id: number) => api.delete(`/cms/admin/faqs/${id}`),
        getFaqCategories: () => api.get('/cms/admin/faqs/categories'),
        createFaqCategory: (data: any) => api.post('/cms/admin/faqs/categories', data),
        updateFaqCategory: (id: number, data: any) => api.put(`/cms/admin/faqs/categories/${id}`, data),
        deleteFaqCategory: (id: number) => api.delete(`/cms/admin/faqs/categories/${id}`),
        // Inquiries
        getInquiries: (params?: { unread?: boolean }) => api.get('/cms/admin/inquiries', { params }),
        getInquiry: (id: number) => api.get(`/cms/admin/inquiries/${id}`),
        markInquiryRead: (id: number) => api.post(`/cms/admin/inquiries/${id}/mark-read`),
        deleteInquiry: (id: number) => api.delete(`/cms/admin/inquiries/${id}`),
        getInquiryStats: () => api.get('/cms/admin/inquiries/stats'),
        // Media
        getMedia: (params?: { type?: string }) => api.get('/cms/admin/media', { params }),
        uploadMedia: (formData: FormData) =>
            api.post('/cms/admin/media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        updateMedia: (id: number, data: any) => api.put(`/cms/admin/media/${id}`, data),
        deleteMedia: (id: number) => api.delete(`/cms/admin/media/${id}`),
        // Health Packages
        getHealthPackages: (params?: { search?: string }) =>
            api.get('/cms/admin/health-packages', { params }),
        getHealthPackage: (id: number) => api.get(`/cms/admin/health-packages/${id}`),
        createHealthPackage: (data: any) => api.post('/cms/admin/health-packages', data),
        updateHealthPackage: (id: number, data: any) =>
            api.put(`/cms/admin/health-packages/${id}`, data),
        deleteHealthPackage: (id: number) => api.delete(`/cms/admin/health-packages/${id}`),
        // Hospital Profile
        getHospitalProfile: () => api.get('/cms/admin/hospital-profile'),
        updateHospitalProfile: (data: any) => api.put('/cms/admin/hospital-profile', data),
    },
};

export default cmsApi;
