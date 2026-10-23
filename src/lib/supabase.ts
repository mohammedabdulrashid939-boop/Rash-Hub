import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, ProductImage, ProductSize, Order, OrderItem, Profile } from '../types';

/**
 * Sanitizes Supabase URL to ensure it is purely the root origin (https://xxx.supabase.co).
 * Removes any accidental /rest/v1, /auth/v1, /storage/v1, trailing slashes, quotes, or paths.
 * Prevents PostgREST PGRST125: "Invalid path specified in request URL"
 */
export function sanitizeSupabaseUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  let cleaned = rawUrl.trim().replace(/^["']|["']$/g, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`;
  }
  try {
    const parsed = new URL(cleaned);
    // Return exclusively protocol + hostname (e.g. https://xyz.supabase.co)
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    // Fallback manual regex cleaning
    cleaned = cleaned.replace(/\/(rest|auth|storage)\/v[0-9]+.*$/i, '');
    cleaned = cleaned.replace(/\/+$/, '');
    return cleaned;
  }
}

export function sanitizeSupabaseKey(rawKey: string): string {
  if (!rawKey) return '';
  return rawKey.trim().replace(/^["']|["']$/g, '');
}

// Read from Vite environment or user-provided runtime configuration
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Allow runtime override from localStorage so the user can connect their project directly in the UI if .env is empty
const rawLocalUrl = typeof window !== 'undefined' ? localStorage.getItem('rash_hub_supabase_url') || '' : '';
const rawLocalAnonKey = typeof window !== 'undefined' ? localStorage.getItem('rash_hub_supabase_anon_key') || '' : '';

// Sanitize immediately
export const SUPABASE_URL = sanitizeSupabaseUrl(rawLocalUrl || envUrl);
export const SUPABASE_ANON_KEY = sanitizeSupabaseKey(rawLocalAnonKey || envAnonKey);

// If the stored local URL had an invalid path (e.g. /rest/v1), update localStorage with the sanitized version
if (typeof window !== 'undefined' && rawLocalUrl && rawLocalUrl !== SUPABASE_URL) {
  try {
    localStorage.setItem('rash_hub_supabase_url', SUPABASE_URL);
  } catch (e) {
    console.warn('Could not update sanitized URL in localStorage', e);
  }
}

export const isSupabaseConfigured = (): boolean => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  if (
    SUPABASE_URL.includes('placeholder-project') ||
    SUPABASE_ANON_KEY.includes('placeholder-anon-key') ||
    SUPABASE_URL === '' ||
    SUPABASE_ANON_KEY === ''
  ) {
    return false;
  }
  return SUPABASE_URL.startsWith('https://') && SUPABASE_URL.includes('.supabase.co');
};

// Create the Supabase client with the sanitized URL
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL || 'https://placeholder-project.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export function saveRuntimeSupabaseConfig(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = sanitizeSupabaseKey(anonKey);
    localStorage.setItem('rash_hub_supabase_url', cleanUrl);
    localStorage.setItem('rash_hub_supabase_anon_key', cleanKey);
    window.location.reload();
  }
}

export function clearRuntimeSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('rash_hub_supabase_url');
    localStorage.removeItem('rash_hub_supabase_anon_key');
    window.location.reload();
  }
}

