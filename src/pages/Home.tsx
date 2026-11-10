import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Scale, GraduationCap, Landmark, Stethoscope } from 'lucide-react';
import SiteLayout from '../components/SiteLayout';
import HeroArt from '../components/HeroArt';
import { ClaimTag } from '../components/ui';

const environments = [
  { icon: Stethoscope, t: 'Clinics', d: 'Monitored AI on clinical encounters. A dosage mismatch can summon a human before harm, with the correction sealed on the record.' },
  { icon: Scale, t: 'Legal aid', d: 'Rights-affecting segments run human-only by policy. The AI goes silent; the interpreter of record is on, on the record.' },
  { icon: GraduationCap, t: 'Schools', d: 'IEP nights and enrollment on T2 policy — vetted terminology, a monitor on channel, consent captured per parent.' },
  { icon: Landmark, t: 'City services', d: 'Intake on T0/T1 self-serve, with escalation the moment a case turns rights-affecting.' },
];

export default function Home() {
  const nav = useNavigate();
  return (
    <SiteLayout>
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-[13px] font-medium text-brand">Risk-aware interpretation governance</p>
            <h1 className="mt-4 font-display text-[2.6rem] leading-[1.08] tracking-[-0.02em] text-ink sm:text-5xl">
              AI where it’s allowed.<br />Humans where it isn’t.
            </h1>
            <p className="mt-5 max-w-[52ch] text-[16px] leading-relaxed text-muted">
              Intevaris decides — per encounter, jurisdiction, risk tier, language pair, and interpreter availability — whether work runs on AI, AI with a human monitor, human-primary, or human-only. Then it records the decision.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => nav('/demo')} className="inline-flex h-11 items-center justify-center gap-2 bg-brand px-5 text-[14px] font-semibold text-white hover:bg-brand-hover">
                Request a demonstration <ArrowRight size={16} />
              </button>
              <button onClick={() => nav('/app')} className="inline-flex h-11 items-center justify-center border border-line bg-surface px-5 text-[14px] font-semibold text-ink hover:bg-subtle">
                Open the workspace
              </button>
            </div>
            <ul className="mt-8 space-y-2 text-[14px] text-muted">
              <li>No raw audio stored by default in this design.</li>
              <li>Fail-safe: required humans are never silently replaced by AI.</li>
              <li>Participant join is designed as a link or QR — no install.</li>
            </ul>
          </div>
          <div className="lg:col-span-6"><HeroArt /></div>
        </div>
      </section>

      <section className="border-b border-line bg-subtle">
        <div className="mx-auto grid max-w-6xl gap-px sm:grid-cols-2 lg:grid-cols-4">
          {[
            { v: '38', l: 'Tenancy isolation contract assertions in the demo test set', tag: 'MEASURED' as const },
            { v: '<10s', l: 'Flag-to-interpreter handoff target', tag: 'HYPOTHESIS' as const },
            { v: '100%', l: 'Single-event tamper classes caught in the demo verifier', tag: 'MEASURED' as const },
            { v: '2', l: 'v1 language pairs in the product plan (en↔es, en↔ar)', tag: 'HYPOTHESIS' as const },
          ].map(item => (
            <div key={item.l} className="bg-page px-5 py-7 sm:px-6">
              <p className="font-display text-3xl text-ink">{item.v}</p>
              <p className="mt-2 text-[13px] leading-snug text-muted">{item.l}</p>
              <div className="mt-3"><ClaimTag tag={item.tag} /></div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-line py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl tracking-[-0.02em] text-ink sm:text-4xl">Mistranslation in high-consequence rooms is not a UX problem.</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-muted">Clinics, legal aid, schools, and public services already know when a human interpreter is required. They lack an operational system that can apply that judgment consistently, monitor AI when it is allowed, and produce a record that survives later scrutiny.</p>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <div>
              <h3 className="text-[15px] font-semibold text-ink">How Intevaris approaches it</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">A policy engine treats legal and operational rules as versioned data: sourced, dated, and flagged for legal review. It does not hard-code “AI for this account.” Mode is computed from the encounter in front of you.</p>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-ink">What the record is for</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">Decisions, consents, quality flags, and human corrections are written in order. This demonstration stores that chain in the browser with an FNV-style integrity hash. It is not production cryptography and is not independently audited.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-subtle py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl tracking-[-0.02em] text-ink">Policy routing, not a default chatbot.</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Inputs', 'Jurisdiction, setting, tier, language pair, availability.'],
              ['Decision', 'Allowed modes, disclosure, consent, retention, fail-safe.'],
              ['Oversight', 'Monitor or interpreter of record when the rule requires a human.'],
              ['Evidence', 'Exportable pack linking the decision to what happened next.'],
            ].map(([t, d], i) => (
              <li key={t}>
                <p className="font-mono text-[12px] text-brand">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-2 text-[16px] font-semibold text-ink">{t}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-line py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="max-w-2xl font-display text-3xl tracking-[-0.02em] text-ink">Built for rooms where a wrong word costs someone something.</h2>
          <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            {environments.map(w => (
              <Link key={w.t} to="/demo" className="bg-surface p-6 hover:bg-subtle">
                <w.icon size={20} strokeWidth={1.6} className="text-brand" />
                <h3 className="mt-4 text-[16px] font-semibold text-ink">{w.t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{w.d}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold text-brand">Run this scenario <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-line py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl tracking-[-0.02em] text-ink">Capabilities that sit between the words and the outcome.</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Policy engine', 'Mode computed per encounter — jurisdiction, setting, tier, language pair, availability.'],
              ['Quality', 'Segment-level flags for numbers, negations, dosages, and missed terms, with human takeover.'],
              ['Evidence', 'Decisions, consents, flags, and corrections written in order and exportable.'],
              ['Security posture', 'Tenant isolation and retention are designed in. Independent certifications have not been obtained.'],
              ['Context', 'Glossaries and prep packs travel with the session so terminology survives a handoff.'],
              ['Human network', 'Credentialed interpreters, assignment, and an interpreter channel that can see the AI draft.'],
            ].map(([t, d]) => (
              <div key={t} className="border-t border-line pt-5">
                <h3 className="text-[16px] font-semibold text-ink">{t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="max-w-3xl font-display text-3xl leading-snug text-ink">“We stopped guessing whether an encounter was too important for AI.”</p>
          <p className="mt-4 text-[14px] text-muted">Illustrative quote for the demonstration cohort — not an endorsement from a real customer.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => nav('/demo')} className="inline-flex h-11 items-center justify-center gap-2 bg-brand px-5 text-[14px] font-semibold text-white hover:bg-brand-hover">
              Prove it on a hard encounter <ArrowRight size={16} />
            </button>
            <Link to="/customers" className="inline-flex h-11 items-center justify-center px-5 text-[14px] font-semibold text-brand">Read demonstration scenarios</Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
