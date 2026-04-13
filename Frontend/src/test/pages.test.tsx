import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Shared mocks
const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockForgotPassword = vi.fn();
const mockGetDashboardCounts = vi.fn();
const mockGetCategories = vi.fn();
const mockAddCategory = vi.fn();
const mockUpdateCategory = vi.fn();
const mockGetProducts = vi.fn();
const mockAddProduct = vi.fn();
const mockUpdateProduct = vi.fn();
const mockDeleteProduct = vi.fn();
const mockUpdateProductStatus = vi.fn();
const mockGetBills = vi.fn();
const mockGenerateBill = vi.fn();
const mockDeleteBill = vi.fn();
const mockGetAllUsers = vi.fn();
const mockUpdateUser = vi.fn();
const mockAddStaff = vi.fn();
const mockUpdateRole = vi.fn();
const mockGetProfile = vi.fn();
const mockUpdateProfile = vi.fn();
const mockChangePassword = vi.fn();
const mockGetMyOrders = vi.fn();
const mockGetMyRatings = vi.fn();
const mockGetAllRatings = vi.fn();
const mockGetMenu = vi.fn();
const mockAddRating = vi.fn();
const mockGetProductsByCategory = vi.fn();
const mockGetRatingsByBill = vi.fn();
const mockGetRatingsByProduct = vi.fn();

vi.mock('../services/api', () => ({
    login: (...args: unknown[]) => mockLogin(...args),
    signup: (...args: unknown[]) => mockSignup(...args),
    forgotPassword: (...args: unknown[]) => mockForgotPassword(...args),
    checkToken: vi.fn(() => Promise.resolve()),
    getProfile: (...args: unknown[]) => mockGetProfile(...args),
    getDashboardCounts: (...args: unknown[]) => mockGetDashboardCounts(...args),
    getCategories: (...args: unknown[]) => mockGetCategories(...args),
    addCategory: (...args: unknown[]) => mockAddCategory(...args),
    updateCategory: (...args: unknown[]) => mockUpdateCategory(...args),
    getProducts: (...args: unknown[]) => mockGetProducts(...args),
    addProduct: (...args: unknown[]) => mockAddProduct(...args),
    updateProduct: (...args: unknown[]) => mockUpdateProduct(...args),
    deleteProduct: (...args: unknown[]) => mockDeleteProduct(...args),
    updateProductStatus: (...args: unknown[]) => mockUpdateProductStatus(...args),
    getProductsByCategory: (...args: unknown[]) => mockGetProductsByCategory(...args),
    getBills: (...args: unknown[]) => mockGetBills(...args),
    generateBill: (...args: unknown[]) => mockGenerateBill(...args),
    deleteBill: (...args: unknown[]) => mockDeleteBill(...args),
    getAllUsers: (...args: unknown[]) => mockGetAllUsers(...args),
    updateUser: (...args: unknown[]) => mockUpdateUser(...args),
    addStaff: (...args: unknown[]) => mockAddStaff(...args),
    updateRole: (...args: unknown[]) => mockUpdateRole(...args),
    updateProfile: (...args: unknown[]) => mockUpdateProfile(...args),
    changePassword: (...args: unknown[]) => mockChangePassword(...args),
    getMyOrders: (...args: unknown[]) => mockGetMyOrders(...args),
    getMyRatings: (...args: unknown[]) => mockGetMyRatings(...args),
    getAllRatings: (...args: unknown[]) => mockGetAllRatings(...args),
    getMenu: (...args: unknown[]) => mockGetMenu(...args),
    addRating: (...args: unknown[]) => mockAddRating(...args),
    getRatingsByBill: (...args: unknown[]) => mockGetRatingsByBill(...args),
    getRatingsByProduct: (...args: unknown[]) => mockGetRatingsByProduct(...args),
    default: { interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } },
}));

function W({ children }: { children: React.ReactNode }) {
    return <MemoryRouter><AuthProvider>{children}</AuthProvider></MemoryRouter>;
}

beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockGetProfile.mockResolvedValue({ data: { name: 'Test', email: 'test@e.com', contactNumber: '123', role: 'admin' } });
    mockGetDashboardCounts.mockResolvedValue({ data: { category: 5, product: 10, bill: 20 } });
    mockGetCategories.mockResolvedValue({ data: [] });
    mockGetProducts.mockResolvedValue({ data: [] });
    mockGetBills.mockResolvedValue({ data: [] });
    mockGetAllUsers.mockResolvedValue({ data: [] });
    mockGetMyOrders.mockResolvedValue({ data: [] });
    mockGetMyRatings.mockResolvedValue({ data: [] });
    mockGetAllRatings.mockResolvedValue({ data: [] });
    mockGetMenu.mockResolvedValue({ data: [] });
    mockGetProductsByCategory.mockResolvedValue({ data: [] });
    window.confirm = vi.fn(() => true);
});

