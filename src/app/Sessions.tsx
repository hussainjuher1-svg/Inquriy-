import { useState } from 'react';
import { Search, X, ShieldCheck, FileText, Download, UserRound, Stethoscope, Scale, GraduationCap, Landmark, Building2, ConciergeBell, QrCode, Copy, Check, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { seedSessions, type SeedSession } from '../lib/data';
import ModeBadge from '../components/ModeBadge';
import { useStore } from '../lib/store';

const settingIcon: Record<string, typeof Stethoscope> = {
  'Clinic': Stethoscope, 'Legal aid': Scale, 'School': GraduationCap, 'City services': Landmark, 'Benefits office': Building2, 'Intake call center': ConciergeBell,
};

const STATUS: Record<SeedSession['status'], { label: string; cls: string }> = {
  in_progress: { label: 'LIVE', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  scheduled: { label: 'SCHEDULED', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  completed: { label: 'COMPLETED', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  escalated: { label: 'ESCALATED', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
};

export default function Sessions() {
  const { log, toast } = useStore();
  const [query, setQuery] = useState('');
  const [tier, setTier] = useState<'all' | 'T0' | 'T1' | 'T2' | 'T3'>('all');
  const [selected, setSelected] = useState<SeedSession | null>(null);

  const filtered = seedSessions.filter(s =>
    (tier === 'all' || s.tier === tier) &&
    (!query || [s.patient, s.id, s.pair, s.mrn, s.setting, s.interpreter ?? ''].join(' ').toLowerCase().includes(query.toLowerCase()))
  );

  const exportPack = (s: SeedSession) => {
    const pack = {
      evidence_pack_version: '1.0', session_id: s.id, generated_at: new Date().toISOString(),
      participant: { alias: s.patient, mrn: s.mrn }, setting: s.setting, language_pair: s.pair,
      tier: s.tier, mode: s.mode, risk_score: s.riskScore, consent_recorded: s.consent,
      interpreter: s.interpreter, host: s.host, flags: s.flags, duration_sec: s.durationSec,
      audit_linkage: 'sha256-chain · see /app/audit · seq 1400', retention: 'transcripts 90d · no raw audio',
      disclaimer: 'Demonstration export from simulated environment. Not legal advice.',
    };
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${s.id}_evidence_pack.json`; a.click();
    URL.revokeObjectURL(url);
    log('evidence.pack.export', s.id, `Evidence pack exported (${s.flags} flags, tier ${s.tier})`, 'success');
    toast({ title: 'Evidence pack exported', body: `${s.id} sealed as JSON — chain linkage included.`, tone: 'ok' });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-pine-deep">Encounter log</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight">Sessions</h1>
        </div>
        <NewSessionButton />
      </div>

      {/* Filter bar */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 h-10 rounded-full border border-line bg-white px-4 w-72">
          <Search size={15} className="text-slate-ink shrink-0" />
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search ID, patient, pair, interpreter…" className="w-full bg-transparent text-[13px] outline-none" aria-label="Filter sessions" />
          {query && <button onClick={() => setQuery('')} aria-label="Clear"><X size={14} className="text-slate-ink" /></button>}
        </label>
        {(['all', 'T0', 'T1', 'T2', 'T3'] as const).map(t => (
          <button key={t} onClick={() => setTier(t)} className={`h-10 rounded-full px-4 text-[12px] font-bold border transition-all ${tier === t ? 'bg-ink text-white border-ink' : 'bg-white border-line text-slate-ink hover:border-line2'}`}>{t === 'all' ? 'All tiers' : `Tier ${t}`}</button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-slate-ink">{filtered.length} of {seedSessions.length} sessions</span>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-white card-shadow">
        <table className="w-full min-w-[820px] text-left text-[12px]">
          <thead>
            <tr className="border-b border-line text-[9px] uppercase tracking-[0.18em] text-slate-ink">
              <th className="px-5 py-3 font-black">Session</th><th className="px-4 py-3 font-black">Setting</th><th className="px-4 py-3 font-black">Status</th><th className="px-4 py-3 font-black">Tier · Risk</th><th className="px-4 py-3 font-black">Mode</th><th className="px-4 py-3 font-black">Scheduled</th><th className="px-4 py-3 font-black">Flags</th><th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {filtered.map(s => {
              const SIcon = settingIcon[s.setting] ?? Stethoscope;
              return (
                <tr key={s.id} onClick={() => setSelected(s)} className="cursor-pointer hover:bg-parch/50 transition-colors">
                  <td className="px-5 py-3"><p className="font-bold">{s.patient}</p><p className="font-mono text-[9.5px] text-slate-ink">{s.id} · {s.mrn}</p></td>
                  <td className="px-4 py-3"><span className="flex items-center gap-1.5 text-slate-ink"><SIcon size={13} />{s.setting}</span></td>
                  <td className="px-4 py-3"><span className={`rounded-md border px-2 py-0.5 text-[9px] font-black tracking-wider ${STATUS[s.status].cls}`}>{STATUS[s.status].label}</span></td>
                  <td className="px-4 py-3"><span className="font-mono font-bold">{s.tier}</span><span className="font-mono text-slate-ink"> · {s.riskScore}</span></td>
                  <td className="px-4 py-3"><ModeBadge mode={s.mode} size="sm" /></td>
                  <td className="px-4 py-3 text-slate-ink">{s.scheduledFor}</td>
                  <td className="px-4 py-3 font-mono font-bold">{s.flags > 0 ? <span className="text-amber-800">⚑ {s.flags}</span> : '—'}</td>
                  <td className="px-4 py-3 text-right"><ArrowRight size={14} className="ml-auto text-slate-ink" /></td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-10 text-center text-[13px] text-slate-ink">No sessions match “{query}”. Try clearing filters.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-ink/45 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 32, stiffness: 300 }} className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-6 py-4">
                <div><p className="font-mono text-[10px] text-pine-deep">{selected.id}</p><h2 className="font-display text-xl font-semibold">{selected.patient}</h2></div>
                <button onClick={() => setSelected(null)} className="grid h-9 w-9 place-items-center rounded-full border border-line hover:bg-parch" aria-label="Close"><X size={17} /></button>
              </div>
              <div className="px-6 py-5 space-y-5">
                <div className="flex items-center gap-3"><ModeBadge mode={selected.mode} /><span className="rounded-md border border-line2 px-2 py-1 font-mono text-[10px] font-bold">{selected.tier} · risk {selected.riskScore}</span>{selected.consent ? <span className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-800"><ShieldCheck size={13} />Consent sealed</span> : <span className="text-[10.5px] font-bold text-amber-800">Awaiting consent</span>}</div>
                <dl className="grid grid-cols-2 gap-3 text-[12px]">
                  {[['Pair', selected.pair], ['Setting', selected.setting], ['Host', selected.host], ['Interpreter', selected.interpreter ?? 'None — AI + monitor'], ['Duration', selected.durationSec ? `${Math.floor(selected.durationSec / 60)}m ${selected.durationSec % 60}s` : '—'], ['Scheduled', selected.scheduledFor]].map(([k, v]) => (
                    <div key={k as string} className="rounded-xl border border-line bg-parch/50 p-3"><dt className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-ink">{k}</dt><dd className="mt-0.5 font-semibold text-ink">{v}</dd></div>
                  ))}
                </dl>
                <div className="rounded-2xl border border-line bg-white p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-ink flex items-center gap-1.5"><FileText size={12} />Chain of custody</p>
                  <ol className="mt-2 space-y-1.5 font-mono text-[10px] text-slate-ink">
                    <li>01 · policy decision dec_8f2a — logged</li>
                    <li>02 · consent cns_7731 — sealed {selected.consent ? '✓' : '(pending)'}</li>
                    <li>03 · {selected.flags} quality flag(s) — {selected.flags ? 'reviewer queue' : 'none'}</li>
                    <li>04 · retention job — scheduled at close</li>
                  </ol>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => exportPack(selected)} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3 text-[12px] font-bold text-white hover:bg-spruce-850"><Download size={15} />Export evidence pack</button>
                  <button onClick={() => { log('session.detail.open', selected.id, 'Opened session detail', 'info'); toast({ title: 'Deep link copied', body: selected.id, tone: 'info' }); }} className="inline-flex items-center justify-center rounded-xl border border-line2 px-4 text-ink hover:bg-parch" aria-label="Copy link"><Copy size={16} /></button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function NewSessionButton() {
  const { log, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const link = 'https://join.intevaris.ai/x7k2';
  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-full bg-pine-deep px-5 text-[12.5px] font-bold text-white hover:bg-pine-deep2"><QrCode size={16} />New participant link</button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 backdrop-blur-sm p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <QrCode size={120} strokeWidth={1.1} className="mx-auto text-ink" />
            <h3 className="mt-4 font-display text-xl font-semibold">Scan to join — no install</h3>
            <p className="mt-1 font-mono text-[11px] text-pine-deep break-all">{link}</p>
            <p className="mt-3 text-[12px] text-slate-ink">Participant joins in &lt;15s (hypothesis, being measured). Consent is read aloud in their language before any audio.</p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => { navigator.clipboard?.writeText(link); setCopied(true); log('session.link.copy', 'x7k2', 'Participant join link copied', 'success'); }} className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-ink py-3 text-[12px] font-bold text-white">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy link'}</button>
              <button onClick={() => { setOpen(false); log('session.link.created', 'ses_new', 'New no-install participant link issued', 'success'); toast({ title: 'Session link issued', body: 'ses_new · consent-first join · expires in 4h', tone: 'ok' }); }} className="flex-1 rounded-xl border border-pine bg-pine-mist py-3 text-[12px] font-bold text-pine-deep">Create session</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
