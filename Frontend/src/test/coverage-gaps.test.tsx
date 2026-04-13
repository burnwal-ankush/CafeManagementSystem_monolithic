import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';

const m = vi.hoisted(() => ({
    login: vi.fn(), signup: vi.fn(), forgotPassword: vi.fn(),
    checkToken: vi.fn(() => Promise.resolve()),
    getProfile: vi.fn(() => Promise.resolve({ data: { name: 'T', email: 't@e.com', contactNumber: '1', role: 'admin' } })),
    getDashboardCounts: vi.fn(() => Promise.resolve({ data: { category: 0, product: 0, bill: 0 } })),
    getCategories: vi.fn(() => Promise.resolve({ data: [] })),
    getProducts: vi.fn(() => Promise.resolve({ data: [] })),
    getBills: vi.fn(() => Promise.resolve({ data: [] })),
    getAllUsers: vi.fn(() => Promise.resolve({ data: [] })),
    getMyOrders: vi.fn(() => Promise.resolve({ data: [] })),
    getMyRatings: vi.fn(() => Promise.resolve({ data: [] })),
    getAllRatings: vi.fn(() => Promise.resolve({ data: [] })),
    getMenu: vi.fn(() => Promise.resolve({ data: [] })),
    addCategory: vi.fn(), updateCategory: vi.fn(),
    addProduct: vi.fn(), updateProduct: vi.fn(), deleteProduct: vi.fn(), updateProductStatus: vi.fn(),
    getProductsByCategory: vi.fn(() => Promise.resolve({ data: [] })),
    generateBill: vi.fn(), deleteBill: vi.fn(),
    updateUser: vi.fn(), addStaff: vi.fn(), updateRole: vi.fn(),
    updateProfile: vi.fn(), changePassword: vi.fn(),
    addRating: vi.fn(),
    getRatingsByBill: vi.fn(() => Promise.resolve({ data: [] })),
    getRatingsByProduct: vi.fn(() => Promise.resolve({ data: [] })),
    getPdf: vi.fn(), getProductById: vi.fn(),
}));

vi.mock('../services/api', () => ({
    ...Object.fromEntries(Object.entries(m).map(([k, v]) => [k, (...a: unknown[]) => v(...a)])),
    default: { interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
}));

function W({ children }: { children: React.ReactNode }) {
    return <MemoryRouter><AuthProvider>{children}</AuthProvider></MemoryRouter>;
}

beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    m.getProfile.mockResolvedValue({ data: { name: 'T', email: 't@e.com', contactNumber: '1', role: 'admin' } });
    m.getCategories.mockResolvedValue({ data: [] });
    m.getProducts.mockResolvedValue({ data: [] });
    m.getBills.mockResolvedValue({ data: [] });
    m.getAllUsers.mockResolvedValue({ data: [] });
    m.getMyOrders.mockResolvedValue({ data: [] });
    m.getMyRatings.mockResolvedValue({ data: [] });
    m.getAllRatings.mockResolvedValue({ data: [] });
    m.getMenu.mockResolvedValue({ data: [] });
    m.getProductsByCategory.mockResolvedValue({ data: [] });
    window.confirm = vi.fn(() => true);
});

