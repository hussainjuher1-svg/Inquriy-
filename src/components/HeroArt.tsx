const STEPS = [
  { n: '01', t: 'Encounter context', d: 'Setting, jurisdiction, language pair, risk signals.' },
  { n: '02', t: 'Policy decision', d: 'Mode computed from editable, sourced rules — never an account default.' },
  { n: '03', t: 'Monitored session', d: 'Segment checks on numbers, negations, dosages, missed terms.' },
  { n: '04', t: 'Human intervention', d: 'Interpreter takeover when policy or quality requires it.' },
  { n: '05', t: 'Evidence export', d: 'Decisions, consents, flags, and corrections in one ordered pack.' },
];

export default function HeroArt() {
  return (
    <div className="panel overflow-hidden" aria-label="Product workflow preview">
      <div className="flex items-center justify-between border-b border-line bg-subtle px-4 py-3">
        <p className="text-[13px] font-semibold text-ink">Routing sequence</p>
        <p className="font-mono text-[11px] text-muted">Demonstration · T2 clinic · es-US</p>
      </div>
      <ol>
        {STEPS.map((s, i) => (
          <li key={s.n} className={`grid grid-cols-[52px_1fr] gap-3 px-4 py-3.5 ${i < STEPS.length - 1 ? 'border-b border-line' : ''}`}>
            <span className="font-mono text-[12px] text-brand">{s.n}</span>
            <div>
              <p className="text-[14px] font-semibold text-ink">{s.t}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="border-t border-line bg-brand-soft px-4 py-3">
        <p className="text-[13px] text-ink"><span className="font-semibold">Outcome:</span> AI with human monitor · consent recorded · numeric flag open</p>
      </div>
    </div>
  );
}
