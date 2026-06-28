import { createContext, useContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import api from '../lib/api';

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
    setUser: Dispatch<SetStateAction<User | null>>;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ requires_otp: boolean; token: string }>;
    register: (data: { name: string; email: string; mobile_number?: string; password: string; password_confirmation: string }) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/user');
            setUser(response.data);
        } catch {
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await api.post('/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            setToken(response.data.token);
        }
        return { requires_otp: response.data.requires_otp ?? false, token: response.data.token ?? '' };
    };

    const register = async (data: { name: string; email: string; mobile_number?: string; password: string; password_confirmation: string }) => {
        await api.post('/register', data);
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch {
            // ignore
        }
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}
