import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, AlertTriangle } from 'lucide-react';
import { Product, ProductSize } from '../types';
import { BUSINESS_INFO } from '../lib/constants';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails }) => {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<ProductSize['size_label'] | null>(null);
  const [sizePickerOpen, setSizePickerOpen] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const coverImage =
    product.images?.find((img) => img.is_cover)?.url ||
    product.images?.[0]?.url ||
    '/logo.png';

  // Calculate total stock across all sizes
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock_quantity, 0) ?? 0;
  const isOutOfStock = totalStock <= 0;
  const isLowStock = totalStock > 0 && totalStock <= 5;

  // Genuine discount calculation
  const hasDiscount =
    Boolean(product.original_price) &&
    product.original_price! > product.selling_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.selling_price) / product.original_price!) * 100)
    : 0;

  const handleQuickAdd = () => {
    if (isOutOfStock) return;

    const availableSizes = product.sizes?.filter((s) => s.stock_quantity > 0) || [];
    if (availableSizes.length === 1) {
      // If only one size available, add directly
      const result = addToCart(product, availableSizes[0].size_label, 1);
      if (result.success) {
        setAddedToast(true);
        setTimeout(() => setAddedToast(false), 2000);
      } else {
        setErrorToast(result.message);
        setTimeout(() => setErrorToast(null), 3000);
      }
    } else {
      // Open size selector modal
      setSizePickerOpen(true);
    }
  };

  const handleConfirmSizeAdd = (size: ProductSize['size_label']) => {
    const result = addToCart(product, size, 1);
    if (result.success) {
      setSizePickerOpen(false);
      setSelectedSize(null);
      setAddedToast(true);
      setTimeout(() => setAddedToast(false), 2000);
    } else {
      setErrorToast(result.message);
      setTimeout(() => setErrorToast(null), 3000);
    }
  };

  return (
    <div className="group relative bg-[#0D121F] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#00E676]/50 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-[0_10px_30px_rgba(0,230,118,0.08)]">
      {/* Top Media Container */}
      <a
        href={`/product/${product.slug}`}
        onClick={(e) => {
          e.preventDefault();
          onViewDetails(product.slug);
        }}
        className="relative aspect-[4/4.5] w-full bg-[#070A11] p-4 flex items-center justify-center overflow-hidden cursor-pointer block"
        aria-label={`View ${product.name}`}
      >
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-md bg-red-500 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-md">
              -{discountPercent}% OFF
            </span>
          )}
          {product.new_arrival && (
            <span className="px-2 py-0.5 rounded-md bg-[#00E676] text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md">
              NEW
            </span>
          )}
          {product.version && (
            <span className="px-2 py-0.5 rounded-md bg-black/75 text-gray-300 font-semibold text-[9px] border border-gray-700 tracking-wider">
              {product.version}
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-md bg-red-950/80 border border-red-800 text-red-400 font-bold text-[9px] uppercase">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-800 text-amber-400 font-bold text-[9px] uppercase">
              Only {totalStock} Left
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold text-[9px] uppercase">
              In Stock
            </span>
          )}
        </div>

        {/* Jersey Image */}
        <img
          src={coverImage}
          alt={`${product.name} - ${product.version} ${product.jersey_type} football kit`}
          width="400"
          height="450"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
        />

        {/* Quick View Button on Hover */}
        <span
          className="absolute bottom-3 right-3 p-2 rounded-xl bg-black/80 hover:bg-[#00E676] text-gray-300 hover:text-black border border-gray-700 hover:border-[#00E676] opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex items-center justify-center"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </span>
      </a>

      {/* Information Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Club & Season */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
            <span className="truncate text-[#00E676]">{product.club_or_country}</span>
            <span>{product.season}</span>
          </div>

          {/* Product Name */}
          <h3 className="text-sm sm:text-base font-bold text-white mt-1 hover:text-[#00E676] transition-colors line-clamp-1">
            <a
              href={`/product/${product.slug}`}
              onClick={(e) => {
                e.preventDefault();
                onViewDetails(product.slug);
              }}
              title={product.name}
            >
              {product.name}
            </a>
          </h3>

          {/* Jersey Type Badge */}
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-400">
            <span>{product.jersey_type}</span>
            <span>•</span>
            <span className="text-gray-500">{product.version}</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-[#00E676]">
                {BUSINESS_INFO.currency} {product.selling_price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-500 line-through">
                  {BUSINESS_INFO.currency} {product.original_price?.toFixed(2)}
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400">Abofour Instant Delivery</p>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              isOutOfStock
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-[#00E676] text-black hover:bg-[#00FF7F] shadow-md shadow-[#00E676]/20'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Quick Size Selection Overlay */}
      {sizePickerOpen && (
        <div className="absolute inset-0 bg-[#0D121F]/95 backdrop-blur-xs p-4 flex flex-col justify-between z-20 rounded-2xl animate-fadeIn">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-gray-800">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Select Your Size
              </h4>
              <button
                onClick={() => setSizePickerOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              Choose an available size for <strong>{product.name}</strong>:
            </p>

            {/* Sizes Grid */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              {product.sizes?.map((sizeObj) => {
                const isSizeOut = sizeObj.stock_quantity <= 0;
                return (
                  <button
                    key={sizeObj.id || sizeObj.size_label}
                    disabled={isSizeOut}
                    onClick={() => handleConfirmSizeAdd(sizeObj.size_label)}
                    className={`py-2 px-1 rounded-lg text-xs font-bold transition flex flex-col items-center justify-center border ${
                      isSizeOut
                        ? 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed line-through'
                        : 'border-gray-700 bg-[#070A11] text-white hover:border-[#00E676] hover:bg-[#00E676]/10'
                    }`}
                  >
                    <span>{sizeObj.size_label}</span>
                    <span className="text-[9px] font-normal text-gray-400">
                      {isSizeOut ? '0 left' : `${sizeObj.stock_quantity} in stock`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => onViewDetails(product.slug)}
              className="text-xs text-[#00E676] hover:underline"
            >
              View Full Jersey Details & Size Guide →
            </button>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {addedToast && (
        <div className="absolute top-2 inset-x-2 py-2 px-3 bg-emerald-500 text-black rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xl z-30">
          <Check className="w-4 h-4" />
          <span>Added to Cart!</span>
        </div>
      )}

      {/* Error Toast */}
      {errorToast && (
        <div className="absolute top-2 inset-x-2 py-2 px-3 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xl z-30">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="truncate">{errorToast}</span>
        </div>
      )}
    </div>
  );
};
