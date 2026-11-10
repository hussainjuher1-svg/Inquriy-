import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { useStore } from '../lib/store';
import { seedSessions, weeklyVolume, modeDistribution, ACTIVITY } from '../lib/data';
import ModeBadge from '../components/ModeBadge';
import { DemoMark, PageHeader } from '../components/ui';

const maxSessions = Math.max(...weeklyVolume.map(d => d.sessions));

export default function CommandCenter() {
  const nav = useNavigate();
  const audit = useStore(s => s.audit);
  const liveNow = seedSessions.filter(s => s.status === 'in_progress' || s.status === 'escalated');
  const needsHuman = seedSessions.filter(s => s.status === 'escalated' || s.flags > 0);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <PageHeader
        kicker="Riverside Health · demonstration tenant"
        title="Command Center"
        description={<>Active encounters and work that needs a person. Figures below are demonstration data. Audit log currently holds {audit.length} events in this browser.</>}
        actions={
          <button onClick={() => nav('/app/live')} className="inline-flex h-11 items-center gap-2 bg-brand px-4 text-[14px] font-semibold text-white hover:bg-brand-hover">
            <Play size={14} fill="currentColor" /> Start guided session
          </button>
        }
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="panel p-5">
          <p className="text-[13px] font-medium text-muted">Needs human attention</p>
          <p className="mt-2 font-display text-4xl">{needsHuman.length}</p>
          <p className="mt-1 text-[14px] text-muted">Open flags or escalated sessions in the seed set.</p>
          <Link to="/app/quality" className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-brand">Review quality queue <ArrowRight size={14} /></Link>
        </section>
        <section className="panel p-5">
          <p className="text-[13px] font-medium text-muted">Interpreter availability</p>
          <p className="mt-2 font-display text-4xl">5 <span className="text-2xl text-muted">on shift</span></p>
          <p className="mt-1 text-[14px] text-muted">1 on break · 1 credential approaching expiry.</p>
          <Link to="/app/interpreters" className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-brand">Open network <ArrowRight size={14} /></Link>
        </section>
        <section className="panel p-5">
          <p className="text-[13px] font-medium text-muted">Evidence health</p>
          <p className="mt-2 font-display text-4xl">{audit.length}</p>
          <p className="mt-1 text-[14px] text-muted">Local FNV-linked events. Not a production ledger.</p>
          <Link to="/app/audit" className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-brand">Verify chain <ArrowRight size={14} /></Link>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4">
        <section className="panel col-span-12 overflow-hidden xl:col-span-8">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 className="text-[15px] font-semibold">Active encounters</h2>
            <div className="flex items-center gap-3">
              <DemoMark />
              <Link to="/app/sessions" className="text-[13px] font-semibold text-brand">All sessions</Link>
            </div>
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead>
                <tr className="border-b border-line text-[12px] text-muted">
                  <th className="px-5 py-2.5 font-medium">Participant</th>
                  <th className="px-4 py-2.5 font-medium">Pair</th>
                  <th className="px-4 py-2.5 font-medium">Tier</th>
                  <th className="px-4 py-2.5 font-medium">Mode</th>
                  <th className="px-4 py-2.5 font-medium">Interpreter</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {liveNow.map(s => (
                  <tr key={s.id} className="hover:bg-subtle">
                    <td className="px-5 py-3">
                      <p className="font-semibold">{s.patient}</p>
                      <p className="font-mono text-[12px] text-muted">{s.id} · {s.setting}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{s.pair.replace('English ↔ ', 'en ↔ ')}</td>
                    <td className="px-4 py-3 font-mono text-[13px]">{s.tier}</td>
                    <td className="px-4 py-3"><ModeBadge mode={s.mode} size="sm" /></td>
                    <td className="px-4 py-3 text-[13px] text-muted">{s.interpreter ?? 'Monitor on channel'}</td>
                    <td className="px-4 py-3"><button onClick={() => nav('/app/live')} className="border border-line px-3 py-1.5 text-[13px] font-semibold hover:bg-subtle">Join</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="divide-y divide-line md:hidden">
            {liveNow.map(s => (
              <button key={s.id} onClick={() => nav('/app/live')} className="block w-full px-4 py-3 text-left">
                <p className="font-semibold">{s.patient} · {s.tier}</p>
                <p className="mt-1 text-[13px] text-muted">{s.pair} · {s.interpreter ?? 'AI + monitor'}</p>
              </button>
            ))}
          </div>
          <div className="border-t border-line px-5 py-4">
            <p className="text-[13px] font-medium text-muted">7-day volume (demonstration)</p>
            <div className="mt-3 flex h-24 items-end gap-2">
              {weeklyVolume.map(d => (
                <div key={d.d} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-16 w-full flex-col justify-end">
                    <div className="w-full bg-warn/70" style={{ height: `${(d.humanRouted / maxSessions) * 100}%` }} />
                    <div className="w-full bg-brand/80" style={{ height: `${((d.sessions - d.humanRouted) / maxSessions) * 100}%` }} />
                  </div>
                  <span className="text-[11px] text-muted">{d.d}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-muted"><span className="inline-block h-2 w-3 bg-brand/80 align-middle" /> AI-contained · <span className="inline-block h-2 w-3 bg-warn/70 align-middle" /> human-routed</p>
          </div>
        </section>

        <div className="col-span-12 flex flex-col gap-4 xl:col-span-4">
          <section className="panel p-5">
            <h2 className="text-[15px] font-semibold">Mode mix · 30 days</h2>
            <div className="mt-3 flex h-2 w-full overflow-hidden">
              {modeDistribution.map(m => <div key={m.mode} style={{ width: `${m.pct}%`, background: m.color }} title={`${m.mode} ${m.pct}%`} />)}
            </div>
            <ul className="mt-3 space-y-1.5 text-[13px] text-muted">
              {modeDistribution.map(m => (
                <li key={m.mode} className="flex justify-between"><span>{m.mode}</span><span className="font-mono">{m.pct}%</span></li>
              ))}
            </ul>
          </section>
          <section className="panel flex-1 overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h2 className="text-[15px] font-semibold">Recent activity</h2>
              <Link to="/app/audit" className="text-[13px] font-semibold text-brand">Ledger</Link>
            </div>
            <ul className="divide-y divide-line">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="px-5 py-3">
                  <p className="text-[13px] leading-snug">{a.text}</p>
                  <p className="mt-1 font-mono text-[11px] text-faint">{a.time} UTC</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
