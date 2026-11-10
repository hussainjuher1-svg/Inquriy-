import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, MessagesSquare, Users2, Mic2, ShieldCheck, BarChart3, Settings,
  Search, Bell, ChevronDown, CircleCheck, TriangleAlert, Info, Check, Building2, LogOut, FileCheck2, Menu, X,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useStore } from '../lib/store';

const GROUPS = [
  {
    label: 'Operate',
    items: [
      { to: '/app', end: true, icon: LayoutDashboard, label: 'Command Center' },
      { to: '/app/sessions', icon: MessagesSquare, label: 'Sessions' },
      { to: '/app/live', icon: Mic2, label: 'Live Session' },
      { to: '/app/interpreters', icon: Users2, label: 'Interpreters' },
    ],
  },
  {
    label: 'Govern',
    items: [
      { to: '/app/policy', icon: ShieldCheck, label: 'Policy Engine' },
      { to: '/app/audit', icon: FileCheck2, label: 'Evidence & Audit' },
      { to: '/app/quality', icon: BarChart3, label: 'Quality' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { to: '/app/admin', icon: Settings, label: 'Admin & Settings' },
    ],
  },
];

const ROLES = ['Org admin', 'Host', 'Reviewer', 'Interpreter', 'Platform operator'] as const;

export default function AppLayout() {
  const location = useLocation();
  const nav = useNavigate();
  const [role, setRole] = useState<(typeof ROLES)[number]>('Org admin');
  const [roleOpen, setRoleOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [search, setSearch] = useState('');
  const roleRef = useRef<HTMLDivElement>(null);
  const { toasts, dismissToast, log, toast } = useStore();

  useEffect(() => { window.scrollTo(0, 0); setNavOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim().toLowerCase();
    if (!q) return;
    const map: Record<string, string> = { session: '/app/sessions', ses: '/app/sessions', policy: '/app/policy', audit: '/app/audit', evidence: '/app/audit', interpreter: '/app/interpreters', glossary: '/app/quality', quality: '/app/quality', admin: '/app/admin', live: '/app/live' };
    const hit = Object.entries(map).find(([k]) => q.includes(k));
    log('search.performed', 'workspace', `Query "${q}" → ${hit ? hit[1] : 'command center'}`, 'info');
    nav(hit ? hit[1] : '/app');
  };

  const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {GROUPS.map(g => (
        <div key={g.label} className="mb-4">
          <p className="px-3 pb-1 text-[12px] font-medium text-faint">{g.label}</p>
          {g.items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 text-[14px] ${isActive ? 'bg-brand-soft font-semibold text-brand' : 'text-muted hover:bg-subtle hover:text-ink'}`}
            >
              <item.icon size={16} strokeWidth={1.8} className="shrink-0" />{item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </>
  );

  return (
    <div className="flex min-h-screen bg-page font-sans text-ink">
      <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-line bg-surface lg:flex">
        <div className="border-b border-line px-4 py-4">
          <Link to="/" aria-label="Back to site"><Logo /></Link>
          <div className="mt-4 flex items-start gap-2 border border-line bg-subtle px-3 py-2">
            <Building2 size={14} className="mt-0.5 shrink-0 text-brand" />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold">Riverside Health</p>
              <p className="font-mono text-[11px] text-muted">tenant_riverside · demo</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Workspace">
          <NavItems />
        </nav>
        <div className="border-t border-line p-4">
          <p className="text-[12px] leading-snug text-muted">Demonstration workspace. Policy logic is real; adapters, tenants, and audio are simulated. Audit events persist in this browser.</p>
          <Link to="/" className="mt-3 flex items-center gap-2 text-[13px] font-medium text-muted hover:text-ink"><LogOut size={14} /> Marketing site</Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-page">
          <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
            <button className="grid h-10 w-10 place-items-center border border-line lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open navigation">
              <Menu size={18} />
            </button>
            <form onSubmit={submitSearch} className="hidden h-10 items-center gap-2 border border-line bg-surface px-3 sm:flex sm:w-64 xl:w-80">
              <Search size={15} className="shrink-0 text-muted" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sessions, policy, audit…" className="w-full bg-transparent text-[14px] outline-none placeholder:text-faint" aria-label="Search workspace" />
            </form>
            <div className="relative ml-auto" ref={roleRef}>
              <button onClick={() => setRoleOpen(o => !o)} className="flex h-10 items-center gap-2 border border-line bg-surface pl-2 pr-3 text-[13px] font-medium" aria-haspopup="listbox" aria-expanded={roleOpen}>
                <span className="grid h-6 w-6 place-items-center bg-brand text-[10px] font-semibold text-white">{role.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
                <span className="hidden md:inline">{role}</span>
                <ChevronDown size={14} className={`text-muted ${roleOpen ? 'rotate-180' : ''}`} />
              </button>
              {roleOpen && (
                <div className="absolute right-0 top-12 z-50 w-60 border border-line bg-surface p-1 shadow-sm" role="listbox">
                  <p className="px-3 py-2 text-[12px] text-muted">View workspace as</p>
                  {ROLES.map(r => (
                    <button key={r} onClick={() => { setRole(r); setRoleOpen(false); log('role.switch', 'workspace', `Viewing as ${r}`, 'info'); }} className="flex w-full items-center justify-between px-3 py-2 text-left text-[14px] hover:bg-subtle">
                      {r}{role === r && <Check size={15} className="text-brand" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="relative grid h-10 w-10 place-items-center border border-line bg-surface" aria-label="Notifications" onClick={() => toast({ title: '2 demonstration notices', body: 'Minh Trần CHI™ expires in 63 days · quality queue has 2 unreviewed flags.', tone: 'info' })}>
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 bg-warn" />
            </button>
            <Link to="/app/live" className="hidden h-10 items-center gap-2 bg-danger px-3 text-[13px] font-semibold text-white md:inline-flex">Live · 3</Link>
          </div>
        </header>

        {navOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button className="absolute inset-0 bg-ink/40" aria-label="Close navigation" onClick={() => setNavOpen(false)} />
            <div className="relative h-full w-[min(88vw,300px)] overflow-y-auto border-r border-line bg-surface p-3">
              <div className="mb-3 flex items-center justify-between px-2">
                <Logo compact />
                <button onClick={() => setNavOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center"><X size={18} /></button>
              </div>
              <NavItems onNavigate={() => setNavOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1"><Outlet context={{ role }} /></main>
      </div>

      <div className="fixed bottom-4 right-4 z-[60] flex w-[min(92vw,360px)] flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className="flex items-start gap-3 border border-line bg-surface p-4 shadow-sm" role="status">
            {t.tone === 'ok' && <CircleCheck size={18} className="mt-0.5 shrink-0 text-ok" />}
            {t.tone === 'warn' && <TriangleAlert size={18} className="mt-0.5 shrink-0 text-warn" />}
            {t.tone === 'info' && <Info size={18} className="mt-0.5 shrink-0 text-info" />}
            {t.tone === 'danger' && <TriangleAlert size={18} className="mt-0.5 shrink-0 text-danger" />}
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{t.title}</p>
              {t.body && <p className="mt-0.5 text-[13px] leading-snug text-muted">{t.body}</p>}
            </div>
            <button onClick={() => dismissToast(t.id)} className="text-[18px] leading-none text-faint hover:text-ink" aria-label="Dismiss">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
