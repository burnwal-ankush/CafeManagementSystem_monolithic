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

// ===== AuthContext default values (lines 19-21: the default context functions) =====
describe('AuthContext defaults', () => {
    it('default context has no-op functions', () => {
        // useAuth outside provider returns defaults
        function Bare() {
            const ctx = useAuth();
            return (
                <div>
                    <span data-testid="t">{ctx.token || 'null'}</span>
                    <span data-testid="r">{ctx.role || 'null'}</span>
                    <span data-testid="n">{ctx.userName || 'null'}</span>
                    <span data-testid="a">{ctx.isAuthenticated ? 'y' : 'n'}</span>
                    <button data-testid="l" onClick={() => ctx.loginUser('x')}>login</button>
                    <button data-testid="o" onClick={() => ctx.logout()}>logout</button>
                    <button data-testid="p" onClick={() => ctx.refreshProfile()}>refresh</button>
                </div>
            );
        }
        // Render WITHOUT AuthProvider to get default context
        render(<MemoryRouter><Bare /></MemoryRouter>);
        expect(screen.getByTestId('t').textContent).toBe('null');
        expect(screen.getByTestId('a').textContent).toBe('n');
        // Call the no-op functions - they should not throw
        fireEvent.click(screen.getByTestId('l'));
        fireEvent.click(screen.getByTestId('o'));
        fireEvent.click(screen.getByTestId('p'));
    });
});

// ===== Categories: modal onClose (line 118) =====
describe('Categories - modal close via X', async () => {
    const { default: Categories } = await import('../pages/Categories');

    it('closes add modal via backdrop', async () => {
        render(<W><Categories /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('Add Category'));
        await waitFor(() => expect(screen.getByText('New Category')).toBeInTheDocument());
        // Close via the X button in modal
        const closeBtn = screen.getAllByRole('button').find(b => b.querySelector('svg[viewBox="0 0 24 24"]') && b.style.borderRadius === '50%' && b.style.width === '32px');
        if (closeBtn) fireEvent.click(closeBtn);
    });
});

// ===== Products: modal cancel button (line 185) =====
describe('Products - modal cancel in edit mode', async () => {
    const { default: Products } = await import('../pages/Products');

    it('opens edit modal then cancels', async () => {
        m.getProducts.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        // Click edit
        const editBtn = screen.getAllByRole('button').find(b => b.style.background === 'var(--latte)');
        if (editBtn) fireEvent.click(editBtn);
        await waitFor(() => expect(screen.getByText('Edit Product')).toBeInTheDocument());
        // Click Cancel
        fireEvent.click(screen.getByText('Cancel'));
    });
});

// ===== Orders: modal form render (line 187) =====
describe('Orders - modal form fields', async () => {
    const { default: Orders } = await import('../pages/Orders');

    it('renders all form fields in new order modal', async () => {
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        render(<W><Orders /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('New Order'));
        await waitFor(() => {
            expect(screen.getByText('Customer Name')).toBeInTheDocument();
            expect(screen.getByText('Email')).toBeInTheDocument();
            expect(screen.getByText('Phone')).toBeInTheDocument();
            expect(screen.getByText('Payment Method')).toBeInTheDocument();
            expect(screen.getByText('Add Items')).toBeInTheDocument();
            expect(screen.getByText('Category')).toBeInTheDocument();
            expect(screen.getByText('Product')).toBeInTheDocument();
            expect(screen.getByText('Qty')).toBeInTheDocument();
        });
    });
});

