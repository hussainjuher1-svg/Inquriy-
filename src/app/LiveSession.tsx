import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hand, Mic, MicOff, Volume2, Pause, Flag, CheckCheck, X, UserRound, Languages,
  ShieldCheck, FileText, Download, CircleCheck, QrCode, PhoneOff, Repeat2, Users, Radio,
} from 'lucide-react';
import ModeBadge from '../components/ModeBadge';
import { useStore } from '../lib/store';

type Phase = 'consent' | 'live' | 'takeover' | 'sealed';
type Speaker = 'provider' | 'participant' | 'interpreter' | 'ai';
interface Segment { id: string; speaker: Speaker; en: string; es?: string; flag?: { type: string; detail: string }; corrected?: string }

const SCRIPT: Segment[] = [
  { id: 'seg1', speaker: 'provider', en: 'Good morning, Maria. Let’s review your new medication together.', es: 'Buenos días, María. Revisemos juntas su nuevo medicamento.' },
  { id: 'seg2', speaker: 'participant', en: 'Okay doctor. The headaches have been better this week.', es: 'Está bien, doctor. Los dolores de cabeza han mejorado esta semana.' },
  { id: 'seg3', speaker: 'provider', en: 'Good to hear. I’m prescribing metformin — 500 milligrams, twice a day, with breakfast and dinner.', es: 'Qué gusto oírlo. Le receto metformina — 500 miligramos, dos veces al día, con el desayuno y la cena.' },
  { id: 'seg4', speaker: 'ai', en: '(AI render) “…50 milligrams, twice a day…”', es: '“…50 miligramos, dos veces al día…”', flag: { type: 'NUMERIC MISMATCH', detail: 'Back-translation detected 500 mg → 50 mg divergence on a dosage segment. Severity: high.' } },
  { id: 'seg5', speaker: 'participant', en: '¿Dos veces al día? Pensé que era solo una vez.', es: 'Twice a day? I thought it was just once.' },
  { id: 'seg6', speaker: 'ai', en: '(AI render) “No — it is taken twice, 12 hours apart.”', es: '“No — se toma dos veces, con 12 horas de diferencia.”', flag: { type: 'NEGATION RISK', detail: 'Negation + numeric content on a T2 dosage thread. Confidence 0.61 — below calibrated threshold.' } },
];