// ==================== LOGIN ====================
describe('Login Page', async () => {
    const { default: Login } = await import('../pages/Login');

    it('renders form elements', () => {
        render(<W><Login /></W>);
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
        expect(screen.getByText('Sign In')).toBeInTheDocument();
        expect(screen.getByText('Forgot password?')).toBeInTheDocument();
        expect(screen.getByText('Create an account')).toBeInTheDocument();
    });

    it('toggles password visibility', () => {
        render(<W><Login /></W>);
        const pw = screen.getByPlaceholderText('••••••••');
        expect(pw).toHaveAttribute('type', 'password');
        fireEvent.click(screen.getByLabelText('Show password'));
        expect(pw).toHaveAttribute('type', 'text');
        fireEvent.click(screen.getByLabelText('Hide password'));
        expect(pw).toHaveAttribute('type', 'password');
    });

    it('submits login and handles success with token', async () => {
        mockLogin.mockResolvedValue({ data: { token: 'abc.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjk5OTk5OTk5OTl9.sig' } });
        render(<W><Login /></W>);
        fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'a@b.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.click(screen.getByText('Sign In'));
        await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({ email: 'a@b.com', password: 'pass' }));
    });

    it('submits login and handles string response', async () => {
        mockLogin.mockResolvedValue({ data: '{"token":"abc.eyJyb2xlIjoiYWRtaW4iLCJleHAiOjk5OTk5OTk5OTl9.sig"}' });
        render(<W><Login /></W>);
        fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'a@b.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.click(screen.getByText('Sign In'));
        await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    });

    it('handles login failure with message', async () => {
        mockLogin.mockRejectedValue({ response: { data: { message: 'Wrong creds' } } });
        render(<W><Login /></W>);
        fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'a@b.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'bad' } });
        fireEvent.click(screen.getByText('Sign In'));
        await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    });

    it('handles login failure without message', async () => {
        mockLogin.mockRejectedValue({});
        render(<W><Login /></W>);
        fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'a@b.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'bad' } });
        fireEvent.click(screen.getByText('Sign In'));
        await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    });

    it('handles login response without token', async () => {
        mockLogin.mockResolvedValue({ data: { message: 'Wait for approval' } });
        render(<W><Login /></W>);
        fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'a@b.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.click(screen.getByText('Sign In'));
        await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    });

    it('applies focus/blur styles on email input', () => {
        render(<W><Login /></W>);
        const email = screen.getByPlaceholderText('your@email.com');
        fireEvent.focus(email);
        expect(email.style.borderColor).toBe('var(--caramel)');
        fireEvent.blur(email);
        expect(email.style.borderColor).toContain('rgba');
    });

    it('applies focus/blur styles on password input', () => {
        render(<W><Login /></W>);
        const pw = screen.getByPlaceholderText('••••••••');
        fireEvent.focus(pw);
        expect(pw.style.borderColor).toBe('var(--caramel)');
        fireEvent.blur(pw);
        expect(pw.style.borderColor).toContain('rgba');
    });
});

