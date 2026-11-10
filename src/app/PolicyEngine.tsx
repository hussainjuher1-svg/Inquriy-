import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, ShieldAlert, CircleCheck, Info, ChevronDown, ExternalLink, Scale, Workflow,
  FileWarning, UserRoundCheck, Hourglass, CalendarClock, FileSignature, Sparkles, Gavel,
} from 'lucide-react';
import {
  DEFAULT_RULES, TIER_META, MODE_META, decide, computeRisk, RISK_SIGNALS,
  type PolicyRule, type Tier, type Mode, type Setting, type Jurisdiction, type LanguagePair,
} from '../lib/policy';
import ModeBadge from '../components/ModeBadge';
import RiskGauge from '../components/RiskGauge';
import { useStore } from '../lib/store';

const SETTINGS: Setting[] = ['Clinic', 'Legal aid', 'School', 'City services', 'Benefits office', 'Intake call center'];
const JURISDICTIONS: Jurisdiction[] = ['Federal (HHS §1557)', 'Ohio', 'California', 'Texas', 'New York', 'English (UK)'];
const PAIRS: LanguagePair[] = ['English ↔ Spanish', 'English ↔ Arabic', 'English ↔ Mandarin', 'English ↔ Vietnamese', 'English ↔ Haitian Creole'];

type Tab = 'calculator' | 'risk' | 'rules';

