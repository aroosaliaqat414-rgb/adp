import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Storefront Components
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { QuickViewModal } from './components/QuickViewModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { InvoicePrintModal } from './components/InvoicePrintModal';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AuthPages } from './pages/AuthPages';
import {
  AboutPage,
  ContactPage,
  FAQsPage,
  ShippingPolicyPage,
  ReturnsPolicyPage
} from './pages/StaticPages';

// Admin Modules
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminFinance } from './pages/admin/AdminFinance';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminSupport } from './pages/admin/AdminSupport';
import { AdminCMS } from './pages/admin/AdminCMS';
import { AdminSettings } from './pages/admin/AdminSettings';

import { Product, Order } from './types';

const MainApp: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});

  // Modals State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);

  // Admin Tab State
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [adminParams, setAdminParams] = useState<any>(null);

  const handleNavigate = (page: string, params: Record<string, string> = {}) => {
    // Role protection for admin routes
    if (page === 'admin') {
      if (!isAuthenticated) {
        setCurrentPage('login');
        setPageParams({ returnTo: 'admin' });
        window.scrollTo(0, 0);
        return;
      }
      if (!isAdmin) {
        alert('Access denied: Staff / Administrator privileges required.');
        return;
      }
    }

    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const handleOrderSuccess = (order: Order) => {
    setLastPlacedOrder(order);
    handleNavigate('order-confirmation');
  };

  const handlePrintInvoice = (order: Order) => {
    setInvoiceModalOrder(order);
  };

  // If in Admin Mode
  if (currentPage === 'admin') {
    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={(tab) => {
          setAdminTab(tab);
          setAdminParams(null);
        }}
        onExitAdmin={() => handleNavigate('home')}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={(tab, params) => {
              setAdminTab(tab);
              setAdminParams(params);
            }}
          />
        )}
        {adminTab === 'orders' && (
          <AdminOrders
            initialOrderId={adminParams?.orderId}
            onPrintInvoice={handlePrintInvoice}
          />
        )}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'inventory' && <AdminInventory />}
        {adminTab === 'customers' && <AdminCustomers />}
        {adminTab === 'coupons' && <AdminCoupons />}
        {adminTab === 'finance' && <AdminFinance />}
        {adminTab === 'reviews' && <AdminReviews />}
        {adminTab === 'support' && <AdminSupport />}
        {adminTab === 'cms' && <AdminCMS />}
        {adminTab === 'settings' && <AdminSettings />}

        {/* Invoice print modal for admin */}
        <InvoicePrintModal
          order={invoiceModalOrder}
          onClose={() => setInvoiceModalOrder(null)}
        />
      </AdminLayout>
    );
  }

  // Storefront Render
  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAF8] text-[#2D232E]">
      <Header onNavigate={handleNavigate} currentPage={currentPage} />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {currentPage === 'shop' && (
          <ShopPage
            initialCategory={pageParams.category}
            initialSearch={pageParams.search}
            initialNewArrival={pageParams.newArrival === 'true'}
            initialBestSeller={pageParams.bestSeller === 'true'}
            onNavigate={handleNavigate}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {currentPage === 'product' && (
          <ProductDetailPage
            productId={pageParams.id || 'prod_1'}
            onNavigate={handleNavigate}
            onOpenSizeGuide={() => setSizeGuideOpen(true)}
            onQuickView={(p) => setQuickViewProduct(p)}
          />
        )}

        {currentPage === 'cart' && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="font-serif text-3xl font-bold mb-6">Shopping Bag</h1>
            <p className="text-xs text-[#8E8191] mb-6">
              Review your garments and continue to checkout.
            </p>
            <CheckoutPage
              onOrderSuccess={handleOrderSuccess}
              onNavigate={handleNavigate}
            />
          </div>
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            onOrderSuccess={handleOrderSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'order-confirmation' && lastPlacedOrder && (
          <OrderConfirmationPage
            order={lastPlacedOrder}
            onNavigate={handleNavigate}
            onPrintInvoice={handlePrintInvoice}
          />
        )}

        {currentPage === 'track-order' && (
          <OrderTrackingPage
            initialQuery={pageParams.query}
            onNavigate={handleNavigate}
            onPrintInvoice={handlePrintInvoice}
          />
        )}

        {currentPage === 'wishlist' && (
          <div className="max-w-7xl mx-auto px-4 py-12">
            <CustomerDashboard
              onNavigate={handleNavigate}
              onPrintInvoice={handlePrintInvoice}
            />
          </div>
        )}

        {currentPage === 'dashboard' && (
          <CustomerDashboard
            onNavigate={handleNavigate}
            onPrintInvoice={handlePrintInvoice}
          />
        )}

        {currentPage === 'login' && (
          <AuthPages
            initialMode="login"
            onNavigate={handleNavigate}
            onSuccess={() => handleNavigate(pageParams.returnTo || 'dashboard')}
          />
        )}

        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'faqs' && <FAQsPage />}
        {currentPage === 'shipping-policy' && <ShippingPolicyPage />}
        {currentPage === 'returns-policy' && <ReturnsPolicyPage />}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />

      {/* Global Modals */}
      <CartDrawer onNavigate={handleNavigate} />

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onNavigate={handleNavigate}
        onOpenSizeGuide={() => {
          setQuickViewProduct(null);
          setSizeGuideOpen(true);
        }}
      />

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />

      <InvoicePrintModal
        order={invoiceModalOrder}
        onClose={() => setInvoiceModalOrder(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <MainApp />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
