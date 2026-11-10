import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import SiteLayout from '../components/SiteLayout';
import { useStore } from '../lib/store';
import { FieldLabel, inputClass } from '../components/ui';

const STAGES = ['Organization', 'Scenario', 'Confirm'] as const;
const SCENARIOS = [
  { id: 'dosage', t: 'Clinical: dosage counseling', d: 'T2 · English↔Spanish · 500 mg → 50 mg back-translation flag' },
  { id: 'eviction', t: 'Legal aid: eviction hearing prep', d: 'T3 · rights-affecting · interpreter of record from the first word' },
  { id: 'iep', t: 'School: IEP parent meeting', d: 'T2 · monitored AI with terminology-vetted monitor' },
  { id: 'utility', t: 'City services: utility shutoff notice', d: 'T1→T3 escalation when urgency cues appear' },
];

export default function Demo() {
  const nav = useNavigate();
  const toast = useStore(s => s.toast);
  const log = useStore(s => s.log);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ org: '', name: '', workEmail: '', phone: '', scenario: 'dosage', pair: 'English ↔ Spanish', team: '6–25', volume: '150–750' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (s: number) => {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!form.org.trim()) e.org = 'Organization name is required';
      if (!form.name.trim()) e.name = 'Your name is required';
      if (!/^\S+@\S+\.\S+$/.test(form.workEmail)) e.workEmail = 'Enter a valid work email';
    }
    if (s === 2 && !form.phone.trim()) e.phone = 'Add a phone number so the record is complete';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => Math.min(2, s + 1)); };
  const back = () => setStep(s => Math.max(0, s - 1));

  const submit = () => {
    if (!validate(2)) return;
    log('demo.request.local', form.org, `Local demonstration request stored · scenario=${form.scenario} · pair=${form.pair}`, 'info');
    try {
      localStorage.setItem('intevaris_demo_request', JSON.stringify({ ...form, savedAt: new Date().toISOString() }));
    } catch { /* quota */ }
    toast({ title: 'Saved on this device', body: 'No sales system is connected. Your answers are stored locally and written to the demo audit log.', tone: 'ok' });
    setDone(true);
  };

  const field = (label: string, key: keyof typeof form, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        {...props}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={inputClass(Boolean(errors[key]))}
      />
      {errors[key] && <span className="mt-1 block text-[13px] font-medium text-danger">{errors[key]}</span>}
    </label>
  );

  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-[13px] font-medium text-brand">Demonstration request</p>
          <h1 className="mt-3 font-display text-4xl leading-[1.1] text-ink">Walk a hard encounter through the policy path.</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">This form does not notify a sales team. Submitting stores a local record so you can continue in the workspace with an honest paper trail.</p>
          <ul className="mt-6 space-y-2 text-[14px] text-muted">
            <li>Pick a scenario the live session can script.</li>
            <li>Open the workspace afterward — same product surface.</li>
            <li>Nothing here transmits PHI or contacts Intevaris.</li>
          </ul>
        </div>

        <div className="lg:col-span-7">
          <div className="panel p-6 sm:p-8">
            {done ? (
              <div>
                <CheckCircle2 size={36} className="text-ok" strokeWidth={1.5} />
                <h2 className="mt-4 font-display text-3xl">Saved locally.</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">A demonstration request for <strong className="text-ink">{form.org}</strong> is on this browser only. It was not delivered to a sales queue. Continue in the sandbox workspace to run the encounter.</p>
                <button onClick={() => nav('/app')} className="mt-6 inline-flex h-11 items-center gap-2 bg-brand px-5 text-[14px] font-semibold text-white hover:bg-brand-hover">
                  Open the workspace <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <ol className="flex items-center gap-2" aria-label="Form progress">
                  {STAGES.map((s, i) => (
                    <li key={s} className="flex flex-1 items-center gap-2">
                      <span className={`grid h-7 w-7 place-items-center font-mono text-[12px] ${i <= step ? 'bg-brand text-white' : 'bg-subtle text-muted'}`}>{i + 1}</span>
                      <span className={`hidden text-[13px] sm:block ${i <= step ? 'font-semibold text-ink' : 'text-faint'}`}>{s}</span>
                      {i < STAGES.length - 1 && <span className="h-px flex-1 bg-line" />}
                    </li>
                  ))}
                </ol>

                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="s0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-7 grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">{field('Organization', 'org', { placeholder: 'Riverside Community Health' })}</div>
                      {field('Your name', 'name', { placeholder: 'Jordan Ellis' })}
                      {field('Work email', 'workEmail', { type: 'email', placeholder: 'j.ellis@example.org' })}
                      {field('Phone', 'phone', { type: 'tel', placeholder: '+1 (614) 555-0180' })}
                      <label className="block">
                        <FieldLabel>Team size</FieldLabel>
                        <select value={form.team} onChange={e => setForm(f => ({ ...f, team: e.target.value }))} className={inputClass()}>
                          {['1–5', '6–25', '26–100', '100+'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </label>
                      <label className="block">
                        <FieldLabel>Monthly encounter volume</FieldLabel>
                        <select value={form.volume} onChange={e => setForm(f => ({ ...f, volume: e.target.value }))} className={inputClass()}>
                          {['<150', '150–750', '750–2,000', '2,000+'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </label>
                    </motion.div>
                  )}
                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-7">
                      <FieldLabel>Hardest scenario</FieldLabel>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {SCENARIOS.map(sc => (
                          <button key={sc.id} type="button" onClick={() => setForm(f => ({ ...f, scenario: sc.id }))} className={`border p-4 text-left ${form.scenario === sc.id ? 'border-brand bg-brand-soft' : 'border-line hover:bg-subtle'}`}>
                            <p className="text-[14px] font-semibold">{sc.t}</p>
                            <p className="mt-1 text-[13px] text-muted">{sc.d}</p>
                          </button>
                        ))}
                      </div>
                      <label className="mt-5 block">
                        <FieldLabel>Primary language pair</FieldLabel>
                        <select value={form.pair} onChange={e => setForm(f => ({ ...f, pair: e.target.value }))} className={inputClass()}>
                          {['English ↔ Spanish', 'English ↔ Arabic', 'English ↔ Mandarin', 'English ↔ Vietnamese', 'English ↔ Haitian Creole', 'Other (we’ll scope it)'].map(v => <option key={v}>{v}</option>)}
                        </select>
                      </label>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-7">
                      <dl className="divide-y divide-line border border-line">
                        {[['Organization', form.org], ['Contact', `${form.name} · ${form.workEmail}`], ['Phone', form.phone || '—'], ['Scenario', SCENARIOS.find(s => s.id === form.scenario)?.t ?? ''], ['Pair', form.pair], ['Volume / team', `${form.volume} sessions/mo · team ${form.team}`]].map(([k, v]) => (
                          <div key={k as string} className="flex justify-between gap-6 px-4 py-3">
                            <dt className="text-[13px] text-muted">{k}</dt>
                            <dd className="text-right text-[14px] font-medium">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      {errors.phone && <p className="mt-2 text-[13px] font-medium text-danger">{errors.phone}</p>}
                      <p className="mt-4 text-[13px] leading-relaxed text-muted">Submitting writes this record to localStorage and the on-device audit log. It is not sent to a server.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-7 flex items-center justify-between gap-3">
                  {step > 0 ? <button onClick={back} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-muted hover:text-ink"><ArrowLeft size={15} /> Back</button> : <span />}
                  {step < 2
                    ? <button onClick={next} className="inline-flex h-11 items-center gap-2 bg-brand px-5 text-[14px] font-semibold text-white hover:bg-brand-hover">Continue <ArrowRight size={16} /></button>
                    : <button onClick={submit} className="inline-flex h-11 items-center gap-2 bg-brand px-5 text-[14px] font-semibold text-white hover:bg-brand-hover">Save local request</button>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