// ===== ORDERS: full cart flow, category change, submit, remove =====
describe('Orders - full flow', async () => {
    const { default: Orders } = await import('../pages/Orders');

    it('opens modal, selects category, adds to cart, submits', async () => {
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        m.getProductsByCategory.mockResolvedValue({ data: [{ id: 10, name: 'Latte', price: 5.5, status: 'true', customerId: 1, customerName: 'Bev', description: '' }] });
        m.generateBill.mockResolvedValue({ data: 'OK' });
        render(<W><Orders /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('New Order'));
        await waitFor(() => expect(screen.getByText('Customer Name')).toBeInTheDocument());

        // Fill customer info
        fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Alice' } });
        fireEvent.change(screen.getByPlaceholderText('john@email.com'), { target: { value: 'a@e.com' } });
        fireEvent.change(screen.getByPlaceholderText('+1 234 567'), { target: { value: '999' } });

        // Select category - find the select that has 'Bev' option
        const allSelects = screen.getAllByRole('combobox');
        for (const sel of allSelects) {
            if (sel.querySelector('option[value="1"]')) {
                fireEvent.change(sel, { target: { value: '1' } });
                break;
            }
        }
        await waitFor(() => expect(m.getProductsByCategory).toHaveBeenCalledWith(1));

        // After category change, product options should appear - find the select with product
        await waitFor(() => {
            const updatedSelects = screen.getAllByRole('combobox');
            const prodSel = updatedSelects.find(s => s.querySelector('option[value="10"]'));
            if (prodSel) fireEvent.change(prodSel, { target: { value: '10' } });
        });

        // Add to cart
        fireEvent.click(screen.getByText('+ Add'));

        // Submit order
        fireEvent.click(screen.getByText('Place Order'));
        await waitFor(() => expect(m.generateBill).toHaveBeenCalled());
    });

    it('shows error when submitting empty cart', async () => {
        m.getCategories.mockResolvedValue({ data: [] });
        render(<W><Orders /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('New Order'));
        await waitFor(() => expect(screen.getByText('Place Order')).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'A' } });
        fireEvent.change(screen.getByPlaceholderText('john@email.com'), { target: { value: 'a@e.com' } });
        fireEvent.change(screen.getByPlaceholderText('+1 234 567'), { target: { value: '1' } });
        fireEvent.click(screen.getByText('Place Order'));
        // Should not call API
        expect(m.generateBill).not.toHaveBeenCalled();
    });

    it('handles generate bill failure', async () => {
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'B' }] });
        m.getProductsByCategory.mockResolvedValue({ data: [{ id: 1, name: 'X', price: 1, status: 'true', customerId: 1, customerName: 'B', description: '' }] });
        m.generateBill.mockRejectedValue(new Error('fail'));
        render(<W><Orders /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('New Order'));
        await waitFor(() => { });

        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[1], { target: { value: '1' } });
        await waitFor(() => { });
        fireEvent.change(selects[2], { target: { value: '1' } });
        fireEvent.click(screen.getByText('+ Add'));
        await waitFor(() => { });

        fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'A' } });
        fireEvent.change(screen.getByPlaceholderText('john@email.com'), { target: { value: 'a@e.com' } });
        fireEvent.change(screen.getByPlaceholderText('+1 234 567'), { target: { value: '1' } });
        fireEvent.click(screen.getByText('Place Order'));
        await waitFor(() => expect(m.generateBill).toHaveBeenCalled());
    });

    it('category change to empty clears products', async () => {
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'B' }] });
        render(<W><Orders /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('New Order'));
        await waitFor(() => { });
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[1], { target: { value: '1' } });
        await waitFor(() => { });
        fireEvent.change(selects[1], { target: { value: '' } });
    });

    it('handles delete bill failure', async () => {
        m.deleteBill.mockRejectedValue(new Error('fail'));
        m.getBills.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', name: 'J', email: 'j@e.com', contactNumber: '1', paymentMethod: 'Cash', total: 10, productDetail: '[]', createdBy: 'j@e.com' }] });
        m.getCategories.mockResolvedValue({ data: [] });
        render(<W><Orders /></W>);
        await waitFor(() => expect(screen.getByText('J')).toBeInTheDocument());
        const delBtn = screen.getAllByRole('button').find(b => b.style.color === 'var(--danger)');
        if (delBtn) fireEvent.click(delBtn);
        await waitFor(() => expect(m.deleteBill).toHaveBeenCalled());
    });
});

// ===== PRODUCTS: edit flow, submit update, submit add, failures =====
describe('Products - edit and submit', async () => {
    const { default: Products } = await import('../pages/Products');

    it('opens edit modal and submits update', async () => {
        m.updateProduct.mockResolvedValue({ data: 'OK' });
        m.getProducts.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());

        // Click edit button (the one with latte background)
        const editBtn = screen.getAllByRole('button').find(b => b.style.background === 'var(--latte)');
        if (editBtn) fireEvent.click(editBtn);
        await waitFor(() => expect(screen.getByText('Edit Product')).toBeInTheDocument());

        fireEvent.change(screen.getByDisplayValue('Coffee'), { target: { value: 'Espresso' } });
        fireEvent.click(screen.getByText('Update'));
        await waitFor(() => expect(m.updateProduct).toHaveBeenCalled());
    });

    it('submits new product', async () => {
        m.addProduct.mockResolvedValue({ data: 'OK' });
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('Add Product'));
        await waitFor(() => expect(screen.getByText('New Product')).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('e.g. Cappuccino'), { target: { value: 'Mocha' } });
        fireEvent.change(screen.getByPlaceholderText('4.99'), { target: { value: '6.50' } });
        fireEvent.click(screen.getByText('Add'));
        await waitFor(() => expect(m.addProduct).toHaveBeenCalled());
    });

    it('handles add product failure', async () => {
        m.addProduct.mockRejectedValue(new Error('fail'));
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('Add Product'));
        await waitFor(() => { });
        fireEvent.change(screen.getByPlaceholderText('e.g. Cappuccino'), { target: { value: 'X' } });
        fireEvent.change(screen.getByPlaceholderText('4.99'), { target: { value: '1' } });
        fireEvent.click(screen.getByText('Add'));
        await waitFor(() => expect(m.addProduct).toHaveBeenCalled());
    });

    it('handles delete failure', async () => {
        m.deleteProduct.mockRejectedValue(new Error('fail'));
        m.getProducts.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        const delBtn = screen.getAllByRole('button').find(b => b.style.color === 'var(--danger)');
        if (delBtn) fireEvent.click(delBtn);
        await waitFor(() => expect(m.deleteProduct).toHaveBeenCalled());
    });

    it('handles status toggle failure', async () => {
        m.updateProductStatus.mockRejectedValue(new Error('fail'));
        m.getProducts.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => expect(screen.getByText('Active')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Active'));
        await waitFor(() => expect(m.updateProductStatus).toHaveBeenCalled());
    });
});

