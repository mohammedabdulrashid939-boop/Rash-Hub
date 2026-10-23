import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AccountPage } from './pages/AccountPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { ContactPage } from './pages/ContactPage';
import { Product, Order, ProductFilterState } from './types';
import { fetchPublishedProducts, fetchProductBySlug } from './lib/supabase';

function MainApp() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Active product for detail page
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  // Last completed order for confirmation page
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [emailVerifiedBanner, setEmailVerifiedBanner] = useState<boolean>(false);

  // Load published catalog from Supabase
  const loadProducts = async () => {
    setLoadingProducts(true);
    const data = await fetchPublishedProducts();
    setProducts(data);
    setLoadingProducts(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Handle URL history routing and hash changes (e.g. Supabase recovery token in URL)
  useEffect(() => {
    const parseUrl = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      if (hash && hash.includes('type=recovery')) {
        setCurrentPage('reset-password');
        return;
      }

      if (hash && (hash.includes('type=signup') || hash.includes('type=email_change'))) {
        setEmailVerifiedBanner(true);
        setCurrentPage('account');
        window.history.replaceState({}, '', '/account');
        return;
      }

      if (path === '/admin') {
        setCurrentPage('admin');
      } else if (path === '/account') {
        setCurrentPage('account');
      } else if (path === '/login') {
        setCurrentPage('login');
      } else if (path === '/signup') {
        setCurrentPage('signup');
      } else if (path === '/forgot-password') {
        setCurrentPage('forgot-password');
      } else if (path === '/reset-password') {
        setCurrentPage('reset-password');
      } else if (path === '/checkout') {
        setCurrentPage('checkout');
      } else if (path === '/contact') {
        setCurrentPage('contact');
      } else if (path === '/shop') {
        setCurrentPage('shop');
      } else if (path.startsWith('/product/')) {
        const slug = path.replace('/product/', '');
        if (slug) {
          handleViewProduct(slug);
        }
      } else {
        setCurrentPage('home');
      }
    };

    parseUrl();

    window.addEventListener('popstate', parseUrl);
    return () => window.removeEventListener('popstate', parseUrl);
  }, []);

  const handleNavigate = (page: string, params: Record<string, string> = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Update browser URL
    let newPath = '/';
    if (page === 'shop') newPath = '/shop';
    else if (page === 'admin') newPath = '/admin';
    else if (page === 'account') newPath = '/account';
    else if (page === 'login') newPath = '/login';
    else if (page === 'signup') newPath = '/signup';
    else if (page === 'forgot-password') newPath = '/forgot-password';
    else if (page === 'reset-password') newPath = '/reset-password';
    else if (page === 'checkout') newPath = '/checkout';
    else if (page === 'contact') newPath = '/contact';

    window.history.pushState({}, '', newPath);
  };

  const handleViewProduct = async (slug: string) => {
    const found = products.find((p) => p.slug === slug);
    if (found) {
      setActiveProduct(found);
    } else {
      const fetched = await fetchProductBySlug(slug);
      setActiveProduct(fetched);
    }
    setCurrentPage('product');
    window.history.pushState({}, '', `/product/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (order: Order) => {
    setConfirmedOrder(order);
    setCurrentPage('order-confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render current page content
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            products={products}
            loading={loadingProducts}
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
          />
        );

      case 'shop':
        return (
          <ShopPage
            products={products}
            loading={loadingProducts}
            initialFilters={{
              search: pageParams.q || '',
              jerseyType: pageParams.type || '',
              version: pageParams.version || '',
              sortBy: 'newest',
            }}
            onViewProduct={handleViewProduct}
          />
        );

      case 'product':
        return (
          <ProductDetailPage
            product={activeProduct}
            allProducts={products}
            onBack={() => handleNavigate('shop')}
            onViewProduct={handleViewProduct}
          />
        );

      case 'checkout':
        return (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onBackToShop={() => handleNavigate('shop')}
          />
        );

      case 'order-confirmation':
        if (!confirmedOrder) {
          return (
            <HomePage
              products={products}
              loading={loadingProducts}
              onNavigate={handleNavigate}
              onViewProduct={handleViewProduct}
            />
          );
        }
        return (
          <OrderConfirmationPage
            order={confirmedOrder}
            onNavigate={handleNavigate}
          />
        );

      case 'login':
        return (
          <LoginPage
            onNavigate={handleNavigate}
            onLoginSuccess={() => handleNavigate('account')}
          />
        );

      case 'signup':
        return <SignUpPage onNavigate={handleNavigate} />;

      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;

      case 'reset-password':
        return <ResetPasswordPage onNavigate={handleNavigate} />;

      case 'account':
        return <AccountPage onNavigate={handleNavigate} />;

      case 'admin':
        return <AdminDashboard onNavigate={handleNavigate} />;

      case 'contact':
        return <ContactPage />;

      default:
        return (
          <HomePage
            products={products}
            loading={loadingProducts}
            onNavigate={handleNavigate}
            onViewProduct={handleViewProduct}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-white flex flex-col font-sans antialiased selection:bg-[#00E676] selection:text-black">
      {/* Global Navigation Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onSearchSubmit={(q) => handleNavigate('shop', { q })}
      />

      {/* Email Verified Banner Notification */}
      {emailVerifiedBanner && (
        <div className="bg-[#00E676] text-black px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <span>✓ Email confirmed successfully! Your Rash Hub Store account is active and logged in.</span>
          </div>
          <button
            onClick={() => setEmailVerifiedBanner(false)}
            className="text-black/70 hover:text-black font-black px-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Page Body */}
      <main className="flex-1">{renderPage()}</main>

      {/* Sliding Shopping Cart Drawer */}
      <CartDrawer onNavigate={handleNavigate} />

      {/* Global Footer (shown on customer pages, discrete on admin) */}
      {currentPage !== 'admin' && <Footer onNavigate={handleNavigate} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