/**
 * Checks connection to the Supabase database
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  hasSchema?: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase credentials are not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      hasSchema: false,
    };
  }

  try {
    const { error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        // relation does not exist
        return {
          connected: true,
          message: 'Connected to Supabase! However, database tables have not been created yet. Please execute the SQL migration in Supabase SQL Editor.',
          hasSchema: false,
        };
      }
      if (error.code === 'PGRST125') {
        return {
          connected: false,
          message: 'Invalid URL path format. Ensure your Supabase Project URL is "https://xxx.supabase.co" without "/rest/v1".',
          hasSchema: false,
        };
      }
      return {
        connected: false,
        message: `Supabase returned an error: ${error.message}`,
        hasSchema: false,
      };
    }

    return {
      connected: true,
      message: 'Successfully connected to Supabase and verified database schema!',
      hasSchema: true,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown connection error';
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${errorMsg}`,
      hasSchema: false,
    };
  }
}

// -------------------------------------------------------------
// PRODUCT OPERATIONS
// -------------------------------------------------------------

export async function fetchPublishedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return getLocalProducts().filter((p) => p.status === 'published');
  }

  try {
    // 1. Try relational query
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        sizes:product_sizes(*)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as Product[];
    }

    // 2. If relational query fails due to missing table join, try simple query
    if (error && error.code !== '42P01') {
      const { data: simpleData, error: simpleErr } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!simpleErr && simpleData) {
        // Try fetching images & sizes separately
        const productIds = simpleData.map((p) => p.id);
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('*')
          .in('product_id', productIds);
        const { data: sizesData } = await supabase
          .from('product_sizes')
          .select('*')
          .in('product_id', productIds);

        return simpleData.map((p) => ({
          ...p,
          images: imagesData?.filter((img) => img.product_id === p.id) || [],
          sizes: sizesData?.filter((sz) => sz.product_id === p.id) || [],
        })) as Product[];
      }
    }

    // Fall back to local products if table doesn't exist
    return getLocalProducts().filter((p) => p.status === 'published');
  } catch (e) {
    return getLocalProducts().filter((p) => p.status === 'published');
  }
}

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return getLocalProducts();
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        sizes:product_sizes(*)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as Product[];
    }

    // Simple fallback query if joins fail
    const { data: simpleData, error: simpleErr } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!simpleErr && simpleData) {
      const productIds = simpleData.map((p) => p.id);
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds);
      const { data: sizesData } = await supabase
        .from('product_sizes')
        .select('*')
        .in('product_id', productIds);

      return simpleData.map((p) => ({
        ...p,
        images: imagesData?.filter((img) => img.product_id === p.id) || [],
        sizes: sizesData?.filter((sz) => sz.product_id === p.id) || [],
      })) as Product[];
    }

    return getLocalProducts();
  } catch (e) {
    return getLocalProducts();
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return getLocalProducts().find((p) => p.slug === slug) || null;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        sizes:product_sizes(*)
      `)
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return data as Product;
    }

    // Fallback simple query
    const { data: simpleData } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (simpleData) {
      const { data: imagesData } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', simpleData.id);
      const { data: sizesData } = await supabase
        .from('product_sizes')
        .select('*')
        .eq('product_id', simpleData.id);

      return {
        ...simpleData,
        images: imagesData || [],
        sizes: sizesData || [],
      } as Product;
    }

    return getLocalProducts().find((p) => p.slug === slug) || null;
  } catch (e) {
    return getLocalProducts().find((p) => p.slug === slug) || null;
  }
}

export async function saveProductToSupabase(
  productData: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { id?: string },
  images: Array<{ url: string; storage_path: string; is_cover: boolean; display_order: number }>,
  sizes: Array<{ size_label: ProductSize['size_label']; stock_quantity: number; sku?: string }>
): Promise<{ success: boolean; product?: Product; error?: string }> {
  if (!isSupabaseConfigured()) {
    // Save to local storage for testing when Supabase is not configured
    const localId = productData.id || `prod_${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: localId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: images.map((img, idx) => ({
        id: `img_${Date.now()}_${idx}`,
        product_id: localId,
        ...img,
      })),
      sizes: sizes.map((s, idx) => ({
        id: `size_${Date.now()}_${idx}`,
        product_id: localId,
        ...s,
      })),
    };
    saveLocalProduct(newProduct);
    return { success: true, product: newProduct };
  }

  try {
    const payload = {
      name: productData.name,
      slug: productData.slug,
      club_or_country: productData.club_or_country,
      country: productData.country || null,
      season: productData.season,
      jersey_type: productData.jersey_type,
      version: productData.version,
      short_description: productData.short_description,
      full_description: productData.full_description,
      selling_price: productData.selling_price,
      original_price: productData.original_price || null,
      featured: productData.featured,
      new_arrival: productData.new_arrival,
      status: productData.status,
      tags: productData.tags || [],
    };

    let productId = productData.id;

    if (productId) {
      const { error: updateError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productId);
      if (updateError) throw updateError;
    } else {
      const { data: newProd, error: insertError } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();
      if (insertError) throw insertError;
      productId = newProd.id;
    }

    // Save images: delete old and insert new
    await supabase.from('product_images').delete().eq('product_id', productId);
    if (images.length > 0) {
      const imageRows = images.map((img) => ({
        product_id: productId,
        storage_path: img.storage_path,
        url: img.url,
        display_order: img.display_order,
        is_cover: img.is_cover,
      }));
      const { error: imgError } = await supabase.from('product_images').insert(imageRows);
      if (imgError) throw imgError;
    }

    // Save sizes: delete old and insert new
    await supabase.from('product_sizes').delete().eq('product_id', productId);
    if (sizes.length > 0) {
      const sizeRows = sizes.map((s) => ({
        product_id: productId,
        size_label: s.size_label,
        stock_quantity: s.stock_quantity,
        sku: s.sku || null,
      }));
      const { error: sizeError } = await supabase.from('product_sizes').insert(sizeRows);
      if (sizeError) throw sizeError;
    }

    const { data: finalProduct, error: fetchError } = await supabase
      .from('products')
      .select(`
        *,
        images:product_images(*),
        sizes:product_sizes(*)
      `)
      .eq('id', productId)
      .single();

    if (fetchError) throw fetchError;

    return { success: true, product: finalProduct as Product };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save product to Supabase';
    return { success: false, error: errorMsg };
  }
}

export async function deleteProductFromSupabase(productId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    deleteLocalProduct(productId);
    return true;
  }

  try {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error deleting product:', e);
    return false;
  }
}

export async function updateProductStatusInSupabase(
  productId: string,
  status: 'published' | 'draft' | 'archived'
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    updateLocalProductStatus(productId, status);
    return true;
  }

  try {
    const { error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', productId);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error updating status:', e);
    return false;
  }
}

// -------------------------------------------------------------
// IMAGE STORAGE UPLOAD
// -------------------------------------------------------------

export async function uploadJerseyImage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; storage_path: string } | null> {
  if (!isSupabaseConfigured()) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          storage_path: `local/${file.name}`,
        });
      };
      reader.readAsDataURL(file);
    });
  }

  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `jerseys/${Date.now()}_${cleanFileName}`;

    if (onProgress) onProgress(30);

    const { error: uploadError } = await supabase.storage
      .from('jersey-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw uploadError;
    }

    if (onProgress) onProgress(80);

    const { data: publicUrlData } = supabase.storage
      .from('jersey-images')
      .getPublicUrl(path);

    if (onProgress) onProgress(100);

    return {
      url: publicUrlData.publicUrl,
      storage_path: path,
    };
  } catch (e) {
    console.error('Image upload failed:', e);
    return null;
  }
}

// -------------------------------------------------------------
// ORDERS OPERATIONS
// -------------------------------------------------------------

export async function createOrderInSupabase(
  orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_reference'>,
  items: Array<{
    product_id?: string;
    product_name: string;
    selected_size: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    product_image?: string;
  }>
): Promise<{ success: boolean; order?: Order; error?: string }> {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const orderReference = `RHS-2026-${rand}`;

  if (!isSupabaseConfigured()) {
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      order_reference: orderReference,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items.map((it, idx) => ({
        id: `item_${Date.now()}_${idx}`,
        ...it,
      })),
    };
    saveLocalOrder(newOrder);
    return { success: true, order: newOrder };
  }

  try {
    const { data: orderRow, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          order_reference: orderReference,
          customer_id: orderData.customer_id || null,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email || null,
          customer_phone: orderData.customer_phone,
          whatsapp_number: orderData.whatsapp_number || null,
          delivery_location: orderData.delivery_location,
          delivery_instructions: orderData.delivery_instructions || null,
          total_amount: orderData.total_amount,
          order_status: orderData.order_status || 'Pending',
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    const orderItemsRows = items.map((it) => ({
      order_id: orderRow.id,
      product_id: it.product_id || null,
      product_name: it.product_name,
      selected_size: it.selected_size,
      quantity: it.quantity,
      unit_price: it.unit_price,
      line_total: it.line_total,
      product_image: it.product_image || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsRows);

    if (itemsError) throw itemsError;

    // Decrement size stock safely
    for (const it of items) {
      if (it.product_id) {
        const { data: sizeRecord } = await supabase
          .from('product_sizes')
          .select('id, stock_quantity')
          .eq('product_id', it.product_id)
          .eq('size_label', it.selected_size)
          .single();

        if (sizeRecord) {
          const newStock = Math.max(0, (sizeRecord.stock_quantity || 0) - it.quantity);
          await supabase
            .from('product_sizes')
            .update({ stock_quantity: newStock })
            .eq('id', sizeRecord.id);
        }
      }
    }

    const { data: fullOrder, error: fetchErr } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderRow.id)
      .single();

    if (fetchErr) throw fetchErr;

    return { success: true, order: fullOrder as Order };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to place order';
    return { success: false, error: errorMsg };
  }
}

export async function fetchCustomerOrders(customerId: string): Promise<Order[]> {
  if (!isSupabaseConfigured()) {
    return getLocalOrders().filter((o) => o.customer_id === customerId);
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Order[]) || [];
  } catch (e) {
    return getLocalOrders().filter((o) => o.customer_id === customerId);
  }
}

export async function fetchAllOrdersAdmin(): Promise<Order[]> {
  if (!isSupabaseConfigured()) {
    return getLocalOrders();
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Order[]) || [];
  } catch (e) {
    return getLocalOrders();
  }
}

export async function updateOrderStatusInSupabase(
  orderId: string,
  newStatus: Order['order_status'],
  notes?: string
): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    updateLocalOrderStatus(orderId, newStatus, notes);
    return true;
  }

  try {
    const updatePayload: { order_status: Order['order_status']; fulfillment_notes?: string } = {
      order_status: newStatus,
    };
    if (notes !== undefined) {
      updatePayload.fulfillment_notes = notes;
    }
    const { error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId);

    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Error updating order status:', e);
    return false;
  }
}

// -------------------------------------------------------------
// LOCAL STATE STORAGE HELPERS (FOR TESTING BEFORE SUPABASE CONFIG)
// -------------------------------------------------------------

const LOCAL_PRODUCTS_KEY = 'rash_hub_products_local';
const LOCAL_ORDERS_KEY = 'rash_hub_orders_local';

export function getLocalProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return [];
}

function saveLocalProduct(product: Product) {
  const current = getLocalProducts();
  const index = current.findIndex((p) => p.id === product.id);
  if (index >= 0) {
    current[index] = product;
  } else {
    current.unshift(product);
  }
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(current));
}

function deleteLocalProduct(id: string) {
  const current = getLocalProducts().filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(current));
}

function updateLocalProductStatus(id: string, status: 'published' | 'draft' | 'archived') {
  const current = getLocalProducts().map((p) => (p.id === id ? { ...p, status } : p));
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(current));
}

export function getLocalOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return [];
}

function saveLocalOrder(order: Order) {
  const current = getLocalOrders();
  current.unshift(order);
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(current));
}

function updateLocalOrderStatus(id: string, status: Order['order_status'], notes?: string) {
  const current = getLocalOrders().map((o) =>
    o.id === id ? { ...o, order_status: status, fulfillment_notes: notes ?? o.fulfillment_notes } : o
  );
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(current));
}
