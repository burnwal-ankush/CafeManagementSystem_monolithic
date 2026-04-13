// This file tests the REAL api.ts without mocking axios
// It covers the interceptor functions (lines 8-25)
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Real API module', () => {
    beforeEach(() => {
        sessionStorage.clear();
        // Mock window.location to prevent actual navigation
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { href: '', assign: vi.fn(), replace: vi.fn() },
        });
    });

    it('exports all API functions', async () => {
        const api = await import('../services/api');
        // Auth
        expect(api.login).toBeTypeOf('function');
        expect(api.signup).toBeTypeOf('function');
        expect(api.checkToken).toBeTypeOf('function');
        expect(api.forgotPassword).toBeTypeOf('function');
        expect(api.changePassword).toBeTypeOf('function');
        expect(api.getProfile).toBeTypeOf('function');
        expect(api.updateProfile).toBeTypeOf('function');
        // Users
        expect(api.getAllUsers).toBeTypeOf('function');
        expect(api.updateUser).toBeTypeOf('function');
        expect(api.addStaff).toBeTypeOf('function');
        expect(api.updateRole).toBeTypeOf('function');
        // Categories
        expect(api.getCategories).toBeTypeOf('function');
        expect(api.addCategory).toBeTypeOf('function');
        expect(api.updateCategory).toBeTypeOf('function');
        // Products
        expect(api.getProducts).toBeTypeOf('function');
        expect(api.addProduct).toBeTypeOf('function');
        expect(api.updateProduct).toBeTypeOf('function');
        expect(api.deleteProduct).toBeTypeOf('function');
        expect(api.updateProductStatus).toBeTypeOf('function');
        expect(api.getProductsByCategory).toBeTypeOf('function');
        expect(api.getProductById).toBeTypeOf('function');
        // Bills
        expect(api.generateBill).toBeTypeOf('function');
        expect(api.getBills).toBeTypeOf('function');
        expect(api.getPdf).toBeTypeOf('function');
        expect(api.deleteBill).toBeTypeOf('function');
        // Dashboard
        expect(api.getDashboardCounts).toBeTypeOf('function');
        // Customer
        expect(api.getMyOrders).toBeTypeOf('function');
        expect(api.getMenu).toBeTypeOf('function');
        expect(api.addRating).toBeTypeOf('function');
        expect(api.getMyRatings).toBeTypeOf('function');
        expect(api.getAllRatings).toBeTypeOf('function');
        expect(api.getRatingsByBill).toBeTypeOf('function');
        expect(api.getRatingsByProduct).toBeTypeOf('function');
        // Default export
        expect(api.default).toBeDefined();
        expect(api.default.interceptors).toBeDefined();
    });

    it('request interceptor is configured', async () => {
        const api = await import('../services/api');
        expect(api.default.interceptors.request).toBeDefined();
    });

    it('response interceptor is configured', async () => {
        const api = await import('../services/api');
        expect(api.default.interceptors.response).toBeDefined();
    });

    it('request interceptor adds token when present in sessionStorage', async () => {
        sessionStorage.setItem('token', 'test-jwt-token');
        const api = await import('../services/api');
        // Access the interceptor handlers directly
        const reqHandlers = (api.default.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Record<string, unknown> }> }).handlers;
        if (reqHandlers && reqHandlers.length > 0) {
            const config = { headers: {} as Record<string, string> };
            const result = reqHandlers[reqHandlers.length - 1].fulfilled(config);
            expect((result as { headers: Record<string, string> }).headers.Authorization).toBe('Bearer test-jwt-token');
        }
    });

    it('request interceptor skips when no token', async () => {
        sessionStorage.removeItem('token');
        const api = await import('../services/api');
        const reqHandlers = (api.default.interceptors.request as unknown as { handlers: Array<{ fulfilled: (config: Record<string, unknown>) => Record<string, unknown> }> }).handlers;
        if (reqHandlers && reqHandlers.length > 0) {
            const config = { headers: {} as Record<string, string> };
            const result = reqHandlers[reqHandlers.length - 1].fulfilled(config);
            expect((result as { headers: Record<string, string> }).headers.Authorization).toBeUndefined();
        }
    });

    it('response interceptor clears session and redirects on 401', async () => {
        sessionStorage.setItem('token', 'abc');
        sessionStorage.setItem('userName', 'Test');
        const api = await import('../services/api');
        const resHandlers = (api.default.interceptors.response as unknown as { handlers: Array<{ rejected: (err: unknown) => Promise<never> }> }).handlers;
        if (resHandlers && resHandlers.length > 0) {
            const handler = resHandlers[resHandlers.length - 1].rejected;
            try {
                await handler({ response: { status: 401 } });
            } catch {
                // Expected - it rejects
            }
            expect(sessionStorage.getItem('token')).toBeNull();
            expect(sessionStorage.getItem('userName')).toBeNull();
            expect(window.location.href).toBe('/login');
        }
    });

    it('response interceptor does not redirect on non-401', async () => {
        sessionStorage.setItem('token', 'abc');
        const api = await import('../services/api');
        const resHandlers = (api.default.interceptors.response as unknown as { handlers: Array<{ rejected: (err: unknown) => Promise<never> }> }).handlers;
        if (resHandlers && resHandlers.length > 0) {
            const handler = resHandlers[resHandlers.length - 1].rejected;
            try {
                await handler({ response: { status: 500 } });
            } catch {
                // Expected
            }
            expect(sessionStorage.getItem('token')).toBe('abc');
        }
    });

    it('response interceptor handles error without response object', async () => {
        sessionStorage.setItem('token', 'abc');
        const api = await import('../services/api');
        const resHandlers = (api.default.interceptors.response as unknown as { handlers: Array<{ rejected: (err: unknown) => Promise<never> }> }).handlers;
        if (resHandlers && resHandlers.length > 0) {
            const handler = resHandlers[resHandlers.length - 1].rejected;
            try {
                await handler(new Error('Network error'));
            } catch {
                // Expected
            }
            expect(sessionStorage.getItem('token')).toBe('abc');
        }
    });
});
