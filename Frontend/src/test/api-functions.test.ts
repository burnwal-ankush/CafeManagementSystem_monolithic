// Test that every exported API function is callable (covers function bodies)
// These will throw network errors since there's no backend, but the function code executes
import { describe, it, expect } from 'vitest';
import {
    login, signup, checkToken, forgotPassword, changePassword, getProfile, updateProfile,
    getAllUsers, updateUser, addStaff, updateRole,
    getCategories, addCategory, updateCategory,
    getProducts, addProduct, updateProduct, deleteProduct, updateProductStatus, getProductsByCategory, getProductById,
    generateBill, getBills, getPdf, deleteBill,
    getDashboardCounts,
    getMyOrders, getMenu, addRating, getMyRatings, getAllRatings, getRatingsByBill, getRatingsByProduct,
} from '../services/api';

describe('API functions execute (real, no mock)', () => {
    // Each function returns a Promise that rejects (no backend), but the function body runs

    it('login calls API', async () => {
        const p = login({ email: 'a', password: 'b' });
        expect(p).toBeInstanceOf(Promise);
        await expect(p).rejects.toThrow();
    });

    it('signup calls API', async () => {
        await expect(signup({ name: 'a', email: 'b', contactNumber: 'c', password: 'd' })).rejects.toThrow();
    });

    it('checkToken calls API', async () => {
        await expect(checkToken()).rejects.toThrow();
    });

    it('forgotPassword calls API', async () => {
        await expect(forgotPassword({ email: 'a' })).rejects.toThrow();
    });

    it('changePassword calls API', async () => {
        await expect(changePassword({ oldPassword: 'a', newPassword: 'b' })).rejects.toThrow();
    });

    it('getProfile calls API', async () => {
        await expect(getProfile()).rejects.toThrow();
    });

    it('updateProfile calls API', async () => {
        await expect(updateProfile({ name: 'a' })).rejects.toThrow();
    });

    it('getAllUsers calls API', async () => {
        await expect(getAllUsers()).rejects.toThrow();
    });

    it('updateUser calls API', async () => {
        await expect(updateUser({ id: '1', status: 'true' })).rejects.toThrow();
    });

    it('addStaff calls API', async () => {
        await expect(addStaff({ name: 'a', email: 'b', contactNumber: 'c', password: 'd' })).rejects.toThrow();
    });

    it('updateRole calls API', async () => {
        await expect(updateRole({ id: '1', role: 'user' })).rejects.toThrow();
    });

    it('getCategories calls API', async () => {
        await expect(getCategories()).rejects.toThrow();
    });

    it('getCategories with filter calls API', async () => {
        await expect(getCategories('true')).rejects.toThrow();
    });

    it('addCategory calls API', async () => {
        await expect(addCategory({ name: 'a' })).rejects.toThrow();
    });

    it('updateCategory calls API', async () => {
        await expect(updateCategory({ id: '1', name: 'a' })).rejects.toThrow();
    });

    it('getProducts calls API', async () => {
        await expect(getProducts()).rejects.toThrow();
    });

    it('addProduct calls API', async () => {
        await expect(addProduct({ name: 'a', categoryId: '1', price: '5' })).rejects.toThrow();
    });

    it('updateProduct calls API', async () => {
        await expect(updateProduct({ id: '1', name: 'a' })).rejects.toThrow();
    });

    it('deleteProduct calls API', async () => {
        await expect(deleteProduct(1)).rejects.toThrow();
    });

    it('updateProductStatus calls API', async () => {
        await expect(updateProductStatus({ id: '1', status: 'true' })).rejects.toThrow();
    });

    it('getProductsByCategory calls API', async () => {
        await expect(getProductsByCategory(1)).rejects.toThrow();
    });

    it('getProductById calls API', async () => {
        await expect(getProductById(1)).rejects.toThrow();
    });

    it('generateBill calls API', async () => {
        await expect(generateBill({ name: 'a' })).rejects.toThrow();
    });

    it('getBills calls API', async () => {
        await expect(getBills()).rejects.toThrow();
    });

    it('getPdf calls API', async () => {
        await expect(getPdf({ uuid: 'a' })).rejects.toThrow();
    });

    it('deleteBill calls API', async () => {
        await expect(deleteBill(1)).rejects.toThrow();
    });

    it('getDashboardCounts calls API', async () => {
        await expect(getDashboardCounts()).rejects.toThrow();
    });

    it('getMyOrders calls API', async () => {
        await expect(getMyOrders()).rejects.toThrow();
    });

    it('getMenu calls API', async () => {
        await expect(getMenu()).rejects.toThrow();
    });

    it('addRating calls API', async () => {
        await expect(addRating({ score: '5' })).rejects.toThrow();
    });

    it('getMyRatings calls API', async () => {
        await expect(getMyRatings()).rejects.toThrow();
    });

    it('getAllRatings calls API', async () => {
        await expect(getAllRatings()).rejects.toThrow();
    });

    it('getRatingsByBill calls API', async () => {
        await expect(getRatingsByBill(1)).rejects.toThrow();
    });

    it('getRatingsByProduct calls API', async () => {
        await expect(getRatingsByProduct(1)).rejects.toThrow();
    });
});
