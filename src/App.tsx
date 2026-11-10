import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const Home = lazy(() => import('./pages/Home'));
const How = lazy(() => import('./pages/How'));
const Security = lazy(() => import('./pages/Security'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Customers = lazy(() => import('./pages/Customers'));
const About = lazy(() => import('./pages/About'));
const Demo = lazy(() => import('./pages/Demo'));

const AppLayout = lazy(() => import('./app/AppLayout'));
const CommandCenter = lazy(() => import('./app/CommandCenter'));
const Sessions = lazy(() => import('./app/Sessions'));
const PolicyEngine = lazy(() => import('./app/PolicyEngine'));
const Interpreters = lazy(() => import('./app/Interpreters'));
const LiveSession = lazy(() => import('./app/LiveSession'));
const EvidenceAudit = lazy(() => import('./app/EvidenceAudit'));
const Quality = lazy(() => import('./app/Quality'));
const Admin = lazy(() => import('./app/Admin'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const Fallback = () => (
  <div className="grid min-h-[60vh] place-items-center bg-paper">
    <Loader2 size={26} className="animate-spin text-pine-deep" aria-label="Loading" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Public marketing site */}
          <Route path="/" element={<Home />} />
          <Route path="/how" element={<How />} />
          <Route path="/security" element={<Security />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/about" element={<About />} />
          <Route path="/demo" element={<Demo />} />

          {/* Product workspace */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<CommandCenter />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="policy" element={<PolicyEngine />} />
            <Route path="interpreters" element={<Interpreters />} />
            <Route path="live" element={<LiveSession />} />
            <Route path="audit" element={<EvidenceAudit />} />
            <Route path="quality" element={<Quality />} />
            <Route path="admin" element={<Admin />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
