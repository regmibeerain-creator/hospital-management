import api from './axios';

export interface Doctor {
    id: number;
    user_id: number;
    name: string;
    email: string;
    specialization: string | null;
    qualification: string | null;
    experience_years: number;
    consultation_fee: number;
    availability: Record<string, { start: string; end: string; label?: string }[]> | null;
    department_id?: number | null;
    department?: Department | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Patient {
    id: number;
    user_id: number | null;
    patient_id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    date_of_birth: string | null;
    gender: string | null;
    blood_group: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
}

export interface Department {
    id: number;
    name: string;
    code: string;
    description: string | null;
    head_doctor_id: number | null;
    head_doctor?: Doctor | null;
    location: string | null;
    phone: string | null;
    email: string | null;
    is_active: boolean;
    doctors?: Doctor[];
    created_at: string;
    updated_at: string;
}

export interface AvailableSlot {
    start_time: string;
    end_time: string | null;
    label: string;
}

export interface Appointment {
    id: number;
    patient: Patient | null;
    doctor: Doctor | null;
    appointment_date: string;
    start_time: string;
    end_time: string | null;
    status: 'scheduled' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
    symptoms: string | null;
    notes: string | null;
    appointment_type: 'online' | 'offline';
    cancellation_reason: string | null;
    can_be_cancelled: boolean;
    is_upcoming: boolean;
    medical_reports?: MedicalReport[];
    prescriptions?: Prescription[];
    created_at: string;
    updated_at: string;
}

export interface PrescriptionItem {
    id: number;
    prescription_id: number;
    medicine_name: string;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
    instructions: string | null;
    quantity: number;
    is_required_medicine: boolean;
    created_at: string;
    updated_at: string;
}

export interface Prescription {
    id: number;
    patient_id: number;
    doctor: Doctor | null;
    appointment_id: number | null;
    diagnosis: string | null;
    notes: string | null;
    follow_up_date: string | null;
    status: 'active' | 'completed' | 'cancelled';
    items: PrescriptionItem[];
    created_at: string;
    updated_at: string;
}

export interface MedicalReport {
    id: number;
    patient_id: number;
    doctor: Doctor | null;
    appointment_id: number | null;
    report_title: string;
    report_type: string;
    file_path: string | null;
    description: string | null;
    uploaded_by: number | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

const bprApi = {
    // ── Doctors ──
    doctors: {
        list: (params?: { specialization?: string; search?: string; per_page?: number }) =>
            api.get<PaginatedResponse<Doctor>>('/doctors', { params }),
        show: (id: number) =>
            api.get<Doctor>(`/doctors/${id}`),
        availableSlots: (doctorId: number, date: string) =>
            api.get<{ date: string; doctor_id: number; slots: AvailableSlot[]; message?: string }>(
                `/doctors/${doctorId}/available-slots`,
                { params: { date } }
            ),
    },

    // ── Appointments ──
    appointments: {
        my: (params?: { status?: string; scope?: 'upcoming' | 'past'; per_page?: number }) =>
            api.get<PaginatedResponse<Appointment>>('/appointments/my', { params }),
        book: (data: {
            doctor_id: number;
            appointment_date: string;
            start_time: string;
            end_time?: string;
            symptoms?: string;
            appointment_type?: 'online' | 'offline';
        }) =>
            api.post<{ message: string; appointment: Appointment }>('/appointments/book', data),
        show: (id: number) =>
            api.get<Appointment>(`/appointments/${id}`),
        cancel: (id: number, data?: { cancellation_reason?: string }) =>
            api.post<{ message: string; appointment: Appointment }>(`/appointments/${id}/cancel`, data || {}),
    },

    // ── Patients ──
    patients: {
        search: (q: string) =>
            api.get<{ data: Patient[]; total: number }>('/patients/search', { params: { q } }),
        register: (data: {
            first_name: string;
            last_name: string;
            date_of_birth?: string;
            gender?: string;
            blood_group?: string;
            phone?: string;
            email?: string;
            address?: string;
            city?: string;
            state?: string;
            emergency_contact_name?: string;
            emergency_contact_phone?: string;
        }) =>
            api.post<{ message: string; data: Patient }>('/patients', data),
        list: (params?: { search?: string; per_page?: number }) =>
            api.get<PaginatedResponse<Patient>>('/patients', { params }),
        show: (id: number) =>
            api.get<{ data: Patient }>(`/patients/${id}`),
        update: (id: number, data: Partial<Patient>) =>
            api.put<{ message: string; data: Patient }>(`/patients/${id}`, data),
    },

    // ── Departments ──
    departments: {
        list: (params?: { search?: string; per_page?: number }) =>
            api.get<PaginatedResponse<Department>>('/departments', { params }),
        listAll: () =>
            api.get<{ data: Department[] }>('/departments/list'),
        show: (id: number) =>
            api.get<{ data: Department }>(`/departments/${id}`),
        create: (data: {
            name: string;
            code: string;
            description?: string;
            head_doctor_id?: number;
            location?: string;
            phone?: string;
            email?: string;
            is_active?: boolean;
        }) =>
            api.post<{ message: string; data: Department }>('/departments', data),
        update: (id: number, data: Partial<Department>) =>
            api.put<{ message: string; data: Department }>(`/departments/${id}`, data),
        delete: (id: number) =>
            api.delete<{ message: string }>(`/departments/${id}`),
    },

    // ── Medical Reports ──
    medicalReports: {
        list: (params?: { report_type?: string; per_page?: number }) =>
            api.get<PaginatedResponse<MedicalReport>>('/medical-reports', { params }),
        show: (id: number) =>
            api.get<MedicalReport>(`/medical-reports/${id}`),
        summary: () =>
            api.get<{ total_reports: number; by_type: Record<string, number> }>('/medical-reports/summary'),
    },

    // ── Prescriptions ──
    prescriptions: {
        list: (params?: { status?: string; per_page?: number }) =>
            api.get<PaginatedResponse<Prescription>>('/prescriptions', { params }),
        show: (id: number) =>
            api.get<Prescription>(`/prescriptions/${id}`),
        active: (params?: { per_page?: number }) =>
            api.get<PaginatedResponse<Prescription>>('/prescriptions/active', { params }),
    },
};

export default bprApi;