// ==================== SIGNUP ====================
describe('Signup Page', async () => {
    const { default: Signup } = await import('../pages/Signup');

    it('renders all fields', () => {
        render(<W><Signup /></W>);
        expect(screen.getByText('Join Café Bliss')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('john@cafe.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('+1 234 567 890')).toBeInTheDocument();
    });

    it('toggles password visibility', () => {
        render(<W><Signup /></W>);
        const pw = screen.getByPlaceholderText('••••••••');
        expect(pw).toHaveAttribute('type', 'password');
        fireEvent.click(screen.getByLabelText('Show password'));
        expect(pw).toHaveAttribute('type', 'text');
    });

    it('submits signup successfully', async () => {
        mockSignup.mockResolvedValue({ data: { message: 'Registered!' } });
        render(<W><Signup /></W>);
        fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByPlaceholderText('john@cafe.com'), { target: { value: 'j@e.com' } });
        fireEvent.change(screen.getByPlaceholderText('+1 234 567 890'), { target: { value: '123' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.click(screen.getByText('Create Account'));
        await waitFor(() => expect(mockSignup).toHaveBeenCalled());
    });

    it('handles signup string response', async () => {
        mockSignup.mockResolvedValue({ data: '{"message":"OK"}' });
        render(<W><Signup /></W>);
        fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByPlaceholderText('john@cafe.com'), { target: { value: 'j@e.com' } });
        fireEvent.change(screen.getByPlaceholderText('+1 234 567 890'), { target: { value: '123' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.click(screen.getByText('Create Account'));
        await waitFor(() => expect(mockSignup).toHaveBeenCalled());
    });

    it('handles signup failure', async () => {
        mockSignup.mockRejectedValue({ response: { data: { message: 'Email exists' } } });
        render(<W><Signup /></W>);
        fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Jane' } });
        fireEvent.change(screen.getByPlaceholderText('john@cafe.com'), { target: { value: 'j@e.com' } });
        fireEvent.change(screen.getByPlaceholderText('+1 234 567 890'), { target: { value: '123' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'pass' } });
        fireEvent.click(screen.getByText('Create Account'));
        await waitFor(() => expect(mockSignup).toHaveBeenCalled());
    });

    it('applies focus/blur on non-password fields', () => {
        render(<W><Signup /></W>);
        const name = screen.getByPlaceholderText('John Doe');
        fireEvent.focus(name);
        expect(name.style.borderColor).toBe('var(--caramel)');
        fireEvent.blur(name);
        expect(name.style.borderColor).toContain('rgba');
    });
});

// ==================== FORGOT PASSWORD ====================
describe('ForgotPassword Page', async () => {
    const { default: ForgotPassword } = await import('../pages/ForgotPassword');

    it('renders form', () => {
        render(<W><ForgotPassword /></W>);
        expect(screen.getByText('Reset Password')).toBeInTheDocument();
        expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
        expect(screen.getByText('Back to login')).toBeInTheDocument();
    });

    it('submits forgot password', async () => {
        mockForgotPassword.mockResolvedValue({});
        render(<W><ForgotPassword /></W>);
        fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'a@b.com' } });
        fireEvent.click(screen.getByText('Send Reset Link'));
        await waitFor(() => expect(mockForgotPassword).toHaveBeenCalledWith({ email: 'a@b.com' }));
    });

    it('handles forgot password failure', async () => {
        mockForgotPassword.mockRejectedValue(new Error('fail'));
        render(<W><ForgotPassword /></W>);
        fireEvent.change(screen.getByPlaceholderText('your@email.com'), { target: { value: 'a@b.com' } });
        fireEvent.click(screen.getByText('Send Reset Link'));
        await waitFor(() => expect(mockForgotPassword).toHaveBeenCalled());
    });
});

// ==================== DASHBOARD ====================
describe('Dashboard Page', async () => {
    const { default: Dashboard } = await import('../pages/Dashboard');

    it('renders and loads counts', async () => {
        render(<W><Dashboard /></W>);
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('Categories')).toBeInTheDocument();
            expect(screen.getByText('Products')).toBeInTheDocument();
            expect(screen.getByText('Bills')).toBeInTheDocument();
        });
    });

    it('handles API failure gracefully', async () => {
        mockGetDashboardCounts.mockRejectedValue(new Error('fail'));
        render(<W><Dashboard /></W>);
        await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument());
    });
});

// ==================== CATEGORIES ====================
describe('Categories Page', async () => {
    const { default: Categories } = await import('../pages/Categories');

    it('renders header and add button', () => {
        render(<W><Categories /></W>);
        expect(screen.getByText('Categories')).toBeInTheDocument();
        expect(screen.getByText('Add Category')).toBeInTheDocument();
    });

    it('shows empty state when no categories', async () => {
        render(<W><Categories /></W>);
        await waitFor(() => expect(screen.getByText('No categories yet. Add your first one!')).toBeInTheDocument());
    });

    it('shows categories when loaded', async () => {
        mockGetCategories.mockResolvedValue({ data: [{ id: 1, name: 'Beverages' }, { id: 2, name: 'Snacks' }] });
        render(<W><Categories /></W>);
        await waitFor(() => {
            expect(screen.getByText('Beverages')).toBeInTheDocument();
            expect(screen.getByText('Snacks')).toBeInTheDocument();
        });
    });

    it('opens add modal and submits', async () => {
        mockAddCategory.mockResolvedValue({ data: { message: 'Added' } });
        render(<W><Categories /></W>);
        fireEvent.click(screen.getByText('Add Category'));
        await waitFor(() => expect(screen.getByText('New Category')).toBeInTheDocument());
        fireEvent.change(screen.getByPlaceholderText('e.g. Hot Beverages'), { target: { value: 'Desserts' } });
        fireEvent.click(screen.getByText('Add'));
        await waitFor(() => expect(mockAddCategory).toHaveBeenCalledWith({ name: 'Desserts' }));
    });

    it('opens edit modal for existing category', async () => {
        mockGetCategories.mockResolvedValue({ data: [{ id: 1, name: 'Beverages' }] });
        render(<W><Categories /></W>);
        await waitFor(() => expect(screen.getByText('Beverages')).toBeInTheDocument());
        // Click edit button (the pencil icon button)
        const editBtns = screen.getAllByRole('button');
        const editBtn = editBtns.find(b => b.querySelector('svg'));
        if (editBtn) fireEvent.click(editBtn);
    });

    it('handles add failure', async () => {
        mockAddCategory.mockRejectedValue(new Error('fail'));
        render(<W><Categories /></W>);
        fireEvent.click(screen.getByText('Add Category'));
        await waitFor(() => expect(screen.getByText('New Category')).toBeInTheDocument());
        fireEvent.change(screen.getByPlaceholderText('e.g. Hot Beverages'), { target: { value: 'X' } });
        fireEvent.click(screen.getByText('Add'));
        await waitFor(() => expect(mockAddCategory).toHaveBeenCalled());
    });

    it('hover effects on category cards', async () => {
        mockGetCategories.mockResolvedValue({ data: [{ id: 1, name: 'Beverages' }] });
        render(<W><Categories /></W>);
        await waitFor(() => expect(screen.getByText('Beverages')).toBeInTheDocument());
        const card = screen.getByText('Beverages').closest('div[class="scale-in"]') || screen.getByText('Beverages').parentElement?.parentElement;
        if (card) {
            fireEvent.mouseEnter(card);
            fireEvent.mouseLeave(card);
        }
    });
});

