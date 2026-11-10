import { useState } from 'react';
import { BadgeCheck, Clock, Star, ShieldCheck, CalendarClock, Users2, Stethoscope, Scale, Landmark, GraduationCap, Building2, ConciergeBell, Download, Check, X } from 'lucide-react';
import { interpreters, type Interpreter } from '../lib/data';
import { useStore } from '../lib/store';

const specialtyIcon = (s: string) =>
  s === 'Clinical' || s === 'Pediatrics' ? Stethoscope : s === 'Legal' || s === 'Immigration' ? Scale : s === 'Benefits' || s === 'Finance' ? Building2 : s === 'City services' || s === 'Emergency' ? Landmark : s === 'School' ? GraduationCap : ConciergeBell;

const STATUS_DOT: Record<Interpreter['status'], string> = { 'on-shift': 'bg-emerald-500', 'on-break': 'bg-amber-400', 'offline': 'bg-slate-300' };

export default function Interpreters() {
  const { log, toast } = useStore();
  const [booked, setBooked] = useState<string[]>([]);
  const [filter, setFilter] = useState('All');
  const specialties = ['All', 'Clinical', 'Legal', 'Benefits', 'City services'];

  const shown = interpreters.filter(i => filter === 'All' || i.specialties.some(s => s.includes(filter)));
  const expiringSoon = interpreters.flatMap(i => i.credentials.filter(c => !c.verified || new Date(c.expiry) < new Date('2027-02-01')).map(c => ({ int: i, cred: c })));

  const book = (i: Interpreter) => {
    setBooked(b => [...b, i.id]);
    log('interpreter.assignment', i.id, `${i.name} assigned to ses_new · ${i.pairs[0]} · avg join ${i.avgJoinSec}s`, 'success');
    toast({ title: `${i.name} assigned`, body: 'Interpreter notified with transcript tail + glossary hits. Handoff timer armed (<10s target).', tone: 'ok' });
  };

  const exportRoster = () => {
    const rows = interpreters.map(i => [i.name, i.languages, i.specialties.join('/'), i.credentials.map(c => `${c.name} exp ${c.expiry}`).join(' | '), i.rating, i.status].join(','));
    const csv = ['name,languages,specialties,credentials,rating,status', ...rows].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'intevaris_interpreter_roster.csv';
    a.click();
    log('roster.export', 'human_network', `Roster CSV exported · ${interpreters.length} interpreters`, 'info');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1500px] mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-pine-deep"><Users2 size={12} /> Human network · D6</p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight">Verified interpreters, one channel away</h1>
          <p className="mt-1 text-[12px] text-slate-ink">Credential verification, SLAs, conflict checks, and fatigue-aware assignment. Ratings shown as uncalibrated until human QA sign-off.</p>
        </div>
        <button onClick={exportRoster} className="inline-flex h-11 items-center gap-2 rounded-full border border-line2 bg-white px-5 text-[12px] font-bold text-ink hover:border-pine hover:text-pine-deep"><Download size={15} />Export roster CSV</button>
      </div>

      {/* Network KPIs */}
      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[['5', 'on shift now', 'text-emerald-800'], ['7.6s', 'median join (sim)', 'text-sky-800'], ['92.4%', 'acceptance rate', 'text-pine-deep'], ['4.8', 'avg. rating (uncalibrated)', 'text-amber-800']].map(([v, l, c], i) => (
          <div key={i} className="rounded-2xl border border-line bg-white p-4 card-shadow"><p className="font-display text-2xl font-semibold">{v}</p><p className={`mt-0.5 text-[10.5px] font-bold ${c}`}>{l}</p></div>
        ))}
      </div>

      {/* Credential alerts */}
      {expiringSoon.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-900">Credential watchlist</p>
          <ul className="mt-2 grid md:grid-cols-2 gap-2">
            {expiringSoon.map(({ int, cred }, i) => (
              <li key={i} className="flex items-start gap-2 rounded-xl bg-white/70 border border-amber-200 px-3 py-2.5 text-[11px] leading-snug">
                {cred.verified ? <CalendarClock size={14} className="mt-0.5 shrink-0 text-amber-700" /> : <X size={14} className="mt-0.5 shrink-0 text-rose-600" />}
                <span><strong>{int.name}</strong> — {cred.name} {cred.verified ? `expires ${cred.expiry}` : 'awaiting verification'} ({cred.issuer}) <button onClick={() => toast({ title: 'Renewal workflow started', body: `${int.name} · ${cred.name} · request sent to issuer portal`, tone: 'info' })} className="font-bold text-pine-deep hover:underline">Renew →</button></span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-1.5">
        {specialties.map(s => <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-4 h-9 text-[12px] font-bold border transition-all ${filter === s ? 'bg-ink text-white border-ink' : 'bg-white border-line text-slate-ink hover:border-line2'}`}>{s}</button>)}
      </div>

      {/* Cards */}
      <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {shown.map(i => (
          <article key={i.id} className="flex flex-col rounded-2xl border border-line bg-white p-5 card-shadow lift">
            <div className="flex items-start gap-3">
              <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-spruce-800 to-spruce-950 text-[15px] font-black text-[#e5c878]">{i.initials}<span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${STATUS_DOT[i.status]}`} /></div>
              <div className="min-w-0">
                <p className="font-bold text-[14.5px] leading-tight">{i.name}</p>
                <p className="font-mono text-[9px] text-slate-ink mt-0.5">{i.languages}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-slate-ink"><Star size={11} fill="#c8892e" className="text-[#c8892e]" />{i.rating} <span className="opacity-60">(uncalibrated)</span> · {i.sessions.toLocaleString()} sessions</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {i.specialties.map(s => { const I = specialtyIcon(s); return <span key={s} className="inline-flex items-center gap-1 rounded-md border border-line bg-parch/60 px-2 py-1 text-[9.5px] font-bold text-slate-ink"><I size={11} />{s}</span>; })}
            </div>
            <div className="mt-3 space-y-1.5 flex-1">
              {i.credentials.map((c, j) => (
                <p key={j} className="flex items-center gap-1.5 text-[10.5px] text-slate-ink">
                  {c.verified ? <BadgeCheck size={13} className="shrink-0 text-pine" /> : <X size={13} className="shrink-0 text-rose-500" />}
                  <span className="truncate">{c.name} · {c.issuer} · exp {c.expiry}</span>
                </p>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-line pt-4">
              {[[`${i.acceptance}%`, 'acceptance'], [`${i.avgJoinSec}s`, 'avg join'], [`${Math.round(i.sessions / 365)}/mo`, 'cadence']].map(([v, l], j) => (
                <div key={j}><p className="font-mono text-[13px] font-bold text-ink">{v}</p><p className="text-[8.5px] uppercase tracking-wide text-slate-ink">{l}</p></div>
              ))}
            </div>
            <button disabled={booked.includes(i.id) || i.status === 'offline'} onClick={() => book(i)} className={`mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-xl text-[12px] font-bold transition-all ${booked.includes(i.id) ? 'bg-emerald-600 text-white' : i.status === 'offline' ? 'bg-parch text-slate-ink cursor-not-allowed' : 'bg-pine-deep text-white hover:bg-pine-deep2'}`}>
              {booked.includes(i.id) ? <><Check size={15} />Assigned to ses_new</> : i.status === 'offline' ? 'Offline' : <><ShieldCheck size={15} />Assign to next session</>}
            </button>
          </article>
        ))}
      </div>

      <p className="mt-5 flex items-center gap-2 text-[10.5px] text-slate-ink"><Clock size={13} />Handoff SLA: flag → interpreter on channel &lt;10s target · HIPAA-minimum-necessary transcript tail only · conflict-of-interest screening automatic on assignment.</p>
    </div>
  );
}
