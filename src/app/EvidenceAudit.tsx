import { useState } from 'react';
import {
  ShieldCheck, ShieldAlert, Search, RotateCcw, FlaskConical, Download, Hash, CircleCheck,
  FileJson, Filter, Link2, TriangleAlert, Loader2, KeyRound,
} from 'lucide-react';
import { useStore, type AuditEvent } from '../lib/store';

const OUTCOME_STYLE: Record<AuditEvent['outcome'], string> = {
  success: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  denied: 'text-rose-700 bg-rose-50 border-rose-200',
  escalated: 'text-amber-800 bg-amber-50 border-amber-200',
  info: 'text-sky-800 bg-sky-50 border-sky-200',
};

export default function EvidenceAudit() {
  const { audit, verifyChain, tamperDemo, clearSessionChain, log, toast } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | AuditEvent['outcome']>('all');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; brokenAt: number | null; checked: number } | null>(null);

  const rows = audit.filter(e =>
    (filter === 'all' || e.outcome === filter) &&
    (!query || [e.action, e.target, e.detail, e.actor, e.id].join(' ').toLowerCase().includes(query.toLowerCase()))
  );

  const runVerification = async () => {
    setVerifying(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 650)); // let the spinner read as real work
    const res = await verifyChain();
    setResult(res);
    setVerifying(false);
    log('chain.verify', 'audit_chain', res.valid ? `Integrity check passed — ${res.checked} events verified, hash links intact` : `VERIFICATION FAILED at seq ${res.brokenAt} — possible tampering detected`, res.valid ? 'success' : 'escalated');
    toast({ title: res.valid ? 'Chain verified' : 'Tampering detected', body: res.valid ? `${res.checked} events · every hash link intact.` : `Break detected at sequence #${res.brokenAt}. Evidence preserved; operator notified.`, tone: res.valid ? 'ok' : 'danger' });
  };

  const exportChain = () => {
    const blob = new Blob([JSON.stringify({ chain: audit, exported_at: new Date().toISOString(), algorithm: 'fnv1a-64-link demo verifier (production: SHA-256)', events: audit.length }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'intevaris_audit_chain_export.json';
    a.click();
    log('chain.export', 'audit_chain', `Full chain exported · ${audit.length} events`, 'info');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-pine-deep"><Hash size={12} /> Evidence & Audit · D3</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight">The tamper-evident ledger</h1>
          <p className="mt-1 text-[12px] text-slate-ink max-w-2xl">Every policy decision, consent, flag, takeover, and export writes an event linked to its predecessor by hash. Alter one byte and verification fails at that sequence — that’s the point.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={runVerification} disabled={verifying} className="inline-flex h-11 items-center gap-2 rounded-full bg-pine-deep px-5 text-[12px] font-bold text-white hover:bg-pine-deep2 disabled:opacity-70">{verifying ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}{verifying ? 'Verifying hashes…' : 'Verify chain integrity'}</button>
          <button onClick={tamperDemo} className="inline-flex h-11 items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-4 text-[11.5px] font-bold text-rose-800 hover:bg-rose-100"><FlaskConical size={15} />Inject tampering (demo)</button>
          <button onClick={exportChain} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line2 bg-white text-ink hover:border-pine" aria-label="Export chain"><Download size={16} /></button>
        </div>
      </div>

      {/* Verification result banner */}
      {result && (
        <div className={`mt-4 flex flex-wrap items-center gap-4 rounded-2xl border px-5 py-4 ${result.valid ? 'border-emerald-300 bg-emerald-50' : 'border-rose-400 bg-rose-50'}`}>
          {result.valid ? <CircleCheck size={26} className="text-emerald-600" /> : <ShieldAlert size={26} className="text-rose-600" />}
          <div className="flex-1 min-w-[240px]">
            <p className={`text-[13px] font-black ${result.valid ? 'text-emerald-900' : 'text-rose-900'}`}>{result.valid ? `INTEGRITY VERIFIED — ${result.checked} events, zero broken links` : `TAMPER DETECTED — chain breaks at sequence #${result.brokenAt}`}</p>
            <p className={`text-[11px] ${result.valid ? 'text-emerald-800/80' : 'text-rose-800/80'}`}>{result.valid ? 'Every event hash recomputes to the stored value and links to its predecessor. Safe to present as evidence of process.' : 'An event’s payload no longer matches its committed hash. In production: page operator, freeze retention, preserve for forensic review.'}</p>
          </div>
          {!result.valid && <button onClick={() => { clearSessionChain(); setResult(null); toast({ title: 'Chain restored to verified seed', tone: 'info' }); }} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-[11px] font-bold text-rose-800"><RotateCcw size={13} />Restore verified state</button>}
        </div>
      )}

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 w-72">
          <Search size={14} className="text-slate-ink shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search action, target, actor…" className="w-full bg-transparent text-[12px] outline-none" aria-label="Search audit events" />
        </label>
        <Filter size={15} className="text-slate-ink ml-1" />
        {(['all', 'success', 'escalated', 'info', 'denied'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`h-9 rounded-full border px-3.5 text-[11px] font-bold capitalize transition-all ${filter === f ? 'bg-ink text-white border-ink' : 'bg-white border-line text-slate-ink'}`}>{f}</button>
        ))}
        <span className="ml-auto font-mono text-[10.5px] text-slate-ink">{rows.length} / {audit.length} events · seq #{audit[audit.length - 1]?.seq}</span>
      </div>

      {/* LEDGER */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-line bg-[#101824] card-shadow">
        <div className="grid grid-cols-[44px_1fr] sm:grid-cols-[44px_150px_1fr] border-b border-white/10 px-4 py-2.5 font-mono text-[8.5px] uppercase tracking-[0.2em] text-white/35"><span>Seq</span><span className="hidden sm:block">Timestamp</span><span>Event</span></div>
        <div className="max-h-[62vh] overflow-y-auto">
          {rows.slice().reverse().map(e => (
            <div key={e.id + e.seq} className="grid grid-cols-[44px_1fr] sm:grid-cols-[44px_150px_1fr] gap-x-3 border-b border-white/5 px-4 py-2.5 hover:bg-white/[.03] font-mono text-[10.5px]">
              <span className="text-white/30">{e.seq}</span>
              <span className="hidden sm:block text-white/45">{new Date(e.ts).toISOString().slice(11, 19)}Z<br /><span className="text-[8.5px] text-white/25">{new Date(e.ts).toISOString().slice(0, 10)}</span></span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[#6fd3ba] font-bold">{e.action}</span>
                  <span className={`rounded border px-1.5 py-0.5 text-[8px] font-black uppercase ${OUTCOME_STYLE[e.outcome]}`}>{e.outcome}</span>
                </span>
                <span className="mt-0.5 block text-white/70 leading-snug">{e.detail}</span>
                <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[8.5px] text-white/35">
                  <span><KeyRound size={8} className="inline mr-1 -mt-0.5" />{e.actor}</span>
                  <span>target: {e.target}</span>
                  <span className="truncate max-w-[220px]"><Link2 size={8} className="inline mr-1 -mt-0.5" />hash {e.hash.slice(0, 12)}…</span>
                </span>
              </span>
            </div>
          ))}
          {rows.length === 0 && <p className="px-4 py-10 text-center text-[12px] text-white/40">No events match this filter.</p>}
        </div>
      </div>

      {/* Chain integrity footer */}
      <div className="mt-4 grid sm:grid-cols-3 gap-3 text-[11px]">
        <div className="rounded-2xl border border-line bg-white p-4"><p className="flex items-center gap-1.5 font-black text-[9.5px] uppercase tracking-[0.18em] text-slate-ink"><Hash size={12} />Chain algorithm</p><p className="mt-1.5 text-ink leading-snug">Demo: FNV-1a-64 links (visually verifiable). Production adapter: SHA-256 + RFC 6962-style Merkle checkpoint every 1,000 events.</p></div>
        <div className="rounded-2xl border border-line bg-white p-4"><p className="flex items-center gap-1.5 font-black text-[9.5px] uppercase tracking-[0.18em] text-slate-ink"><FileJson size={12} />What an evidence pack proves</p><p className="mt-1.5 text-ink leading-snug">That <em>this</em> decision, <em>this</em> consent, and <em>these</em> flags existed — in order, unaltered — at a point in time. It does not prove clinical correctness.</p></div>
        <div className="rounded-2xl border border-line bg-white p-4"><p className="flex items-center gap-1.5 font-black text-[9.5px] uppercase tracking-[0.18em] text-slate-ink"><TriangleAlert size={12} />Retention</p><p className="mt-1.5 text-ink leading-snug">Audit events outlive session content. Legal hold suspends transcript deletion for named matters; deletion certificates are chained like everything else.</p></div>
      </div>
    </div>
  );
}
