import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { BackToTop } from './components/BackToTop';
import { Toaster } from './components/Toaster';
import { ScrollProgress } from './components/ScrollProgress';
import { GrainOverlay } from './components/GrainOverlay';
import { QuickView } from './components/QuickView';
import { useAuth } from './store/auth';
import { useLocale } from './store/locale';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Collections } from './pages/Collections';
import { About } from './pages/About';
import { Checkout } from './pages/Checkout';
import { OrderConfirmation } from './pages/OrderConfirmation';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Account } from './pages/Account';
import { Wishlist } from './pages/Wishlist';
import { AuthCallback } from './pages/AuthCallback';
import { Shipping, Privacy, Terms } from './pages/Legal';
import { WhatsAppFloat } from './components/WhatsAppFloat';
import { NotFound } from './pages/NotFound';

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.main>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0 }), [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const init = useAuth((s) => s.init);
  const locale = useLocale((s) => s.locale);

  useEffect(() => {
    init();
  }, [init]);

  // <html lang> sigue al idioma activo (SEO + accesibilidad)
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <>
      <GrainOverlay />
      <ScrollToTop />
      <ScrollProgress />
      <AnnouncementBar />
      <Header />
      <CartDrawer />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Page><Home /></Page>} />
          <Route path="/shop" element={<Page><Shop /></Page>} />
          <Route path="/collections" element={<Page><Collections /></Page>} />
          <Route path="/product/:slug" element={<Page><ProductDetail /></Page>} />
          <Route path="/about" element={<Page><About /></Page>} />
          <Route path="/checkout" element={<Page><Checkout /></Page>} />
          <Route path="/order/:id" element={<Page><OrderConfirmation /></Page>} />
          <Route path="/login" element={<Page><Login /></Page>} />
          <Route path="/register" element={<Page><Register /></Page>} />
          <Route path="/account" element={<Page><Account /></Page>} />
          <Route path="/wishlist" element={<Page><Wishlist /></Page>} />
          <Route path="/auth/callback" element={<Page><AuthCallback /></Page>} />
          <Route path="/envios" element={<Page><Shipping /></Page>} />
          <Route path="/privacidad" element={<Page><Privacy /></Page>} />
          <Route path="/terminos" element={<Page><Terms /></Page>} />
          <Route path="*" element={<Page><NotFound /></Page>} />
        </Routes>
      </AnimatePresence>
      <WhatsAppFloat />
      <BackToTop />
      <Toaster />
      <QuickView />
      <Footer />
    </>
  );
}
