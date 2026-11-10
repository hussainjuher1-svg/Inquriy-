import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const Daybook = lazy(() => import('./daybook/Daybook'));

const Home = lazy(() => import('./intevaris/Public').then(m => ({ default: m.Home })));
const Information = lazy(() => import('./intevaris/Public').then(m => ({ default: m.Information })));
const AppLayout = lazy(() => import('./intevaris/Workspace'));
const Overview = lazy(() => import('./intevaris/Workspace').then(m => ({ default: m.Overview })));
const DataPage = lazy(() => import('./intevaris/Workspace').then(m => ({ default: m.DataPage })));
const Live = lazy(() => import('./intevaris/Workspace').then(m => ({ default: m.Live })));
const Policy = lazy(() => import('./intevaris/Workspace').then(m => ({ default: m.Policy })));
const Settings = lazy(() => import('./intevaris/Workspace').then(m => ({ default: m.Settings })));

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
          <Route path="/daybook/*" element={<Daybook />} />
          {/* Public marketing site */}
          <Route path="/" element={<Home />} />
          <Route path="/how" element={<Information kind="how" />} />
          <Route path="/security" element={<Information kind="security" />} />
          <Route path="/pricing" element={<Information kind="pricing" />} />
          <Route path="/customers" element={<Information kind="customers" />} />
          <Route path="/about" element={<Information kind="about" />} />
          <Route path="/demo" element={<Information kind="demo" />} />

          {/* Product workspace */}
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Overview />} />
            <Route path="sessions" element={<DataPage kind="sessions" />} />
            <Route path="policy" element={<Policy />} />
            <Route path="interpreters" element={<DataPage kind="interpreters" />} />
            <Route path="live" element={<Live />} />
            <Route path="audit" element={<DataPage kind="audit" />} />
            <Route path="quality" element={<DataPage kind="quality" />} />
            <Route path="admin" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
