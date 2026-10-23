-- ============================================================
-- RASH HUB STORE — SUPABASE DATABASE MIGRATION & RLS POLICIES
-- Football Jerseys Only — Abofour, Ghana Delivery
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone_number TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  club_or_country TEXT NOT NULL,
  country TEXT,
  season TEXT NOT NULL,
  jersey_type TEXT NOT NULL CHECK (jersey_type IN ('Home', 'Away', 'Third Kit', 'Goalkeeper', 'Special Edition', 'Retro', 'Other')),
  version TEXT NOT NULL CHECK (version IN ('Fan Version', 'Player Version')),
  short_description TEXT NOT NULL,
  full_description TEXT NOT NULL,
  selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
  original_price NUMERIC(10, 2) CHECK (original_price IS NULL OR original_price >= selling_price),
  featured BOOLEAN NOT NULL DEFAULT false,
  new_arrival BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.products(new_arrival);

-- 3. PRODUCT IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id);

-- 4. PRODUCT SIZES & STOCK TABLE
CREATE TABLE IF NOT EXISTS public.product_sizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_label TEXT NOT NULL CHECK (size_label IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL')),
  stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  sku TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(product_id, size_label)
);

CREATE INDEX IF NOT EXISTS idx_product_sizes_product ON public.product_sizes(product_id);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_reference TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  whatsapp_number TEXT,
  delivery_location TEXT NOT NULL,
  delivery_instructions TEXT,
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  order_status TEXT NOT NULL DEFAULT 'Pending' CHECK (order_status IN ('Pending', 'Confirmed', 'Processing', 'Ready for Delivery', 'Completed', 'Cancelled')),
  fulfillment_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(order_reference);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  selected_size TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
  product_image TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 7. SECURITY FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Football Fan'),
    NEW.email,
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. ENABLE RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 9. RLS POLICIES
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile (not role)" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR public.is_admin()));
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view published products" ON public.products FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin());

CREATE POLICY "Public can view product images" ON public.product_images FOR SELECT USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.status = 'published' OR public.is_admin())));
CREATE POLICY "Admins can manage product images" ON public.product_images FOR ALL USING (public.is_admin());

CREATE POLICY "Public can view product sizes" ON public.product_sizes FOR SELECT USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND (p.status = 'published' OR public.is_admin())));
CREATE POLICY "Admins can manage product sizes" ON public.product_sizes FOR ALL USING (public.is_admin());

CREATE POLICY "Customers can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id OR public.is_admin());
CREATE POLICY "Anyone can create an order" ON public.orders FOR INSERT WITH CHECK (customer_id IS NULL OR customer_id = auth.uid());
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (public.is_admin());

CREATE POLICY "Customers can view their order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.customer_id = auth.uid() OR public.is_admin())));
CREATE POLICY "Anyone can insert order items when creating order" ON public.order_items FOR INSERT WITH CHECK (true);

-- 10. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('jersey-images', 'jersey-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
CREATE POLICY "Public can view jersey images" ON storage.objects FOR SELECT USING (bucket_id = 'jersey-images');
CREATE POLICY "Admins can upload jersey images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'jersey-images' AND public.is_admin());
CREATE POLICY "Admins can update jersey images" ON storage.objects FOR UPDATE USING (bucket_id = 'jersey-images' AND public.is_admin());
CREATE POLICY "Admins can delete jersey images" ON storage.objects FOR DELETE USING (bucket_id = 'jersey-images' AND public.is_admin());
