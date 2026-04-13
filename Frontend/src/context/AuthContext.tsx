import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { checkToken, getProfile } from '../services/api';

interface AuthContextType {
    token: string | null;
    role: string | null;
    userName: string | null;
    isAuthenticated: boolean;
    loginUser: (token: string) => void;
    logout: () => void;
    refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    role: null,
    userName: null,
    isAuthenticated: false,
    loginUser: () => { },
    logout: () => { },
    refreshProfile: () => { },
});

function parseJwt(token: string) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch {
        return null;
    }
}

function isTokenExpired(token: string): boolean {
    const payload = parseJwt(token);
    if (!payload?.exp) return false;
    return Date.now() >= payload.exp * 1000;
}

// Use sessionStorage so each browser tab has its own independent session.
// This lets you be logged in as admin in one tab and customer in another.
function getInitialState() {
    const token = sessionStorage.getItem('token');
    if (!token) return { token: null, role: null, userName: null };
    if (isTokenExpired(token)) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userName');
        return { token: null, role: null, userName: null };
    }
    const payload = parseJwt(token);
    return { token, role: payload?.role || null, userName: sessionStorage.getItem('userName') };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const initial = getInitialState();
    const [token, setToken] = useState<string | null>(initial.token);
    const [role, setRole] = useState<string | null>(initial.role);
    const [userName, setUserName] = useState<string | null>(initial.userName);

    const fetchProfile = useCallback(() => {
        if (token) {
            getProfile().then((res) => {
                const name = res.data?.name || null;
                setUserName(name);
                if (name) sessionStorage.setItem('userName', name);
            }).catch(() => { });
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            checkToken().catch((err) => {
                if (err?.response?.status === 401) {
                    setToken(null);
                    setRole(null);
                    setUserName(null);
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('userName');
                }
            });
            fetchProfile();
        }
    }, [token, fetchProfile]);

    const loginUser = (newToken: string) => {
        sessionStorage.setItem('token', newToken);
        setToken(newToken);
        const payload = parseJwt(newToken);
        setRole(payload?.role || null);
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userName');
        setToken(null);
        setRole(null);
        setUserName(null);
    };

    return (
        <AuthContext.Provider value={{ token, role, userName, isAuthenticated: !!token, loginUser, logout, refreshProfile: fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
