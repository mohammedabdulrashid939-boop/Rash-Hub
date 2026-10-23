import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Shield,
  Edit2,
  Check,
  AlertCircle,
  LogOut,
  Calendar,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchCustomerOrders } from '../lib/supabase';
import { Order, OrderStatus } from '../types';
import { BUSINESS_INFO, getWhatsAppLink, buildWhatsAppOrderMessage } from '../lib/constants';

interface AccountPageProps {
  onNavigate: (page: string) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({ onNavigate }) => {
  const { user, profile, isAdmin, updateProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile?.full_name || '');
  const [editPhone, setEditPhone] = useState(profile?.phone_number || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setEditName(profile.full_name);
      setEditPhone(profile.phone_number || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      setLoadingOrders(true);
      const data = await fetchCustomerOrders(user.id);
      setOrders(data);
      setLoadingOrders(false);
    };

    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-500 mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-xs text-gray-400">
          Please log in to your account to view your past jersey orders and profile details.
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="px-6 py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#00FF7F]"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    const res = await updateProfile(editName.trim(), editPhone.trim() || undefined);
    setProfileSaving(false);

    if (res.success) {
      setProfileSuccess('Profile successfully updated!');
      setIsEditingProfile(false);
      setTimeout(() => setProfileSuccess(null), 3000);
    } else {
      setProfileError(res.error || 'Failed to update profile');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Confirmed':
      case 'Processing':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'Ready for Delivery':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Completed':
        return 'bg-emerald-500/20 text-[#00E676] border-emerald-500/40';
      case 'Cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Account Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0D121F] via-[#090D17] to-[#0D121F] border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/30 flex items-center justify-center text-[#00E676]">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{profile?.full_name}</h1>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-[#00E676]/40 text-[#00E676] text-[10px] font-extrabold uppercase">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
            <p className="text-[11px] text-[#00E676] mt-1 font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Abofour, Ghana Delivery Customer</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-[#00E676]/40 text-[#00E676] text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-500/20"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </button>
          )}

          <button
            onClick={() => signOut()}
            className="px-4 py-2.5 rounded-xl bg-[#080B11] border border-gray-700 text-gray-300 hover:text-red-400 hover:border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 space-x-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === 'orders' ? 'text-[#00E676]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
          {activeTab === 'orders' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00E676]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 transition relative flex items-center gap-2 ${
            activeTab === 'profile' ? 'text-[#00E676]' : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile Settings</span>
          {activeTab === 'profile' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#00E676]" />
          )}
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {loadingOrders ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-[#0D121F] border border-gray-800 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 sm:p-6 rounded-2xl bg-[#0D121F] border border-gray-800 hover:border-gray-700 transition space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-black text-white">
                        {ord.order_reference}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(
                          ord.order_status
                        )}`}
                      >
                        {ord.order_status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        {new Date(ord.created_at).toLocaleDateString()}
                      </span>
                      <span className="font-black text-white text-sm">
                        {BUSINESS_INFO.currency} {ord.total_amount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items snapshot */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {(ord.items || []).map((it, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#080B11] border border-gray-800 text-gray-300"
                      >
                        {it.product_name} ({it.selected_size}) x{it.quantity}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
                      <span className="truncate">{ord.delivery_location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#080B11] border border-gray-700 text-white text-xs font-semibold hover:border-[#00E676]"
                      >
                        View Details
                      </button>

                      <a
                        href={getWhatsAppLink(
                          `Hello Rash Hub Store, I am inquiring about my Order ${ord.order_reference} (${ord.customer_name}).`
                        )}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-lg bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-bold flex items-center gap-1 hover:bg-[#00E676]/20"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Help</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0D121F] border border-gray-800 rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-500 mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">No Orders Yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                You haven't placed any jersey orders yet. Discover your club or national team kits and enjoy instant Abofour delivery.
              </p>
              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#00FF7F]"
              >
                Shop Football Jerseys
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-[#0D121F] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-800">
            <div>
              <h3 className="text-base font-bold text-white">Customer Profile</h3>
              <p className="text-xs text-gray-400 mt-0.5">Manage your personal information</p>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-[#00E676]/40 text-[#00E676] text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. 0533916516"
                  className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#00E676] text-black font-extrabold uppercase hover:bg-[#00FF7F] disabled:opacity-50"
                >
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-[#080B11] border border-gray-800 flex justify-between">
                <span className="text-gray-400">Full Name</span>
                <span className="font-bold text-white">{profile?.full_name}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#080B11] border border-gray-800 flex justify-between">
                <span className="text-gray-400">Email Address</span>
                <span className="font-bold text-white">{user.email}</span>
              </div>
              <div className="p-4 rounded-xl bg-[#080B11] border border-gray-800 flex justify-between">
                <span className="text-gray-400">Phone Number</span>
                <span className="font-bold text-white">
                  {profile?.phone_number || 'Not provided'}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-[#080B11] border border-gray-800 flex justify-between">
                <span className="text-gray-400">Account Type</span>
                <span className="font-bold text-[#00E676] capitalize">
                  {profile?.role || 'customer'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0D121F] border border-gray-800 rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[85vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400">
                  Order Details
                </span>
                <h3 className="text-base font-black text-white font-mono">
                  {selectedOrder.order_reference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase border ${getStatusColor(selectedOrder.order_status)}`}>
                  {selectedOrder.order_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Order Date:</span>
                <span className="text-white font-semibold">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delivery Location:</span>
                <span className="text-white font-semibold text-right max-w-xs">
                  {selectedOrder.delivery_location}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="pt-3 border-t border-gray-800 space-y-2">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Ordered Jerseys
              </h4>
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
              <span>Total Amount:</span>
              <span className="text-[#00E676]">
                {BUSINESS_INFO.currency} {selectedOrder.total_amount.toFixed(2)}
              </span>
            </div>

            {/* Actions */}
            <div className="pt-4 flex gap-2">
              <a
                href={getWhatsAppLink(
                  `Hello Rash Hub Store, I am inquiring about Order ${selectedOrder.order_reference}.`
                )}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase text-center hover:bg-[#00FF7F] flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Dispatch</span>
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
    </div>
  );
};