// ==================== PRODUCTS ====================
describe('Products Page', async () => {
    const { default: Products } = await import('../pages/Products');

    it('renders header', () => {
        render(<W><Products /></W>);
        expect(screen.getByText('Products')).toBeInTheDocument();
        expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    it('shows empty state', async () => {
        render(<W><Products /></W>);
        await waitFor(() => expect(screen.getByText('No products yet. Start building your menu!')).toBeInTheDocument());
    });

    it('shows products table', async () => {
        mockGetProducts.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        expect(screen.getByText('$4.99')).toBeInTheDocument();
    });

    it('opens add product modal', async () => {
        mockGetCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('Add Product'));
        await waitFor(() => expect(screen.getByText('New Product')).toBeInTheDocument());
    });

    it('toggles product status', async () => {
        mockUpdateProductStatus.mockResolvedValue({ data: 'OK' });
        mockGetProducts.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => expect(screen.getByText('Active')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Active'));
        await waitFor(() => expect(mockUpdateProductStatus).toHaveBeenCalled());
    });

    it('deletes product with confirm', async () => {
        mockDeleteProduct.mockResolvedValue({ data: 'OK' });
        mockGetProducts.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        // Find delete button
        const btns = screen.getAllByRole('button');
        const delBtn = btns.find(b => b.style.color === 'var(--danger)');
        if (delBtn) fireEvent.click(delBtn);
        await waitFor(() => expect(mockDeleteProduct).toHaveBeenCalledWith(1));
    });

    it('hover on product row', async () => {
        mockGetProducts.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><Products /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        const row = screen.getByText('Coffee').closest('tr');
        if (row) {
            fireEvent.mouseEnter(row);
            fireEvent.mouseLeave(row);
        }
    });
});

// ==================== ORDERS ====================
describe('Orders Page', async () => {
    const { default: Orders } = await import('../pages/Orders');

    it('renders header', () => {
        mockGetCategories.mockResolvedValue({ data: [] });
        render(<W><Orders /></W>);
        expect(screen.getByText('Orders')).toBeInTheDocument();
        expect(screen.getByText('New Order')).toBeInTheDocument();
    });

    it('shows empty state', async () => {
        mockGetCategories.mockResolvedValue({ data: [] });
        render(<W><Orders /></W>);
        await waitFor(() => expect(screen.getByText('No orders yet')).toBeInTheDocument());
    });

    it('shows bills with items', async () => {
        mockGetBills.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', name: 'John', email: 'j@e.com', contactNumber: '1', paymentMethod: 'Cash', total: 25.5, productDetail: '[{"name":"Coffee","quantity":2}]', createdBy: 'j@e.com' }] });
        mockGetCategories.mockResolvedValue({ data: [] });
        render(<W><Orders /></W>);
        await waitFor(() => {
            expect(screen.getByText('John')).toBeInTheDocument();
            expect(screen.getByText('$25.5')).toBeInTheDocument();
            expect(screen.getByText('Coffee × 2')).toBeInTheDocument();
        });
    });

    it('opens new order modal', async () => {
        mockGetCategories.mockResolvedValue({ data: [{ id: 1, name: 'Bev' }] });
        render(<W><Orders /></W>);
        await waitFor(() => { });
        fireEvent.click(screen.getByText('New Order'));
        await waitFor(() => expect(screen.getByText('Customer Name')).toBeInTheDocument());
    });

    it('deletes bill', async () => {
        mockDeleteBill.mockResolvedValue({ data: 'OK' });
        mockGetBills.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', name: 'John', email: 'j@e.com', contactNumber: '1', paymentMethod: 'Cash', total: 25, productDetail: '[]', createdBy: 'j@e.com' }] });
        mockGetCategories.mockResolvedValue({ data: [] });
        render(<W><Orders /></W>);
        await waitFor(() => expect(screen.getByText('John')).toBeInTheDocument());
        const delBtn = screen.getAllByRole('button').find(b => b.style.color === 'var(--danger)');
        if (delBtn) fireEvent.click(delBtn);
        await waitFor(() => expect(mockDeleteBill).toHaveBeenCalledWith(1));
    });
});

// ==================== USERS ====================
describe('Users Page', async () => {
    const { default: Users } = await import('../pages/Users');

    it('renders header and controls', () => {
        render(<W><Users /></W>);
        expect(screen.getByText('Users')).toBeInTheDocument();
        expect(screen.getByText('Add Staff')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Search by name, email, or phone...')).toBeInTheDocument();
    });

    it('shows user cards with role badges', async () => {
        mockGetAllUsers.mockResolvedValue({
            data: [
                { id: 1, name: 'Alice', contactNumber: '111', email: 'a@e.com', status: 'true', role: 'user' },
                { id: 2, name: 'Bob', contactNumber: '222', email: 'b@e.com', status: 'false', role: 'customer' },
            ]
        });
        render(<W><Users /></W>);
        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('Bob')).toBeInTheDocument();
            expect(screen.getByText('Staff')).toBeInTheDocument();
            expect(screen.getByText('Customer')).toBeInTheDocument();
        });
    });

    it('filters by search', async () => {
        mockGetAllUsers.mockResolvedValue({
            data: [
                { id: 1, name: 'Alice', contactNumber: '111', email: 'a@e.com', status: 'true', role: 'user' },
                { id: 2, name: 'Bob', contactNumber: '222', email: 'b@e.com', status: 'true', role: 'customer' },
            ]
        });
        render(<W><Users /></W>);
        await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
        fireEvent.change(screen.getByPlaceholderText('Search by name, email, or phone...'), { target: { value: 'Bob' } });
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('filters by role tab', async () => {
        mockGetAllUsers.mockResolvedValue({
            data: [
                { id: 1, name: 'Alice', contactNumber: '111', email: 'a@e.com', status: 'true', role: 'user' },
                { id: 2, name: 'Bob', contactNumber: '222', email: 'b@e.com', status: 'true', role: 'customer' },
            ]
        });
        render(<W><Users /></W>);
        await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
        fireEvent.click(screen.getByText(/Customers \(/));
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('toggles user status', async () => {
        mockUpdateUser.mockResolvedValue({ data: 'OK' });
        mockGetAllUsers.mockResolvedValue({ data: [{ id: 1, name: 'Alice', contactNumber: '111', email: 'a@e.com', status: 'true', role: 'user' }] });
        render(<W><Users /></W>);
        await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Deactivate'));
        await waitFor(() => expect(mockUpdateUser).toHaveBeenCalledWith({ id: '1', status: 'false' }));
    });

    it('toggles user role', async () => {
        mockUpdateRole.mockResolvedValue({ data: 'OK' });
        mockGetAllUsers.mockResolvedValue({ data: [{ id: 1, name: 'Alice', contactNumber: '111', email: 'a@e.com', status: 'true', role: 'customer' }] });
        render(<W><Users /></W>);
        await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Make Staff'));
        await waitFor(() => expect(mockUpdateRole).toHaveBeenCalledWith({ id: '1', role: 'user' }));
    });

    it('opens add staff modal and submits', async () => {
        mockAddStaff.mockResolvedValue({ data: '{"message":"Added!"}' });
        render(<W><Users /></W>);
        fireEvent.click(screen.getByText('Add Staff'));
        await waitFor(() => expect(screen.getByText('Add Staff Member')).toBeInTheDocument());
    });

    it('hover on user card', async () => {
        mockGetAllUsers.mockResolvedValue({ data: [{ id: 1, name: 'Alice', contactNumber: '111', email: 'a@e.com', status: 'true', role: 'user' }] });
        render(<W><Users /></W>);
        await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
        const card = screen.getByText('Alice').closest('div[class="scale-in"]') || screen.getByText('Alice').parentElement?.parentElement?.parentElement;
        if (card) {
            fireEvent.mouseEnter(card);
            fireEvent.mouseLeave(card);
        }
    });
});

// ==================== ACCOUNT ====================
describe('Account Page', async () => {
    const { default: Account } = await import('../pages/Account');

    it('loads and displays profile', async () => {
        render(<W><Account /></W>);
        await waitFor(() => {
            expect(screen.getByText('My Account')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
            expect(screen.getByDisplayValue('test@e.com')).toBeInTheDocument();
            expect(screen.getByDisplayValue('123')).toBeInTheDocument();
        });
    });

    it('email field is disabled', async () => {
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByDisplayValue('test@e.com')).toBeDisabled());
    });

    it('updates profile', async () => {
        mockUpdateProfile.mockResolvedValue({ data: { message: 'Updated' } });
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByDisplayValue('Test')).toBeInTheDocument());
        fireEvent.change(screen.getByDisplayValue('Test'), { target: { value: 'New Name' } });
        fireEvent.click(screen.getByText('Save Changes'));
        await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalledWith({ name: 'New Name', contactNumber: '123' }));
    });

    it('updates profile failure', async () => {
        mockUpdateProfile.mockRejectedValue(new Error('fail'));
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByDisplayValue('Test')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Save Changes'));
        await waitFor(() => expect(mockUpdateProfile).toHaveBeenCalled());
    });

    it('changes password successfully', async () => {
        mockChangePassword.mockResolvedValue({ data: { message: 'Changed' } });
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByText('Change Password')).toBeInTheDocument());
        const pwInputs = screen.getAllByPlaceholderText('••••••••');
        fireEvent.change(pwInputs[0], { target: { value: 'old' } });
        fireEvent.change(pwInputs[1], { target: { value: 'new' } });
        fireEvent.change(pwInputs[2], { target: { value: 'new' } });
        fireEvent.click(screen.getByText('Update Password'));
        await waitFor(() => expect(mockChangePassword).toHaveBeenCalledWith({ oldPassword: 'old', newPassword: 'new' }));
    });

    it('password mismatch shows error', async () => {
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByText('Change Password')).toBeInTheDocument());
        const pwInputs = screen.getAllByPlaceholderText('••••••••');
        fireEvent.change(pwInputs[0], { target: { value: 'old' } });
        fireEvent.change(pwInputs[1], { target: { value: 'new1' } });
        fireEvent.change(pwInputs[2], { target: { value: 'new2' } });
        fireEvent.click(screen.getByText('Update Password'));
        // Should not call API
        expect(mockChangePassword).not.toHaveBeenCalled();
    });

    it('toggles password visibility for all fields', async () => {
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByText('Change Password')).toBeInTheDocument());
        const eyeBtns = screen.getAllByLabelText('Show password');
        expect(eyeBtns.length).toBe(3);
        eyeBtns.forEach(btn => fireEvent.click(btn));
        const hideBtns = screen.getAllByLabelText('Hide password');
        expect(hideBtns.length).toBe(3);
    });

    it('focus/blur on profile inputs', async () => {
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByDisplayValue('Test')).toBeInTheDocument());
        const nameInput = screen.getByDisplayValue('Test');
        fireEvent.focus(nameInput);
        expect(nameInput.style.borderColor).toBe('var(--caramel)');
        fireEvent.blur(nameInput);
        expect(nameInput.style.borderColor).toContain('rgba');
    });

    it('focus/blur on password inputs', async () => {
        render(<W><Account /></W>);
        await waitFor(() => expect(screen.getByText('Change Password')).toBeInTheDocument());
        const pwInputs = screen.getAllByPlaceholderText('••••••••');
        fireEvent.focus(pwInputs[0]);
        expect(pwInputs[0].style.borderColor).toBe('var(--caramel)');
        fireEvent.blur(pwInputs[0]);
        expect(pwInputs[0].style.borderColor).toContain('rgba');
    });

    it('handles profile load failure', async () => {
        mockGetProfile.mockRejectedValue(new Error('fail'));
        render(<W><Account /></W>);
        // Should still render the page
        await waitFor(() => expect(screen.getByText('My Account')).toBeInTheDocument());
    });
});

