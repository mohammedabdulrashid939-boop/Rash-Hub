export type JerseyType = 'Home' | 'Away' | 'Third Kit' | 'Goalkeeper' | 'Special Edition' | 'Retro';
export type JerseyVersion = 'Fan Version' | 'Player Version';

export interface ProductImage {
  id: string;
  product_id?: string;
  storage_path: string;
  url: string;
  display_order: number;
  is_cover: boolean;
  created_at?: string;
}

export interface ProductSize {
  id: string;
  product_id?: string;
  size_label: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  stock_quantity: number;
  sku?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  club_or_country: string;
  country?: string;
  season: string;
  jersey_type: JerseyType;
  version: JerseyVersion;
  short_description: string;
  full_description: string;
  selling_price: number;
  original_price?: number | null;
  featured: boolean;
  new_arrival: boolean;
  status: 'published' | 'draft' | 'archived';
  tags?: string[];
  created_at?: string;
  updated_at?: string;
  images?: ProductImage[];
  sizes?: ProductSize[];
}

export interface CartItem {
  id: string;
  product: Product;
  selected_size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  quantity: number;
  unit_price: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Ready for Delivery'
  | 'Completed'
  | 'Cancelled';

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id?: string;
  product_name: string;
  selected_size: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_image?: string;
}

export interface Order {
  id: string;
  order_reference: string;
  customer_id?: string | null;
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  whatsapp_number?: string;
  delivery_location: string;
  delivery_instructions?: string;
  total_amount: number;
  order_status: OrderStatus;
  fulfillment_notes?: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  role: 'customer' | 'admin';
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilterState {
  search: string;
  clubOrCountry: string;
  jerseyType: string;
  version: string;
  size: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'newest' | 'price_low' | 'price_high';
}