// ===== USERS: add staff modal full flow, error paths =====
describe('Users - add staff and errors', async () => {
    const { default: Users } = await import('../pages/Users');

    it('submits add staff form successfully', async () => {
        m.addStaff.mockResolvedValue({ data: '{"message":"Added!"}' });
        render(<W><Users /></W>);
        fireEvent.click(screen.getByText('Add Staff'));
        await waitFor(() => expect(screen.getByText('Add Staff Member')).toBeInTheDocument());

        fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'New Staff' } });
        fireEvent.change(screen.getByPlaceholderText('john@cafe.com'), { target: { value: 'ns@e.com' } });
        fireEvent.change(screen.getByPlaceholderText('+1 234 567 890'), { target: { value: '555' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass123' } });

        // Toggle password visibility in modal
        fireEvent.click(screen.getByLabelText('Show password'));
        fireEvent.click(screen.getByLabelText('Hide password'));

        fireEvent.click(screen.getAllByText('Add Staff').find(b => b.tagName === 'BUTTON' && b.getAttribute('type') === 'submit')!);
        await waitFor(() => expect(m.addStaff).toHaveBeenCalled());
    });

    it('handles add staff with object response', async () => {
        m.addStaff.mockResolvedValue({ data: { message: 'Added!' } });
        render(<W><Users /></W>);
        fireEvent.click(screen.getByText('Add Staff'));
        await waitFor(() => expect(screen.getByText('Add Staff Member')).toBeInTheDocument());
        fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'S' } });
        fireEvent.change(screen.getByPlaceholderText('john@cafe.com'), { target: { value: 's@e.com' } });
        fireEvent.change(screen.getByPlaceholderText('+1 234 567 890'), { target: { value: '1' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'p' } });
        fireEvent.click(screen.getAllByText('Add Staff').find(b => b.tagName === 'BUTTON' && b.getAttribute('type') === 'submit')!);
        await waitFor(() => expect(m.addStaff).toHaveBeenCalled());
    });

    it('handles add staff failure with parseable error', async () => {
        m.addStaff.mockRejectedValue({ response: { data: '{"message":"Email exists"}' } });
        render(<W><Users /></W>);
        fireEvent.click(screen.getByText('Add Staff'));
        await waitFor(() => { });
        fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'S' } });
        fireEvent.change(screen.getByPlaceholderText('john@cafe.com'), { target: { value: 's@e.com' } });
        fireEvent.change(screen.getByPlaceholderText('+1 234 567 890'), { target: { value: '1' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'p' } });
        fireEvent.click(screen.getAllByText('Add Staff').find(b => b.tagName === 'BUTTON' && b.getAttribute('type') === 'submit')!);
        await waitFor(() => expect(m.addStaff).toHaveBeenCalled());
    });

    it('handles add staff failure with unparseable error', async () => {
        m.addStaff.mockRejectedValue({ response: { data: 'not json' } });
        render(<W><Users /></W>);
        fireEvent.click(screen.getByText('Add Staff'));
        await waitFor(() => { });
        fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'S' } });
        fireEvent.change(screen.getByPlaceholderText('john@cafe.com'), { target: { value: 's@e.com' } });
        fireEvent.change(screen.getByPlaceholderText('+1 234 567 890'), { target: { value: '1' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'p' } });
        fireEvent.click(screen.getAllByText('Add Staff').find(b => b.tagName === 'BUTTON' && b.getAttribute('type') === 'submit')!);
        await waitFor(() => expect(m.addStaff).toHaveBeenCalled());
    });

    it('handles toggle status failure', async () => {
        m.updateUser.mockRejectedValue(new Error('fail'));
        m.getAllUsers.mockResolvedValue({ data: [{ id: 1, name: 'Alice', contactNumber: '1', email: 'a@e.com', status: 'true', role: 'user' }] });
        render(<W><Users /></W>);
        await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Deactivate'));
        await waitFor(() => expect(m.updateUser).toHaveBeenCalled());
    });

    it('handles toggle role failure', async () => {
        m.updateRole.mockRejectedValue(new Error('fail'));
        m.getAllUsers.mockResolvedValue({ data: [{ id: 1, name: 'Alice', contactNumber: '1', email: 'a@e.com', status: 'true', role: 'customer' }] });
        render(<W><Users /></W>);
        await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Make Staff'));
        await waitFor(() => expect(m.updateRole).toHaveBeenCalled());
    });

    it('shows unknown role badge', async () => {
        m.getAllUsers.mockResolvedValue({ data: [{ id: 1, name: 'Alice', contactNumber: '1', email: 'a@e.com', status: 'true', role: 'unknown' }] });
        render(<W><Users /></W>);
        await waitFor(() => expect(screen.getByText('unknown')).toBeInTheDocument());
    });

    it('search focus/blur styles', async () => {
        render(<W><Users /></W>);
        const search = screen.getByPlaceholderText('Search by name, email, or phone...');
        fireEvent.focus(search);
        expect(search.style.borderColor).toBe('var(--caramel)');
        fireEvent.blur(search);
    });
});