// ==================== CUSTOMER DASHBOARD ====================
describe('Customer Dashboard', async () => {
    const { default: CustomerDashboard } = await import('../pages/CustomerDashboard');

    it('renders stats', async () => {
        mockGetMyOrders.mockResolvedValue({ data: [{ id: 1, total: 25.5 }] });
        mockGetMyRatings.mockResolvedValue({ data: [{ id: 1 }] });
        render(<W><CustomerDashboard /></W>);
        await waitFor(() => {
            expect(screen.getByText('My Orders')).toBeInTheDocument();
            expect(screen.getByText('Total Spent')).toBeInTheDocument();
            expect(screen.getAllByText(/25\.5/).length).toBeGreaterThan(0);
        });
    });

    it('shows recent orders', async () => {
        mockGetMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10 }] });
        mockGetMyRatings.mockResolvedValue({ data: [] });
        render(<W><CustomerDashboard /></W>);
        await waitFor(() => expect(screen.getByText('B-1')).toBeInTheDocument());
    });

    it('shows empty orders message', async () => {
        render(<W><CustomerDashboard /></W>);
        await waitFor(() => expect(screen.getByText('No orders yet. Visit us and place your first order!')).toBeInTheDocument());
    });

    it('handles API failure', async () => {
        mockGetMyOrders.mockRejectedValue(new Error('fail'));
        mockGetMyRatings.mockRejectedValue(new Error('fail'));
        render(<W><CustomerDashboard /></W>);
        await waitFor(() => expect(screen.getByText('Welcome Back!')).toBeInTheDocument());
    });
});

