import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080',
    headers: { 'Content-Type': 'application/json' },
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// Auth
export const signup = (data: Record<string, string>) => API.post('/user/signup', data);
export const login = (data: Record<string, string>) => API.post('/user/login', data);
export const checkToken = () => API.get('/user/checkToken');
export const forgotPassword = (data: Record<string, string>) => API.post('/user/forgotPassword', data);
export const changePassword = (data: Record<string, string>) => API.post('/user/changePassword', data);
export const getProfile = () => API.get('/user/profile');
export const updateProfile = (data: Record<string, string>) => API.post('/user/updateProfile', data);

// Users
export const getAllUsers = () => API.get('/user/get');
export const updateUser = (data: Record<string, string>) => API.post('/user/update', data);
export const addStaff = (data: Record<string, string>) => API.post('/user/addStaff', data);
export const updateRole = (data: Record<string, string>) => API.post('/user/updateRole', data);

// Categories
export const getCategories = (filter?: string) => API.get('/category/getCategory', { params: filter ? { filterValue: filter } : {} });
export const addCategory = (data: Record<string, string>) => API.post('/category/addCategory', data);
export const updateCategory = (data: Record<string, string>) => API.post('/category/updateCategory', data);

// Products
export const getProducts = () => API.get('/product/getProduct');
export const addProduct = (data: Record<string, string>) => API.post('/product/addProduct', data);
export const updateProduct = (data: Record<string, string>) => API.post('/product/updateProduct', data);
export const deleteProduct = (id: number) => API.post(`/product/deleteProduct/${id}`);
export const updateProductStatus = (data: Record<string, string>) => API.post('/product/updateStatus', data);
export const getProductsByCategory = (id: number) => API.get(`/product/getByCategory/${id}`);
export const getProductById = (id: number) => API.get(`/product/getProductById/${id}`);

// Bills
export const generateBill = (data: Record<string, unknown>) => API.post('/bill/generateBill', data);
export const getBills = () => API.get('/bill/getBills');
export const getPdf = (data: Record<string, unknown>) => API.post('/bill/getPdf', data, { responseType: 'blob' });
export const deleteBill = (id: number) => API.post(`/bill/deleteBill/${id}`);

// Dashboard
export const getDashboardCounts = () => API.get('/dashboard/getCount');

// Customer
export const getMyOrders = () => API.get('/customer/myOrders');
export const getMenu = () => API.get('/customer/menu');
export const addRating = (data: Record<string, string>) => API.post('/customer/rate', data);
export const getMyRatings = () => API.get('/customer/myRatings');
export const getAllRatings = () => API.get('/customer/allRatings');
export const getRatingsByBill = (billId: number) => API.get(`/customer/ratings/bill/${billId}`);
export const getRatingsByProduct = (productId: number) => API.get(`/customer/ratings/product/${productId}`);

export default API;
