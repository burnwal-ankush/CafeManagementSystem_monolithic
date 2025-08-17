import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/user/signup', data),
  login: (data) => api.post('/user/login', data),
  checkToken: () => api.get('/user/checkToken'),
  changePassword: (data) => api.post('/user/changePassword', data),
  forgotPassword: (data) => api.post('/user/forgotPassword', data),
};

export const userAPI = {
  getAllUsers: () => api.get('/user/get'),
  updateUser: (data) => api.post('/user/update', data),
};

export const categoryAPI = {
  addCategory: (data) => api.post('/category/addCategory', data),
  getAllCategories: (filterValue) => api.get(`/category/getCategory${filterValue ? `?filterValue=${filterValue}` : ''}`),
  updateCategory: (data) => api.post('/category/updateCategory', data),
};

export const productAPI = {
  addProduct: (data) => api.post('/product/addProduct', data),
  getAllProducts: () => api.get('/product/getProduct'),
  updateProduct: (data) => api.post('/product/updateProduct', data),
  deleteProduct: (id) => api.post(`/product/deleteProduct/${id}`),
  updateStatus: (data) => api.post('/product/updateStatus', data),
  getByCategory: (id) => api.get(`/product/getByCategory/${id}`),
  getProductById: (id) => api.get(`/product/getProductById/${id}`),
};

export const billAPI = {
  generateBill: (data) => api.post('/bill/generateBill', data),
  getBills: () => api.get('/bill/getBills'),
  getPdf: (data) => api.post('/bill/getPdf', data, { responseType: 'blob' }),
  deleteBill: (id) => api.post(`/bill/deleteBill/${id}`),
};

export const dashboardAPI = {
  getCount: () => api.get('/dashboard/getCount'),
};

export default api;