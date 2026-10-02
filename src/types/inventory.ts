export type CategoryType = 'raw_material' | 'finished_good';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  supplier_id: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  min_stock: number;
  stock_qty: number;
  image_url: string;
  created_at: string;
}

export type StockMovementType = 'in' | 'out' | 'adjustment';

export interface StockMovement {
  id: string;
  product_id: string;
  warehouse_id: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  note: string;
  created_at: string;
}
