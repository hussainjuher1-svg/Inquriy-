import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function DemoMark({ children = 'Demonstration data' }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center border border-line bg-subtle px-2 py-0.5 font-mono text-[11px] font-medium text-muted">
      {children}
    </span>
  );
}

export function ClaimTag({ tag }: { tag: 'MEASURED' | 'HYPOTHESIS' | 'ASPIRATIONAL' | 'DEMONSTRATION' }) {
  const cls =
    tag === 'MEASURED' ? 'border-ok/30 bg-ok-soft text-ok' :
    tag === 'HYPOTHESIS' ? 'border-warn/30 bg-warn-soft text-warn' :
    tag === 'DEMONSTRATION' ? 'border-line bg-subtle text-muted' :
    'border-danger/30 bg-danger-soft text-danger';
  return <span className={`inline-flex border px-2 py-0.5 font-mono text-[11px] font-medium tracking-wide ${cls}`}>{tag}</span>;
}

export function Button({
  children, variant = 'primary', className = '', ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warn' }) {
  const base = 'inline-flex h-11 items-center justify-center gap-2 px-4 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    secondary: 'border border-line bg-surface text-ink hover:border-line-strong hover:bg-subtle',
    ghost: 'text-muted hover:text-ink',
    danger: 'bg-danger text-white hover:bg-[#9a3f38]',
    warn: 'border border-warn/40 bg-warn-soft text-warn hover:bg-[#f0e3d2]',
  } as const;
  return <button className={`${base} ${styles[variant]} ${className}`} {...props}>{children}</button>;
}

export function StatusChip({ tone, children }: { tone: 'ok' | 'warn' | 'danger' | 'info' | 'neutral'; children: ReactNode }) {
  const map = {
    ok: 'border-ok/25 bg-ok-soft text-ok',
    warn: 'border-warn/30 bg-warn-soft text-warn',
    danger: 'border-danger/30 bg-danger-soft text-danger',
    info: 'border-info/25 bg-info-soft text-info',
    neutral: 'border-line bg-subtle text-muted',
  };
  return <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[12px] font-semibold ${map[tone]}`}>{children}</span>;
}

export function PageHeader({ kicker, title, description, actions }: { kicker?: string; title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {kicker && <p className="text-[12px] font-medium text-brand">{kicker}</p>}
        <h1 className="mt-1 font-sans text-[26px] font-semibold tracking-[-0.02em] text-ink sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="block text-[13px] font-medium text-ink">{children}</span>;
}

export function inputClass(error = false) {
  return `mt-1.5 h-11 w-full border bg-surface px-3 text-[14px] text-ink outline-none transition-colors placeholder:text-faint focus:border-brand ${error ? 'border-danger' : 'border-line'}`;
}
