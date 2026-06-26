import { useAuth } from '../contexts/AuthContext';
import PatientDashboard from './dashboard/PatientDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import DoctorDashboard from './dashboard/DoctorDashboard';
import ReceptionDashboard from './dashboard/ReceptionDashboard';

export default function Dashboard() {
    const { user } = useAuth();
    const role = user?.role?.slug || 'patient';

    switch (role) {
        case 'admin':
            return <AdminDashboard />;
        case 'doctor':
            return <DoctorDashboard />;
        case 'receptionist':
            return <ReceptionDashboard />;
        case 'patient':
            return <PatientDashboard />;
        case 'nurse':
            return <PatientDashboard />;
        case 'pharmacist':
            return <PatientDashboard />;
        default:
            return <PatientDashboard />;
    }
}
