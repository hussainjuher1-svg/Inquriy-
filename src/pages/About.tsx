import { useNavigate } from 'react-router-dom';
import SiteLayout, { MarketingHero } from '../components/SiteLayout';

export default function About() {
  const nav = useNavigate();
  return (
    <SiteLayout>
      <MarketingHero kicker="About" title="Responsible, policy-driven interpretation infrastructure.">
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">This page describes product intent. It is not a corporate history, funding announcement, or roster of real employees.</p>
      </MarketingHero>

      <section className="border-b border-line py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-5 lg:gap-16">
          <div className="lg:col-span-3">
            <p className="font-display text-[1.65rem] leading-snug text-ink">In a rights-affecting moment, “the AI probably got it right” is not a standard anyone would accept for themselves.</p>
            <p className="mt-6 text-[15px] leading-relaxed text-muted">Professional interpreters are scarce and unevenly distributed. Unmonitored AI interpretation is fast and unaccountable. Intevaris is the third option: a policy engine that decides who interprets, then produces the record that a later reviewer can inspect.</p>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">It is deliberately not a model company. This product does not train foundation models, clone voices, or scrape calls. It is a routing and evidence system: provider-neutral adapters, tenant-scoped data, and a human interpreter path that can join when policy requires it.</p>
          </div>
          <div className="mt-10 lg:col-span-2 lg:mt-0">
            <h2 className="text-[15px] font-semibold">What we will not claim</h2>
            <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-muted">
              <li>We never claim to replace human interpreters.</li>
              <li>We never claim HIPAA, SOC 2, or GDPR certification before an audit exists.</li>
              <li>We never publish a latency number without method and sample size.</li>
              <li>We never let AI silently substitute for a required human.</li>
            </ul>
            <p className="mt-6 text-[14px] leading-relaxed text-muted"><span className="font-semibold text-ink">Non-goals, v1. </span>No model training, voice cloning, meeting bots, phone/SIP, self-hosting, or court/diplomacy/defense deployments until sovereignty features exist and are ADR-gated.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-subtle py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl">What the product optimizes for</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              ['The participant’s comprehension', 'The only honest success metric: did the person understand? Flags and handoffs serve that.'],
              ['Dignity under risk', 'A benefits hearing deserves the same rigor a judge gets. Tier policy encodes that without a lawyer in every session.'],
              ['Records that survive scrutiny', 'If a regulator or court asks what happened, the answer is an ordered export — not a chat screenshot.'],
            ].map(([t, d]) => (
              <div key={t}>
                <h3 className="text-[16px] font-semibold">{t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl">Roadmap discipline</h2>
          <p className="mt-3 max-w-2xl text-[15px] text-muted">Five phases, one gate at a time. Checkmarks below describe intended program status, not a live production deployment of this repository.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-5">
            {[
              ['P0', 'Plan', 'ADRs, threat model, schema, evaluation plan'],
              ['P1', 'Foundation', 'CI, RLS, RBAC, audit chain, fake adapters'],
              ['P2', 'Real-time', 'Live sessions, streaming pipeline, consent'],
              ['P3', 'Quality + human', 'Escalation, interpreter channel, golden sets'],
              ['P4–P5', 'Enterprise', 'SSO/SCIM, billing, region pinning — ADR-gated'],
            ].map(([p, t, d]) => (
              <div key={p} className="border-t border-line pt-4">
                <p className="font-mono text-[12px] text-brand">{p}</p>
                <p className="mt-1 font-semibold">{t}</p>
                <p className="mt-1 text-[13px] leading-snug text-muted">{d}</p>
              </div>
            ))}
          </div>
          <button onClick={() => nav('/demo')} className="mt-10 h-11 bg-brand px-5 text-[14px] font-semibold text-white hover:bg-brand-hover">Discuss the product</button>
        </div>
      </section>
    </SiteLayout>
  );
}
