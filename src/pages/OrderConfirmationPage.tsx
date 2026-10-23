import React from 'react';
import {
  CheckCircle,
  MessageCircle,
  Phone,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { Order } from '../types';
import { BUSINESS_INFO, getWhatsAppLink, buildWhatsAppOrderMessage } from '../lib/constants';

interface OrderConfirmationPageProps {
  order: Order;
  onNavigate: (page: string) => void;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  order,
  onNavigate,
}) => {
  const handleFollowUpWhatsApp = () => {
    const msg = buildWhatsAppOrderMessage({
      orderReference: order.order_reference,
      customerName: order.customer_name,
      items: (order.items || []).map((it) => ({
        name: it.product_name,
        size: it.selected_size,
        quantity: it.quantity,
        price: it.unit_price,
      })),
      total: order.total_amount,
      deliveryLocation: order.delivery_location,
    });
    window.open(getWhatsAppLink(msg), '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
      {/* Success Banner */}
      <div className="bg-[#0D121F] border border-gray-800 rounded-3xl p-8 sm:p-10 text-center shadow-2xl relative overflow-hidden space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-[#00E676] flex items-center justify-center mx-auto text-[#00E676] shadow-lg shadow-[#00E676]/20">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#00E676]/20 text-[#00E676] uppercase tracking-wider">
            Order Successfully Placed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-3 uppercase tracking-tight">
            THANK YOU FOR YOUR ORDER!
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-lg mx-auto leading-relaxed">
            Your order has been recorded in our Supabase system. Our Abofour dispatch team is preparing your jerseys now.
          </p>
        </div>

        {/* Order Reference Box */}
        <div className="p-4 rounded-2xl bg-[#080B11] border border-gray-800 max-w-md mx-auto flex items-center justify-between text-xs">
          <div>
            <span className="text-gray-400 block text-[10px] uppercase font-bold">
              Order Reference
            </span>
            <span className="text-base font-black text-white font-mono">
              {order.order_reference}
            </span>
          </div>
          <div className="text-right">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Amount</span>
            <span className="text-base font-black text-[#00E676]">
              {BUSINESS_INFO.currency} {order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Dispatch Timeline Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs max-w-xl mx-auto pt-2">
          <div className="p-3 rounded-xl bg-[#080B11] border border-gray-800">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Location:</span>
            </div>
            <p className="font-bold text-white line-clamp-1">{order.delivery_location}</p>
          </div>

          <div className="p-3 rounded-xl bg-[#080B11] border border-gray-800">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Est. Delivery:</span>
            </div>
            <p className="font-bold text-white">1 to 3 Hours (Abofour)</p>
          </div>

          <div className="p-3 rounded-xl bg-[#080B11] border border-gray-800">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
              <span>Status:</span>
            </div>
            <p className="font-bold text-[#00E676]">{order.order_status}</p>
          </div>
        </div>

        {/* WhatsApp Follow-up CTA */}
        <div className="pt-4 space-y-3 max-w-md mx-auto">
          <button
            onClick={handleFollowUpWhatsApp}
            className="w-full py-3.5 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00FF7F] transition shadow-lg shadow-[#00E676]/20 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            <span>CONFIRM ON WHATSAPP (+233533916516)</span>
          </button>

          <a
            href={`tel:${BUSINESS_INFO.phone}`}
            className="w-full py-3 rounded-xl bg-[#0F172A] border border-gray-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4 text-[#00E676]" />
            <span>Call Dispatch ({BUSINESS_INFO.phoneFormatted})</span>
          </a>
        </div>
      </div>

      {/* Ordered Items Breakdown */}
      {order.items && order.items.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#0D121F] border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Order Items Breakdown
          </h3>

          <div className="divide-y divide-gray-800 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-12 h-14 object-contain rounded-lg bg-black/50 p-1 border border-gray-800"
                    />
                  )}
                  <div>
                    <p className="font-bold text-white">{item.product_name}</p>
                    <p className="text-gray-400 mt-0.5">
                      Size: <span className="text-white font-bold">{item.selected_size}</span> • Qty:{' '}
                      <span className="text-white font-bold">{item.quantity}</span>
                    </p>
                  </div>
                </div>

                <p className="font-bold text-[#00E676]">
                  {BUSINESS_INFO.currency} {item.line_total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={() => onNavigate('shop')}
          className="text-xs font-bold text-gray-400 hover:text-white transition flex items-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>

        <button
          onClick={() => onNavigate('account')}
          className="px-5 py-2.5 rounded-xl bg-[#0F172A] border border-gray-700 text-white text-xs font-bold hover:border-[#00E676] transition flex items-center gap-1.5"
        >
          <span>View in My Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