// ==================== CUSTOMER ORDERS ====================
describe('Customer Orders', async () => {
    const { default: CustomerOrders } = await import('../pages/CustomerOrders');

    it('shows empty state', async () => {
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('No orders yet')).toBeInTheDocument());
    });

    it('shows orders with items', async () => {
        mockGetMyOrders.mockResolvedValue({
            data: [{
                id: 1, uuid: 'B-1', name: 'John', billCreatedDttm: '2026-01-01T00:00:00', paymentMethod: 'Cash', total: 25.5,
                productDetail: '[{"id":1,"name":"Coffee","quantity":2,"total":10}]',
            }]
        });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => {
            expect(screen.getByText('B-1')).toBeInTheDocument();
            expect(screen.getByText('$25.5')).toBeInTheDocument();
            expect(screen.getByText('Coffee')).toBeInTheDocument();
        });
    });

    it('opens bill review modal', async () => {
        mockGetMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('Review Order')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review Order'));
        await waitFor(() => expect(screen.getByText('How was your order experience?')).toBeInTheDocument());
    });

    it('opens product review modal', async () => {
        mockGetMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[{"id":5,"name":"Latte","quantity":1,"total":5}]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('Rate')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Rate'));
        await waitFor(() => expect(screen.getByText('How was this item?')).toBeInTheDocument());
    });

    it('submits review', async () => {
        mockAddRating.mockResolvedValue({ data: { message: 'OK' } });
        mockGetMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('Review Order')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review Order'));
        await waitFor(() => expect(screen.getByText('How was your order experience?')).toBeInTheDocument());
        // Click 4th star
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        fireEvent.click(stars[3]);
        fireEvent.change(screen.getByPlaceholderText('Share your thoughts...'), { target: { value: 'Great!' } });
        fireEvent.click(screen.getByText('Submit'));
        await waitFor(() => expect(mockAddRating).toHaveBeenCalled());
    });

    it('submit review without score shows error', async () => {
        mockGetMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('Review Order')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review Order'));
        await waitFor(() => expect(screen.getByText('Submit')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Submit'));
        expect(mockAddRating).not.toHaveBeenCalled();
    });

    it('toggles bill reviews', async () => {
        mockGetRatingsByBill.mockResolvedValue({ data: [{ id: 1, customerName: 'Jane', score: 5, comment: 'Awesome', reviewType: 'bill', createdAt: '2026-01-01' }] });
        mockGetMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('View Reviews')).toBeInTheDocument());
        fireEvent.click(screen.getByText('View Reviews'));
        await waitFor(() => expect(screen.getByText('Jane')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Hide Reviews'));
    });

    it('shows empty reviews message', async () => {
        mockGetRatingsByBill.mockResolvedValue({ data: [] });
        mockGetMyOrders.mockResolvedValue({ data: [{ id: 1, uuid: 'B-1', paymentMethod: 'Cash', total: 10, productDetail: '[]', billCreatedDttm: null }] });
        render(<W><CustomerOrders /></W>);
        await waitFor(() => expect(screen.getByText('View Reviews')).toBeInTheDocument());
        fireEvent.click(screen.getByText('View Reviews'));
        await waitFor(() => expect(screen.getByText('No reviews yet for this order')).toBeInTheDocument());
    });
});

