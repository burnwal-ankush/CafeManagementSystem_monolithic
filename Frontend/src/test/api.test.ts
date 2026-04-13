import { describe, it, expect } from 'vitest';

describe('API Service Configuration', () => {
    it('exports all required API functions', async () => {
        const api = await import('../services/api');
        expect(api.login).toBeDefined();
        expect(api.signup).toBeDefined();
        expect(api.checkToken).toBeDefined();
        expect(api.forgotPassword).toBeDefined();
        expect(api.changePassword).toBeDefined();
        expect(api.getAllUsers).toBeDefined();
        expect(api.updateUser).toBeDefined();
        expect(api.addStaff).toBeDefined();
        expect(api.updateRole).toBeDefined();
        expect(api.getCategories).toBeDefined();
        expect(api.addCategory).toBeDefined();
        expect(api.updateCategory).toBeDefined();
        expect(api.getProducts).toBeDefined();
        expect(api.addProduct).toBeDefined();
        expect(api.updateProduct).toBeDefined();
        expect(api.deleteProduct).toBeDefined();
        expect(api.updateProductStatus).toBeDefined();
        expect(api.getProductsByCategory).toBeDefined();
        expect(api.getProductById).toBeDefined();
        expect(api.generateBill).toBeDefined();
        expect(api.getBills).toBeDefined();
        expect(api.getPdf).toBeDefined();
        expect(api.deleteBill).toBeDefined();
        expect(api.getDashboardCounts).toBeDefined();
        expect(api.getMyOrders).toBeDefined();
        expect(api.getMenu).toBeDefined();
        expect(api.addRating).toBeDefined();
        expect(api.getMyRatings).toBeDefined();
        expect(api.getAllRatings).toBeDefined();
        expect(api.getRatingsByBill).toBeDefined();
        expect(api.getRatingsByProduct).toBeDefined();
        expect(api.getProfile).toBeDefined();
        expect(api.updateProfile).toBeDefined();
    });

    it('exports default axios instance', async () => {
        const api = await import('../services/api');
        expect(api.default).toBeDefined();
    });
});
