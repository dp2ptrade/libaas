export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  color_hex: string | null;
  stock_quantity: number;
  price_adjustment: number;
  sku: string | null;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  category_id: string | null;
  price: number;
  compare_price: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  fabric: string | null;
  care_instructions: string | null;
  tags: string[] | null;
  sku: string | null;
  stock_quantity: number;
  created_at?: string;
  updated_at?: string;
  category?: Category;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
};

export type ProductWithRelations = Product & {
  category?: Category;
  product_images?: ProductImage[];
  product_variants?: ProductVariant[];
};

export type CartItem = {
  product_id: string;
  variant_id: string | null;
  name: string;
  slug: string;
  price: number;
  image_url: string;
  size: string | null;
  color: string | null;
  color_hex?: string | null;
  quantity: number;
  stock: number;
};

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  status: string;
  payment_method: string;
  payment_status: string;
  payment_reference: string | null;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  coupon_code: string | null;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district: string;
  shipping_postcode: string | null;
  customer_email: string | null;
  notes: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
};

export type Address = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  district: string;
  postcode: string | null;
  is_default: boolean;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: string;
  created_at: string;
};

export type WishlistItem = {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_approved: boolean;
  created_at: string;
};

export type PaymentMethod = 'cod' | 'visa' | 'bkash' | 'nagad';
