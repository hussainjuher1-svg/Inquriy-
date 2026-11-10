export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="29" height="29" rx="2" fill="#1D6251" />
      <path d="M10 11.5h12M16 11.5V22" stroke="#F6F7F4" strokeWidth="1.7" strokeLinecap="square" />
      <path d="M10 11.5 8 18h4l-2-6.5M22 11.5 20 18h4l-2-6.5" stroke="#E8F1ED" strokeWidth="1.4" strokeLinecap="square" />
    </svg>
  );
}

export default function Logo({ compact = false, inverted = false }: { compact?: boolean; inverted?: boolean }) {
  const text = inverted ? 'text-white' : 'text-ink';
  const sub = inverted ? 'text-white/60' : 'text-muted';
  return (
    <span className="flex items-center gap-2.5 select-none">
      <LogoMark size={28} />
      {!compact && (
        <span className="leading-none">
          <span className={`block font-sans text-[15px] font-semibold tracking-[-0.02em] ${text}`}>Intevaris</span>
          <span className={`mt-1 block text-[11px] ${sub}`}>Interpretation governance</span>
        </span>
      )}
    </span>
  );
}
