import React, { useState } from 'react';
import {
  ShoppingBag,
  MessageCircle,
  Phone,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  Flame,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Layers,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { BUSINESS_INFO, getWhatsAppLink, JERSEY_TYPES } from '../lib/constants';

interface HomePageProps {
  products: Product[];
  loading: boolean;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onViewProduct: (slug: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  loading,
  onNavigate,
  onViewProduct,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featuredJerseys = products.filter((p) => p.featured);
  const newArrivals = products.filter((p) => p.new_arrival);

  const faqs = [
    {
      q: 'Do you deliver throughout Ghana or only in Abofour?',
      a: 'Rash Hub Store strictly delivers within Abofour, Ghana only! We focus exclusively on our Abofour community to guarantee ultra-fast, same-day delivery right to your door or pickup station.',
    },
    {
      q: 'What is the difference between Fan Version and Player Version jerseys?',
      a: 'Fan Version jerseys are designed for everyday supporters with comfortable, relaxed fits and embroidered crests. Player Version jerseys feature the exact athletic skin-tight fit, heat-pressed official badges, and ultra-lightweight breathable ventilation fabrics worn by pro footballers on match days.',
    },
    {
      q: 'How do I choose the correct jersey size?',
      a: 'We stock XS, S, M, L, XL, XXL, and XXXL. For Fan Versions, pick your standard t-shirt size. For Player Versions, we recommend sizing up one size for a comfortable fit since they are slim-cut.',
    },
    {
      q: 'Can I order directly on WhatsApp?',
      a: 'Yes, absolutely! Click any "Order on WhatsApp" button across the store or chat us at +233533916516. You can send us the name of the jersey, and we will confirm size availability and coordinate instant Abofour delivery.',
    },
    {
      q: 'Can I inspect my jersey before paying?',
      a: 'Yes! When our Abofour dispatch arrives, you can verify the jersey quality, stitching, and size fit before completing your payment.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-24 bg-gradient-to-b from-[#090D16] via-[#06080E] to-[#080B11]">
        {/* Glow & Stadium Light Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00E676]/15 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#00E676]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Abofour pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00E676]/10 border border-[#00E676]/30 text-[#00E676] text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#00E676]/10">
                <MapPin className="w-3.5 h-3.5" />
                <span>Instant Delivery in Abofour, Ghana only</span>
              </div>

              {/* Exact Required Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] uppercase">
                BUY QUALITY JERSEYS FOR INSTANT DELIVERY FOR THE NEW SEASON
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed mx-auto lg:mx-0">
                “Rep your favorite club and national team with quality football jerseys. Discover your
                next match-day look at Rash Hub Store.”
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => onNavigate('shop')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#00E676] text-black font-black text-sm uppercase tracking-wider hover:bg-[#00FF7F] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(0,230,118,0.3)] flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>SHOP JERSEYS</span>
                </button>

                <a
                  href={getWhatsAppLink(
                    'Hello Rash Hub Store! I want to order a jersey for delivery in Abofour.'
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#0F172A] border border-gray-700 text-white font-bold text-sm uppercase tracking-wider hover:border-[#00E676] hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group"
                >
                  <MessageCircle className="w-5 h-5 text-[#00E676] group-hover:scale-110 transition-transform" />
                  <span>ORDER ON WHATSAPP</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-gray-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#00E676]" />
                  <span>100% Quality Fabric</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#00E676]" />
                  <span>1-3 Hour Abofour Dispatch</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#00E676]" />
                  <span>Call {BUSINESS_INFO.phoneFormatted}</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-[#0F172A] via-[#070A10] to-[#0A1220] rounded-3xl border border-gray-800 p-8 shadow-2xl flex flex-col items-center justify-center group overflow-hidden">
                {/* Glow ring */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00E676]/20 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                {/* Official Logo Brand Asset */}
                <img
                  src="/logo.png"
                  alt="Rash Hub Store Official Jersey Collection"
                  className="w-64 sm:w-72 h-auto object-contain drop-shadow-[0_0_25px_rgba(0,230,118,0.35)] relative z-10 group-hover:scale-105 transition-transform duration-500"
                />

                {/* Floating Tag */}
                <div className="absolute bottom-6 inset-x-6 py-2.5 px-4 bg-black/80 backdrop-blur-md border border-gray-700 rounded-xl flex items-center justify-between z-20">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    {BUSINESS_INFO.tagline}
                  </span>
                  <span className="text-xs font-extrabold text-[#00E676]">Ghana Cedis (GH₵)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED JERSEYS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-orange-400 uppercase tracking-widest">
              <Flame className="w-4 h-4" />
              <span>Match-Day Picks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
              FEATURED JERSEYS
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Top trending club and international kits in demand right now.
            </p>
          </div>

          <button
            onClick={() => onNavigate('shop', { filter: 'featured' })}
            className="text-xs font-bold text-[#00E676] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Featured</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-80 bg-gray-900/60 rounded-2xl animate-pulse border border-gray-800"
              />
            ))}
          </div>
        ) : featuredJerseys.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredJerseys.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16 px-4 bg-[#0D121F] border border-gray-800 rounded-3xl max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-800/80 flex items-center justify-center text-gray-500 mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Catalog Coming Online</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              New season jerseys are currently being uploaded by the Rash Hub Store administrator.
              Connect Supabase in the top bar or contact us directly on WhatsApp to order immediately!
            </p>
            <div className="pt-2">
              <a
                href={getWhatsAppLink('Hello, I want to ask which jerseys are in stock today.')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-bold hover:bg-[#00FF7F]"
              >
                <MessageCircle className="w-4 h-4" />
                Ask Stock on WhatsApp
              </a>
            </div>
          </div>
        )}
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#00E676] uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>Just Landed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
              NEW ARRIVALS
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Fresh 2025/2026 kit drops freshly unboxed for Abofour football fans.
            </p>
          </div>

          <button
            onClick={() => onNavigate('shop', { filter: 'new_arrivals' })}
            className="text-xs font-bold text-[#00E676] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse New Kits</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={onViewProduct}
              />
            ))}
          </div>
        ) : null}
      </section>

      {/* 4. SHOP BY JERSEY TYPE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-[#00E676] uppercase tracking-widest">
            Kits For Every Style
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
            SHOP BY JERSEY TYPE
          </h2>
          <p className="text-xs text-gray-400 mt-2">
            Select your preferred match-day colorway or iconic throwback edition.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {JERSEY_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onNavigate('shop', { type })}
              className="p-5 rounded-2xl bg-[#0D121F] border border-gray-800 hover:border-[#00E676] hover:bg-[#00E676]/5 text-center transition group flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-xl bg-black/60 border border-gray-800 flex items-center justify-center text-gray-400 group-hover:text-[#00E676] group-hover:border-[#00E676]/40 transition">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-white group-hover:text-[#00E676] transition">
                {type}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 5. WHY CHOOSE RASH HUB STORE? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0F172A] to-[#070A10] border border-gray-800 relative overflow-hidden">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-extrabold text-[#00E676] uppercase tracking-widest">
              The Abofour Jersey Authority
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              WHY FOOTBALL FANS CHOOSE RASH HUB STORE
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              We live and breathe football. Rather than waiting days for uncertain out-of-town parcels,
              Rash Hub Store delivers verified match-day jerseys directly in Abofour within hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 pt-8 border-t border-gray-800">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 text-[#00E676] flex items-center justify-center font-black">
                01
              </div>
              <h4 className="text-sm font-bold text-white">Strict Abofour Focus</h4>
              <p className="text-xs text-gray-400">
                100% dedicated to Abofour fans. Doorstep delivery in 1-3 hours.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 text-[#00E676] flex items-center justify-center font-black">
                02
              </div>
              <h4 className="text-sm font-bold text-white">Fan & Player Cuts</h4>
              <p className="text-xs text-gray-400">
                Authentic fabric weights, embroidered crests, and pro athletic heat transfers.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 text-[#00E676] flex items-center justify-center font-black">
                03
              </div>
              <h4 className="text-sm font-bold text-white">Inspect Before Taking</h4>
              <p className="text-xs text-gray-400">
                Check material feel and size fit before handing payment to the dispatch rider.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#00E676]/10 text-[#00E676] flex items-center justify-center font-black">
                04
              </div>
              <h4 className="text-sm font-bold text-white">Direct WhatsApp Assistance</h4>
              <p className="text-xs text-gray-400">
                Talk directly to Rashid on WhatsApp (+233533916516) for sizing advice anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW TO ORDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold text-[#00E676] uppercase tracking-widest">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
            HOW TO ORDER IN ABOFOUR
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0D121F] border border-gray-800 space-y-3 relative">
            <span className="text-3xl font-black text-[#00E676]/30">01</span>
            <h4 className="text-base font-bold text-white">Select Your Jersey & Size</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Browse our catalog of club and national teams. Pick your size (XS up to XXXL) and version.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D121F] border border-gray-800 space-y-3 relative">
            <span className="text-3xl font-black text-[#00E676]/30">02</span>
            <h4 className="text-base font-bold text-white">Checkout or WhatsApp Order</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Submit your order on the website or click "Order on WhatsApp" to send your pre-filled inquiry.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0D121F] border border-gray-800 space-y-3 relative">
            <span className="text-3xl font-black text-[#00E676]/30">03</span>
            <h4 className="text-base font-bold text-white">Fast Abofour Door Delivery</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Our dispatch rider brings your jersey to your Abofour location within 1 to 3 hours.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-extrabold text-[#00E676] uppercase tracking-widest">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mt-1">
            FREQUENTLY ASKED QUESTIONS
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-[#0D121F] border border-gray-800 rounded-2xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4"
                >
                  <span className="text-xs sm:text-sm font-bold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#00E676] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-gray-400 leading-relaxed border-t border-gray-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. WHATSAPP & PHONE CONTACT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#0A101D] to-black border border-[#00E676]/30 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left shadow-2xl">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00E676]/20 text-[#00E676] text-xs font-bold uppercase tracking-wider">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Direct WhatsApp Line Available</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              NEED HELP CHOOSING YOUR SIZE OR LOOKING FOR A SPECIFIC CLUB?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300">
              Message us directly on WhatsApp or give us a call. We help Abofour fans find their match day fit in seconds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
            <a
              href={getWhatsAppLink('Hello Rash Hub Store, I want to inquire about football jerseys.')}
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-xl bg-[#00E676] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#00FF7F] transition flex items-center justify-center gap-2 shadow-lg shadow-[#00E676]/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp ({BUSINESS_INFO.whatsapp})</span>
            </a>

            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="px-6 py-3.5 rounded-xl bg-[#0F172A] border border-gray-700 text-white font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-[#00E676]" />
              <span>Call: {BUSINESS_INFO.phoneFormatted}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
