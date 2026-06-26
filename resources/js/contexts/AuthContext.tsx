import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import api from '../lib/axios';

interface User {
    id: number;
    name: string;
    email: string;
    mobile_number: string | null;
    avatar: string | null;
    role: { id: number; name: string; slug: string } | null;
    onboard_status: string;
    email_verified_at: string | null;
    phone_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ requires_otp: boolean; token: string }>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    verifyOtp: (email: string, code: string, type: string) => Promise<void>;
    resendOtp: (email: string, type: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<{ reset_token: string }>;
    verifyResetOtp: (email: string, code: string, resetToken: string) => Promise<{ reset_token: string }>;
    resetPassword: (email: string, token: string, password: string, password_confirmation: string) => Promise<void>;
    updateProfile: (data: FormData) => Promise<User>;
    changePassword: (currentPassword: string, newPassword: string, newPasswordConfirmation: string) => Promise<void>;
    resendEmailVerification: (email: string) => Promise<void>;
    fetchUser: () => Promise<void>;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    mobile_number?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const response = await api.get('/user');
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchUser().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token, fetchUser]);

    const login = async (email: string, password: string) => {
        const response = await api.post('/login', { email, password });
        const { token: newToken, requires_otp } = response.data;
        setToken(newToken);
        localStorage.setItem('auth_token', newToken);
        return { requires_otp, token: newToken };
    };

    const register = async (data: RegisterData) => {
        await api.post('/register', data);
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    };

    const verifyOtp = async (email: string, code: string, type: string) => {
        await api.post('/verify-otp', { email, code, type });
        if (type === 'login') {
            await fetchUser();
        }
    };

    const resendOtp = async (email: string, type: string) => {
        await api.post('/resend-otp', { email, type });
    };

    const forgotPassword = async (email: string) => {
        const response = await api.post('/forgot-password', { email });
        return { reset_token: response.data.reset_token };
    };

    const verifyResetOtp = async (email: string, code: string, resetToken: string) => {
        const response = await api.post('/verify-reset-otp', { email, code, reset_token: resetToken });
        return { reset_token: response.data.reset_token };
    };

    const resetPassword = async (email: string, token: string, password: string, password_confirmation: string) => {
        await api.post('/reset-password', { email, token, password, password_confirmation });
    };

    const updateProfile = async (data: FormData) => {
        const response = await api.post('/profile', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
    };

    const changePassword = async (currentPassword: string, newPassword: string, newPasswordConfirmation: string) => {
        await api.post('/profile/change-password', {
            current_password: currentPassword,
            new_password: newPassword,
            new_password_confirmation: newPasswordConfirmation,
        });
    };

    const resendEmailVerification = async (email: string) => {
        await api.post('/resend-verification', { email });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                verifyOtp,
                resendOtp,
                forgotPassword,
                verifyResetOtp,
                resetPassword,
                updateProfile,
                changePassword,
                resendEmailVerification,
                fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
