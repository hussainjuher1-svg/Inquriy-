import { useMemo, useState } from 'react';
import {
  BarChart3, BookOpenCheck, FlaskConical, CircleCheck, CircleDashed, Flag, Plus, X, CheckCheck,
  ChevronDown, ListFilter,
} from 'lucide-react';
import { glossaries, latencyBars, modeDistribution } from '../lib/data';
import { useStore } from '../lib/store';

interface ReviewItem {
  id: string; session: string; pair: string; segment: string; issue: string; severity: 'high' | 'medium' | 'low'; status: 'pending' | 'resolved';
}
const SEED_REVIEW: ReviewItem[] = [
  { id: 'rev_01', session: 'ses_9f3k2', pair: 'en↔es', segment: 'seg4 “…50 miligramos…”', issue: 'Numeric mismatch (500→50 mg)', severity: 'high', status: 'pending' },
  { id: 'rev_02', session: 'ses_2m8x1', pair: 'en↔ar', segment: 'seg2 “benefit suspension date…”', issue: 'Date rendering ambiguous in Arabic numeral context', severity: 'medium', status: 'pending' },
  { id: 'rev_03', session: 'ses_6y2h7', pair: 'en↔es', segment: 'seg11 “consentimiento…”', issue: 'Omission of negation cue in back-translation', severity: 'medium', status: 'resolved' },
  { id: 'rev_04', session: 'ses_7p1q4', pair: 'en↔zh', segment: 'seg2 “appointment reminder”', issue: 'Fluency: register too formal for participant', severity: 'low', status: 'resolved' },
];