export default function PolicyEngine() {
  const { log, toast } = useStore();
  const [tab, setTab] = useState<Tab>('calculator');
  const [rules, setRules] = useState<PolicyRule[]>(DEFAULT_RULES);
  const [expanded, setExpanded] = useState<Tier | null>('T2');

  // Calculator state
  const [cSetting, setCSetting] = useState<Setting>('Clinic');
  const [cTier, setCTier] = useState<Tier>('T2');
  const [cPair, setCPair] = useState<LanguagePair>('English ↔ Spanish');
  const [cJuris, setCJuris] = useState<Jurisdiction>('Federal (HHS §1557)');
  const [cAvail, setCAvail] = useState(true);
  const [decision, setDecision] = useState(() => decide({ setting: 'Clinic', tier: 'T2', pair: 'English ↔ Spanish', jurisdiction: 'Federal (HHS §1557)', availability: true }, DEFAULT_RULES));

  // Override state
  const [overrideReason, setOverrideReason] = useState('');
  const [overridden, setOverridden] = useState(false);

  // Risk scorer state
  const [rSetting, setRSetting] = useState<Setting>('Clinic');
  const [signals, setSignals] = useState<string[]>(['dosage']);
  const risk = useMemo(() => computeRisk(rSetting, signals), [rSetting, signals]);

  const runDecision = () => {
    const d = decide({ setting: cSetting, tier: cTier, pair: cPair, jurisdiction: cJuris, availability: cAvail }, rules);
    setDecision(d);
    setOverridden(false);
    setOverrideReason('');
    log('policy.decision', d.decisionId, `${cSetting} · ${cTier} · ${cPair} · ${cJuris} · availability=${cAvail} → ${d.primaryMode}${d.blocked ? ' (BLOCKED — fail-safe)' : ''}`, d.blocked ? 'escalated' : 'success');
    toast({ title: d.blocked ? 'Fail-safe engaged' : 'Policy decision logged', body: d.blocked ? 'Required human unavailable — AI-only fallback refused.' : `${d.decisionId} · ${MODE_META[d.primaryMode].label} · chained to audit log`, tone: d.blocked ? 'warn' : 'ok' });
  };

  const applyRiskToCalc = () => {
    setCSetting(rSetting);
    setCTier(risk.tier);
    setTab('calculator');
    toast({ title: 'Risk applied to calculator', body: `Tier set to ${risk.tier} from signals. Review and run the decision.`, tone: 'info' });
  };

  const submitOverride = () => {
    if (overrideReason.trim().length < 12) { toast({ title: 'Reason required', body: 'Override reasons must be at least 12 characters and are countersigned by a supervisor.', tone: 'danger' }); return; }
    setOverridden(true);
    log('policy.override', decision.decisionId, `T2 override recorded: “${overrideReason.trim()}” · supervisor countersign pending`, 'escalated');
    toast({ title: 'Override recorded', body: 'Reason chained to the audit log. Supervisor countersign required within 24h.', tone: 'warn' });
  };

  const ruleByTier = (t: Tier) => rules.find(r => r.tier === t)!;

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-pine-deep"><Gavel size={12} /> Policy Engine · ADR-001/002/005</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight">Risk-appropriate routing, codified</h1>
          <p className="mt-1 text-[12px] text-slate-ink max-w-2xl">Defaults are editable, sourced, dated data — <span className="font-semibold text-amber-800">needs legal review</span>. Not legal advice. Change a default and every downstream decision follows.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 inline-flex flex-wrap gap-1 rounded-2xl border border-line bg-white p-1.5 card-shadow">
        {([['calculator', 'Mode Calculator', Calculator], ['risk', 'Risk Scorer', Workflow], ['rules', 'Rule Editor', Scale]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[12.5px] font-bold transition-all ${tab === id ? 'bg-ink text-white shadow' : 'text-slate-ink hover:bg-parch'}`}><Icon size={15} />{label}</button>
        ))}
      </div>

      {/* ============ MODE CALCULATOR ============ */}
      {tab === 'calculator' && (
        <div className="mt-4 grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-line bg-white p-6 card-shadow">
            <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-ink">Inputs</h2>
            <div className="mt-4 space-y-4">
              <Select label="Setting" value={cSetting} onChange={v => setCSetting(v as Setting)} options={SETTINGS} />
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-ink">Tier</span>
                <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                  {(['T0', 'T1', 'T2', 'T3'] as Tier[]).map(t => (
                    <button key={t} onClick={() => setCTier(t)} className={`rounded-xl border py-2.5 font-mono text-[12px] font-bold transition-all ${cTier === t ? 'border-ink bg-ink text-white shadow' : 'border-line bg-parch/50 text-slate-ink hover:border-line2'}`}>{t}</button>
                  ))}
                </div>
              </div>
              <Select label="Language pair" value={cPair} onChange={v => setCPair(v as LanguagePair)} options={PAIRS} />
              <Select label="Jurisdiction" value={cJuris} onChange={v => setCJuris(v as Jurisdiction)} options={JURISDICTIONS} />
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-ink">Interpreter availability</span>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5 rounded-xl border border-line bg-parch/50 p-1">
                  {[['true', 'Available now'], ['false', 'Unavailable']].map(([v, l]) => (
                    <button key={v} onClick={() => setCAvail(v === 'true')} className={`rounded-lg py-2.5 text-[12px] font-bold transition-all ${String(cAvail) === v ? 'bg-white shadow text-ink' : 'text-slate-ink'}`}>{l}</button>
                  ))}
                </div>
              </div>
              <button onClick={runDecision} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-pine-deep py-3.5 text-[13px] font-black text-white hover:bg-pine-deep2 transition-colors"><Calculator size={16} />Evaluate policy decision</button>
            </div>
          </div>

          {/* Decision output */}
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-line bg-ink text-white overflow-hidden card-shadow flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-teal-300">Decision · {decision.decisionId}</p>
              <p className="font-mono text-[9px] text-white/40">{new Date(decision.evaluatedAt).toLocaleTimeString()} · chained</p>
            </div>
            <div className="p-6 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">Route to</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="font-display text-2xl sm:text-3xl font-semibold text-[#e5c878]">{MODE_META[decision.primaryMode].label}</span>
                <ModeBadge mode={decision.primaryMode} light />
              </div>
              {decision.blocked ? (
                <div className="mt-4 rounded-2xl border border-rose-400/40 bg-rose-500/12 p-4">
                  <p className="flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-rose-300"><ShieldAlert size={15} />Fail-safe engaged — AI-only refused</p>
                  <ul className="mt-2 space-y-1.5">{decision.failsafe.map((f, i) => <li key={i} className="flex items-start gap-2 text-[11.5px] leading-snug text-rose-100/85"><span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-400" />{f}</li>)}</ul>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => toast({ title: 'Added to interpreter waitlist', body: 'Next qualified monitor ETA 6–9 min (simulated queue).', tone: 'info' })} className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-bold hover:bg-white/15"><Hourglass size={13} />Waitlist next human</button>
                    <button onClick={() => toast({ title: 'Callback scheduled', body: 'Participant will receive a callback link in their language.', tone: 'info' })} className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-bold hover:bg-white/15"><CalendarClock size={13} />Schedule callback</button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[12px] text-white/60 leading-relaxed">Permitted modes for this context: <span className="font-semibold text-white/85">{decision.allowedModes.map(m => MODE_META[m].label).join(' · ')}</span></p>
              )}
              <div className="mt-5 grid sm:grid-cols-2 gap-3 text-[11px] leading-snug">
                {[['Credentials', decision.rule.credentials], ['Disclosure', decision.rule.disclosure], ['Consent', decision.rule.consent], ['Retention', decision.rule.retention], ['Escalation', decision.rule.escalation]].map(([k, v]) => (
                  <div key={k as string} className="rounded-xl border border-white/10 bg-white/[.04] p-3"><p className="font-mono text-[8.5px] uppercase tracking-[0.18em] text-teal-300/80">{k}</p><p className="mt-1 text-white/80">{v}</p></div>
                ))}
              </div>
              {decision.notes.length > 0 && <div className="mt-4 space-y-1.5">{decision.notes.map((n, i) => <p key={i} className="flex items-start gap-1.5 text-[10.5px] text-amber-200/90"><Info size={12} className="mt-0.5 shrink-0" />{n}</p>)}</div>}

              {/* Override path (T2 only) */}
              {!decision.blocked && decision.overrideAllowed && !overridden && (
                <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-[0.16em] text-amber-300"><FileSignature size={12} />Supervisor override (T2 only — never T3)</p>
                  <textarea value={overrideReason} onChange={e => setOverrideReason(e.target.value)} rows={2} placeholder="Documented reason, e.g. “No Spanish monitor on channel; clinician explicitly accepted monitored-AI-only for this 6-min refill discussion; supervisor notified by page…”" className="mt-2 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[11.5px] text-white placeholder-white/30 outline-none focus:border-amber-400/60" />
                  <button onClick={submitOverride} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-400 px-4 py-2 text-[11px] font-black text-[#2a1e08] hover:bg-amber-300"><FileSignature size={13} />Record override + request countersign</button>
                </div>
              )}
              {overridden && <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-[11.5px] font-semibold text-amber-200"><CircleCheck size={15} />Override recorded and chained — see Evidence & Audit.</p>}

              <p className="mt-5 border-t border-white/10 pt-4 font-mono text-[8.5px] leading-relaxed text-white/35">Source: {decision.rule.source}<br />Effective {decision.rule.effectiveDate} · Reviewer: {decision.rule.reviewer} · needs_legal_review: true<br />Not legal advice. Governing in this workspace as versioned, editable data.</p>
            </div>
          </div>
        </div>
      )}

      {/* ============ RISK SCORER ============ */}
      {tab === 'risk' && (
        <div className="mt-4 grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7 rounded-2xl border border-line bg-white p-6 card-shadow">
            <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-ink">Encounter risk signals</h2>
            <Select label="Setting" value={rSetting} onChange={v => setRSetting(v as Setting)} options={SETTINGS} className="mt-4" />
            <div className="mt-4 space-y-2">
              {RISK_SIGNALS.map(s => {
                const active = signals.includes(s.id);
                return (
                  <button key={s.id} onClick={() => setSignals(prev => active ? prev.filter(x => x !== s.id) : [...prev, s.id])} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${active ? 'border-pine bg-pine-mist ' : 'border-line bg-parch/40 hover:border-line2'}`}>
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${active ? 'border-pine bg-pine text-white' : 'border-line2 bg-white'}`}>{active && <CircleCheck size={14} />}</span>
                    <span className="flex-1"><span className="block text-[12px] font-bold text-ink">{s.label} <span className="font-mono text-[10px] text-pine-deep">+{s.weight}</span></span><span className="block text-[10.5px] text-slate-ink">{s.detail}</span></span>
                  </button>
                );
              })}
            </div>
            <button onClick={applyRiskToCalc} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-3 text-[12px] font-bold text-white hover:bg-spruce-850"><Sparkles size={15} />Apply score to Mode Calculator</button>
          </div>
          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-line bg-white p-6 card-shadow flex flex-col items-center justify-center">
            <RiskGauge score={risk.score} size={170} />
            <p className="mt-4 font-display text-2xl font-semibold">{TIER_META[risk.tier].name}</p>
            <ul className="mt-4 w-full max-w-xs space-y-1.5">
              {risk.reasons.map((r, i) => <li key={i} className="flex items-center gap-2 font-mono text-[10px] text-slate-ink"><span className="h-1 w-1 rounded-full bg-brass-deep" />{r}</li>)}
            </ul>
            <p className="mt-4 text-center text-[10.5px] text-slate-ink max-w-[280px]">Score ≥ 58 ⇒ T3 (rights-affecting · human-only). ≥ 34 ⇒ T2 · ≥ 18 ⇒ T1 · else T0. Thresholds are workspace-editable data, not law.</p>
          </div>
        </div>
      )}

      {/* ============ RULE EDITOR ============ */}
      {tab === 'rules' && (
        <div className="mt-4 space-y-3">
          <p className="flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-3xl"><FileWarning size={15} className="mt-0.5 shrink-0" />These defaults are reference starting points requiring legal review in your jurisdiction. Editing them creates a new policy version chained into the audit log — decisions made before the change remain bound to the rule version in force at the time.</p>
          {DEFAULT_RULES.map(rule => {
            const isOpen = expanded === rule.tier;
            const current = ruleByTier(rule.tier);
            return (
              <div key={rule.tier} className="overflow-hidden rounded-2xl border border-line bg-white card-shadow">
                <button onClick={() => setExpanded(isOpen ? null : rule.tier)} className="flex w-full items-center gap-4 px-5 sm:px-6 py-4 text-left">
                  <span className={`rounded-lg border px-2.5 py-1.5 font-mono text-[11px] font-black ${TIER_META[rule.tier].tone}`}>{rule.tier}</span>
                  <div className="min-w-0 flex-1"><p className="text-[13.5px] font-bold">{rule.name} <span className="font-medium text-slate-ink">— {rule.definition}</span></p>
                    <p className="mt-0.5 font-mono text-[9px] text-slate-ink/80 truncate">sources: {rule.source.split(';')[0]} · needs_legal_review: {String(rule.needsLegalReview)}</p></div>
                  <ChevronDown size={18} className={`shrink-0 text-slate-ink transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>{isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden border-t border-line">
                    <div className="grid md:grid-cols-2 gap-4 p-5 sm:p-6">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-ink">Allowed modes (editable)</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">{(['AI_ONLY', 'AI_WITH_HUMAN_MONITOR', 'HUMAN_PRIMARY_AI_ASSIST', 'HUMAN_ONLY'] as Mode[]).map(m => (
                          <button key={m} onClick={() => {
                            setRules(prev => prev.map(r => r.tier !== rule.tier ? r : {
                              ...r,
                              modes: r.modes.includes(m) ? r.modes.filter(x => x !== m) : [...r.modes, m],
                            }));
                            log('policy.rule.edit', `rule_${rule.tier}`, `${rule.tier} allowed modes toggled: ${m}`, 'escalated');
                            toast({ title: 'Rule edited', body: `${rule.tier} modes updated — chained as new policy version.`, tone: 'warn' });
                          }} className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition-all ${current.modes.includes(m) ? MODE_META[m].tone + ' ring-1 ring-current' : 'border-line bg-parch/40 text-slate-ink opacity-55'}`}>{MODE_META[m].label}</button>
                        ))}</div>
                        <div className="mt-4 rounded-xl border border-line bg-parch/50 p-3 text-[10.5px] leading-snug text-slate-ink"><p className="font-black text-[9px] uppercase tracking-[0.18em]">Consent requirement</p><p className="mt-1">{current.consent}</p></div>
                      </div>
                      <div className="space-y-3 text-[11px]">
                        <Field label="Credentials" v={current.credentials} />
                        <Field label="Disclosure" v={current.disclosure} />
                        <Field label="Retention" v={current.retention} />
                        <Field label="Escalation triggers" v={current.escalation} />
                        <div className="rounded-xl border border-line p-3">
                          <p className="font-black text-[9px] uppercase tracking-[0.18em] text-slate-ink">Source</p>
                          <p className="mt-1 text-ink leading-snug">{current.source}</p>
                          <a href={current.sourceUrl.startsWith('http') ? current.sourceUrl : '#'} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 font-mono text-[9.5px] text-pine-deep hover:underline break-all">{current.sourceUrl}<ExternalLink size={11} /></a>
                          <p className="mt-1.5 font-mono text-[8.5px] text-slate-ink">Effective {current.effectiveDate} · {current.reviewer}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}</AnimatePresence>
              </div>
            );
          })}
          <button onClick={() => { setRules(DEFAULT_RULES); log('policy.rules.reset', 'policy_suite', 'All tier rules restored to reference defaults', 'info'); toast({ title: 'Defaults restored', tone: 'info' }); }} className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-ink hover:text-ink"><UserRoundCheck size={13} />Reset to reference defaults</button>
        </div>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options, className = '' }: { label: string; value: string; onChange: (v: string) => void; options: string[]; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-ink">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-parch/40 px-4 py-3 text-[13px] font-semibold text-ink outline-none focus:border-pine">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
function Field({ label, v }: { label: string; v: string }) {
  return <div className="rounded-xl border border-line p-3"><p className="font-black text-[9px] uppercase tracking-[0.18em] text-slate-ink">{label}</p><p className="mt-1 text-ink leading-snug">{v}</p></div>;
}
