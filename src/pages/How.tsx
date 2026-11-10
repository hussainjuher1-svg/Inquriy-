import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import SiteLayout, { MarketingHero } from '../components/SiteLayout';
import { ClaimTag } from '../components/ui';

const STAGES = [
  { stage: 'VAD', ms: 24, note: 'Voice activity detection' },
  { stage: 'ASR', ms: 640, note: 'Streaming speech → text' },
  { stage: 'Segment', ms: 30, note: 'Turn-taking and boundaries' },
  { stage: 'Translate', ms: 890, note: 'Contextual MT + glossary' },
  { stage: 'Quality', ms: 210, note: 'Numeric, negation, dosage checks' },
  { stage: 'TTS', ms: 720, note: 'Neural voice render' },
];

const FAQ = [
  { q: 'Is Intevaris a replacement for human interpreters?', a: 'No. It is meant to reduce unnecessary human use on T0/T1 encounters and require humans where rules or risk demand T2/T3. Interpreters remain the authority in rights-affecting moments.' },
  { q: 'Who holds encryption keys in this project?', a: 'This demonstration has no production key management. The intended architecture is per-tenant data keys with tenant control. It is not marketed as zero-knowledge.' },
  { q: 'What happens when no human interpreter is available?', a: 'Fail-safe: never silent AI fallback when a human is required. The engine offers waitlist, callback, or a T2 override with a recorded reason. T3 cannot override to AI-only.' },
  { q: 'Are the legal defaults actually law?', a: 'No. Defaults are editable, sourced, dated data flagged needs_legal_review. Citations are starting points. Intevaris is not legal advice.' },
  { q: 'What about accuracy and latency claims?', a: 'Only MEASURED items may be treated as evidence. Latency figures on this page are simulated-adapter hypotheses until real-provider runs exist.' },
  { q: 'Does the participant install anything?', a: 'The intended join path is a QR or link. This workspace simulates that path; it does not run a production join service.' },
];

export default function How() {
  const [open, setOpen] = useState(0);
  return (
    <SiteLayout>
      <MarketingHero kicker="How it works" title="From encounter context to a sealed record.">
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">One session, a small number of stages, no guesswork about who is allowed to interpret. The live workspace scripts this flow; it does not stream real audio.</p>
      </MarketingHero>

      <section className="border-b border-line py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-3">
          {[
            { n: '01', t: 'Join and consent', d: 'A host starts the encounter. The participant opens a link. Consent is captured in their language before interpretation begins, and the artifact is written to the record.' },
            { n: '02', t: 'Score and route', d: 'The policy engine decides the mode from tenant, jurisdiction, setting, tier, language pair, and availability. T3 rights-affecting work is human-only. The decision logs inputs and rule version.' },
            { n: '03', t: 'Monitor and seal', d: 'Quality checks run on segments. Flags can summon a human. Close writes an ordered pack of decisions, consents, flags, and corrections.' },
          ].map(s => (
            <div key={s.n}>
              <p className="font-mono text-[12px] text-brand">{s.n}</p>
              <h2 className="mt-2 font-display text-2xl text-ink">{s.t}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-line bg-subtle py-16">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl text-ink">The intended real-time pipeline</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">VAD → ASR → Segment → Translate → Quality → TTS. Names, numbers, dates, dosages, and negations get special-case checks because those are where translation harms people.</p>
            <div className="mt-6"><ClaimTag tag="HYPOTHESIS" /></div>
            <p className="mt-3 text-[14px] leading-relaxed text-muted">Latency figures below are simulated-adapter measurements, not production claims. Captions p50 ≤1.5s and speech p50 ≤3s remain targets until labeled MEASURED with method and sample size.</p>
          </div>
          <div className="panel p-6">
            <p className="text-[13px] font-medium text-ink">Stage budget · simulated adapters</p>
            <div className="mt-5 space-y-3">
              {STAGES.map(s => (
                <div key={s.stage} className="flex items-center gap-3">
                  <span className="w-24 text-[13px] font-semibold text-ink">{s.stage}</span>
                  <div className="h-5 flex-1 overflow-hidden bg-subtle">
                    <div className="h-full bg-brand" style={{ width: `${Math.min(100, s.ms / 9)}%` }} />
                  </div>
                  <span className="w-14 text-right font-mono text-[12px]">{s.ms}ms</span>
                </div>
              ))}
            </div>
            <p className="mt-5 border-t border-line pt-4 font-mono text-[12px] text-muted">Captions p50/p95 1.41s / 2.83s · Speech 2.6s / 4.7s · simulated n described in Quality</p>
          </div>
        </div>
      </section>

      <section className="border-b border-line py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="max-w-2xl font-display text-3xl text-ink">Escalation is a first-class path, not an exception.</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-5">
            {[
              ['Trigger', 'Low quality, missed term, numeric mismatch, “I don’t understand”, distress, tier change, or host request.'],
              ['Flag', 'The segment is tagged with a reason. Host and monitor are notified. The participant sees a calm indicator, not an alarm wall.'],
              ['Handoff', 'The interpreter receives transcript tail, glossary hits, flags, and why now.'],
              ['Takeover', 'The interpreter speaks. AI goes silent or assist-only. Corrections log authorship.'],
              ['Hand back', 'Context persists. The session continues under the current tier policy.'],
            ].map(([t, d], i) => (
              <li key={t}>
                <p className="font-mono text-[12px] text-brand">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-2 text-[15px] font-semibold">{t}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-b border-line bg-subtle py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-3xl text-ink">Architecture as proposed, not as hosted here</h2>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted">This repository is a React demonstration: policy logic runs in the browser; audit events persist in localStorage. The intended production shape is a modular control plane with a separate real-time pipeline and provider-neutral adapters. That hosting is not present in this build.</p>
          <pre className="panel mt-8 overflow-x-auto p-5 font-mono text-[12px] leading-relaxed text-ink">
{`policy decide --tier T2 --setting clinic --pair es-US
→ AI_WITH_HUMAN_MONITOR
fail_safe: human_required_if_monitor_unavailable
rule_source: HHS §1557 (needs_legal_review)`}
          </pre>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display text-3xl text-ink">Questions counsel asks</h2>
          <div className="mt-8 divide-y divide-line border border-line bg-surface">
            {FAQ.map((item, i) => (
              <div key={item.q}>
                <button onClick={() => setOpen(open === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left" aria-expanded={open === i}>
                  <span className="text-[15px] font-semibold">{item.q}</span>
                  <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${open === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="px-5 pb-5 text-[14px] leading-relaxed text-muted">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
