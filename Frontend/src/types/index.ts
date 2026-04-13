export interface User {
  id: number;
  name: string;
  contactNumber: string;
  email: string;
  status: string;
  role: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  status: string;
  customerId: number;
  customerName: string;
}

export interface Bill {
  id: number;
  uuid: string;
  name: string;
  email: string;
  contactNumber: string;
  paymentMethod: string;
  total: number;
  productDetail: string;
  createdBy: string;
  billCreatedDttm: string;
}

export interface DashboardCounts {
  category: number;
  product: number;
  bill: number;
}

export interface AuthResponse {
  token: string;
}

export interface ProductDetail {
  id: number;
  name: string;
  category: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Rating {
  id: number;
  customerEmail: string;
  customerName: string;
  score: number;
  comment: string;
  createdAt: string;
  billId: number | null;
  productId: number | null;
  productName: string | null;
  reviewType: string;
}
