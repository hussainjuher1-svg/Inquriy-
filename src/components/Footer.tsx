import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  const cols: Array<{ title: string; links: Array<[string, string]> }> = [
    { title: 'Product', links: [['How it works', '/how'], ['Security & evidence', '/security'], ['Pricing', '/pricing'], ['Customer scenarios', '/customers'], ['Request a demo', '/demo']] },
    { title: 'Company', links: [['About', '/about'], ['Claims register', '/security'], ['Legal sources', '/security']] },
    { title: 'Workspace', links: [['Command Center', '/app'], ['Policy engine', '/app/policy'], ['Evidence ledger', '/app/audit']] },
  ];
  return (
    <footer className="border-t border-line bg-subtle text-muted">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-5 max-w-[36ch] text-[14px] leading-relaxed">
              Policy-driven routing between AI interpretation and qualified humans, with an exportable record of decisions, consents, and corrections.
            </p>
            <p className="mt-4 text-[13px] leading-relaxed">This demonstration does not hold a SOC 2, HIPAA, or ISO certificate. Control design is documented; independent audit has not been completed.</p>
          </div>
          {cols.map(col => (
            <div key={col.title} className="lg:col-span-2">
              <h2 className="text-[13px] font-semibold text-ink">{col.title}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map(([label, to]) => (
                  <li key={label}><Link to={to} className="text-[14px] hover:text-ink">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
          <div className="lg:col-span-2">
            <h2 className="text-[13px] font-semibold text-ink">Position</h2>
            <p className="mt-3 font-display text-[20px] leading-snug text-ink">AI where allowed. Humans where required.</p>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-line pt-6 text-[12px] sm:flex-row">
          <p>© 2026 Intevaris demonstration. Human interpreters hold final authority in rights-affecting moments.</p>
          <p className="font-mono">Local demo · FNV integrity hash · not production infrastructure</p>
        </div>
      </div>
    </footer>
  );
}