export default function LiveSession() {
  const nav = useNavigate();
  const { log, toast } = useStore();
  const [phase, setPhase] = useState<Phase>('consent');
  const [step, setStep] = useState(0); // segments revealed
  const [flags, setFlags] = useState<string[]>([]);
  const [handoff, setHandoff] = useState<number | null>(null); // seconds measured
  const [elapsed, setElapsed] = useState(0);
  const [aiMuted, setAiMuted] = useState(false);
  const [clarification, setClarification] = useState(false);
  const [correction, setCorrection] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(''); // typewriter buffer for current segment
  const scrollRef = useRef<HTMLDivElement>(null);
  const handoffStart = useRef<number | null>(null);

  const visible = SCRIPT.slice(0, step);
  const activeFlag = flags.length > 0 && phase !== 'sealed';

  // Session timer
  useEffect(() => {
    if (phase === 'live' || phase === 'takeover') {
      const t = setInterval(() => setElapsed(e => e + 1), 1000);
      return () => clearInterval(t);
    }
  }, [phase]);

  // Scripted reveal with typewriter effect
  useEffect(() => {
    if (phase !== 'live') return;
    if (step >= SCRIPT.length) return;
    const target = SCRIPT[step];
    const text = target.es ?? target.en;
    let i = 0;
    setStreaming('');
    const type = setInterval(() => {
      i += 3;
      setStreaming(text.slice(0, i));
      if (i >= text.length) clearInterval(type);
    }, 28);
    const advance = setTimeout(() => {
      setStep(s => s + 1);
      setStreaming('');
      if (target.flag && !flags.includes(target.id)) {
        setFlags(f => [...f, target.id]);
        handoffStart.current = Date.now();
        log('quality.flag', target.id, `${target.flag.type}: ${target.flag.detail}`, 'escalated');
        toast({ title: `Flag: ${target.flag.type}`, body: 'Monitor Daniela Ríos has the segment with full context.', tone: 'warn' });
      }
    }, 2400);
    return () => { clearInterval(type); clearTimeout(advance); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, step]);

  // Auto-scroll transcript
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [step, correction, clarification]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const recordConsent = () => {
    log('consent.record', 'ses_live_demo', 'Participant consent captured (es-US) · explicit tap · artifact cns_8801 sealed', 'success');
    log('session.start', 'ses_live_demo', 'T2 clinic · AI_WITH_HUMAN_MONITOR · Daniela Ríos on channel · glossary “Pediatrics Clinical Core” attached', 'success');
    toast({ title: 'Consent sealed — session live', body: 'Participant joined in 9s · no install · disclosure completed in Spanish.', tone: 'ok' });
    setPhase('live');
    setElapsed(412); // continuing from a live-ish state
  };

  const takeOver = () => {
    const measured = handoffStart.current ? Math.max(1, Math.round((Date.now() - handoffStart.current) / 100) / 10) : 8.1;
    setHandoff(measured);
    setAiMuted(true);
    setPhase('takeover');
    log('interpreter.takeover', 'ses_live_demo', `Daniela Ríos took over · handoff ${measured}s (target <10s) · AI set assist-only`, 'escalated');
    toast({ title: 'Interpreter has the floor', body: `AI muted · handoff measured at ${measured}s.`, tone: 'warn' });
  };

  const sendCorrection = () => {
    setCorrection('500 miligramos, dos veces al día — quisiera confirmar que entendió correctamente.');
    log('interpreter.correction', 'seg4', 'Daniela Ríos corrected dosage rendering: “500 mg twice daily” re-voiced + confirmed with participant', 'success');
    toast({ title: 'Correction voiced + logged', body: 'Participant confirmed understanding. Segment seg4 amended in evidence pack.', tone: 'ok' });
  };

  const askRepetition = () => {
    setClarification(true);
    log('host.clarification', 'ses_live_demo', 'Host requested participant repetition request — AI re-rendered seg5 at lower rate, es-US', 'info');
    toast({ title: 'Repetition requested', body: 'Last segment re-voiced in Spanish at 0.85× rate.', tone: 'info' });
    setTimeout(() => setClarification(false), 2600);
  };

  const handBack = () => {
    setAiMuted(false);
    setPhase('live');
    log('interpreter.handback', 'ses_live_demo', 'Daniela Ríos handed back to AI assist — monitor remains on channel', 'info');
    toast({ title: 'Handed back to AI', body: 'Monitor stays on channel for this T2 encounter.', tone: 'info' });
  };

  const endSession = () => {
    setPhase('sealed');
    log('session.close', 'ses_live_demo', 'Session closed · retention job scheduled (90d) · evidence pack sealed · billing event usage_88d2 logged', 'success');
    toast({ title: 'Session sealed', body: 'Evidence pack generated · retention job queued · usage metered.', tone: 'ok' });
  };

  const exportPack = () => {
    const pack = {
      evidence_pack_version: '1.0', session_id: 'ses_live_demo', sealed_at: new Date().toISOString(),
      tier: 'T2', mode: 'AI_WITH_HUMAN_MONITOR', pair: 'English ↔ Spanish', setting: 'Clinic',
      consent_artifact: 'cns_8801', glossary: 'Riverside Pediatrics — Clinical Core (214 terms)',
      segments: SCRIPT.map(s => ({ id: s.id, speaker: s.speaker, text: s.en, flag: s.flag ?? null })),
      corrections: correction ? [{ segment: 'seg4', author: 'Daniela Ríos (NBCMI CHI™)', text: correction, back_translation_verified: true }] : [],
      flags: flags.length, handoff_seconds_measured: handoff ?? 'n/a (no takeover)',
      audit_chain: 'sha256 · verify at /app/audit', disclaimer: 'Simulated demo environment. Not medical or legal advice.',
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' }));
    a.download = 'ses_live_demo_evidence_pack.json';
    a.click();
    log('evidence.pack.export', 'ses_live_demo', 'Live demo evidence pack exported', 'success');
  };

  const reset = () => { setPhase('consent'); setStep(0); setFlags([]); setHandoff(null); setElapsed(0); setAiMuted(false); setCorrection(null); handoffStart.current = null; };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1500px] mx-auto">
      {/* Header strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="relative grid h-11 w-11 place-items-center rounded-2xl bg-rose-500/15 border border-rose-300"><Radio size={20} className="text-rose-600" />{phase !== 'sealed' && <span className="live-dot absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500" />}</span>
          <div>
            <p className="font-mono text-[10px] text-pine-deep font-bold">ses_live_demo · T2 · Clinic · English ↔ Spanish</p>
            <h1 className="font-display text-xl sm:text-2xl font-semibold leading-tight">Guided live session — <span className="text-slate-ink">dosage counseling</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <ModeBadge mode={phase === 'takeover' || aiMuted ? 'HUMAN_PRIMARY_AI_ASSIST' : 'AI_WITH_HUMAN_MONITOR'} />
          <span className="rounded-xl border border-line bg-white px-3 py-2 font-mono text-[12px] font-bold tabular-nums">{mm}:{ss}</span>
          {phase !== 'sealed' && <button onClick={endSession} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-[11px] font-black text-rose-700 hover:bg-rose-100"><PhoneOff size={14} />End</button>}
        </div>
      </div>

      {/* ============ CONSENT GATE ============ */}
      {phase === 'consent' && (
        <div className="mt-6 grid lg:grid-cols-2 gap-5">
          <div className="rounded-3xl border border-line bg-white p-7 card-shadow">
            <div className="flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 text-xl font-black text-white">M</div>
              <div><p className="font-bold">María G. <span className="font-mono text-[10px] font-medium text-slate-ink">MRN-22941</span></p><p className="text-[11px] text-slate-ink">Joined via QR · no install · es-US</p></div>
            </div>
            <div className="mt-6 rounded-2xl border border-teal-200 bg-pine-mist p-5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-pine-deep">Aviso de consentimiento (se lee en voz alta)</p>
              <p className="mt-2 font-display text-[17px] leading-snug text-ink">“Esta consulta usa interpretación con inteligencia artificial supervisada por una persona. Su voz no se guarda por defecto. Usted puede pedir un intérprete humano en cualquier momento diciendo ‘necesito un intérprete’.”</p>
              <p className="mt-3 text-[11px] text-slate-ink">English: “This visit uses AI interpretation monitored by a person. Your voice isn’t kept by default. You can ask for a human interpreter any time.”</p>
            </div>
            <div className="mt-5 flex items-center gap-3"><span className="flex gap-0.5">{[0.5, 0.9, 0.7, 1, 0.6, 0.85, 0.45].map((h, i) => <span key={i} className="eq-bar h-6 w-1 rounded-full bg-pine/70" style={{ height: `${h * 24}px`, animationDelay: `${i * 0.11}s` }} />)}</span><span className="text-[11px] font-mono text-pine-deep">Disclosure played · 0:14</span></div>
            <button onClick={recordConsent} className="group mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-pine-deep py-4 text-[14px] font-black text-white hover:bg-pine-deep2 transition-colors"><ShieldCheck size={18} />Record explicit consent & begin <span className="font-mono text-[10px] font-bold text-teal-200">cns_8801</span></button>
          </div>
          <div className="rounded-3xl bg-spruce-950 text-white p-7 flex flex-col">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-teal-300">Before audio starts — policy gates</p>
            <ul className="mt-4 space-y-3 text-[12.5px] leading-snug">
              {[['T2 policy evaluated', 'Clinic · T2 · es-US · Federal (HHS §1557) → AI_WITH_HUMAN_MONITOR'], ['Interpreter on channel', 'Daniela Ríos, CHI™ — credential verified 2026-09-02 · SLA target <10s'], ['Glossary attached', '“Riverside Pediatrics — Clinical Core” · 214 terms · dosage + negation rules active'], ['Disclosure rendered in participant language', 'es-US · read aloud · captioned · logged with timestamp'], ['Retention scope set', 'Transcripts 90d · no raw audio · legal-hold ready · region us-east-1']].map(([t, d], i) => (
                <li key={i} className="flex items-start gap-3"><CircleCheck size={17} className="mt-0.5 shrink-0 text-teal-400" /><span><span className="font-bold text-white/90">{t}</span><span className="block text-white/55 text-[11.5px]">{d}</span></span></li>
              ))}
            </ul>
            <div className="mt-auto pt-6 border-t border-white/10">
              <p className="font-mono text-[9px] text-white/35">Consent artifacts are hash-chained into the audit log. No audio flows before this gate returns 200.</p>
            </div>
          </div>
        </div>
      )}

      {/* ============ LIVE / TAKEOVER ============ */}
      {(phase === 'live' || phase === 'takeover') && (
        <div className="mt-6 grid grid-cols-12 gap-4">
          {/* TRANSCRIPT — center */}
          <section className="col-span-12 lg:col-span-7 xl:col-span-6 rounded-3xl border border-line bg-white card-shadow flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-ink"><Languages size={13} />Dual-language transcript</p>
              <span className="font-mono text-[9px] text-slate-ink">glossary: clinical-core v214 · streaming</span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-[54vh] lg:max-h-[62vh] px-5 py-4 space-y-3">
              {visible.map(s => (
                <div key={s.id} className={`rounded-2xl border p-3.5 ${s.speaker === 'interpreter' ? 'border-teal-200 bg-pine-mist' : s.flag ? 'border-amber-300 bg-amber-50/60' : 'border-line bg-parch/40'}`}>
                  <p className="text-[8.5px] font-black uppercase tracking-[0.18em] text-slate-ink">{s.speaker === 'participant' ? 'María G. · es-US' : s.speaker === 'provider' ? 'Dr. Patel · en-US' : s.speaker === 'ai' ? 'Intevaris AI (monitored)' : 'Daniela Ríos · interpreter'}</p>
                  <p className="mt-1.5 text-[13px] leading-snug text-ink">{s.en}</p>
                  {s.es && <p className="mt-1 text-[12px] leading-snug text-pine-deep italic">{s.es}</p>}
                  {s.flag && <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-300 bg-amber-100/60 px-2.5 py-1.5 text-[10px] font-bold text-amber-900"><Flag size={11} className="mt-0.5 shrink-0" />{s.flag.type}: {s.flag.detail}</p>}
                </div>
              ))}
              {streaming && <div className="rounded-2xl border border-dashed border-pine/50 bg-pine-mist/50 p-3.5"><p className="text-[13px] text-pine-deep">{streaming}<span className="animate-pulse">▌</span></p></div>}
              {clarification && <p className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-[11.5px] font-semibold text-sky-800"><Repeat2 size={14} />Re-voicing last segment in Spanish at 0.85×…</p>}
              {correction && <div className="rounded-2xl border border-teal-300 bg-teal-50 p-3.5"><p className="text-[8.5px] font-black uppercase tracking-[0.18em] text-pine-deep">Daniela Ríos · correction voiced & logged</p><p className="mt-1.5 text-[13px] leading-snug text-ink">{correction}</p><p className="mt-1.5 flex items-center gap-1 text-[9.5px] font-mono text-pine-deep"><CheckCheck size={11} />back-translation verified · seg4 amended</p></div>}
              {visible.length === SCRIPT.length && !correction && <p className="text-center font-mono text-[10px] text-slate-ink pt-2">— end of scripted demo segment flow —</p>}
            </div>
            {/* HOST CONTROLS */}
            <div className="border-t border-line bg-parch/60 px-4 py-2.5 flex flex-wrap items-center gap-1.5">
              <HostBtn icon={aiMuted ? MicOff : Mic} label={aiMuted ? 'AI muted' : 'Pause AI'} onClick={() => { setAiMuted(m => !m); log('host.pause_ai', 'ses_live_demo', aiMuted ? 'AI resumed by host' : 'AI paused by host — interpreter floor', 'info'); }} active={aiMuted} danger={aiMuted} />
              <HostBtn icon={Users} label="Request human" onClick={takeOver} highlight={activeFlag} />
              <HostBtn icon={Repeat2} label="Repetition" onClick={askRepetition} />
              <HostBtn icon={aiMuted ? Mic : Hand} label={phase === 'takeover' ? 'Muted (interpreter)' : 'Mute me'} onClick={() => toast({ title: 'Mic toggled', body: 'Simulated — host microphone state only.', tone: 'info' })} />
              <span className="ml-auto flex items-center gap-1.5 font-mono text-[9px] text-slate-ink"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />p50 1.4s · p95 2.8s (sim)</span>
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-6 flex flex-col gap-4">
            {/* INTERPRETER CHANNEL */}
            <section className="rounded-3xl bg-spruce-950 text-white overflow-hidden shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
                <p className="flex items-center gap-2 text-[9.5px] font-black uppercase tracking-[0.2em] text-teal-300"><UserRound size={13} />Interpreter channel · Daniela Ríos</p>
                <span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-1 text-[9px] font-bold text-teal-300">CHI™ verified</span>
              </div>
              <div className="p-4 space-y-3">
                {activeFlag ? (
                  <div className="rounded-2xl border border-rose-400/40 bg-rose-500/12 p-4">
                    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-rose-300"><Flag size={13} />Escalation active · {flags.length} flag(s)</p>
                    <p className="mt-1.5 text-[11px] leading-snug text-rose-100/85">Context handed over: transcript tail (6 segments) · glossary hits (“dosis”, “contraindicación”) · numeric thread “500 mg → 50 mg” · participant anxiety signal at seg5.</p>
                    {handoffStart.current && <p className="mt-1.5 font-mono text-[9.5px] text-rose-200/70">handoff timer running…</p>}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-[11px] text-white/65 leading-snug"><span className="font-bold text-white/85">Monitoring mode.</span> AI is rendering; Daniela sees every segment, flags arrive here with full context. She takes over on any flag — or your “Request human” tap.</div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={takeOver} disabled={phase === 'takeover'} className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl text-[12px] font-black transition-all ${phase === 'takeover' ? 'bg-rose-900/60 text-rose-200/60 cursor-default' : 'bg-rose-500 text-white hover:bg-rose-400 '}`}><Hand size={16} />{phase === 'takeover' ? 'Daniela has the floor' : 'Take over now'}</button>
                  <button onClick={sendCorrection} disabled={!!correction} className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl text-[12px] font-bold transition-all ${correction ? 'bg-teal-800 text-teal-100/70 cursor-default' : 'border border-teal-400/50 bg-teal-400/15 text-teal-200 hover:bg-teal-400/25'}`}><CheckCheck size={16} />{correction ? 'Correction logged' : 'Correct seg 4'}</button>
                </div>
                {phase === 'takeover' && <button onClick={handBack} className="w-full inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 text-[11.5px] font-bold text-white/80 hover:bg-white/10"><Repeat2 size={14} />Hand back to AI (monitor remains)</button>}
              </div>
            </section>

            {/* SIDE-BY-SIDE PANELS: participant + AI */}
            <div className="grid sm:grid-cols-2 gap-4">
              <section className="rounded-3xl border border-line bg-white p-4 card-shadow">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-ink flex items-center justify-between"><span className="flex items-center gap-1.5"><QrCode size={11} />Participant view</span><span className="font-mono text-[8px] normal-case text-slate-ink/70">join.intevaris.ai/x7k2</span></p>
                <div className="mt-2.5 rounded-2xl border border-line bg-parch/60 p-3 text-center">
                  <p className="text-[22px] leading-tight font-display text-ink">{correction ?? '¿Necesita repetir?'}</p>
                  <p className="mt-1.5 text-[9.5px] text-slate-ink">{correction ? 'Daniela confirmó: 500 mg, dos veces al día ✓' : 'Toque para oír de nuevo · diga “necesito un intérprete” en cualquier momento'}</p>
                </div>
              </section>
              <section className="rounded-3xl border border-line bg-white p-4 card-shadow">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-ink flex items-center justify-between"><span>AI assist · live</span><span className={`flex h-2 w-2 rounded-full ${aiMuted ? 'bg-slate-300' : 'bg-emerald-500'}`} /></p>
                <dl className="mt-2 space-y-1.5 font-mono text-[9.5px]">
                  {[['ASR conf', '0.94'], ['Glossary hits', '14 (dosis ×3)'], ['Back-translation', flags.length ? '2 triggered' : 'armed'], ['Numeric checks', '500 MG ≠ 50 MG → flagged'], ['Negation checks', flags.length > 1 ? '1 triggered' : 'armed'], ['Hallucination guard', 'schema-constrained ✓']].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between border-b border-line/60 pb-1"><dt className="text-slate-ink">{k}</dt><dd className={`font-bold ${String(v).includes('flagged') || String(v).includes('triggered') ? 'text-amber-800' : 'text-ink'}`}>{v}</dd></div>
                  ))}
                </dl>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* ============ SEALED SUMMARY ============ */}
      {phase === 'sealed' && (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-3xl border border-line bg-white p-8 sm:p-10 card-shadow text-center max-w-3xl mx-auto">
          <CircleCheck size={56} strokeWidth={1.4} className="mx-auto text-pine" />
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">Session sealed with an evidence pack.</h2>
          <p className="mx-auto mt-2 max-w-lg text-[13.5px] text-slate-ink">Every decision, consent, flag, and correction is hash-linked into the audit chain. Export it, file it, or hand it to counsel — it verifies independently.</p>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[[String(flags.length), 'quality flags'], [handoff ? `${handoff}s` : '—', 'measured handoff'], ['1', 'correction logged'], ['cns_8801', 'consent artifact']].map(([v, l], i) => (
              <div key={i} className="rounded-2xl border border-line bg-parch/60 p-4"><p className="font-mono text-lg font-bold text-ink">{v}</p><p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-ink">{l}</p></div>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button onClick={exportPack} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-[13px] font-bold text-white hover:bg-spruce-850"><Download size={16} />Export evidence pack (JSON)</button>
            <button onClick={() => nav('/app/audit')} className="inline-flex items-center gap-2 rounded-full border border-pine bg-pine-mist px-6 py-3.5 text-[13px] font-bold text-pine-deep hover:bg-pine-soft"><ShieldCheck size={16} />Verify in the audit ledger</button>
            <button onClick={reset} className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-ink hover:text-ink px-4 py-3"><X size={14} />Run it again</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function HostBtn({ icon: Icon, label, onClick, active = false, danger = false, highlight = false }: { icon: typeof Mic; label: string; onClick: () => void; active?: boolean; danger?: boolean; highlight?: boolean }) {
  return (
    <button onClick={onClick} className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-[10.5px] font-bold transition-all ${danger ? 'border-rose-300 bg-rose-100 text-rose-800' : highlight ? 'border-amber-400 bg-amber-100 text-amber-900' : active ? 'border-ink bg-ink text-white' : 'border-line2 bg-white text-ink hover:border-pine hover:text-pine-deep'}`}>
      <Icon size={14} />{label}
    </button>
  );
}
