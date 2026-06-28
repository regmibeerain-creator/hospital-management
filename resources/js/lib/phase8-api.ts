import api from './axios';

export interface ImagingOrderData {
    id: number;
    order_number: string;
    study_type: string;
    body_part: string | null;
    clinical_history: string | null;
    notes: string | null;
    priority: 'routine' | 'urgent' | 'stat';
    status: 'ordered' | 'scheduled' | 'acquired' | 'reporting' | 'signed' | 'delivered';
    patient: { id: number; first_name: string; last_name: string; patient_id: string } | null;
    referring_doctor: { id: number; name: string } | null;
    schedule: ModalityScheduleData | null;
    report: StructuredReportData | null;
    created_at: string;
}

export interface ModalityScheduleData {
    id: number;
    modality: string;
    scheduled_at: string;
    duration_minutes: number;
    room: string | null;
    status: string;
    technician: { id: number; name: string } | null;
}

export interface ImagingStudyData {
    id: number;
    accession_number: string;
    modality: string;
    study_uid: string | null;
    series_count: number;
    instance_count: number;
    dicom_path: string | null;
    quality: string | null;
    status: string;
}

export interface StructuredReportData {
    id: number;
    report_title: string;
    technique: string | null;
    findings: string | null;
    impression: string | null;
    recommendation: string | null;
    comparison: string | null;
    status: 'draft' | 'preliminary' | 'signed' | 'amended';
    is_double_read: boolean;
    primary_reader: { id: number; name: string } | null;
    secondary_reader: { id: number; name: string } | null;
    signed_at: string | null;
}

export interface RisStats {
    total_orders: number;
    pending_orders: number;
    unreported_studies: number;
    signed_today: number;
    scheduled_today: number;
    in_progress: number;
    orders_by_modality: { study_type: string; total: number }[];
    avg_turnaround_hours: number | null;
}

const risApi = {
    // Dashboard
    stats: () => api.get<RisStats>('/ris/stats'),
    modalities: () => api.get<{ data: { id: string; name: string }[] }>('/ris/modalities'),

    // Orders
    orders: (params?: Record<string, any>) => api.get<{ data: ImagingOrderData[] }>('/ris/orders', { params }),
    storeOrder: (data: any) => api.post('/ris/orders', data),
    showOrder: (id: number) => api.get<{ data: ImagingOrderData }>(`/ris/orders/${id}`),
    updateOrder: (id: number, data: any) => api.put(`/ris/orders/${id}`, data),

    // Schedule
    schedule: (params?: Record<string, any>) => api.get<{ data: ModalityScheduleData[] }>('/ris/schedule', { params }),
    scheduleSlot: (data: any) => api.post('/ris/schedule', data),
    updateSchedule: (id: number, data: any) => api.put(`/ris/schedule/${id}`, data),

    // Studies
    studies: (params?: Record<string, any>) => api.get<{ data: ImagingStudyData[] }>('/ris/studies', { params }),
    acquireStudy: (data: any) => api.post('/ris/studies', data),
    updateStudy: (id: number, data: any) => api.put(`/ris/studies/${id}`, data),

    // Reports
    reports: (params?: Record<string, any>) => api.get<{ data: StructuredReportData[] }>('/ris/reports', { params }),
    startReport: (data: any) => api.post('/ris/reports', data),
    updateReport: (id: number, data: any) => api.put(`/ris/reports/${id}`, data),
    signReport: (id: number, data: any) => api.post(`/ris/reports/${id}/sign`, data),
    amendReport: (id: number, data: any) => api.post(`/ris/reports/${id}/amend`, data),
};

export default risApi;