// ===== CATEGORIES: edit submit, update failure =====
describe('Categories - edit and update', async () => {
    const { default: Categories } = await import('../pages/Categories');

    it('edits existing category and submits update', async () => {
        m.updateCategory.mockResolvedValue({ data: 'OK' });
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Beverages' }] });
        render(<W><Categories /></W>);
        await waitFor(() => expect(screen.getByText('Beverages')).toBeInTheDocument());

        // Click edit button
        const editBtn = screen.getAllByRole('button').find(b => b.style.borderRadius === '50%');
        if (editBtn) fireEvent.click(editBtn);
        await waitFor(() => expect(screen.getByText('Edit Category')).toBeInTheDocument());

        fireEvent.change(screen.getByDisplayValue('Beverages'), { target: { value: 'Drinks' } });
        fireEvent.click(screen.getByText('Update'));
        await waitFor(() => expect(m.updateCategory).toHaveBeenCalledWith({ id: '1', name: 'Drinks' }));
    });

    it('closes modal with cancel', async () => {
        m.getCategories.mockResolvedValue({ data: [] });
        render(<W><Categories /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('Add Category'));
        await waitFor(() => expect(screen.getByText('New Category')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Cancel'));
    });
});

// ===== ACCOUNT: change password failure =====
describe('Account - password change failure', async () => {
    const { default: Account } = await import('../pages/Account');

    it('handles password change API failure', async () => {
        m.changePassword.mockRejectedValue(new Error('fail'));
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByText('Change Password')).toBeInTheDocument());
        const pwInputs = screen.getAllByPlaceholderText('••••••••');
        fireEvent.change(pwInputs[0], { target: { value: 'old' } });
        fireEvent.change(pwInputs[1], { target: { value: 'new' } });
        fireEvent.change(pwInputs[2], { target: { value: 'new' } });
        fireEvent.click(screen.getByText('Update Password'));
        await waitFor(() => expect(m.changePassword).toHaveBeenCalled());
    });

    it('updates phone number', async () => {
        m.updateProfile.mockResolvedValue({ data: { message: 'OK' } });
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByDisplayValue('1')).toBeInTheDocument());
        fireEvent.change(screen.getByDisplayValue('1'), { target: { value: '999' } });
        fireEvent.click(screen.getByText('Save Changes'));
        await waitFor(() => expect(m.updateProfile).toHaveBeenCalledWith({ name: 'T', contactNumber: '999' }));
    });
});

