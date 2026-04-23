export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  description: string;
  sizes: string[];
  stock: number;
  rating: number;
  reviews: number;
}

export interface CartItem {
  id: string;
  product: Product;
  size: string;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "active" | "inactive";
  registeredDate: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  deliveryAddress: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  status: "pending" | "success" | "failed";
  date: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  code: string;
  validUntil: string;
  image: string;
  active: boolean;
}

export interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  status: "assigned" | "in_transit" | "delivered";
  assignedTo?: string;
  deliveryDate?: string;
}

// Mock Data for Analytics (Used in SalesReports)
export const salesData = [
  { month: "Jan", sales: 12500, orders: 45 },
  { month: "Feb", sales: 15800, orders: 58 },
  { month: "Mar", sales: 18200, orders: 67 },
  { month: "Apr", sales: 16500, orders: 61 },
  { month: "May", sales: 21000, orders: 75 },
  { month: "Jun", sales: 24500, orders: 89 },
];

export const topProducts = [
  { name: "Nike Air Max 270", sales: 145 },
  { name: "Jordan 1 Retro High", sales: 132 },
  { name: "Adidas Ultraboost 22", sales: 98 },
  { name: "Vans Old Skool", sales: 87 },
  { name: "Converse Chuck Taylor", sales: 76 },
];