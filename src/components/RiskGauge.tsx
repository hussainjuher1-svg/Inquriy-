export default function RiskGauge({ score, size = 140 }: { score: number; size?: number }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, score / 100);
  const color = score >= 58 ? '#B64D45' : score >= 34 ? '#A87532' : score >= 18 ? '#446E91' : '#34745B';
  const label = score >= 58 ? 'T3 · Rights-affecting' : score >= 34 ? 'T2 · Sensitive' : score >= 18 ? 'T1 · Routine' : 'T0 · Informational';
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 110 110" width={size} height={size} className="-rotate-90" aria-hidden="true">
          <circle cx="55" cy="55" r={r} fill="none" stroke="#E1E6E0" strokeWidth="10" />
          <circle
            cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={c} strokeDashoffset={c * (1 - frac * 0.75)}
            style={{ transition: 'stroke-dashoffset .6s ease, stroke .3s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[28px] font-medium leading-none text-ink">{score}</span>
          <span className="mt-1 font-mono text-[11px] text-faint">/ 100</span>
        </div>
      </div>
      <span className="mt-3 text-[13px] font-medium text-muted">{label}</span>
    </div>
  );
}