export default function Quality() {
  const { log, toast } = useStore();
  const [tab, setTab] = useState<'overview' | 'glossaries' | 'review'>('overview');
  const [review, setReview] = useState(SEED_REVIEW);
  const [openGlossary, setOpenGlossary] = useState(glossaries[0].id);
  const [terms, setTerms] = useState(glossaries[0].sample);
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const evalRows = [
    { metric: 'WER (es-US, clinical)', value: '6.8%', note: 'golden set: 240 clinical encounters · uncalibrated' },
    { metric: 'chrF++ (es-US)', value: '71.4', note: 'vs. reference translations · n=240 · uncalibrated' },
    { metric: 'Numeric accuracy (dosage)', value: '97.1%', note: '1,900 synthetic stress segments · MEASURED (simulated adapters)' },
    { metric: 'Negation detection recall', value: '88.5%', note: 'flagged 77/87 planted negations · uncalibrated' },
    { metric: 'Term accuracy (glossary pairs)', value: '93.2%', note: '214 glossary terms in context · n=640 · uncalibrated' },
    { metric: 'Caption latency p50 / p95', value: '1.41s / 2.83s', note: 'target ≤1.5s / ≤3s · HYPOTHESIS until real-provider run' },
  ];

  const pending = review.filter(r => r.status === 'pending').length;

  const resolve = (id: string) => {
    setReview(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
    const item = review.find(r => r.id === id);
    log('quality.review.resolve', item?.session ?? id, `Reviewer resolved: ${item?.issue}`, 'success');
    toast({ title: 'Label recorded', body: 'Feeds the golden dataset; model regressions will be blocked on this signal.', tone: 'ok' });
  };

  const addTerm = () => {
    if (!newSource.trim() || !newTarget.trim()) return;
    setTerms(t => [...t, { source: newSource.trim(), target: newTarget.trim() }]);
    log('glossary.term.add', openGlossary, `Added “${newSource.trim()}” → “${newTarget.trim()}”`, 'success');
    toast({ title: 'Glossary term added', body: 'Future sessions with this glossary will constrain translation to it.', tone: 'ok' });
    setNewSource(''); setNewTarget('');
  };

  const maxMs = Math.max(...latencyBars.map(b => b.ms));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-pine-deep"><FlaskConical size={12} /> Quality · D2 · Phase 3</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight">Measured, labeled, gated</h1>
          <p className="mt-1 text-[12px] text-slate-ink max-w-2xl">Every provider, model, or prompt change runs against golden sets per language/domain. Regressions block release. All scores below are <strong>uncalibrated</strong> until human QA signs off.</p>
        </div>
        {pending > 0 && <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-[11px] font-black text-amber-900"><Flag size={13} />{pending} flag{pending > 1 ? 's' : ''} awaiting reviewer</span>}
      </div>

      <div className="mt-5 inline-flex flex-wrap gap-1 rounded-2xl border border-line bg-white p-1.5 card-shadow">
        {([['overview', 'Evaluation snapshot', BarChart3], ['glossaries', 'Glossaries & prep packs', BookOpenCheck], ['review', `Review queue (${pending})`, ListFilter]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-bold transition-all ${tab === id ? 'bg-ink text-white' : 'text-slate-ink hover:bg-parch'}`}><Icon size={15} />{label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="mt-4 grid grid-cols-12 gap-4">
          {/* Scorecard */}
          <section className="col-span-12 lg:col-span-7 rounded-2xl border border-line bg-white card-shadow overflow-hidden">
            <div className="border-b border-line px-5 py-3.5 flex items-center justify-between"><h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-ink">Golden-set evaluation · release gate</h2><span className="font-mono text-[9px] text-brass-deep font-bold">PASS · margin +2.1 pts</span></div>
            <div className="divide-y divide-line/70">
              {evalRows.map((r, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-3">
                  <div><p className="text-[12.5px] font-bold text-ink">{r.metric}</p><p className="text-[9.5px] font-mono text-slate-ink mt-0.5">{r.note}</p></div>
                  <p className="self-center font-mono text-[13px] font-bold text-pine-deep">{r.value}</p>
                </div>
              ))}
            </div>
            <p className="border-t border-line bg-parch/50 px-5 py-2.5 font-mono text-[8.5px] text-slate-ink">eval run eval_2207 · golden sets v0.4 · last full gate: 2026-10-27 · regression tolerance ±1.5 pts · <strong>uncalibrated</strong></p>
          </section>

          {/* Latency budget + mode mix */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
            <section className="rounded-2xl border border-line bg-white p-5 card-shadow">
              <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-ink">Per-stage latency · simulated adapters</h2>
              <div className="mt-3 space-y-2">
                {latencyBars.map(b => (
                  <div key={b.stage} className="flex items-center gap-2">
                    <span className="w-20 text-[10px] font-bold text-slate-ink">{b.stage}</span>
                    <div className="h-4 flex-1 rounded bg-parch overflow-hidden"><div className="h-full rounded bg-gradient-to-r from-pine to-teal-500" style={{ width: `${(b.ms / maxMs) * 100}%` }} /></div>
                    <span className="w-12 text-right font-mono text-[9px] font-bold text-ink">{b.ms}ms</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="flex-1 rounded-2xl border border-line bg-white p-5 card-shadow">
              <h2 className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-ink">Routing outcomes · 30 days</h2>
              <div className="mt-3 space-y-2.5">
                {modeDistribution.map(m => (
                  <div key={m.mode}>
                    <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-ink"><span>{m.mode}</span><span className="font-mono">{m.pct}%</span></div>
                    <div className="mt-1 h-2.5 rounded-full bg-parch overflow-hidden"><div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} /></div>
                  </div>
                ))}
              </div>
              <p className="mt-3 font-mono text-[8.5px] text-slate-ink">sample: 242 sessions · self-reported setting tags · uncalibrated</p>
            </section>
          </div>
        </div>
      )}

      {tab === 'glossaries' && (
        <div className="mt-4 grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4 space-y-2">
            {glossaries.map(g => (
              <button key={g.id} onClick={() => { setOpenGlossary(g.id); setTerms(g.sample); }} className={`w-full rounded-2xl border p-4 text-left transition-all ${openGlossary === g.id ? 'border-pine bg-pine-mist ring-1 ring-pine/40' : 'border-line bg-white hover:border-line2'}`}>
                <p className="text-[12.5px] font-bold leading-snug">{g.name}</p>
                <p className="mt-1 font-mono text-[9px] text-slate-ink">{g.pair.replace('English ↔ ', 'en↔')} · {g.domain} · {g.terms} terms</p>
                <p className="mt-1 text-[9px] text-slate-ink/70">updated {g.updated} · owner {g.owner}</p>
              </button>
            ))}
          </div>
          <div className="col-span-12 md:col-span-8 rounded-2xl border border-line bg-white card-shadow overflow-hidden">
            <div className="border-b border-line px-5 py-3.5 flex items-center justify-between"><h2 className="text-[11px] font-black uppercase tracking-[0.18em]">Terms — {glossaries.find(g => g.id === openGlossary)?.name}</h2><span className="font-mono text-[9px] text-slate-ink">constrains MT + informs back-translation</span></div>
            <div className="divide-y divide-line/70">
              {terms.map((t, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center px-5 py-3">
                  <p className="text-[12px] font-semibold text-ink">{t.source}</p>
                  <span className="font-mono text-[10px] text-pine">→</span>
                  <div><p className="text-[12px] text-pine-deep font-semibold">{t.target}</p>{t.note && <p className="text-[9px] text-amber-800">{t.note}</p>}</div>
                </div>
              ))}
            </div>
            <div className="border-t border-line bg-parch/50 p-4 flex flex-wrap gap-2">
              <input value={newSource} onChange={e => setNewSource(e.target.value)} placeholder="Source term (en)" className="h-11 flex-1 min-w-[140px] rounded-xl border border-line bg-white px-3 text-[12.5px] outline-none focus:border-pine" aria-label="Source term" />
              <input value={newTarget} onChange={e => setNewTarget(e.target.value)} placeholder="Target term" className="h-11 flex-1 min-w-[140px] rounded-xl border border-line bg-white px-3 text-[12.5px] outline-none focus:border-pine" aria-label="Target term" />
              <button onClick={addTerm} className="h-11 inline-flex items-center gap-1.5 rounded-xl bg-ink px-5 text-[12px] font-bold text-white"><Plus size={15} />Add term</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'review' && (
        <div className="mt-4 grid grid-cols-12 gap-4">
          <section className="col-span-12 lg:col-span-7 rounded-2xl border border-line bg-white card-shadow overflow-hidden">
            <div className="border-b border-line px-5 py-3.5 flex items-center justify-between"><h2 className="text-[11px] font-black uppercase tracking-[0.18em]">Human review queue</h2><span className="font-mono text-[9px] text-slate-ink">labels feed golden sets · block regressions</span></div>
            <div className="divide-y divide-line/70">
              {review.map(r => (
                <div key={r.id} className="flex items-start gap-3 px-5 py-4">
                  <span className={`mt-0.5 rounded-md border px-2 py-1 font-mono text-[9px] font-black uppercase ${r.severity === 'high' ? 'border-rose-200 bg-rose-50 text-rose-700' : r.severity === 'medium' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-sky-200 bg-sky-50 text-sky-700'}`}>{r.severity}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-ink leading-snug">{r.issue}</p>
                    <p className="mt-0.5 font-mono text-[9px] text-slate-ink">{r.session} · {r.pair} · {r.segment}</p>
                  </div>
                  {r.status === 'pending'
                    ? <button onClick={() => resolve(r.id)} className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-pine bg-pine-mist px-3 py-2 text-[10.5px] font-bold text-pine-deep hover:bg-pine-soft"><CheckCheck size={13} />Resolve</button>
                    : <span className="shrink-0 inline-flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-700"><CircleCheck size={14} />Labeled</span>}
                </div>
              ))}
            </div>
          </section>
          <aside className="col-span-12 lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-line bg-white p-5 card-shadow">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-ink">Rubric (human labels)</p>
              <ul className="mt-2.5 space-y-1.5 text-[11.5px] text-slate-ink">
                {['Accuracy — meaning preserved?', 'Omission / addition — anything dropped or invented?', 'Terminology — glossary honored?', 'Fluency — natural in target language?', 'Severity — none · minor · major · critical'].map(r => <li key={r} className="flex items-start gap-2"><CircleDashed size={13} className="mt-0.5 shrink-0 text-pine" />{r}</li>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 card-shadow">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-ink">Release gate policy</p>
              <p className="mt-2 text-[12px] leading-relaxed text-ink">A provider/model/prompt change ships only if: <strong>no golden-set metric regresses &gt; 1.5 pts</strong>, numeric-accuracy ≥ 96% on dosage stress set, and reviewer-confirmed critical-miss count = 0.</p>
              <p className="mt-2 font-mono text-[9px] text-brass-deep">multi-model cross-check (R1): kept only if it measurably improves error detection per cost — currently unproven, so it stays OFF.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
