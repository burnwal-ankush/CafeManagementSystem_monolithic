import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Helper component to expose auth context
function AuthConsumer() {
    const { isAuthenticated, role, userName, loginUser, logout } = useAuth();
    return (
        <div>
            <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
            <span data-testid="role">{role || 'none'}</span>
            <span data-testid="name">{userName || 'none'}</span>
            <button data-testid="login" onClick={() => loginUser(createMockToken('admin'))}>Login</button>
            <button data-testid="logout" onClick={logout}>Logout</button>
        </div>
    );
}

function createMockToken(role: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256' }));
    const payload = btoa(JSON.stringify({ sub: 'test@e.com', role, exp: Math.floor(Date.now() / 1000) + 3600 }));
    return `${header}.${payload}.signature`;
}

describe('AuthContext', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('starts unauthenticated when no token', () => {
        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        expect(screen.getByTestId('auth').textContent).toBe('no');
        expect(screen.getByTestId('role').textContent).toBe('none');
    });

    it('loginUser sets token and role', () => {
        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        act(() => { screen.getByTestId('login').click(); });
        expect(screen.getByTestId('auth').textContent).toBe('yes');
        expect(screen.getByTestId('role').textContent).toBe('admin');
        expect(sessionStorage.getItem('token')).toBeTruthy();
    });

    it('logout clears everything', () => {
        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        act(() => { screen.getByTestId('login').click(); });
        act(() => { screen.getByTestId('logout').click(); });
        expect(screen.getByTestId('auth').textContent).toBe('no');
        expect(sessionStorage.getItem('token')).toBeNull();
    });

    it('restores session from sessionStorage', () => {
        const token = createMockToken('customer');
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userName', 'Jane');

        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        expect(screen.getByTestId('auth').textContent).toBe('yes');
        expect(screen.getByTestId('role').textContent).toBe('customer');
        expect(screen.getByTestId('name').textContent).toBe('Jane');
    });

    it('clears expired token on init', () => {
        const header = btoa(JSON.stringify({ alg: 'HS256' }));
        const payload = btoa(JSON.stringify({ sub: 'test@e.com', role: 'admin', exp: 1000 }));
        sessionStorage.setItem('token', `${header}.${payload}.sig`);

        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        expect(screen.getByTestId('auth').textContent).toBe('no');
        expect(sessionStorage.getItem('token')).toBeNull();
    });
});
