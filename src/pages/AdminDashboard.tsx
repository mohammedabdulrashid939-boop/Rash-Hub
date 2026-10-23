import React, { useState, useEffect } from 'react';
import {
  Shield,
  Package,
  ShoppingBag,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Filter,
  ExternalLink,
  Copy,
  Check,
  Database,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Product, Order, OrderStatus } from '../types';
import {
  fetchAllProductsAdmin,
  fetchAllOrdersAdmin,
  deleteProductFromSupabase,
  updateProductStatusInSupabase,
  updateOrderStatusInSupabase,
  isSupabaseConfigured,
} from '../lib/supabase';
import { BUSINESS_INFO, getWhatsAppLink } from '../lib/constants';
import { JerseyUploadStudio } from '../components/JerseyUploadStudio';
import { SupabaseSetupModal } from '../components/SupabaseSetupBanner';

interface AdminDashboardProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { user, profile, isAdmin, isDemoMode, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'jerseys' | 'upload' | 'orders' | 'settings'
  >('overview');

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Jersey search & filters
  const [jerseySearch, setJerseySearch] = useState('');
  const [jerseyStatusFilter, setJerseyStatusFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<string>('all');

  // Order search & filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Edit Product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Delete Confirmation
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Supabase Setup modal
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  // Status notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadAllData = async () => {
    setLoadingData(true);
    const [prods, ords] = await Promise.all([
      fetchAllProductsAdmin(),
      fetchAllOrdersAdmin(),
    ]);
    setProducts(prods);
    setOrders(ords);
    setLoadingData(false);
  };

  useEffect(() => {
    loadAllData();
  }, [isAdmin]);

