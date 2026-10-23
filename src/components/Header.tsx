import React, { useState } from 'react';
import {
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  Search,
  Shield,
  Phone,
  MessageCircle,
  LogOut,
  ChevronRight,
  Flame,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { BUSINESS_INFO, getWhatsAppLink } from '../lib/constants';
import { SupabaseStatusBadge } from './SupabaseSetupBanner';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string, params?: Record<string, string>) => void;
  onSearchSubmit?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onSearchSubmit }) => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(searchQuery.trim());
      }
      onNavigate('shop', { q: searchQuery.trim() });
      setSearchOpen(false);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'shop', label: 'Shop Jerseys', href: '/shop' },
    { id: 'new-arrivals', label: 'New Arrivals', badge: 'Hot', href: '/shop' },
    { id: 'featured', label: 'Featured Jerseys', href: '/shop' },
    { id: 'contact', label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080B11]/95 backdrop-blur-md border-b border-gray-800/80">
      {/* 1. Announcement Bar */}
      <div className="bg-gradient-to-r from-black via-[#0F172A] to-black border-b border-gray-800 text-[11px] text-gray-300 py-1.5 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs truncate">
            <span className="w-2 h-2 rounded-full bg-[#00E676] animate-pulse" />
            <span className="font-semibold text-white tracking-wide">RASH HUB STORE:</span>
            <span className="text-gray-300">
              Football jerseys for every fan • Delivery in <strong className="text-[#00E676]">Abofour, Ghana</strong> only
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-4 text-xs text-gray-400 shrink-0">
            <a
              href={`tel:${BUSINESS_INFO.phone}`}
              className="flex items-center gap-1 hover:text-[#00E676] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#00E676]" />
              <span>{BUSINESS_INFO.phoneFormatted}</span>
            </a>
            <span className="text-gray-700">|</span>
            <a
              href={getWhatsAppLink('Hello Rash Hub Store! I want to inquire about football jerseys.')}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[#00E676] hover:underline"
            >
              <MessageCircle className="w-3 h-3" />
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Official Brand Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
            className="flex items-center space-x-3 cursor-pointer"
            aria-label="Rash Hubs Homepage"
          >
            <img
              src="/logo.png"
              alt="Rash Hubs Official Logo"
              width="170"
              height="56"
              fetchPriority="high"
              className="h-14 w-auto max-w-[170px] object-contain hover:scale-[1.02] transition-transform drop-shadow-[0_0_12px_rgba(0,230,118,0.2)]"
            />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (link.id === 'new-arrivals') {
                    onNavigate('shop', { filter: 'new_arrivals' });
                  } else if (link.id === 'featured') {
                    onNavigate('shop', { filter: 'featured' });
                  } else {
                    onNavigate(link.id);
                  }
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition relative flex items-center gap-1.5 ${
                  currentPage === link.id
                    ? 'text-[#00E676] bg-[#00E676]/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.id === 'new-arrivals' && <Sparkles className="w-3.5 h-3.5 text-[#00E676]" />}
                {link.id === 'featured' && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                {link.label}
                {link.badge && (
                  <span className="px-1.5 py-0.2 bg-gradient-to-r from-emerald-500 to-[#00E676] text-black font-extrabold text-[9px] rounded-full uppercase">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Right Action Icons: Search, Backend Status, Cart, Account */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Supabase Status Indicator */}
            <div className="hidden sm:block">
              <SupabaseStatusBadge />
            </div>

            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-300 hover:text-[#00E676] hover:bg-white/5 rounded-xl transition"
              title="Search Jerseys"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-300 hover:text-[#00E676] hover:bg-white/5 rounded-xl transition"
              title="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#00E676] text-[10px] font-black text-black shadow-lg shadow-[#00E676]/40 animate-scale">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Customer Account Controls */}
            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                {isAdmin && (
                  <button
                    onClick={() => onNavigate('admin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-[#00E676]/40 text-[#00E676] text-xs font-bold hover:bg-[#00E676]/20 transition"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                )}

                <button
                  onClick={() => onNavigate('account')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F172A] border border-gray-700 text-white text-xs font-semibold hover:border-gray-500 transition"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#00E676]" />
                  <span className="max-w-[100px] truncate">
                    {profile?.full_name?.split(' ')[0] || 'My Account'}
                  </span>
                </button>

                <button
                  onClick={() => signOut()}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white transition"
                >
                  Login
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00E676] text-black text-xs font-bold hover:bg-[#00FF7F] transition shadow-md shadow-[#00E676]/20"
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Search Input */}
      {searchOpen && (
        <div className="border-t border-gray-800 bg-[#0A0E17] py-3 px-4 shadow-xl">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by club (Real Madrid, Arsenal, Chelsea...), country (Ghana, Brazil), or season..."
                className="w-full pl-10 pr-24 py-2.5 bg-[#0F172A] border border-gray-700 rounded-xl text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#00E676]"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 px-3 py-1 rounded-lg bg-[#00E676] text-black text-xs font-bold hover:bg-[#00FF7F] transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-800 bg-[#080B11] px-4 pt-3 pb-6 space-y-4 shadow-2xl">
          {/* Mobile Supabase Badge */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <span className="text-xs text-gray-400">System Status</span>
            <SupabaseStatusBadge />
          </div>

          {/* Mobile Navigation Links */}
          <nav className="space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  if (link.id === 'new-arrivals') {
                    onNavigate('shop', { filter: 'new_arrivals' });
                  } else if (link.id === 'featured') {
                    onNavigate('shop', { filter: 'featured' });
                  } else {
                    onNavigate(link.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  currentPage === link.id
                    ? 'bg-[#00E676]/10 text-[#00E676]'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </a>
            ))}
          </nav>

          {/* Account Controls Mobile */}
          <div className="pt-3 border-t border-gray-800 space-y-2">
            {user ? (
              <>
                <div className="px-3 py-2 rounded-xl bg-[#0F172A] border border-gray-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{profile?.full_name || 'My Account'}</p>
                    <p className="text-[10px] text-gray-400">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[#00E676] text-[10px] font-bold">
                      Admin
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('admin');
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-[#00E676]/40 text-[#00E676] text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Admin Dashboard
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('account');
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#0F172A] border border-gray-700 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-[#00E676]" />
                  My Account & Orders
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    signOut();
                  }}
                  className="w-full py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('login');
                  }}
                  className="py-2.5 rounded-xl border border-gray-700 text-white text-xs font-bold hover:bg-white/5 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('signup');
                  }}
                  className="py-2.5 rounded-xl bg-[#00E676] text-black text-xs font-bold hover:bg-[#00FF7F] transition shadow-md shadow-[#00E676]/20"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>

          {/* Abofour Contact quick bar in mobile menu */}
          <div className="pt-2 text-[11px] text-gray-400 flex items-center justify-between">
            <span>Call: {BUSINESS_INFO.phoneFormatted}</span>
            <span className="text-[#00E676]">Abofour, Ghana</span>
          </div>
        </div>
      )}
    </header>
  );
};
