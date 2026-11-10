import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const links = [
  { to: '/how', label: 'How it works' },
  { to: '/security', label: 'Security & evidence' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/customers', label: 'Customers' },
  { to: '/about', label: 'About' },
];

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`sticky top-0 z-50 border-b ${scrolled || open ? 'border-line bg-page/95' : 'border-transparent bg-page'}`}>
      <a href="#main" className="skip-link">Skip to content</a>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          <Link to="/" className="shrink-0" aria-label="Intevaris home"><Logo /></Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `px-3 py-2 text-[14px] transition-colors ${isActive ? 'font-semibold text-ink' : 'text-muted hover:text-ink'}`}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <button onClick={() => nav('/app')} className="px-2 py-2 text-[14px] font-medium text-muted hover:text-ink">Sign in</button>
            <button onClick={() => nav('/demo')} className="h-10 bg-brand px-4 text-[14px] font-semibold text-white hover:bg-brand-hover">Request a demo</button>
          </div>
          <button className="p-2 text-ink lg:hidden" onClick={() => setOpen(o => !o)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <nav className="grid gap-1 border-t border-line pb-5 pt-3 lg:hidden" aria-label="Mobile">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-2 py-3 text-[16px] text-ink">{l.label}</NavLink>
            ))}
            <button onClick={() => { setOpen(false); nav('/app'); }} className="px-2 py-3 text-left text-[16px] text-ink">Sign in to workspace</button>
            <button onClick={() => { setOpen(false); nav('/demo'); }} className="mt-2 h-11 bg-brand text-[15px] font-semibold text-white">Request a demo</button>
          </nav>
        )}
      </div>
    </header>
  );
}