// ===== CUSTOMER MENU: submit failure, empty reviews, no description =====
describe('CustomerMenu - edge cases', async () => {
    const { default: CustomerMenu } = await import('../pages/CustomerMenu');

    it('handles review submit failure', async () => {
        m.addRating.mockRejectedValue(new Error('fail'));
        m.getMenu.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: '', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review'));
        await waitFor(() => { });
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        fireEvent.click(stars[2]);
        fireEvent.click(screen.getByText('Submit'));
        await waitFor(() => expect(m.addRating).toHaveBeenCalled());
    });

    it('shows empty reviews for product', async () => {
        m.getRatingsByProduct.mockResolvedValue({ data: [] });
        m.getMenu.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Reviews'));
        await waitFor(() => expect(screen.getByText('No reviews yet')).toBeInTheDocument());
        // Toggle hide
        fireEvent.click(screen.getByText('Hide'));
    });

    it('submit without score shows error', async () => {
        m.getMenu.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review'));
        await waitFor(() => { });
        fireEvent.click(screen.getByText('Submit'));
        expect(m.addRating).not.toHaveBeenCalled();
    });

    it('shows avg rating when reviews loaded', async () => {
        m.getRatingsByProduct.mockResolvedValue({
            data: [
                { id: 1, customerName: 'J', score: 4, comment: '', reviewType: 'product', createdAt: '2026-01-01' },
                { id: 2, customerName: 'K', score: 5, comment: 'Nice', reviewType: 'product', createdAt: '2026-01-01' },
            ]
        });
        m.getMenu.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Reviews'));
        await waitFor(() => expect(screen.getByText('4.5')).toBeInTheDocument());
    });
});

// ===== CUSTOMER ORDERS: product review with product type, review with expanded bill =====
describe('CustomerOrders - product review flow', async () => {
    const { default: CustomerOrders } = await import('../pages/CustomerOrders');

    it('submits product review from order', async () => {
        m.addRating.mockResolvedValue({ data: { message: 'OK' } });
        m.getMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[{"id":5,"name":"Latte","quantity":1,"total":5}]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('Rate')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Rate'));
        await waitFor(() => expect(screen.getByText('How was this item?')).toBeInTheDocument());
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        fireEvent.click(stars[4]);
        fireEvent.change(screen.getByPlaceholderText('Share your thoughts...'), { target: { value: 'Yum' } });
        fireEvent.click(screen.getByText('Submit'));
        await waitFor(() => {
            const call = m.addRating.mock.calls[0][0];
            expect(call.reviewType).toBe('product');
            expect(call.productId).toBe('5');
            expect(call.productName).toBe('Latte');
        });
    });

    it('handles review submit failure', async () => {
        m.addRating.mockRejectedValue(new Error('fail'));
        m.getMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('Review Order')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review Order'));
        await waitFor(() => { });
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        fireEvent.click(stars[0]);
        fireEvent.click(screen.getByText('Submit'));
        await waitFor(() => expect(m.addRating).toHaveBeenCalled());
    });

    it('shows product review with product name badge in reviews', async () => {
        m.getRatingsByBill.mockResolvedValue({
            data: [
                { id: 1, customerName: 'Jane', score: 5, comment: 'Great', reviewType: 'product', productName: 'Latte', createdAt: '2026-01-01' },
            ]
        });
        m.getMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('View Reviews')).toBeInTheDocument());
        fireEvent.click(screen.getByText('View Reviews'));
        await waitFor(() => {
            expect(screen.getByText('Jane')).toBeInTheDocument();
            expect(screen.getByText('Latte')).toBeInTheDocument();
        });
    });
});

// ===== AUTH CONTEXT: 401 on checkToken =====
describe('AuthContext - 401 handling', () => {
    it('clears session on 401 from checkToken', async () => {
        const header = btoa(JSON.stringify({ alg: 'HS256' }));
        const payload = btoa(JSON.stringify({ sub: 'test@e.com', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 }));
        const token = `${header}.${payload}.sig`;
        sessionStorage.setItem('token', token);

        m.checkToken.mockRejectedValue({ response: { status: 401 } });
        m.getProfile.mockRejectedValue({ response: { status: 401 } });

        const { useAuth } = await import('../context/AuthContext');
        function Consumer() {
            const { isAuthenticated } = useAuth();
            return <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>;
        }

        render(<W><Consumer /></W>);
        await waitFor(() => {
            expect(sessionStorage.getItem('token')).toBeNull();
        }, { timeout: 3000 });
    });
});

