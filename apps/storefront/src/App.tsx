import { lazy, Suspense, useEffect } from 'react';
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
import { Home } from './pages/Home'; // eager: es el landing principal
import { WhatsAppFloat } from './components/WhatsAppFloat';

// El resto de páginas se cargan bajo demanda (code-splitting → carga inicial menor).
const Shop = lazy(() => import('./pages/Shop').then((m) => ({ default: m.Shop })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const Collections = lazy(() => import('./pages/Collections').then((m) => ({ default: m.Collections })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Checkout = lazy(() => import('./pages/Checkout').then((m) => ({ default: m.Checkout })));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation').then((m) => ({ default: m.OrderConfirmation })));
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then((m) => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then((m) => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then((m) => ({ default: m.ResetPassword })));
const Account = lazy(() => import('./pages/Account').then((m) => ({ default: m.Account })));
const Wishlist = lazy(() => import('./pages/Wishlist').then((m) => ({ default: m.Wishlist })));
const AuthCallback = lazy(() => import('./pages/AuthCallback').then((m) => ({ default: m.AuthCallback })));
const Shipping = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Shipping })));
const Privacy = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import('./pages/Legal').then((m) => ({ default: m.Terms })));
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

// Fallback de carga (branded, mínimo)
function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <span className="font-varsity text-2xl uppercase tracking-[0.3em] text-bone/30 animate-pulse">
        NMRC
      </span>
    </div>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Suspense fallback={<PageFallback />}>{children}</Suspense>
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
          <Route path="/forgot-password" element={<Page><ForgotPassword /></Page>} />
          <Route path="/reset-password" element={<Page><ResetPassword /></Page>} />
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