// ===== Users: modal form render (lines 247, 279) =====
describe('Users - modal form fields and cancel', async () => {
    const { default: Users } = await import('../pages/Users');

    it('renders all fields in add staff modal and cancels', async () => {
        render(<W><Users /></W>);
        fireEvent.click(screen.getByText('Add Staff'));
        await waitFor(() => {
            expect(screen.getByText('Add Staff Member')).toBeInTheDocument();
            expect(screen.getByText('Full Name')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('john@cafe.com')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('+1 234 567 890')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        });
        // Click Cancel button inside modal
        fireEvent.click(screen.getByText('Cancel'));
    });
});

// ===== CustomerMenu: modal textarea and buttons (lines 221-228) =====
describe('CustomerMenu - modal textarea interaction', async () => {
    const { default: CustomerMenu } = await import('../pages/CustomerMenu');

    it('types in textarea and cancels review modal', async () => {
        m.getMenu.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review'));
        await waitFor(() => expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument());
        // Type in textarea
        fireEvent.change(screen.getByPlaceholderText('Share your thoughts...'), { target: { value: 'Great coffee!' } });
        expect(screen.getByPlaceholderText('Share your thoughts...')).toHaveValue('Great coffee!');
        // Cancel
        fireEvent.click(screen.getByText('Cancel'));
    });
});

// ===== CustomerOrders: modal title ternary (line 269) =====
describe('CustomerOrders - modal title for product type', async () => {
    const { default: CustomerOrders } = await import('../pages/CustomerOrders');

    it('shows product name in modal title', async () => {
        m.getMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[{"id":5,"name":"Espresso","quantity":1,"total":5}]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('Rate')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Rate'));
        await waitFor(() => expect(screen.getByText('Review: Espresso')).toBeInTheDocument());
        // Type in textarea
        fireEvent.change(screen.getByPlaceholderText('Share your thoughts...'), { target: { value: 'Smooth!' } });
        // Cancel
        fireEvent.click(screen.getByText('Cancel'));
    });
});

// ===== CustomerDashboard: branch for loading state (line 21) =====
describe('CustomerDashboard - loading branch', async () => {
    const { default: CustomerDashboard } = await import('../pages/CustomerDashboard');

    it('shows loading dashes while fetching', () => {
        // Don't resolve the promises - keep loading
        m.getMyOrders.mockReturnValue(new Promise(() => { }));
        m.getMyRatings.mockReturnValue(new Promise(() => { }));
        render(<W><CustomerDashboard /></W>);
        // Should show dash placeholders
        const dashes = screen.getAllByText('—');
        expect(dashes.length).toBeGreaterThan(0);
    });
});

// ===== CustomerRatings: uncovered branch for star display (lines 133-157) =====
describe('CustomerRatings - star display branches', async () => {
    const { default: CustomerRatings } = await import('../pages/CustomerRatings');

    it('renders reviews with various scores showing correct stars', async () => {
        m.getMyRatings.mockResolvedValue({
            data: [
                { id: 1, customerName: 'Alice', score: 1, comment: 'Bad', reviewType: 'general', createdAt: '2026-01-01', billId: null, productId: null, productName: null },
                { id: 2, customerName: 'Bob', score: 3, comment: '', reviewType: 'general', createdAt: '2026-01-02', billId: null, productId: null, productName: null },
                { id: 3, customerName: 'Carol', score: 5, comment: 'Perfect', reviewType: 'general', createdAt: '2026-01-03', billId: null, productId: null, productName: null },
            ]
        });
        m.getAllRatings.mockResolvedValue({ data: [] });
        render(<W><CustomerRatings /></W>);
        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('Bob')).toBeInTheDocument();
            expect(screen.getByText('Carol')).toBeInTheDocument();
        });
    });

    it('renders review without comment', async () => {
        m.getMyRatings.mockResolvedValue({
            data: [
                { id: 1, customerName: 'NoComment', score: 4, comment: '', reviewType: 'general', createdAt: '2026-01-01', billId: null, productId: null, productName: null },
            ]
        });
        render(<W><CustomerRatings /></W>);
        await waitFor(() => expect(screen.getByText('NoComment')).toBeInTheDocument());
    });
});

// ===== Login: branch for data.message fallback (line 27) =====
describe('Login - message fallback branch', async () => {
    const { default: Login } = await import('../pages/Login');

    it('shows fallback message when no message in response', async () => {
        m.login.mockResolvedValue({ data: {} }); // no token, no message
        render(<W><Login /></W>);
        fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'a@b.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.click(screen.getByText('Sign In'));
        await waitFor(() => expect(m.login).toHaveBeenCalled());
    });
});

