import axios, { AxiosInstance } from 'axios';

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

export interface Store {
  store_id: string;
  pricing_type: 'FIXED' | 'VARIABLE';
  price: number;
  available_for_sale: boolean;
  optimal_stock?: number | null;
  low_stock?: number | null;
}

export interface Variant {
  variant_id: string;
  item_id: string;
  sku?: string;
  barcode?: string;
  option1_value?: string;
  option2_value?: string;
  option3_value?: string;
  default_price: number;
  cost?: number;
  purchase_cost?: number | null;
  default_pricing_type: 'FIXED' | 'VARIABLE';
  stores?: Store[];
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface Product {
  id: string;
  handle: string;
  reference_id?: string | null;
  item_name: string;
  description?: string | null;
  track_stock: boolean;
  sold_by_weight: boolean;
  is_composite: boolean;
  use_production: boolean;
  category_id: string;
  components: any[]; // define if needed
  primary_supplier_id?: string | null;
  tax_ids: string[];
  modifier_ids: string[];
  form: string;
  color: string;
  image_url?: string | null;
  option1_name?: string | null;
  option2_name?: string | null;
  option3_name?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  variants?: Variant[];
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface Modifier {
  id: string;
  name: string;
  price?: number;
}

export interface Customer {
  id?: string;
  name: string;
  email?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  note?: string;
}

export interface OrderItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  cost?: number;
  modifiers?: string[];
  notes?: string;
}

export interface Order {
  id?: string;
  store_id: string;
  customer_id?: string;
  customer?: Customer;
  items: OrderItem[];
  subtotal?: number;
  total_discount?: number;
  total_tax?: number;
  total?: number;
  note?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  created_at?: string;
}

class LoyverseAPI {
  private api: AxiosInstance;
  
  constructor() {
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Products
  async getProducts(limit = 100, cursor?: string): Promise<{ products: Product[], cursor?: string }> {
    const params: any = { limit };
    if (cursor) params.cursor = cursor;
    const response = await this.api.get('/items', { params });
    return {
      products: response.data.items,
      cursor: response.data.cursor
    };
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.api.get(`/items/${id}`);
    return response.data;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const response = await this.api.get('/items');
    const allItems: Product[] = response.data.items;

    const filtered = allItems.filter(
        (item) => item.category_id === categoryId
    );
console.log('filtered');
    console.log(filtered);
    return filtered;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await this.api.get('/categories');
    return response.data.categories;
  }

  async getCategory(id: string): Promise<Category> {
    const response = await this.api.get(`/categories/${id}`);
    return response.data;
  }

  // Customers
  async createCustomer(customer: Customer): Promise<Customer> {
    const response = await this.api.post('/customers', customer);
    return response.data;
  }

  async getCustomer(id: string): Promise<Customer> {
    const response = await this.api.get(`/customers/${id}`);
    return response.data;
  }

  async searchCustomers(query: string): Promise<Customer[]> {
    const response = await this.api.get('/customers', {
      params: { query }
    });
    return response.data.customers;
  }

  // Orders/Receipts
  async createReceipt(order: Order): Promise<Order> {
    const receipt = {
      store_id: order.store_id || process.env.EXPO_PUBLIC_STORE_ID,
      customer_id: order.customer_id,
      line_items: order.items.map(item => ({
        item_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.modifiers,
        notes: item.notes
      })),
      note: order.note,
      payments: [{
        payment_type_id: 'CASH', // This should be dynamic based on payment method
        amount: order.total || 0
      }]
    };
    
    const response = await this.api.post('/receipts', receipt);
    return response.data;
  }

  async getReceipt(id: string): Promise<Order> {
    const response = await this.api.get(`/receipts/${id}`);
    return response.data;
  }

  async getReceipts(limit = 50, cursor?: string): Promise<{ orders: Order[], cursor?: string }> {
    const params: any = { limit };
    if (cursor) params.cursor = cursor;
    
    const response = await this.api.get('/receipts', { params });
    return {
      orders: response.data.receipts,
      cursor: response.data.cursor
    };
  }

  // Inventory
  async getInventory(itemId: string, storeId?: string): Promise<any> {
    const params: any = {};
    if (storeId) params.store_id = storeId;
    
    const response = await this.api.get(`/inventory/${itemId}`, { params });
    return response.data;
  }

  // Stores
  async getStores(): Promise<any[]> {
    const response = await this.api.get('/stores');
    return response.data.stores;
  }
}

export const loyverseAPI = new LoyverseAPI();