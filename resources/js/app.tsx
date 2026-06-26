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