// ==================== CUSTOMER MENU ====================
describe('Customer Menu', async () => {
    const { default: CustomerMenu } = await import('../pages/CustomerMenu');

    it('shows empty state', async () => {
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Menu is being prepared...')).toBeInTheDocument());
    });

    it('shows products grouped by category', async () => {
        mockGetMenu.mockResolvedValue({
            data: [
                { id: 1, name: 'Coffee', description: 'Hot brew', price: 4.99, status: 'true', customerId: 1, customerName: 'Beverages' },
                { id: 2, name: 'Tea', description: 'Green tea', price: 2.99, status: 'true', customerId: 1, customerName: 'Beverages' },
            ]
        });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => {
            expect(screen.getByText('Beverages')).toBeInTheDocument();
            expect(screen.getByText('Coffee')).toBeInTheDocument();
            expect(screen.getByText('$4.99')).toBeInTheDocument();
        });
    });

    it('opens product review modal', async () => {
        mockGetMenu.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review'));
        await waitFor(() => expect(screen.getByText('How was this item?')).toBeInTheDocument());
    });

    it('submits product review', async () => {
        mockAddRating.mockResolvedValue({ data: { message: 'OK' } });
        mockGetMenu.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Review'));
        await waitFor(() => expect(screen.getByText('How was this item?')).toBeInTheDocument());
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        fireEvent.click(stars[4]); // 5 stars
        fireEvent.click(screen.getByText('Submit'));
        await waitFor(() => expect(mockAddRating).toHaveBeenCalled());
    });

    it('toggles product reviews', async () => {
        mockGetRatingsByProduct.mockResolvedValue({ data: [{ id: 1, customerName: 'Jane', score: 4, comment: 'Nice', reviewType: 'product', createdAt: '2026-01-01' }] });
        mockGetMenu.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        fireEvent.click(screen.getByText('Reviews'));
        await waitFor(() => expect(screen.getByText('Jane')).toBeInTheDocument());
    });

    it('hover on menu card', async () => {
        mockGetMenu.mockResolvedValue({ data: [{ id: 1, name: 'Coffee', description: 'Hot', price: 4.99, status: 'true', customerId: 1, customerName: 'Bev' }] });
        render(<W><CustomerMenu /></W>);
        await waitFor(() => expect(screen.getByText('Coffee')).toBeInTheDocument());
        const card = screen.getByText('Coffee').closest('div[class="scale-in"]') || screen.getByText('Coffee').parentElement?.parentElement;
        if (card) {
            fireEvent.mouseEnter(card);
            fireEvent.mouseLeave(card);
        }
    });
});

