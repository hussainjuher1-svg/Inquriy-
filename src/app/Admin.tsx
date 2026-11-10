import { useState } from 'react';
import {
  Settings, KeyRound, Plus, Copy, Check, Trash2, ShieldCheck, CreditCard, Receipt,
  Globe2, Database, Users, CircleCheck, TriangleAlert, Trash, Landmark,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { teamMembers } from '../lib/data';

export default function Admin() {
  const { log, toast } = useStore();
  const [retention, setRetention] = useState('90');
  const [region, setRegion] = useState('us-east-1 (simulated)');
  const [legalHold, setLegalHold] = useState(false);
  const [keys, setKeys] = useState([
    { id: 'key_live_8f2a', name: 'EMR integration — production', scope: 'sessions:read, evidence:read', created: '2026-09-14', lastUsed: '11 min ago' },
    { id: 'key_test_31bb', name: 'Sandbox — CI pipeline', scope: 'sessions:write, policy:read', created: '2026-10-02', lastUsed: '3 d ago' },
  ]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [invoicePaid, setInvoicePaid] = useState<string[]>(['INV-2026-0092']);

  const mintKey = () => {
    const id = 'key_live_' + Math.random().toString(36).slice(2, 6);
    setKeys(k => [...k, { id, name: 'Untitled key', scope: 'sessions:read', created: '2026-10-29', lastUsed: 'never' }]);
    log('apikey.mint', id, 'New scoped API key minted (sessions:read)', 'success');
    toast({ title: 'API key minted', body: `${id} · shown once · copy it now.`, tone: 'ok' });
  };
  const revokeKey = (id: string) => {
    setKeys(k => k.filter(x => x.id !== id));
    log('apikey.revoke', id, 'API key revoked — takes effect immediately', 'escalated');
    toast({ title: 'Key revoked', body: `${id} no longer authenticates.`, tone: 'warn' });
  };
  const copyKey = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const saveRetention = () => {
    log('retention.policy.update', 'tenant_riverside', `Transcript retention set to ${retention} days${legalHold ? ' · LEGAL HOLD ACTIVE — deletion suspended' : ''} · region ${region}`, 'success');
    toast({ title: 'Retention policy saved', body: `${retention}d transcripts · raw audio still deleted immediately. ${legalHold ? 'Legal hold active.' : ''}`, tone: 'ok' });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1300px] mx-auto">
      <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-pine-deep"><Settings size={12} /> Administration · tenant_riverside</p>
      <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold tracking-tight">Admin & Settings</h1>

      <div className="mt-6 grid grid-cols-12 gap-4">
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-7 space-y-4">

          {/* Team & roles */}
          <section className="overflow-hidden rounded-2xl border border-line bg-white card-shadow">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5"><h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]"><Users size={14} />Team & roles</h2><button onClick={() => toast({ title: 'Invite sent', body: 'An invitation email with role-scoped magic link was queued (simulated).', tone: 'ok' })} className="inline-flex items-center gap-1.5 rounded-lg border border-pine bg-pine-mist px-3 py-2 text-[10.5px] font-bold text-pine-deep hover:bg-pine-soft"><Plus size={13} />Invite</button></div>
            <table className="w-full text-left text-[11.5px]">
              <thead><tr className="border-b border-line text-[8.5px] uppercase tracking-[0.18em] text-slate-ink"><th className="px-5 py-2.5">Member</th><th className="px-4 py-2.5">Role</th><th className="px-4 py-2.5">MFA</th><th className="px-4 py-2.5">Last active</th></tr></thead>
              <tbody className="divide-y divide-line/60">
                {teamMembers.map(m => (
                  <tr key={m.email} className="hover:bg-parch/50">
                    <td className="px-5 py-2.5"><p className="font-bold text-ink">{m.name}</p><p className="font-mono text-[8.5px] text-slate-ink">{m.email}</p></td>
                    <td className="px-4 py-2.5"><span className="rounded-md border border-line bg-parch px-2 py-0.5 text-[9.5px] font-bold">{m.role}</span></td>
                    <td className="px-4 py-2.5">{m.mfa ? <Check size={14} className="text-pine" /> : <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800"><TriangleAlert size={11} />off</span>}</td>
                    <td className="px-4 py-2.5 font-mono text-[9.5px] text-slate-ink">{m.lastActive}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Data retention & region */}
          <section className="rounded-2xl border border-line bg-white p-5 sm:p-6 card-shadow">
            <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]"><Database size={14} />Data retention & residency</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-ink">Transcript retention</span>
                <select value={retention} onChange={e => setRetention(e.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-line bg-parch/40 px-3 text-[13px] font-semibold outline-none focus:border-pine">
                  {['30', '90', '180', '365'].map(d => <option key={d} value={d}>{d} days</option>)}
                </select>
              </label>
              <label className="block"><span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-ink"><Globe2 size={11} />Region pin</span>
                <select value={region} onChange={e => setRegion(e.target.value)} className="mt-1.5 w-full h-11 rounded-xl border border-line bg-parch/40 px-3 text-[13px] font-semibold outline-none focus:border-pine">
                  {['us-east-1 (simulated)', 'us-west-2 (simulated)', 'eu-central-1 (simulated)', 'ap-southeast-2 (simulated)'].map(r => <option key={r}>{r}</option>)}
                </select>
              </label>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4">
              <input type="checkbox" checked={legalHold} onChange={e => { setLegalHold(e.target.checked); log('legalhold.toggle', 'tenant_riverside', e.target.checked ? 'Legal hold ENGAGED — all deletions suspended, matters preserved' : 'Legal hold released', 'escalated'); }} className="mt-1 h-4 w-4 accent-amber-700" />
              <span className="text-[12px] leading-snug text-amber-900"><strong className="flex items-center gap-1.5"><Landmark size={13} />Legal hold</strong>When on, transcript and audit deletion is suspended for this tenant regardless of retention timers. Chained to the audit log on toggle.</span>
            </label>
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-[10.5px] text-slate-ink">Raw audio: <strong>never stored by default</strong> · deletion jobs: daily · certificates chained.</p>
              <button onClick={saveRetention} className="h-11 rounded-xl bg-pine-deep px-6 text-[12px] font-bold text-white hover:bg-pine-deep2">Save retention policy</button>
            </div>
          </section>

          {/* API keys */}
          <section className="overflow-hidden rounded-2xl border border-line bg-white card-shadow">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5"><h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]"><KeyRound size={14} />API keys · scoped, revocable</h2><button onClick={mintKey} className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-[10.5px] font-bold text-white"><Plus size={13} />Mint key</button></div>
            <div className="divide-y divide-line/60">
              {keys.map(k => (
                <div key={k.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1"><p className="font-mono text-[10.5px] font-bold text-ink">{k.id}</p><p className="text-[10px] text-slate-ink">{k.name} · scope: <span className="font-mono">{k.scope}</span></p><p className="font-mono text-[8.5px] text-slate-ink/70">created {k.created} · last used {k.lastUsed}</p></div>
                  <button onClick={() => copyKey(k.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-line hover:border-pine" aria-label="Copy key id">{copiedKey === k.id ? <Check size={15} className="text-pine" /> : <Copy size={15} />}</button>
                  <button onClick={() => revokeKey(k.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50" aria-label="Revoke key"><Trash2 size={15} /></button>
                </div>
              ))}
              {keys.length === 0 && <p className="px-5 py-6 text-center text-[11px] text-slate-ink">No active keys. Mint one to integrate your EMR or case-management system.</p>}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN — billing + verification */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* Plan */}
          <section className="rounded-2xl bg-spruce-950 text-white p-6 card-shadow">
            <div className="flex items-center justify-between"><h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-[#e5c878]">Professional plan</h2><span className="rounded-full border border-teal-400/30 bg-teal-400/10 px-2.5 py-1 text-[9px] font-bold text-teal-300">current</span></div>
            <p className="mt-3 font-display text-4xl font-semibold">$740<span className="text-base text-white/50">/mo</span></p>
            <p className="mt-1 text-[10.5px] text-white/55">750 routed sessions · 5 pairs · T0–T3 policy · pass-through human minutes (0% markup)</p>
            <dl className="mt-4 space-y-2 border-t border-white/10 pt-4 text-[11px]">
              {[['Sessions used (Oct)', '242 / 750'], ['AI-contained', '171 sessions'], ['Human-routed', '67 sessions'], ['Monitor minutes (pass-through)', '$312.40']].map(([k, v]) => (
                <div key={k as string} className="flex items-center justify-between"><dt className="text-white/55">{k}</dt><dd className="font-mono font-bold">{v}</dd></div>
              ))}
            </dl>
            <button onClick={() => toast({ title: 'Plan change requested', body: 'Your account team will reach out within one business day (simulated).', tone: 'info' })} className="mt-4 w-full h-11 rounded-xl border border-white/20 bg-white/5 text-[12px] font-bold hover:bg-white/10">Compare plans / upgrade</button>
          </section>

          {/* Invoices */}
          <section className="overflow-hidden rounded-2xl border border-line bg-white card-shadow">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5"><h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]"><Receipt size={14} />Invoices</h2><button onClick={() => { log('invoice.export', 'tenant_riverside', 'All invoices CSV exported', 'info'); toast({ title: 'Invoices exported', body: 'CSV downloaded.', tone: 'ok' }); }} className="text-[10.5px] font-bold text-pine-deep hover:underline">Export all</button></div>
            {[['INV-2026-0101', 'October 2026', '$740 + $312.40 pass-through', false], ['INV-2026-0092', 'September 2026', '$740 + $268.10 pass-through', true], ['INV-2026-0088', 'August 2026', '$740 + $295.75 pass-through', true]].map(([id, period, amt]) => (
              <div key={id as string} className="flex items-center justify-between gap-3 border-b border-line/60 px-5 py-3 last:border-0">
                <div><p className="font-mono text-[10.5px] font-bold">{id}</p><p className="text-[9px] text-slate-ink">{period} · {amt}</p></div>
                {invoicePaid.includes(id as string)
                  ? <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700"><CircleCheck size={13} />Paid</span>
                  : <button onClick={() => { setInvoicePaid(p => [...p, id as string]); log('invoice.pay', id as string, 'Invoice marked paid (simulated charge)', 'success'); toast({ title: 'Payment recorded', body: id as string, tone: 'ok' }); }} className="inline-flex items-center gap-1.5 rounded-lg border border-pine bg-pine-mist px-3 py-2 text-[10px] font-bold text-pine-deep"><CreditCard size={13} />Pay now</button>}
              </div>
            ))}
          </section>

          {/* Trust & keys */}
          <section className="rounded-2xl border border-line bg-white p-5 card-shadow">
            <h2 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]"><ShieldCheck size={14} />Tenant trust posture</h2>
            <ul className="mt-3 space-y-2 text-[11px] leading-snug text-slate-ink">
              {['Envelope encryption: AES-256-GCM · per-tenant DEK, KMS-wrapped · region us-east-1', 'Cross-tenant access: denied by RLS · contract-tested (38 assertions) · last run pass', 'Operator access: break-glass only · 0 routine accesses in 30 days · all breaks audited', 'SSO: SAML/OIDC ready — enable with your IdP metadata (P4)', 'BYOK (tenant-supplied KMS keys): Phase 5 roadmap'].map(t => <li key={t} className="flex items-start gap-2"><CircleCheck size={13} className="mt-0.5 shrink-0 text-pine" />{t}</li>)}
            </ul>
            <p className="mt-3 border-t border-line pt-3 font-mono text-[8.5px] text-slate-ink">“SOC 2-ready design” — Type II not yet performed · docs/compliance/control-matrix.md</p>
          </section>

          {/* Danger */}
          <section className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5">
            <h2 className="flex items-center gap-2 text-[10.5px] font-black uppercase tracking-[0.18em] text-rose-800"><Trash size={14} />Danger zone</h2>
            <p className="mt-2 text-[11px] text-rose-900/80 leading-snug">Export everything, then close the tenant. Deletion issues a chained certificate and cannot be undone.</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => { log('tenant.export', 'tenant_riverside', 'Full tenant export requested (GDPR Art. 20-style)', 'info'); toast({ title: 'Export queued', body: 'You will receive a signed download link within 24h (simulated).', tone: 'info' }); }} className="h-10 rounded-xl border border-rose-300 bg-white px-4 text-[10.5px] font-bold text-rose-800">Request full export</button>
              <button onClick={() => { log('tenant.delete.requested', 'tenant_riverside', 'TENANT DELETION REQUESTED — cooling-off 14 days, operator countersign required', 'escalated'); toast({ title: 'Deletion requested', body: '14-day cooling-off started · cancellable in Admin (simulated).', tone: 'danger' }); }} className="h-10 rounded-xl border border-rose-400 bg-rose-600 px-4 text-[10.5px] font-black text-white">Request deletion</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