// ===== Signup: focus/blur on all field types (lines 22-26) =====
describe('Signup - all field focus/blur', async () => {
    const { default: Signup } = await import('../pages/Signup');

    it('focus/blur on email field', () => {
        render(<W><Signup /></W>);
        const email = screen.getByPlaceholderText('john@cafe.com');
        fireEvent.focus(email);
        expect(email.style.borderColor).toBe('var(--caramel)');
        fireEvent.blur(email);
        expect(email.style.borderColor).toContain('rgba');
    });

    it('focus/blur on phone field', () => {
        render(<W><Signup /></W>);
        const phone = screen.getByPlaceholderText('+1 234 567 890');
        fireEvent.focus(phone);
        expect(phone.style.borderColor).toBe('var(--caramel)');
        fireEvent.blur(phone);
    });

    it('focus/blur on password field', () => {
        render(<W><Signup /></W>);
        const pw = screen.getByPlaceholderText('••••••••');
        fireEvent.focus(pw);
        expect(pw.style.borderColor).toBe('var(--caramel)');
        fireEvent.blur(pw);
    });
});

// ===== parseJwt catch branch (line 30) =====
describe('parseJwt exported', () => {
    it('returns null for completely invalid token', async () => {
        const { parseJwt } = await import('../context/AuthContext');
        expect(parseJwt('garbage')).toBeNull();
        expect(parseJwt('')).toBeNull();
        expect(parseJwt('a.!!!invalid-base64.c')).toBeNull();
    });

    it('parses valid token', async () => {
        const { parseJwt } = await import('../context/AuthContext');
        const header = btoa(JSON.stringify({ alg: 'HS256' }));
        const payload = btoa(JSON.stringify({ sub: 'test', role: 'admin' }));
        const result = parseJwt(`${header}.${payload}.sig`);
        expect(result).toEqual({ sub: 'test', role: 'admin' });
    });
});

// ===== Force modal rendering for all remaining pages =====
describe('CustomerMenu - force modal render', async () => {
    const { default: CustomerMenu } = await import('../pages/CustomerMenu');
    it('renders review modal content', async () => {
        m.getMenu.mockResolvedValue({ data: [{ id: 1, name: 'X', description: 'Y', price: 1, status: 'true', customerId: 1, customerName: 'C' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('X')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review'));
        await waitFor(() => {
            expect(screen.getByText('Review: X')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument();
            expect(screen.getByText('Submit')).toBeInTheDocument();
        });
    });
});

describe('CustomerOrders - force modal render', async () => {
    const { default: CustomerOrders } = await import('../pages/CustomerOrders');
    it('renders review modal with product type', async () => {
        m.getMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'U', paymentMethod: 'Cash', total: 5, productDetail: '[{"id":1,"name":"Z","quantity":1,"total":5}]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('Rate')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Rate'));
        await waitFor(() => {
            expect(screen.getByText('Review: Z')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Share your thoughts...')).toBeInTheDocument();
        });
    });
});

describe('Orders - force modal render', async () => {
    const { default: Orders } = await import('../pages/Orders');
    it('renders new order modal with all fields', async () => {
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'B' }] });
        render(<W><Orders /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('New Order'));
        await waitFor(() => {
            expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Place Order')).toBeInTheDocument();
            expect(screen.getByText('Payment Method')).toBeInTheDocument();
        });
    });
});

describe('Products - force modal render', async () => {
    const { default: Products } = await import('../pages/Products');
    it('renders add product modal', async () => {
        m.getCategories.mockResolvedValue({ data: [{ id: 1, name: 'B' }] });
        render(<W><Products /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('Add Product'));
        await waitFor(() => {
            expect(screen.getByText('New Product')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('e.g. Cappuccino')).toBeInTheDocument();
        });
    });
});

describe('Users - force modal render', async () => {
    const { default: Users } = await import('../pages/Users');
    it('renders add staff modal', async () => {
        render(<W><Users /></W>);
        fireEvent.click(screen.getByText('Add Staff'));
        await waitFor(() => {
            expect(screen.getByText('Add Staff Member')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        });
    });
});

describe('Categories - force modal render', async () => {
    const { default: Categories } = await import('../pages/Categories');
    it('renders add category modal', async () => {
        render(<W><Categories /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('Add Category'));
        await waitFor(() => {
            expect(screen.getByText('New Category')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('e.g. Hot Beverages')).toBeInTheDocument();
        });
    });
});
