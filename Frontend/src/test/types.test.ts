import { describe, it, expect } from 'vitest';
import type { User, Category, Product, Bill, Rating, DashboardCounts, ProductDetail } from '../types';

describe('Type Definitions', () => {
    it('User type has all required fields', () => {
        const user: User = { id: 1, name: 'Test', contactNumber: '123', email: 'test@e.com', status: 'true', role: 'customer' };
        expect(user.id).toBe(1);
        expect(user.role).toBe('customer');
    });

    it('Category type has id and name', () => {
        const cat: Category = { id: 1, name: 'Beverages' };
        expect(cat.name).toBe('Beverages');
    });

    it('Product type supports double price', () => {
        const prod: Product = { id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' };
        expect(prod.price).toBe(4.99);
    });

    it('Bill type supports double total', () => {
        const bill: Bill = { id: 1, uuid: 'B-1', name: 'Test', email: 'e@e.com', contactNumber: '1', paymentMethod: 'Cash', total: 25.50, productDetail: '[]', createdBy: 'e@e.com', billCreatedDttm: '2026-01-01' };
        expect(bill.total).toBe(25.50);
    });

    it('Rating type has review type fields', () => {
        const rating: Rating = { id: 1, customerEmail: 'e@e.com', customerName: 'Jane', score: 5, comment: 'Great', createdAt: '2026-01-01', billId: 1, productId: null, productName: null, reviewType: 'bill' };
        expect(rating.reviewType).toBe('bill');
        expect(rating.billId).toBe(1);
    });

    it('DashboardCounts has all count fields', () => {
        const counts: DashboardCounts = { category: 5, product: 10, bill: 20 };
        expect(counts.category + counts.product + counts.bill).toBe(35);
    });

    it('ProductDetail has quantity as number', () => {
        const detail: ProductDetail = { id: 1, name: 'Coffee', category: 'Bev', quantity: 2, price: 4.99, total: 9.98 };
        expect(detail.quantity).toBe(2);
        expect(detail.total).toBeCloseTo(9.98);
    });
});