  // Authorization check
  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            Admin Access Restricted
          </h2>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            This dashboard is strictly protected by Row Level Security (RLS) for authorized store
            administrators.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0D121F] border border-gray-800 text-xs text-gray-300 space-y-2 text-left">
          <p className="font-bold text-white">How to grant Admin Role in Supabase:</p>
          <code className="block p-2 bg-black/60 rounded text-[11px] text-[#00E676] font-mono break-all">
            UPDATE public.profiles SET role = 'admin' WHERE email = '{user?.email || 'your-email@example.com'}';
          </code>
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => onNavigate('home')}
            className="px-5 py-2.5 rounded-xl bg-[#0F172A] border border-gray-700 text-white text-xs font-bold"
          >
            Go to Storefront
          </button>
          <button
            onClick={() => signOut()}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Statistics
  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.status === 'published').length;
  const draftProducts = products.filter((p) => p.status === 'draft').length;

  const lowStockProducts = products.filter((p) => {
    const total = p.sizes?.reduce((sum, s) => sum + s.stock_quantity, 0) ?? 0;
    return total > 0 && total <= 5;
  }).length;

  const outOfStockProducts = products.filter((p) => {
    const total = p.sizes?.reduce((sum, s) => sum + s.stock_quantity, 0) ?? 0;
    return total === 0;
  }).length;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.order_status === 'Pending').length;
  const completedOrders = orders.filter((o) => o.order_status === 'Completed').length;
  const totalRevenue = orders
    .filter((o) => o.order_status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total_amount, 0);

  // Filtered Jerseys list
  const filteredJerseys = products.filter((p) => {
    if (jerseySearch.trim()) {
      const q = jerseySearch.toLowerCase();
      const match =
        p.name.toLowerCase().includes(q) ||
        p.club_or_country.toLowerCase().includes(q) ||
        p.season.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (jerseyStatusFilter !== 'all' && p.status !== jerseyStatusFilter) return false;
    if (stockFilter === 'low') {
      const total = p.sizes?.reduce((sum, s) => sum + s.stock_quantity, 0) ?? 0;
      if (total <= 0 || total > 5) return false;
    }
    if (stockFilter === 'out') {
      const total = p.sizes?.reduce((sum, s) => sum + s.stock_quantity, 0) ?? 0;
      if (total > 0) return false;
    }
    return true;
  });

  // Filtered Orders list
  const filteredOrders = orders.filter((o) => {
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const match =
        o.order_reference.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q);
      if (!match) return false;
    }
    if (orderStatusFilter !== 'all' && o.order_status !== orderStatusFilter) return false;
    return true;
  });

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    const success = await deleteProductFromSupabase(productToDelete.id);
    setDeleting(false);
    if (success) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showToast(`Deleted ${productToDelete.name}`);
      setProductToDelete(null);
    } else {
      alert('Failed to delete product from Supabase');
    }
  };

  const handleToggleStatus = async (
    product: Product,
    newStatus: 'published' | 'draft' | 'archived'
  ) => {
    const ok = await updateProductStatusInSupabase(product.id, newStatus);
    if (ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
      showToast(`Status updated to ${newStatus}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const ok = await updateOrderStatusInSupabase(orderId, status);
    if (ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: status } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, order_status: status } : null));
      }
      showToast(`Order status updated to ${status}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-24 right-4 z-50 p-4 rounded-2xl bg-emerald-500 text-black font-extrabold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Top Navbar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0D121F] via-[#080B11] to-[#0D121F] border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="Rash Hub Store Admin"
            className="h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(0,230,118,0.25)]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">ADMIN COMMAND CENTER</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#00E676]/20 border border-[#00E676]/40 text-[#00E676] text-[10px] font-extrabold uppercase">
                Authorized
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Rash Hub Store • Football Jerseys Only • Abofour, Ghana Delivery
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setEditingProduct(null);
              setActiveTab('upload');
            }}
            className="px-4 py-2.5 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00FF7F] transition flex items-center gap-1.5 shadow-lg shadow-[#00E676]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload New Jersey</span>
          </button>

          <button
            onClick={() => onNavigate('shop')}
            className="px-4 py-2.5 rounded-xl bg-[#0F172A] border border-gray-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4 text-[#00E676]" />
            <span>View Store</span>
          </button>

          <button
            onClick={() => setSetupModalOpen(true)}
            className="p-2.5 rounded-xl bg-[#080B11] border border-gray-700 text-gray-300 hover:text-white"
            title="Database Configuration"
          >
            <Database className="w-4 h-4 text-[#00E676]" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-800 space-x-6 text-xs font-bold uppercase tracking-wider">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'jerseys', label: `Manage Jerseys (${products.length})`, icon: Package },
          { id: 'upload', label: 'Upload Studio', icon: PlusCircle },
          { id: 'orders', label: `Manage Orders (${orders.length})`, icon: ShoppingBag },
          { id: 'settings', label: 'Store Settings & Supabase', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'upload') setEditingProduct(null);
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`pb-3 shrink-0 flex items-center gap-2 transition relative ${
                isActive ? 'text-[#00E676]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00E676]" />}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0D121F] border border-gray-800 space-y-1">
              <span className="text-xs text-gray-400 uppercase font-bold">Total Products</span>
              <p className="text-3xl font-black text-white">{totalProducts}</p>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
                <span className="text-[#00E676]">{publishedProducts} Published</span>
                <span>•</span>
                <span>{draftProducts} Drafts</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D121F] border border-gray-800 space-y-1">
              <span className="text-xs text-gray-400 uppercase font-bold">Stock Alerts</span>
              <p className="text-3xl font-black text-amber-400">{lowStockProducts}</p>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
                <span>{lowStockProducts} Low Stock</span>
                <span>•</span>
                <span className="text-red-400">{outOfStockProducts} Out of Stock</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D121F] border border-gray-800 space-y-1">
              <span className="text-xs text-gray-400 uppercase font-bold">Total Orders</span>
              <p className="text-3xl font-black text-white">{totalOrders}</p>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 pt-1">
                <span className="text-amber-400">{pendingOrders} Pending</span>
                <span>•</span>
                <span className="text-[#00E676]">{completedOrders} Completed</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0D121F] border border-gray-800 space-y-1">
              <span className="text-xs text-gray-400 uppercase font-bold">Total Sales</span>
              <p className="text-3xl font-black text-[#00E676]">
                {BUSINESS_INFO.currency} {totalRevenue.toFixed(2)}
              </p>
              <p className="text-[11px] text-gray-400 pt-1">Abofour Verified Fulfillment</p>
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="p-6 rounded-3xl bg-[#0D121F] border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Recent Abofour Orders
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-[#00E676] hover:underline"
              >
                View All Orders →
              </button>
            </div>

            {orders.length > 0 ? (
              <div className="divide-y divide-gray-800 text-xs">
                {orders.slice(0, 5).map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <span className="font-mono font-bold text-white">{ord.order_reference}</span>
                      <p className="text-gray-400 text-[11px] mt-0.5">
                        {ord.customer_name} • {ord.delivery_location}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-black text-white">
                        {BUSINESS_INFO.currency} {ord.total_amount.toFixed(2)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        {ord.order_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">No orders recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE JERSEYS */}
      {activeTab === 'jerseys' && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={jerseySearch}
                onChange={(e) => setJerseySearch(e.target.value)}
                placeholder="Search jerseys by title, club, or season..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#0D121F] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:border-[#00E676]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              <select
                value={jerseyStatusFilter}
                onChange={(e) => setJerseyStatusFilter(e.target.value)}
                className="px-3 py-2 bg-[#0D121F] border border-gray-800 rounded-xl text-xs text-white"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 bg-[#0D121F] border border-gray-800 rounded-xl text-xs text-white"
              >
                <option value="all">All Stock Levels</option>
                <option value="low">Low Stock (&le; 5)</option>
                <option value="out">Out of Stock (0)</option>
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-[#0D121F] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#080B11] text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="p-4">Jersey</th>
                    <th className="p-4">Club / Season</th>
                    <th className="p-4">Edition & Version</th>
                    <th className="p-4">Price (GH₵)</th>
                    <th className="p-4">Total Stock</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/80">
                  {filteredJerseys.length > 0 ? (
                    filteredJerseys.map((prod) => {
                      const cover =
                        prod.images?.find((i) => i.is_cover)?.url ||
                        prod.images?.[0]?.url ||
                        '/logo.png';
                      const stockCount =
                        prod.sizes?.reduce((sum, s) => sum + s.stock_quantity, 0) ?? 0;

                      return (
                        <tr key={prod.id} className="hover:bg-white/[0.02] transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={cover}
                                alt={prod.name}
                                className="w-12 h-14 object-contain rounded-lg bg-black/40 border border-gray-800 p-1 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-white line-clamp-1">{prod.name}</p>
                                <span className="text-[10px] text-gray-500 font-mono">
                                  {prod.slug}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-white">{prod.club_or_country}</p>
                            <p className="text-[10px] text-gray-400">{prod.season}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-white">{prod.jersey_type}</p>
                            <span className="text-[10px] text-gray-400">{prod.version}</span>
                          </td>
                          <td className="p-4 font-black text-[#00E676]">
                            {BUSINESS_INFO.currency} {prod.selling_price.toFixed(2)}
                          </td>
                          <td className="p-4">
                            {stockCount <= 0 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-400 border border-red-800">
                                0 (Sold Out)
                              </span>
                            ) : stockCount <= 5 ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-800">
                                {stockCount} (Low)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                                {stockCount} in stock
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <select
                              value={prod.status}
                              onChange={(e) =>
                                handleToggleStatus(
                                  prod,
                                  e.target.value as 'published' | 'draft' | 'archived'
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border bg-[#080B11] ${
                                prod.status === 'published'
                                  ? 'border-[#00E676]/40 text-[#00E676]'
                                  : prod.status === 'draft'
                                  ? 'border-amber-500/40 text-amber-300'
                                  : 'border-gray-700 text-gray-500'
                              }`}
                            >
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                              <option value="archived">Archived</option>
                            </select>
                          </td>
                          <td className="p-4 text-right space-x-1">
                            <button
                              onClick={() => {
                                setEditingProduct(prod);
                                setActiveTab('upload');
                              }}
                              className="p-1.5 text-gray-400 hover:text-[#00E676] rounded-lg hover:bg-white/5"
                              title="Edit in Upload Studio"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setProductToDelete(prod)}
                              className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                              title="Delete Jersey"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No jerseys match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UPLOAD STUDIO */}
      {activeTab === 'upload' && (
        <JerseyUploadStudio
          initialProduct={editingProduct}
          onSuccess={(savedProduct) => {
            loadAllData();
            setActiveTab('jerseys');
            showToast(`Jersey "${savedProduct.name}" saved successfully!`);
          }}
          onCancel={() => {
            setEditingProduct(null);
            setActiveTab('jerseys');
          }}
        />
      )}

      {/* TAB 4: MANAGE ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search orders by Ref (RHS-...), customer name, or phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#0D121F] border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:border-[#00E676]"
              />
            </div>

            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#0D121F] border border-gray-800 rounded-xl text-xs text-white self-start sm:self-auto"
            >
              <option value="all">All Order Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Ready for Delivery">Ready for Delivery</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="bg-[#0D121F] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="bg-[#080B11] text-gray-400 uppercase text-[10px] tracking-wider border-b border-gray-800">
                  <tr>
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer & Phone</th>
                    <th className="p-4">Abofour Location</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/80">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-white/[0.02] transition">
                        <td className="p-4 font-mono font-bold text-white">
                          {ord.order_reference}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-white">{ord.customer_name}</p>
                          <a
                            href={`tel:${ord.customer_phone}`}
                            className="text-[#00E676] hover:underline"
                          >
                            {ord.customer_phone}
                          </a>
                        </td>
                        <td className="p-4 max-w-xs truncate text-gray-400">
                          {ord.delivery_location}
                        </td>
                        <td className="p-4 font-black text-white">
                          {BUSINESS_INFO.currency} {ord.total_amount.toFixed(2)}
                        </td>
                        <td className="p-4">
                          <select
                            value={ord.order_status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                            }
                            className="px-2 py-1 rounded-lg bg-[#080B11] border border-gray-700 text-xs text-white"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Ready for Delivery">Ready for Delivery</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={getWhatsAppLink(
                                `Hello ${ord.customer_name}, this is Rash Hub Store regarding your jersey Order ${ord.order_reference} for delivery in Abofour.`
                              )}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-[#00E676]/10 text-[#00E676] hover:bg-[#00E676]/20"
                              title="Chat Customer on WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <a
                              href={`tel:${ord.customer_phone}`}
                              className="p-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white"
                              title="Call Customer"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3 py-1.5 rounded-lg bg-[#080B11] border border-gray-700 text-white font-semibold hover:border-[#00E676]"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STORE SETTINGS & SUPABASE */}
      {activeTab === 'settings' && (
        <div className="max-w-3xl space-y-6">
          <div className="p-6 rounded-3xl bg-[#0D121F] border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Database className="w-5 h-5 text-[#00E676]" />
              Supabase Project Connection & Schema Status
            </h3>
            <p className="text-xs text-gray-400">
              Rash Hub Store connects securely to your Supabase PostgreSQL database, Storage bucket, and Auth service.
            </p>

            <div className="p-4 rounded-2xl bg-[#080B11] border border-gray-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Connection Status</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {isSupabaseConfigured()
                    ? 'Connected with Project URL and Public Anon Key'
                    : 'Currently awaiting Supabase credentials in .env or Settings'}
                </p>
              </div>

              <button
                onClick={() => setSetupModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase hover:bg-[#00FF7F]"
              >
                Configure / Run SQL
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0D121F] border border-gray-800 space-y-4 text-xs">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Store Information Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Store Name:</span>
                <span className="font-bold text-white">{BUSINESS_INFO.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Currency:</span>
                <span className="font-bold text-[#00E676]">Ghana Cedis ({BUSINESS_INFO.currency})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Delivery Territory:</span>
                <span className="font-bold text-white">{BUSINESS_INFO.deliveryLocation}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-800">
                <span className="text-gray-400">Phone Contact:</span>
                <span className="font-bold text-white">{BUSINESS_INFO.phoneFormatted}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-400">WhatsApp:</span>
                <span className="font-bold text-[#00E676]">{BUSINESS_INFO.whatsapp}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#0D121F] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Delete Jersey Product?</h3>
              <p className="text-xs text-gray-400 mt-1">
                Are you sure you want to permanently delete <strong>{productToDelete.name}</strong>?
                This action removes all images and size inventory from Supabase.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                disabled={deleting}
                onClick={handleDeleteProduct}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-extrabold text-xs uppercase hover:bg-red-500 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-3 rounded-xl bg-[#080B11] border border-gray-700 text-gray-300 font-bold text-xs uppercase hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal (Admin) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0D121F] border border-gray-800 rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Order Details</span>
                <h3 className="text-base font-black text-white font-mono">
                  {selectedOrder.order_reference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Customer:</span>
                <span className="font-bold text-white">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone:</span>
                <a href={`tel:${selectedOrder.customer_phone}`} className="text-[#00E676] font-bold">
                  {selectedOrder.customer_phone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Abofour Location:</span>
                <span className="text-white text-right font-medium max-w-xs">
                  {selectedOrder.delivery_location}
                </span>
              </div>
              {selectedOrder.delivery_instructions && (
                <div className="p-3 rounded-xl bg-[#080B11] border border-gray-800">
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">
                    Instructions:
                  </span>
                  <p className="text-gray-300">{selectedOrder.delivery_instructions}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="pt-3 border-t border-gray-800 space-y-2">
              <h4 className="font-bold text-white uppercase text-[11px]">Ordered Jerseys</h4>
              <div className="divide-y divide-gray-800">
                {(selectedOrder.items || []).map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{it.product_name}</p>
                      <p className="text-gray-400 text-[10px]">
                        Size: {it.selected_size} • Qty: {it.quantity} @ {BUSINESS_INFO.currency}{' '}
                        {it.unit_price}
                      </p>
                    </div>
                    <span className="font-bold text-[#00E676]">
                      {BUSINESS_INFO.currency} {it.line_total.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-800 flex justify-between font-bold text-sm text-white">
              <span>Total:</span>
              <span className="text-[#00E676]">
                {BUSINESS_INFO.currency} {selectedOrder.total_amount.toFixed(2)}
              </span>
            </div>

            {/* Update status */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                Update Order Status:
              </label>
              <select
                value={selectedOrder.order_status}
                onChange={(e) =>
                  handleUpdateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)
                }
                className="w-full px-3 py-2 bg-[#080B11] border border-gray-700 rounded-xl text-white font-bold"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Processing">Processing</option>
                <option value="Ready for Delivery">Ready for Delivery</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="pt-4 flex gap-2">
              <a
                href={getWhatsAppLink(
                  `Hello ${selectedOrder.customer_name}, this is Rash Hub Store regarding your order ${selectedOrder.order_reference}.`
                )}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase text-center hover:bg-[#00FF7F] flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Customer</span>
              </a>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Setup Modal */}
      <SupabaseSetupModal isOpen={setupModalOpen} onClose={() => setSetupModalOpen(false)} />
    </div>
  );
};