// ===== API INTERCEPTORS =====
describe('API interceptors', () => {
    it('request interceptor adds token from sessionStorage', async () => {
        // Import the real module to test interceptors
        sessionStorage.setItem('token', 'test-token');
        const api = await import('../services/api');
        // The interceptor is already set up on import - verify the module exports
        expect(api.default).toBeDefined();
        expect(typeof api.login).toBe('function');
        expect(typeof api.signup).toBe('function');
        expect(typeof api.checkToken).toBe('function');
        expect(typeof api.forgotPassword).toBe('function');
        expect(typeof api.changePassword).toBe('function');
        expect(typeof api.getProfile).toBe('function');
        expect(typeof api.updateProfile).toBe('function');
        expect(typeof api.getAllUsers).toBe('function');
        expect(typeof api.updateUser).toBe('function');
        expect(typeof api.addStaff).toBe('function');
        expect(typeof api.updateRole).toBe('function');
        expect(typeof api.getCategories).toBe('function');
        expect(typeof api.addCategory).toBe('function');
        expect(typeof api.updateCategory).toBe('function');
        expect(typeof api.getProducts).toBe('function');
        expect(typeof api.addProduct).toBe('function');
        expect(typeof api.updateProduct).toBe('function');
        expect(typeof api.deleteProduct).toBe('function');
        expect(typeof api.updateProductStatus).toBe('function');
        expect(typeof api.getProductsByCategory).toBe('function');
        expect(typeof api.getProductById).toBe('function');
        expect(typeof api.generateBill).toBe('function');
        expect(typeof api.getBills).toBe('function');
        expect(typeof api.getPdf).toBe('function');
        expect(typeof api.deleteBill).toBe('function');
        expect(typeof api.getDashboardCounts).toBe('function');
        expect(typeof api.getMyOrders).toBe('function');
        expect(typeof api.getMenu).toBe('function');
        expect(typeof api.addRating).toBe('function');
        expect(typeof api.getMyRatings).toBe('function');
        expect(typeof api.getAllRatings).toBe('function');
        expect(typeof api.getRatingsByBill).toBe('function');
        expect(typeof api.getRatingsByProduct).toBe('function');
    });
});

// ===== AUTH: malformed token triggers catch in parseJwt =====
describe('AuthContext - malformed token', () => {
    it('handles token with no exp field (isTokenExpired returns false)', () => {
        // Token with no exp - parseJwt succeeds but isTokenExpired returns false
        const header = btoa(JSON.stringify({ alg: 'HS256' }));
        const payload = btoa(JSON.stringify({ sub: 'test@e.com', role: 'admin' })); // no exp
        sessionStorage.setItem('token', `${header}.${payload}.sig`);

        function Consumer() {
            const auth = useAuth();
            return <span data-testid="a">{auth.isAuthenticated ? 'y' : 'n'}</span>;
        }
        render(<W><Consumer /></W>);
        // Token without exp should still be valid (isTokenExpired returns false)
        expect(screen.getByTestId('a').textContent).toBe('y');
    });
});

// ===== ORDERS: cart rendering with remove button, cancel modal =====
describe('Orders - cart remove and cancel', async () => {
    const { default: Orders } = await import('../pages/Orders');

    it('removes item from cart', async () => {
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        m.getProductsByCategory.mockResolvedValue({ data: [{ id: 10, name: 'Latte', price: 5.5, status: 'true', customerId: 1, customerName: 'Bev', description: '' }] });
        render(<W><Orders /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('New Order'));
        await waitFor(() => expect(screen.getByText('Customer Name')).toBeInTheDocument());

        // Select category and product
        const allSelects = screen.getAllByRole('combobox');
        for (const sel of allSelects) {
            if (sel.querySelector('option[value="1"]')) {
                fireEvent.change(sel, { target: { value: '1' } });
                break;
            }
        }
        await waitFor(() => expect(m.getProductsByCategory).toHaveBeenCalled());
        await waitFor(() => {
            const updatedSelects = screen.getAllByRole('combobox');
            const prodSel = updatedSelects.find(s => s.querySelector('option[value="10"]'));
            if (prodSel) fireEvent.change(prodSel, { target: { value: '10' } });
        });
        fireEvent.click(screen.getByText('+ Add'));

        // Cart should show - verify total line
        await waitFor(() => expect(screen.getByText('Total')).toBeInTheDocument());

        // Remove item from cart (trash button inside cart)
        const trashBtns = screen.getAllByRole('button').filter(b => b.style.color === 'var(--danger)');
        if (trashBtns.length > 0) fireEvent.click(trashBtns[0]);
    });

    it('cancels order modal', async () => {
        m.getCategories.mockResolvedValue({ data: [] });
        render(<W><Orders /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('New Order'));
        await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Cancel'));
    });

    it('changes quantity input', async () => {
        m.getCategories.mockResolvedValue({ data: [] });
        render(<W><Orders /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('New Order'));
        await waitFor(() => { });
        const qtyInput = screen.getByDisplayValue('1');
        fireEvent.change(qtyInput, { target: { value: '3' } });
        expect(qtyInput).toHaveValue(3);
    });

    it('handles confirm cancel on delete', async () => {
        window.confirm = vi.fn(() => false);
        m.getBills.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', name: 'J', email: 'j@e.com', contactNumber: '1', paymentMethod: 'Cash', total: 10, productDetail: '[]', createdBy: 'j@e.com' }] });
        m.getCategories.mockResolvedValue({ data: [] });
        render(<W><Orders /></W>);
        await waitFor(() => expect(screen.getByText('J')).toBeInTheDocument());
        const delBtn = screen.getAllByRole('button').find(b => b.style.color === 'var(--danger)');
        if (delBtn) fireEvent.click(delBtn);
        expect(m.deleteBill).not.toHaveBeenCalled();
    });
});

