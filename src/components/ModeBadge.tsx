const MODE_STYLE: Record<string, { label: string; tone: 'ok' | 'warn' | 'danger' | 'info' }> = {
  AI_ONLY: { label: 'AI only', tone: 'ok' },
  AI_WITH_HUMAN_MONITOR: { label: 'AI + human monitor', tone: 'warn' },
  HUMAN_PRIMARY_AI_ASSIST: { label: 'Human-primary · AI assist', tone: 'info' },
  HUMAN_ONLY: { label: 'Human only', tone: 'danger' },
};

const TONE: Record<string, string> = {
  ok: 'border-ok/25 bg-ok-soft text-ok',
  warn: 'border-warn/30 bg-warn-soft text-warn',
  danger: 'border-danger/30 bg-danger-soft text-danger',
  info: 'border-info/25 bg-info-soft text-info',
};

export default function ModeBadge({ mode, size = 'md' }: { mode: string; light?: boolean; size?: 'sm' | 'md' }) {
  const m = MODE_STYLE[mode] ?? MODE_STYLE.AI_ONLY;
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-[12px]' : 'px-2 py-0.5 text-[12px]';
  return (
    <span className={`inline-flex items-center border font-semibold ${TONE[m.tone]} ${pad}`}>
      {m.label}
    </span>
  );
}
