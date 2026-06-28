import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import OtpVerify from './pages/OtpVerify';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOtp from './pages/VerifyResetOtp';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ModulePage from './pages/dashboard/modules/ModulePage';

// Phase 6: Notifications, Reports & Settings
import NotificationsPage from './pages/dashboard/NotificationsPage';
import ReportsPage from './pages/dashboard/ReportsPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import AuditLogsPage from './pages/dashboard/AuditLogsPage';

// Patient BPR pages
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import AppointmentDetail from './pages/patient/AppointmentDetail';
import MedicalReports from './pages/patient/MedicalReports';
import Prescriptions from './pages/patient/Prescriptions';

// Public CMS pages
import PublicHomePage from './pages/public/PublicHomePage';
import BlogList from './pages/public/BlogList';
import BlogDetail from './pages/public/BlogDetail';
import FaqPage from './pages/public/FaqPage';
import ContactPage from './pages/public/ContactPage';
import HealthPackages from './pages/public/HealthPackages';

// Admin CMS pages
import CmsDashboard from './pages/admin/CmsDashboard';
import CmsPageManager from './pages/admin/CmsPageManager';
import CmsPostManager from './pages/admin/CmsPostManager';
import CmsCategoryManager from './pages/admin/CmsCategoryManager';
import CmsFaqManager from './pages/admin/CmsFaqManager';
import CmsInquiryManager from './pages/admin/CmsInquiryManager';
import CmsMediaManager from './pages/admin/CmsMediaManager';
import CmsHealthPackageManager from './pages/admin/CmsHealthPackageManager';
import CmsHospitalProfile from './pages/admin/CmsHospitalProfile';

// Phase 5: Billing, Insurance & Inventory
import BillingManager from './pages/admin/BillingManager';
import InsuranceManager from './pages/admin/InsuranceManager';
import InventoryManager from './pages/admin/InventoryManager';

// Phase 4: Pharmacy, Laboratory & Radiology
import PharmacyManager from './pages/admin/PharmacyManager';
import LaboratoryManager from './pages/admin/LaboratoryManager';
import RadiologyManager from './pages/admin/RadiologyManager';

// Phase 7: LIS - Laboratory Information System
import LisManager from './pages/admin/LisManager';

// Phase 8: RIS/PACS - Radiology Information System
import RisManager from './pages/admin/RisManager';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
    <BrowserRouter>
        <ThemeProvider>
        <AuthProvider>
            <Routes>
                {/* Public CMS routes */}
                <Route path="/" element={<PublicHomePage />} />
                <Route path="/website" element={<Navigate to="/" replace />} />
                <Route path="/website/blog" element={<BlogList />} />
                <Route path="/website/blog/:slug" element={<BlogDetail />} />
                <Route path="/website/faq" element={<FaqPage />} />
                <Route path="/website/contact" element={<ContactPage />} />
                <Route path="/website/health-packages" element={<HealthPackages />} />

                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<OtpVerify />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Dashboard routes — all nested under /dashboard */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />

                    {/* Patient BPR routes */}
                    <Route path="appointments/book" element={<BookAppointment />} />
                    <Route path="appointments/:id" element={<AppointmentDetail />} />
                    <Route path="appointments" element={<MyAppointments />} />
                    <Route path="medical-records" element={<MedicalReports />} />
                    <Route path="lab-reports" element={<MedicalReports />} />
                    <Route path="radiology-reports" element={<MedicalReports />} />
                    <Route path="prescriptions" element={<Prescriptions />} />

                    {/* Phase 5: Billing, Insurance & Inventory */}
                    <Route path="billing" element={<BillingManager />} />
                    <Route path="insurance" element={<InsuranceManager />} />
                    <Route path="inventory" element={<InventoryManager />} />

                    {/* Phase 4: Pharmacy, Laboratory & Radiology */}
                    <Route path="pharmacy" element={<PharmacyManager />} />
                    <Route path="laboratory" element={<LaboratoryManager />} />
                    <Route path="radiology" element={<RadiologyManager />} />

                    {/* Phase 6: Notifications, Reports & Settings */}
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="audit-logs" element={<AuditLogsPage />} />

                    {/* Phase 7: LIS */}
                    <Route path="lis" element={<LisManager />} />

                    {/* Phase 8: RIS/PACS */}
                    <Route path="ris" element={<RisManager />} />

                    <Route path="*" element={<ModulePage />} />
                </Route>

                {/* Admin CMS routes (inside AppLayout) */}
                <Route
                    path="/admin/cms"
                    element={
                        <ProtectedRoute roles={['admin']}>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<CmsDashboard />} />
                    <Route path="pages" element={<CmsPageManager />} />
                    <Route path="posts" element={<CmsPostManager />} />
                    <Route path="categories" element={<CmsCategoryManager />} />
                    <Route path="faq" element={<CmsFaqManager />} />
                    <Route path="inquiries" element={<CmsInquiryManager />} />
                    <Route path="media" element={<CmsMediaManager />} />
                    <Route path="health-packages" element={<CmsHealthPackageManager />} />
                    <Route path="profile" element={<CmsHospitalProfile />} />
                </Route>

                {/* Legacy redirects */}
                <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
        </ThemeProvider>
    </BrowserRouter>
);
