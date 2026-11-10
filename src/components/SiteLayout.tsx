import type { ReactNode } from 'react';
import PublicNav from './PublicNav';
import Footer from './Footer';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-page text-ink antialiased">
      <PublicNav />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}

export function MarketingHero({ kicker, title, children }: { kicker: string; title: ReactNode; children?: ReactNode }) {
  return (
    <section className="border-b border-line bg-page">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-14">
        <p className="text-[13px] font-medium text-brand">{kicker}</p>
        <h1 className="mt-3 max-w-4xl font-display text-[2.25rem] leading-[1.12] tracking-[-0.02em] text-ink sm:text-5xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}
