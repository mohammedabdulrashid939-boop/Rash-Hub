import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { BUSINESS_INFO } from '../lib/constants';

interface CartDrawerProps {
  onNavigate: (page: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalAmount } =
    useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0D121F] border-l border-gray-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-800 flex items-center justify-between bg-[#080B11]">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-[#00E676]/10 rounded-lg text-[#00E676]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Your Shopping Cart</h2>
                <p className="text-xs text-gray-400">
                  {items.length} item{items.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Abofour Delivery Alert */}
          <div className="bg-[#00E676]/10 border-b border-[#00E676]/20 px-4 py-2.5 flex items-center gap-2 text-xs text-[#00E676]">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>
              <strong>Abofour Delivery Only:</strong> Fast door-to-door delivery in Abofour, Ghana.
            </span>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-gray-800/60 flex items-center justify-center text-gray-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Your cart is empty</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Find your favorite club or national team jersey and rep your colours!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('shop');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-bold hover:bg-[#00FF7F] transition shadow-lg shadow-[#00E676]/20"
                >
                  Shop Jerseys Now
                </button>
              </div>
            ) : (
              items.map((item) => {
                const coverImage =
                  item.product.images?.find((img) => img.is_cover)?.url ||
                  item.product.images?.[0]?.url ||
                  '/logo.png';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-[#080B11] border border-gray-800 rounded-xl flex gap-3.5 items-start transition hover:border-gray-700"
                  >
                    <img
                      src={coverImage}
                      alt={item.product.name}
                      className="w-18 h-20 object-contain rounded-lg bg-black/40 border border-gray-800 p-1 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-white truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-500 hover:text-red-400 transition p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                          Size: {item.selected_size}
                        </span>
                        <span className="text-[10px] text-gray-400">{item.product.version}</span>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-gray-700 rounded-lg overflow-hidden bg-[#0F172A]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-gray-300 hover:bg-gray-700 transition"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-gray-300 hover:bg-gray-700 transition"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold text-[#00E676]">
                            {BUSINESS_INFO.currency} {(item.unit_price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {BUSINESS_INFO.currency} {item.unit_price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-800 bg-[#080B11] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>
                    {BUSINESS_INFO.currency} {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Delivery (Abofour)</span>
                  <span className="text-[#00E676] font-medium">Instant Local Delivery</span>
                </div>
                <div className="pt-2 border-t border-gray-800 flex justify-between text-sm font-bold text-white">
                  <span>Estimated Total</span>
                  <span className="text-[#00E676]">
                    {BUSINESS_INFO.currency} {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('checkout');
                  }}
                  className="w-full py-3 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00FF7F] transition flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('shop');
                  }}
                  className="w-full py-2.5 rounded-xl border border-gray-800 text-gray-300 font-medium text-xs hover:bg-white/5 transition"
                >
                  Continue Shopping
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E676]" />
                <span>Genuine Quality • Inspected Before Delivery</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
