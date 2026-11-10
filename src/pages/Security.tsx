import { useState } from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import SiteLayout, { MarketingHero } from '../components/SiteLayout';
import { claimsRegister } from '../lib/data';
import { ClaimTag } from '../components/ui';

const TABS = ['Data handling', 'Access & audit', 'Claims register', 'Legal sources'] as const;

const MATRIX = [
  { area: 'Tenancy isolation', state: 'Demonstration: contract-test story (38 assertions). Production RLS is proposed, not hosted here.', ok: false, kind: 'Proposed + demo tests' },
  { area: 'Encryption in transit', state: 'Proposed: TLS 1.3. This static app does not terminate production media.', ok: false, kind: 'Proposed' },
  { area: 'Encryption at rest', state: 'Proposed: AES-256 per-tenant keys. Demo persistence is localStorage, unencrypted at rest in the browser.', ok: false, kind: 'Proposed' },
  { area: 'Audit logging', state: 'Implemented in-demo: ordered events with FNV-style integrity hash. Not SHA-256 production infrastructure.', ok: true, kind: 'Demo implementation' },
  { area: 'Retention & deletion', state: 'Admin UI simulates retention and legal hold. No backend deletion jobs run.', ok: true, kind: 'Demo implementation' },
  { area: 'Access reviews / SSO', state: 'Role switcher is a view filter. SSO/SCIM is roadmap, not implemented.', ok: false, kind: 'Proposed' },
  { area: 'Independent audit', state: 'Not performed. We do not claim SOC 2, HIPAA, GDPR, or ISO certification.', ok: false, kind: 'Not obtained' },
];

export default function Security() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Data handling');
  return (
    <SiteLayout>
      <MarketingHero kicker="Security and evidence" title="State what this build does, what is proposed, and what has never been certified.">
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">No military-grade, zero-knowledge, or pre-audit “compliant” language. Legal rules are sourced, dated data that still need counsel review.</p>
      </MarketingHero>

      <div className="sticky top-16 z-30 border-b border-line bg-page">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-3 py-2 text-[14px] ${tab === t ? 'border-b-2 border-brand font-semibold text-ink' : 'text-muted hover:text-ink'}`}>{t}</button>
          ))}
        </div>
      </div>

      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {tab === 'Data handling' && (
            <div className="grid gap-10 lg:grid-cols-2">
              <div>
                <h2 className="text-[18px] font-semibold">Implemented in this demonstration</h2>
                <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted">
                  <li>Audit events append in order and persist in the browser (localStorage key intevaris_audit_v1).</li>
                  <li>Integrity check recomputes an FNV-style hash over canonical event payloads. Tampering a stored field fails verification.</li>
                  <li>Evidence pack export is a JSON file generated in the client.</li>
                  <li>Admin retention controls write audit events; they do not delete remote data because none exists.</li>
                </ul>
              </div>
              <div>
                <h2 className="text-[18px] font-semibold">Proposed production architecture</h2>
                <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted">
                  <li>No raw audio stored by default — transcripts only, configurable retention, legal hold.</li>
                  <li>Region pinning and per-tenant envelope encryption with tenant-held keys.</li>
                  <li>PostgreSQL row-level security, signed images, SBOM, and operator break-glass that is always audited.</li>
                  <li>None of the above is running behind this Vite app.</li>
                </ul>
              </div>
              <div className="lg:col-span-2 border border-warn/40 bg-warn-soft p-5 text-[14px] leading-relaxed text-ink">
                Residual risks we cannot eliminate even in a production design: endpoint compromise on participant devices, and insider misuse within a tenant. Those would be surfaced via audit export — they are not solved by a hash chain.
              </div>
            </div>
          )}

          {tab === 'Access & audit' && (
            <div>
              <div className="overflow-x-auto border border-line">
                <table className="w-full min-w-[720px] text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-line bg-subtle">
                      <th className="px-4 py-3 font-semibold">Control area</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MATRIX.map(r => (
                      <tr key={r.area} className="border-b border-line align-top">
                        <td className="px-4 py-3 font-semibold">{r.area}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{r.kind}</td>
                        <td className="px-4 py-3 text-muted">
                          <span className="flex gap-2">
                            {r.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-ok" /> : <CircleAlert size={16} className="mt-0.5 shrink-0 text-warn" />}
                            {r.state}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-[13px] text-muted">Policy governance: tier rules are editable data with source URLs and needs_legal_review. Changing a mode writes an audit event. Prior decisions remain bound to the rule version in force at evaluation time — in this demo, that versioning is represented in the log, not a production rule store.</p>
            </div>
          )}

          {tab === 'Claims register' && (
            <div>
              <p className="max-w-2xl text-[15px] leading-relaxed text-muted">Every performance, security, or compliance claim — tagged MEASURED, HYPOTHESIS, or ASPIRATIONAL. Only MEASURED belongs in customer-facing proof.</p>
              <div className="mt-6 overflow-x-auto border border-line">
                <table className="w-full min-w-[720px] text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-line bg-subtle">
                      <th className="px-4 py-3 font-semibold">Claim</th>
                      <th className="px-4 py-3 font-semibold">Tag</th>
                      <th className="px-4 py-3 font-semibold">Evidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claimsRegister.map(r => (
                      <tr key={r.claim} className="border-b border-line align-top">
                        <td className="px-4 py-3 font-medium">{r.claim}</td>
                        <td className="px-4 py-3"><ClaimTag tag={r.tag} /></td>
                        <td className="px-4 py-3 text-muted">{r.evidence}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'Legal sources' && (
            <div>
              <p className="max-w-2xl text-[15px] leading-relaxed text-muted">Policy defaults are reference starting points. Not legal advice. Your counsel verifies before reliance.</p>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {[
                  { name: 'HHS Section 1557 (ACA)', what: 'Anti-discrimination in health programs — qualified interpreter expectations', url: 'hhs.gov/civil-rights/for-individuals/section-1557' },
                  { name: 'Ohio Adm. Code Rule 87', what: 'Court interpreter competency context for legal settings', url: 'casetext.com/regulation/ohio-administrative-code/rule-87' },
                  { name: 'California AB 1242', what: 'Interpretation in specified proceedings — rights-affecting reference', url: 'leginfo.legislature.ca.gov' },
                  { name: 'ISO 31000:2018', what: 'Risk-management vocabulary anchoring the T0–T3 model', url: 'iso.org/standard/65694.html' },
                  { name: 'WCAG 2.2 AA', what: 'Accessibility target for the participant experience. This demo has been designed toward that target; it has not had an independent WCAG audit.', url: 'w3.org/TR/WCAG22' },
                  { name: 'GDPR Art. 5(1)(e) / Art. 32', what: 'Storage limitation and security of processing — counsel review per region', url: 'eur-lex.europa.eu' },
                ].map(s => (
                  <article key={s.name} className="border-t border-line pt-4">
                    <h3 className="text-[16px] font-semibold">{s.name}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.what}</p>
                    <p className="mt-2 font-mono text-[12px] text-brand">{s.url}</p>
                    <p className="mt-2 text-[12px] text-warn">needs_legal_review</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