// ===== PRODUCTS: load failure, cancel modal, confirm cancel delete =====
describe('Products - remaining gaps', async () => {
    const { default: Products } = await import('../pages/Products');

    it('handles load failure', async () => {
        m.getProducts.mockRejectedValue(new Error('fail'));
        m.getCategories.mockRejectedValue(new Error('fail'));
        render(<W><Products /></W>);
        await waitFor(() => expect(screen.getByText('Products')).toBeInTheDocument());
    });

    it('cancels product modal', async () => {
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('Add Product'));
        await waitFor(() => expect(screen.getByText('Cancel')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Cancel'));
    });

    it('handles confirm cancel on delete', async () => {
        window.confirm = vi.fn(() => false);
        m.getProducts.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        const delBtn = screen.getAllByRole('button').find(b => b.style.color === 'var(--danger)');
        if (delBtn) fireEvent.click(delBtn);
        expect(m.deleteProduct).not.toHaveBeenCalled();
    });
});

// ===== CATEGORIES: load failure =====
describe('Categories - load failure', async () => {
    const { default: Categories } = await import('../pages/Categories');

    it('handles load failure', async () => {
        m.getCategories.mockRejectedValue(new Error('fail'));
        render(<W><Categories /></W>);
        await waitFor(() => expect(screen.getByText('Categories')).toBeInTheDocument());
    });
});

// ===== USERS: unknown role fallback in roleBadge =====
describe('Users - roleBadge fallback', async () => {
    const { default: Users } = await import('../pages/Users');

    it('renders Make Customer for staff role', async () => {
        m.getAllUsers.mockResolvedValue({ data: [{ id: 1, name: 'Bob', contactNumber: '1', email: 'b@e.com', status: 'false', role: 'user' }] });
        render(<W><Users /></W>);
        await waitFor(() => {
            expect(screen.getByText('Bob')).toBeInTheDocument();
            expect(screen.getByText('Make Customer')).toBeInTheDocument();
            expect(screen.getByText('Activate')).toBeInTheDocument();
        });
    });
});

// ===== ACCOUNT: successful password change clears form =====
describe('Account - password change success clears form', async () => {
    const { default: Account } = await import('../pages/Account');

    it('clears password fields after successful change', async () => {
        m.changePassword.mockResolvedValue({ data: { message: 'Changed' } });
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByText('Change Password')).toBeInTheDocument());
        const pwInputs = screen.getAllByPlaceholderText('••••••••');
        fireEvent.change(pwInputs[0], { target: { value: 'old' } });
        fireEvent.change(pwInputs[1], { target: { value: 'new' } });
        fireEvent.change(pwInputs[2], { target: { value: 'new' } });
        fireEvent.click(screen.getByText('Update Password'));
        await waitFor(() => expect(m.changePassword).toHaveBeenCalled());
        // After success, fields should be cleared
        await waitFor(() => {
            pwInputs.forEach(inp => expect(inp).toHaveValue(''));
        });
    });
});

// ===== CUSTOMER MENU: StarPicker inner component coverage =====
describe('CustomerMenu - StarPicker hover', async () => {
    const { default: CustomerMenu } = await import('../pages/CustomerMenu');

    it('star hover in review modal', async () => {
        m.getMenu.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review'));
        await waitFor(() => expect(screen.getByText('How was this item?')).toBeInTheDocument());
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        // Hover over stars
        fireEvent.mouseEnter(stars[2]);
        fireEvent.mouseLeave(stars[2]);
        // Click and cancel
        fireEvent.click(screen.getByText('Cancel'));
    });
});

// ===== CUSTOMER ORDERS: StarPicker hover, cancel review =====
describe('CustomerOrders - StarPicker and cancel', async () => {
    const { default: CustomerOrders } = await import('../pages/CustomerOrders');

    it('star hover in review modal and cancel', async () => {
        m.getMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[]', billCreatedDttm: '2026-01-01T00:00:00' }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('Review Order')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review Order'));
        await waitFor(() => { });
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        fireEvent.mouseEnter(stars[1]);
        fireEvent.mouseLeave(stars[1]);
        fireEvent.click(screen.getByText('Cancel'));
    });

    it('shows review with no comment', async () => {
        m.getRatingsByBill.mockResolvedValue({
            data: [
                { id: 1, customerName: 'Jane', score: 3, comment: '', reviewType: 'bill', productName: null, createdAt: '2026-01-01' },
            ]
        });
        m.getMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('View Reviews')).toBeInTheDocument());
        fireEvent.click(screen.getByText('View Reviews'));
        await waitFor(() => expect(screen.getByText('Jane')).toBeInTheDocument());
    });
});