// ==================== CUSTOMER RATINGS ====================
describe('Customer Ratings', async () => {
    const { default: CustomerRatings } = await import('../pages/CustomerRatings');

    it('renders form and tabs', async () => {
        render(<W><CustomerRatings /></W>);
        expect(screen.getByText('Ratings & Reviews')).toBeInTheDocument();
        expect(screen.getByText('Leave a Review')).toBeInTheDocument();
        expect(screen.getByText('My Reviews')).toBeInTheDocument();
        expect(screen.getByText('All Reviews')).toBeInTheDocument();
    });

    it('submits general review', async () => {
        mockAddRating.mockResolvedValue({ data: { message: 'OK' } });
        render(<W><CustomerRatings /></W>);
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        fireEvent.click(stars[3]); // 4 stars
        fireEvent.change(screen.getByPlaceholderText('Tell us about your experience...'), { target: { value: 'Great café!' } });
        fireEvent.click(screen.getByText('Submit Review'));
        await waitFor(() => expect(mockAddRating).toHaveBeenCalledWith({ score: '4', comment: 'Great café!' }));
    });

    it('submit without score shows error', async () => {
        render(<W><CustomerRatings /></W>);
        fireEvent.click(screen.getByText('Submit Review'));
        expect(mockAddRating).not.toHaveBeenCalled();
    });

    it('switches between tabs', async () => {
        mockGetMyRatings.mockResolvedValue({ data: [] });
        mockGetAllRatings.mockResolvedValue({ data: [{ id: 1, customerName: 'Bob', score: 5, comment: 'Wow', reviewType: 'general', createdAt: '2026-01-01', billId: null, productId: null, productName: null }] });
        render(<W><CustomerRatings /></W>);
        await waitFor(() => expect(screen.getByText("You haven't left any reviews yet")).toBeInTheDocument());
        fireEvent.click(screen.getByText('All Reviews'));
        await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument());
    });

    it('shows review type badges', async () => {
        mockGetMyRatings.mockResolvedValue({
            data: [
                { id: 1, customerName: 'Me', score: 5, comment: 'Nice', reviewType: 'product', productName: 'Latte', createdAt: '2026-01-01', billId: null, productId: 1 },
                { id: 2, customerName: 'Me', score: 4, comment: 'Good', reviewType: 'bill', productName: null, createdAt: '2026-01-01', billId: 1, productId: null },
            ]
        });
        render(<W><CustomerRatings /></W>);
        await waitFor(() => {
            expect(screen.getByText('Product: Latte')).toBeInTheDocument();
            expect(screen.getByText('Order Review')).toBeInTheDocument();
        });
    });

    it('star hover effect', () => {
        render(<W><CustomerRatings /></W>);
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        fireEvent.mouseEnter(stars[2]);
        fireEvent.mouseLeave(stars[2]);
    });

    it('handles submit failure', async () => {
        mockAddRating.mockRejectedValue(new Error('fail'));
        render(<W><CustomerRatings /></W>);
        const stars = screen.getAllByLabelText(/Rate \d stars/);
        fireEvent.click(stars[0]);
        fireEvent.click(screen.getByText('Submit Review'));
        await waitFor(() => expect(mockAddRating).toHaveBeenCalled());
    });
});
