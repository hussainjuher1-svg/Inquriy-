import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleCheck } from 'lucide-react';
import SiteLayout, { MarketingHero } from '../components/SiteLayout';

const plans = [
  {
    name: 'Starter', tagline: 'One clinic, school, or office', monthly: 290, annual: 245,
    cta: 'Start a 14-day pilot conversation', featured: false,
    features: ['Up to 150 routed sessions / mo', '2 language pairs · T0–T2 policy', 'AI + human monitor routing', 'Evidence packs (PDF/JSON export)', 'Email support · 1 business day', 'Community glossary templates'],
    missing: ['SLA-backed human interpreter network', 'SSO / SCIM / custom retention'],
  },
  {
    name: 'Professional', tagline: 'Multi-site programs', monthly: 890, annual: 740,
    cta: 'Request a live demo', featured: true,
    features: ['Up to 750 routed sessions / mo', '5 language pairs · T0–T3 policy', 'Human network with <10s handoff target', 'Custom glossaries + prep packs', 'Audit-chain verification export', 'Priority support · 4 business hours', 'Quality dashboards per language pair'],
    missing: ['Dedicated region pinning', 'BYOK keys'],
  },
  {
    name: 'Enterprise', tagline: 'Health systems, courts, cities', monthly: null, annual: null,
    cta: 'Talk to us', featured: false,
    features: ['Unlimited routed sessions', 'Unlimited pairs · custom tier rules', 'Region pinning · dedicated keys (roadmap)', 'SSO/SAML/SCIM · DPA & BAA when available', 'Operator break-glass, fully audited', 'Named success architect · SLA', 'Golden-dataset evaluation program'],
    missing: [],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);
  const nav = useNavigate();
  return (
    <SiteLayout>
      <MarketingHero kicker="Pricing" title="Priced per routed outcome, not per minute of people.">
        <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-muted">Figures below are demonstration list prices for evaluation. They are not a live checkout. Human interpreter time is described as pass-through on Professional and Enterprise.</p>
        <div className="mt-8 inline-flex border border-line bg-surface p-1">
          {(['Monthly', 'Annual · save ~15%'] as const).map((l, i) => {
            const active = (i === 1) === annual;
            return (
              <button key={l} onClick={() => setAnnual(i === 1)} className={`px-4 py-2 text-[14px] font-medium ${active ? 'bg-brand text-white' : 'text-muted hover:text-ink'}`}>{l}</button>
            );
          })}
        </div>
      </MarketingHero>

      <section className="py-14">
        <div className="mx-auto grid max-w-6xl items-stretch gap-6 px-4 sm:px-6 md:grid-cols-3">
          {plans.map(p => (
            <div key={p.name} className={`flex flex-col border p-6 ${p.featured ? 'border-brand bg-surface' : 'border-line bg-surface'}`}>
              {p.featured && <p className="text-[12px] font-semibold text-brand">Most commonly scoped</p>}
              <h2 className="mt-1 text-[22px] font-semibold">{p.name}</h2>
              <p className="mt-1 text-[14px] text-muted">{p.tagline}</p>
              <div className="mt-6 flex items-end gap-2">
                {p.monthly ? (
                  <>
                    <span className="font-display text-4xl">${annual ? p.annual : p.monthly}</span>
                    <span className="pb-1 text-[13px] text-muted">/ mo {annual ? 'billed annually' : 'billed monthly'}</span>
                  </>
                ) : (
                  <>
                    <span className="font-display text-4xl">Custom</span>
                    <span className="pb-1 text-[13px] text-muted">annual agreement</span>
                  </>
                )}
              </div>
              <ul className="mt-6 flex-1 space-y-2">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[14px] text-muted"><CircleCheck size={16} className="mt-0.5 shrink-0 text-brand" />{f}</li>
                ))}
                {p.missing.map(f => (
                  <li key={f} className="flex items-start gap-2 text-[14px] text-faint line-through">{f}</li>
                ))}
              </ul>
              <button onClick={() => nav('/demo')} className={`mt-7 h-11 text-[14px] font-semibold ${p.featured ? 'bg-brand text-white hover:bg-brand-hover' : 'border border-line hover:bg-subtle'}`}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-subtle py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="font-display text-2xl">Fine print</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3 text-[14px] leading-relaxed text-muted">
            <div><p className="font-semibold text-ink">Human minutes at cost</p><p className="mt-2">Monitor and interpreter minutes are described as pass-through. This demo does not bill anyone.</p></div>
            <div><p className="font-semibold text-ink">No per-seat trap</p><p className="mt-2">Hosts and reviewers are unlimited on every plan. Participants never pay and never install.</p></div>
            <div><p className="font-semibold text-ink">Pilot scope</p><p className="mt-2">14 days, up to 50 routed sessions, your policies and glossaries, an evidence pack at the end — as a proposed commercial motion, not a live signup.</p></div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
