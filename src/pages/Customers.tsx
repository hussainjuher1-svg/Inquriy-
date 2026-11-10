import { useNavigate } from 'react-router-dom';
import SiteLayout, { MarketingHero } from '../components/SiteLayout';
import { ClaimTag } from '../components/ui';

const stories = [
  {
    org: 'Riverside Health', type: 'Community health system', setting: '12 clinics',
    result: 'Dosage flags caught pre-administration in simulated runs',
    quote: 'Three times in our pilot, the back-translation check caught a “once daily vs twice daily” discrepancy before the patient left the room.',
    person: 'Dr. Amara Osei, CMIO',
  },
  {
    org: 'Legal Aid Society', type: 'Housing and eviction unit', setting: 'Columbus, OH',
    result: 'Rights-affecting segments ran human-only, enforced',
    quote: 'The judge wants to know who interpreted what and when. We export the evidence pack instead of assembling affidavits.',
    person: 'Atty. Rafael Mendes, Supervising Attorney',
  },
  {
    org: 'Springfield Public Schools', type: 'K–12 district', setting: 'IEP and enrollment',
    result: 'IEP season handled with monitored AI on T2 policy',
    quote: 'The front office runs intake and pulls a human the moment policy says so.',
    person: 'Ingrid Brooks, Family Engagement Director',
  },
  {
    org: 'City of Columbus 311', type: 'Municipal services', setting: 'Utilities, permits',
    result: 'T0/T1 volume self-served; T3 auto-escalated with an audit trail',
    quote: 'A utility shutoff notice is not T1. The system knew that before the caller did.',
    person: 'Marcus Whitfield, 311 Program Manager',
  },
];

export default function Customers() {
  const nav = useNavigate();
  return (
    <SiteLayout>
      <MarketingHero kicker="Customers" title="Illustrative scenarios — not a customer list.">
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-muted">Organizations, quotes, and outcomes on this page are demonstration content used to explain the product. They are not partnerships, pilots, or endorsements.</p>
        <div className="mt-4"><ClaimTag tag="DEMONSTRATION" /></div>
      </MarketingHero>
      <section className="py-14">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2">
          {stories.map(s => (
            <article key={s.org} className="border-t border-line pt-6">
              <p className="text-[13px] font-medium text-brand">{s.org} · {s.type}</p>
              <blockquote className="mt-4 font-display text-[22px] leading-snug text-ink">“{s.quote}”</blockquote>
              <p className="mt-4 text-[14px] text-muted">{s.person} — {s.setting}</p>
              <p className="mt-3 text-[14px] text-ink"><span className="font-semibold">Scenario result: </span>{s.result}</p>
              <button onClick={() => nav('/demo')} className="mt-4 text-[14px] font-semibold text-brand">Run this scenario in the demo</button>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
