import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShoppingBag,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  BUSINESS_INFO,
  ABOFOUR_LOCAL_AREAS,
  getWhatsAppLink,
  buildWhatsAppOrderMessage,
} from '../lib/constants';
import { createOrderInSupabase } from '../lib/supabase';
import { Order } from '../types';

interface CheckoutPageProps {
  onOrderSuccess: (order: Order) => void;
  onBackToShop: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onOrderSuccess,
  onBackToShop,
}) => {
  const { items, totalAmount, clearCart } = useCart();
  const { user, profile } = useAuth();

  // Form Fields
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(profile?.phone_number || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.phone_number || '');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [selectedArea, setSelectedArea] = useState(ABOFOUR_LOCAL_AREAS[0]);
  const [customAddress, setCustomAddress] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Strict Abofour verification checkbox
  const [abofourConfirmed, setAbofourConfirmed] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-500 mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-gray-400">
          Add at least one football jersey to your cart before proceeding to checkout.
        </p>
        <button
          onClick={onBackToShop}
          className="px-6 py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#00FF7F]"
        >
          Browse Jerseys
        </button>
      </div>
    );
  }

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (sameAsPhone) {
      setWhatsappNumber(val);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation
    if (!fullName.trim()) {
      setErrorMessage('Please provide your full name.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMessage('Please provide a valid Ghana phone number (e.g. 0533916516).');
      return;
    }
    if (!abofourConfirmed) {
      setErrorMessage(
        'Delivery is strictly restricted to Abofour, Ghana. Please confirm your delivery location is in Abofour.'
      );
      return;
    }

    const fullDeliveryLocation = customAddress.trim()
      ? `${selectedArea} (${customAddress.trim()}), Abofour, Ghana`
      : `${selectedArea}, Abofour, Ghana`;

    setSubmitting(true);

    try {
      const orderPayload = {
        customer_id: user?.id || null,
        customer_name: fullName.trim(),
        customer_email: email.trim() || undefined,
        customer_phone: phone.trim(),
        whatsapp_number: whatsappNumber.trim() || phone.trim(),
        delivery_location: fullDeliveryLocation,
        delivery_instructions: deliveryInstructions.trim() || undefined,
        total_amount: totalAmount,
        order_status: 'Pending' as const,
      };

      const orderItemsPayload = items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        selected_size: item.selected_size,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.unit_price * item.quantity,
        product_image:
          item.product.images?.find((i) => i.is_cover)?.url ||
          item.product.images?.[0]?.url ||
          '/logo.png',
      }));

      const res = await createOrderInSupabase(orderPayload, orderItemsPayload);

      if (res.success && res.order) {
        clearCart();
        onOrderSuccess(res.order);
      } else {
        setErrorMessage(res.error || 'Failed to place order. Please try again or order on WhatsApp.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Order processing error';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-4">
        <div>
          <button
            onClick={onBackToShop}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            CHECKOUT & INSTANT DELIVERY
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Doorstep delivery strictly inside Abofour, Ghana. Pay upon delivery or confirm on WhatsApp.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
          {/* Strict Delivery Notice Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-[#0A101D] border border-[#00E676]/30 flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#00E676] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-extrabold text-white">
                STRICT DELIVERY LOCATION: ABOFOUR, GHANA ONLY
              </p>
              <p className="text-gray-300 leading-relaxed">
                Rash Hub Store exclusively services Abofour. Orders outside Abofour cannot be
                fulfilled. Our local rider will bring your jerseys directly to your doorstep.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Customer Details */}
          <div className="p-6 rounded-2xl bg-[#0D121F] border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E676]" />
              1. Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="e.g. 0533916516"
                  className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={sameAsPhone}
                    onChange={(e) => {
                      setSameAsPhone(e.target.checked);
                      if (e.target.checked) setWhatsappNumber(phone);
                    }}
                    className="accent-[#00E676]"
                  />
                  <span className="text-gray-300">WhatsApp number is the same as phone number</span>
                </label>

                {!sameAsPhone && (
                  <div className="mt-3">
                    <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="e.g. 0533916516"
                      className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00E676]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Location in Abofour */}
          <div className="p-6 rounded-2xl bg-[#0D121F] border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E676]" />
              2. Abofour Delivery Address
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Abofour Area / Landmark *
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00E676]"
                >
                  {ABOFOUR_LOCAL_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Specific Street / House / Landmark details
                </label>
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g. Near Central Mosque, opposite the taxi rank"
                  className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-300 uppercase tracking-wider mb-1">
                  Special Delivery Instructions
                </label>
                <textarea
                  rows={2}
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Call 10 minutes before arrival"
                  className="w-full px-4 py-2.5 bg-[#080B11] border border-gray-700 rounded-xl text-white focus:outline-none focus:border-[#00E676]"
                />
              </div>

              {/* Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#080B11] border border-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={abofourConfirmed}
                  onChange={(e) => setAbofourConfirmed(e.target.checked)}
                  className="accent-[#00E676] mt-0.5"
                />
                <span className="text-gray-300 text-[11px] leading-relaxed">
                  I confirm that my delivery location is within <strong>Abofour, Ghana</strong>. I understand that Rash Hub Store only operates inside Abofour.
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-[#00E676] text-black font-black text-xs uppercase tracking-wider hover:bg-[#00FF7F] transition shadow-lg shadow-[#00E676]/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Placing Order in Supabase...</span>
            ) : (
              <>
                <span>CONFIRM ORDER ({BUSINESS_INFO.currency} {totalAmount.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0D121F] border border-gray-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Order Items ({items.length})
            </h3>

            <div className="divide-y divide-gray-800/80 max-h-80 overflow-y-auto pr-1 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={
                      item.product.images?.find((i) => i.is_cover)?.url ||
                      item.product.images?.[0]?.url ||
                      '/logo.png'
                    }
                    alt={item.product.name}
                    className="w-14 h-16 object-contain rounded-lg bg-black/40 border border-gray-800 p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-bold text-white truncate">{item.product.name}</p>
                    <p className="text-gray-400 mt-0.5">
                      Size: <strong className="text-white">{item.selected_size}</strong> • Qty:{' '}
                      <strong className="text-white">{item.quantity}</strong>
                    </p>
                    <p className="text-[#00E676] font-bold mt-1">
                      {BUSINESS_INFO.currency} {(item.unit_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-800 space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>
                  {BUSINESS_INFO.currency} {totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Abofour Doorstep Delivery</span>
                <span className="text-[#00E676] font-semibold">Instant Local</span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-black text-white">
                <span>Total Amount Due</span>
                <span className="text-[#00E676]">
                  {BUSINESS_INFO.currency} {totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Option */}
          <div className="p-5 rounded-2xl bg-[#080B11] border border-gray-800 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#00E676] font-bold">
              <MessageCircle className="w-4 h-4" />
              <span>Prefer to order directly via WhatsApp?</span>
            </div>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              You can instantly forward this jersey cart to Rashid on WhatsApp to confirm delivery time right now.
            </p>
            <button
              type="button"
              onClick={() => {
                const msg = buildWhatsAppOrderMessage({
                  customerName: fullName || 'Customer',
                  items: items.map((i) => ({
                    name: i.product.name,
                    size: i.selected_size,
                    quantity: i.quantity,
                    price: i.unit_price,
                  })),
                  total: totalAmount,
                  deliveryLocation: `${selectedArea}, Abofour`,
                });
                window.open(getWhatsAppLink(msg), '_blank');
              }}
              className="w-full py-2.5 rounded-xl border border-[#00E676]/40 text-[#00E676] font-bold hover:bg-[#00E676]/10 transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Send Cart to WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
