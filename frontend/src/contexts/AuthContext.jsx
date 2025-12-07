import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const res = await authAPI.login({ email, password });
            const { token: t, user: u } = res.data;

            localStorage.setItem('token', t);
            localStorage.setItem('user', JSON.stringify(u));
            setToken(t);
            setUser(u);

            return { success: true };
        } catch (err) {
            const msg = err.displayMessage || 'Login failed';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const signup = useCallback(async (name, email, password, department) => {
        setLoading(true);
        setError(null);

        try {
            const res = await authAPI.signup({ name, email, password, department });
            const { token: t, user: u } = res.data;

            localStorage.setItem('token', t);
            localStorage.setItem('user', JSON.stringify(u));
            setToken(t);
            setUser(u);

            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || err.displayMessage || 'Signup failed';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setError(null);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const value = {
        user,
        token,
        loading,
        error,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        clearError
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
