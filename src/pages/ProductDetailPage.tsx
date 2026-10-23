import React, { useState } from 'react';
import {
  ShoppingBag,
  MessageCircle,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Check,
  AlertTriangle,
  ChevronRight,
  Share2,
  RefreshCw,
  Phone,
  MapPin,
  Flame,
} from 'lucide-react';
import { Product, ProductSize } from '../types';
import { ProductCard } from '../components/ProductCard';
import { BUSINESS_INFO, getWhatsAppLink, buildWhatsAppOrderMessage } from '../lib/constants';
import { useCart } from '../context/CartContext';

interface ProductDetailPageProps {
  product: Product | null;
  allProducts: Product[];
  onBack: () => void;
  onViewProduct: (slug: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBack,
  onViewProduct,
}) => {
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize['size_label'] | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-500 mx-auto">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-2xl font-black text-white">Jersey Not Found or Unavailable</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          The requested football jersey could not be located or has been archived. Check our active catalog for more match-day options.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-[#00E676] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#00FF7F]"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[selectedImageIndex]?.url || '/logo.png';

  // Stock calculations
  const totalStock = product.sizes?.reduce((sum, s) => sum + s.stock_quantity, 0) ?? 0;
  const isOutOfStock = totalStock <= 0;

  // Selected size stock
  const currentSizeRecord = product.sizes?.find((s) => s.size_label === selectedSize);
  const currentSizeStock = currentSizeRecord ? currentSizeRecord.stock_quantity : 0;

  // Discount
  const hasDiscount =
    Boolean(product.original_price) &&
    product.original_price! > product.selling_price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.selling_price) / product.original_price!) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      setActionError('Please select a size first.');
      return;
    }

    if (currentSizeStock < quantity) {
      setActionError(`Only ${currentSizeStock} available in size ${selectedSize}.`);
      return;
    }

    const result = addToCart(product, selectedSize, quantity);
    if (result.success) {
      setActionSuccess(result.message);
      setActionError(null);
      setTimeout(() => setActionSuccess(null), 3000);
    } else {
      setActionError(result.message);
    }
  };

  const handleWhatsAppOrder = () => {
    if (!selectedSize) {
      setActionError('Please select your size before ordering on WhatsApp.');
      return;
    }

    const msg = buildWhatsAppOrderMessage({
      items: [
        {
          name: product.name,
          size: selectedSize,
          quantity,
          price: product.selling_price,
        },
      ],
      total: product.selling_price * quantity,
      deliveryLocation: 'Abofour, Ghana',
    });

    window.open(getWhatsAppLink(msg), '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} at Rash Hub Store in Abofour!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setActionSuccess('Link copied to clipboard!');
      setTimeout(() => setActionSuccess(null), 2500);
    }
  };

  // Related products
  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.club_or_country === product.club_or_country ||
          p.jersey_type === product.jersey_type ||
          p.version === product.version)
    )
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 space-y-12">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#00E676] transition p-2 rounded-lg hover:bg-white/5"
          title="Share Jersey"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Visual Box */}
          <div className="relative aspect-[4/4.5] w-full bg-[#070A11] border border-gray-800 rounded-3xl p-6 flex items-center justify-center overflow-hidden shadow-2xl group">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
              {hasDiscount && (
                <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-black text-xs uppercase shadow-md">
                  -{discountPercent}% OFF
                </span>
              )}
              {product.new_arrival && (
                <span className="px-2.5 py-1 rounded-lg bg-[#00E676] text-black font-black text-xs uppercase shadow-md">
                  NEW ARRIVAL
                </span>
              )}
              <span className="px-2.5 py-1 rounded-lg bg-black/80 border border-gray-700 text-gray-300 font-bold text-xs uppercase">
                {product.version}
              </span>
            </div>

            {/* Stock pill */}
            <div className="absolute top-4 right-4 z-10">
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-lg bg-red-950/90 border border-red-800 text-red-400 text-xs font-bold uppercase">
                  Out of Stock
                </span>
              ) : (
                <span className="px-3 py-1 rounded-lg bg-emerald-950/90 border border-emerald-800 text-emerald-400 text-xs font-bold uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
                  In Stock ({totalStock} kits)
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails Gallery */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-24 rounded-2xl bg-[#070A11] border p-1.5 shrink-0 transition ${
                    selectedImageIndex === idx
                      ? 'border-[#00E676] ring-2 ring-[#00E676]/30 shadow-lg'
                      : 'border-gray-800 hover:border-gray-600 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Abofour Delivery Guarantee Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#00E676]/10 to-transparent border border-[#00E676]/20 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#00E676]/20 text-[#00E676] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Instant Abofour Delivery Guarantee</p>
              <p className="text-[11px] text-gray-300">
                Delivered straight to your location in Abofour in 1 to 3 hours. Inspect before payment!
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Information, Pricing, Size Selector & Checkout */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Title */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00E676]">
              <span>{product.club_or_country}</span>
              <span>•</span>
              <span>{product.season}</span>
              <span>•</span>
              <span>{product.jersey_type}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-2 leading-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
              {product.short_description}
            </p>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-[#0D121F] border border-gray-800 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-[#00E676]">
                {BUSINESS_INFO.currency} {product.selling_price.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {BUSINESS_INFO.currency} {product.original_price?.toFixed(2)}
                </span>
              )}
            </div>

            <span className="text-xs font-bold text-gray-300 px-2.5 py-1 rounded-md bg-gray-800">
              {product.version}
            </span>
          </div>

          {/* Available Sizes Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Select Size * {selectedSize && <span className="text-[#00E676]">({selectedSize})</span>}
              </label>
              <span className="text-[11px] text-gray-400">
                {selectedSize && currentSizeStock > 0 ? (
                  <strong className="text-emerald-400">{currentSizeStock} kits available</strong>
                ) : (
                  'Select size to check stock'
                )}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {product.sizes?.map((sizeObj) => {
                const isSelected = selectedSize === sizeObj.size_label;
                const isAvailable = sizeObj.stock_quantity > 0;

                return (
                  <button
                    key={sizeObj.id || sizeObj.size_label}
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedSize(sizeObj.size_label);
                      setActionError(null);
                    }}
                    className={`py-3 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center border ${
                      isSelected
                        ? 'bg-[#00E676] text-black border-[#00E676] shadow-lg shadow-[#00E676]/20'
                        : isAvailable
                        ? 'bg-[#0D121F] text-white border-gray-700 hover:border-gray-500 hover:bg-white/5'
                        : 'bg-[#080B11] text-gray-600 border-gray-800 line-through cursor-not-allowed'
                    }`}
                  >
                    <span>{sizeObj.size_label}</span>
                    <span className="text-[9px] font-normal opacity-80">
                      {isAvailable ? `${sizeObj.stock_quantity} left` : 'Out'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">
              Quantity:
            </span>
            <div className="flex items-center border border-gray-700 rounded-xl bg-[#0D121F] overflow-hidden">
              <button
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-30"
              >
                -
              </button>
              <span className="px-4 py-2 text-xs font-bold text-white">{quantity}</span>
              <button
                disabled={currentSizeStock ? quantity >= currentSizeStock : false}
                onClick={() => setQuantity((q) => q + 1)}
                className="px-3 py-2 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          {/* Feedback messages */}
          {actionSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-[#00E676]/40 text-[#00E676] text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {/* Action Buttons: Add to Cart & WhatsApp Order */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg ${
                isOutOfStock
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-[#00E676] text-black hover:bg-[#00FF7F] shadow-[#00E676]/20 hover:scale-[1.01]'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ADD TO CART ({BUSINESS_INFO.currency} {(product.selling_price * quantity).toFixed(2)})</span>
            </button>

            <button
              onClick={handleWhatsAppOrder}
              className="w-full py-3.5 rounded-2xl bg-[#0F172A] border border-gray-700 text-white font-bold text-xs uppercase tracking-wider hover:border-[#00E676] hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-[#00E676]" />
              <span>ORDER DIRECTLY ON WHATSAPP (+233533916516)</span>
            </button>
          </div>

          {/* Full Detailed Description */}
          <div className="pt-6 border-t border-gray-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Product Overview & Details
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
              {product.full_description}
            </p>
          </div>

          {/* Specifications list */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-[#0D121F] border border-gray-800">
              <span className="text-gray-400 block text-[10px] uppercase">Edition Type</span>
              <span className="font-bold text-white">{product.jersey_type}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0D121F] border border-gray-800">
              <span className="text-gray-400 block text-[10px] uppercase">Version Fit</span>
              <span className="font-bold text-white">{product.version}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0D121F] border border-gray-800">
              <span className="text-gray-400 block text-[10px] uppercase">Season</span>
              <span className="font-bold text-white">{product.season}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0D121F] border border-gray-800">
              <span className="text-gray-400 block text-[10px] uppercase">Delivery Area</span>
              <span className="font-bold text-[#00E676]">Abofour, Ghana Only</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Reel */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-gray-800 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-tight">
              YOU MAY ALSO LIKE
            </h3>
            <span className="text-xs text-gray-400">Related match kits</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} onViewDetails={onViewProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