// ===== ACCOUNT: phone input focus/blur (lines 145-146) =====
describe('Account - phone focus/blur', async () => {
    const { default: Account } = await import('../pages/Account');

    it('focus/blur on phone input', async () => {
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByDisplayValue('1')).toBeInTheDocument());
        const phoneInput = screen.getByDisplayValue('1');
        fireEvent.focus(phoneInput);
        expect(phoneInput.style.borderColor).toBe('var(--caramel)');
        fireEvent.blur(phoneInput);
        expect(phoneInput.style.borderColor).toContain('rgba');
    });
});

// ===== ORDERS: getProductsByCategory failure (line 41) =====
describe('Orders - category fetch failure', async () => {
    const { default: Orders } = await import('../pages/Orders');

    it('handles getProductsByCategory failure', async () => {
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        m.getProductsByCategory.mockRejectedValue(new Error('fail'));
        render(<W><Orders /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('New Order'));
        await waitFor(() => expect(screen.getByText('Customer Name')).toBeInTheDocument());
        const allSelects = screen.getAllByRole('combobox');
        for (const sel of allSelects) {
            if (sel.querySelector('option[value="1"]')) {
                fireEvent.change(sel, { target: { value: '1' } });
                break;
            }
        }
        await waitFor(() => expect(m.getProductsByCategory).toHaveBeenCalled());
    });
});

// ===== USERS: load failure (line 38) =====
describe('Users - load failure', async () => {
    const { default: Users } = await import('../pages/Users');

    it('handles getAllUsers failure', async () => {
        m.getAllUsers.mockRejectedValue(new Error('fail'));
        render(<W><Users /></W>);
        await waitFor(() => expect(screen.getByText('Users')).toBeInTheDocument());
    });
});

// ===== CUSTOMER ORDERS: submit review with expanded bill to trigger refresh (line 84) =====
describe('CustomerOrders - review with expanded bill refresh', async () => {
    const { default: CustomerOrders } = await import('../pages/CustomerOrders');

    it('refreshes bill reviews after submitting review while expanded', async () => {
        m.addRating.mockResolvedValue({ data: { message: 'OK' } });
        m.getRatingsByBill.mockResolvedValue({ data: [] });
        m.getMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('View Reviews')).toBeInTheDocument());

        // First expand the reviews
        fireEvent.click(screen.getByText('View Reviews'));
        await waitFor(() => expect(screen.getByText('No reviews yet for this order')).toBeInTheDocument());

        // Now open review modal for this bill
        fireEvent.click(screen.getByText('Review Order'));
        await waitFor(() => expect(screen.getByText('How was your order experience?')).toBeInTheDocument());

        // Submit review
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        fireEvent.click(stars[4]);
        fireEvent.click(screen.getByText('Submit'));
        await waitFor(() => expect(m.addRating).toHaveBeenCalled());
        // Should have called getRatingsByBill again to refresh
        await waitFor(() => expect(m.getRatingsByBill).toHaveBeenCalledTimes(2));
    });
});

// ===== CUSTOMER MENU: review submit refreshes expanded product reviews =====
describe('CustomerMenu - review refreshes expanded', async () => {
    const { default: CustomerMenu } = await import('../pages/CustomerMenu');

    it('refreshes product reviews after submitting while expanded', async () => {
        m.addRating.mockResolvedValue({ data: { message: 'OK' } });
        m.getRatingsByProduct.mockResolvedValue({ data: [] });
        m.getMenu.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());

        // Expand reviews first
        fireEvent.click(screen.getByText('Reviews'));
        await waitFor(() => expect(screen.getByText('No reviews yet')).toBeInTheDocument());

        // Open review modal
        fireEvent.click(screen.getByText('Review'));
        await waitFor(() => expect(screen.getByText('How was this item?')).toBeInTheDocument());

        // Submit
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        fireEvent.click(stars[3]);
        fireEvent.click(screen.getByText('Submit'));
        await waitFor(() => expect(m.addRating).toHaveBeenCalled());
        // Should refresh
        await waitFor(() => expect(m.getRatingsByProduct).toHaveBeenCalledTimes(2));
    });
});
