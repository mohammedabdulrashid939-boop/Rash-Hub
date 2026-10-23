import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Shield, RefreshCw, Truck, Check, X } from 'lucide-react';
import { BUSINESS_INFO, getWhatsAppLink } from '../lib/constants';

interface FooterProps {
  onNavigate: (page: string, params?: Record<string, string>) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [infoModal, setInfoModal] = useState<{ title: string; content: string } | null>(null);

  const openInfoModal = (title: string, content: string) => {
    setInfoModal({ title, content });
  };

  const deliveryInfoText = `
    DELIVERY LOCATION RESTRICTION:
    Rash Hub Store strictly delivers within Abofour, Ashanti Region, Ghana only.
    We do NOT currently offer nationwide or out-of-town dispatch.
    
    DELIVERY TIMELINES:
    Orders within Abofour are processed immediately. In-stock jerseys are delivered right to your doorstep or designated pickup point within Abofour in 1 to 3 hours from confirmation.
    
    HOW IT WORKS:
    1. Place your order on this website or directly via WhatsApp.
    2. Provide your exact Abofour location (e.g. Abofour Post Office, Zongo, Market area, New Town, Lorry Station).
    3. Our dispatch rider will contact you prior to arrival.
    4. Inspect your jersey upon delivery before payment if paying on delivery!
  `;

  const returnsPolicyText = `
    RASH HUB STORE RETURN & EXCHANGE POLICY:
    
    1. Size Exchanges: If your jersey doesn't fit, we are happy to exchange it for another size within 24 hours of delivery in Abofour, provided the jersey is unworn, clean, and has all original tags attached.
    2. Quality Guarantee: Inspect the jersey at the point of delivery. If you notice any defect or wrong kit version, notify the delivery rider immediately for an on-the-spot replacement.
    3. Customized Jerseys: Jerseys printed with custom fan names or specific player numbers cannot be returned unless there was a printing error by our team.
  `;

  const termsText = `
    TERMS & CONDITIONS OF SERVICE:
    
    - Rash Hub Store specializes exclusively in premium football jerseys (Fan Version, Player Version, Retro, and Goalkeeper kits).
    - Prices are displayed in Ghana Cedis (GH₵).
    - Orders are subject to stock availability and valid confirmation.
    - Delivery is strictly confined to Abofour, Ghana.
    - Direct communication via Phone (0533916516) or WhatsApp (+233533916516) is available for all order inquiries and customer support.
  `;

  return (
    <>
      <footer className="bg-[#05080E] border-t border-gray-800 text-gray-400 text-xs">
        {/* Value Highlights Bar */}
        <div className="border-b border-gray-800/80 bg-[#080B12]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Instant Abofour Delivery</h4>
                <p className="text-[11px] text-gray-400">Strictly dedicated to Abofour fans</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">100% Quality Jerseys</h4>
                <p className="text-[11px] text-gray-400">Player & Fan Version kits</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">WhatsApp Direct Order</h4>
                <p className="text-[11px] text-gray-400">Instant chat & size guidance</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 rounded-xl bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Inspect Before Taking</h4>
                <p className="text-[11px] text-gray-400">Hassle-free size exchange</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-4">
              <img
                src="/logo.png"
                alt="Rash Hubs — Football Jerseys Store"
                width="180"
                height="64"
                loading="lazy"
                decoding="async"
                className="h-16 w-auto object-contain drop-shadow-[0_0_12px_rgba(0,230,118,0.2)]"
              />
              <p className="text-xs text-gray-300 max-w-sm font-medium">
                {BUSINESS_INFO.tagline}
              </p>
              <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                Rep your favorite club and national team with authentic match-day jerseys in Ghana.
                Every jersey is inspected for fabric quality, stitching, and official badges.
              </p>

              {/* Delivery restriction badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-[#00E676]/30 text-[#00E676] text-xs">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Delivery: <strong>Abofour, Ghana only</strong></span>
              </div>
            </div>

            {/* Quick Links */}
            <nav className="space-y-3" aria-label="Footer Catalog Navigation">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Catalog</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="/shop"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('shop');
                    }}
                    className="hover:text-[#00E676] transition"
                  >
                    All Jerseys
                  </a>
                </li>
                <li>
                  <a
                    href="/shop"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('shop', { filter: 'new_arrivals' });
                    }}
                    className="hover:text-[#00E676] transition"
                  >
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a
                    href="/shop"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('shop', { filter: 'featured' });
                    }}
                    className="hover:text-[#00E676] transition"
                  >
                    Featured Match Kits
                  </a>
                </li>
                <li>
                  <a
                    href="/shop"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('shop', { type: 'Player Version' });
                    }}
                    className="hover:text-[#00E676] transition"
                  >
                    Player Versions
                  </a>
                </li>
                <li>
                  <a
                    href="/shop"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('shop', { type: 'Fan Version' });
                    }}
                    className="hover:text-[#00E676] transition"
                  >
                    Fan Versions
                  </a>
                </li>
              </ul>
            </nav>

            {/* Customer Care */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Customer Care</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => openInfoModal('Delivery in Abofour, Ghana', deliveryInfoText)}
                    className="hover:text-[#00E676] transition"
                  >
                    Delivery Information
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfoModal('Returns & Exchanges', returnsPolicyText)}
                    className="hover:text-[#00E676] transition"
                  >
                    Returns & Sizing Exchange
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => openInfoModal('Terms & Conditions', termsText)}
                    className="hover:text-[#00E676] transition"
                  >
                    Terms of Service
                  </button>
                </li>
                <li>
                  <a
                    href="/contact"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate('contact');
                    }}
                    className="hover:text-[#00E676] transition"
                  >
                    Contact & Abofour Support
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('account')}
                    className="hover:text-[#00E676] transition"
                  >
                    My Account & Orders
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact & WhatsApp */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Get in Touch</h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a
                    href={`tel:${BUSINESS_INFO.phone}`}
                    className="flex items-center gap-2 hover:text-[#00E676] transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#00E676]" />
                    <span>{BUSINESS_INFO.phoneFormatted}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={getWhatsAppLink('Hello Rash Hub Store, I want to inquire about jerseys.')}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-[#00E676] hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp: {BUSINESS_INFO.whatsapp}</span>
                  </a>
                </li>
                <li className="flex items-start gap-2 text-gray-400">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 mt-0.5 shrink-0" />
                  <span>Abofour, Ashanti Region, Ghana</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/80 py-6 px-4 bg-[#030509]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
            <p>
              © {new Date().getFullYear()} <strong className="text-gray-300">Rash Hub Store</strong>.
              All Rights Reserved. Football jerseys for every fan.
            </p>
            <div className="flex items-center space-x-4">
              <span>Currency: <strong>Ghana Cedis (GH₵)</strong></span>
              <span>•</span>
              <span>Abofour Delivery Only</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0D121F] border border-gray-800 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <h3 className="text-base font-bold text-white">{infoModal.title}</h3>
              <button
                onClick={() => setInfoModal(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 text-xs text-gray-300 whitespace-pre-line leading-relaxed max-h-[60vh] overflow-y-auto">
              {infoModal.content}
            </div>
            <div className="pt-3 border-t border-gray-800 flex justify-end">
              <button
                onClick={() => setInfoModal(null)}
                className="px-4 py-2 rounded-xl bg-[#00E676] text-black text-xs font-bold hover:bg-[#00FF7F]"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
