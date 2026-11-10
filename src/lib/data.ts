/* INTEVARIS — seed data. All figures are DEMONSTRATION data for the simulated
   workspace; no real tenants, patients, or customers are represented. */

export interface SeedSession {
  id: string; patient: string; mrn: string; pair: string; pairNative: string;
  setting: string; tier: 'T0'|'T1'|'T2'|'T3'; mode: string; riskScore: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'escalated';
  interpreter: string | null; host: string; scheduledFor: string; durationSec: number;
  flags: number; consent: boolean;
}

export const PAIRS = ['English ↔ Spanish', 'English ↔ Arabic', 'English ↔ Mandarin', 'English ↔ Vietnamese', 'English ↔ Haitian Creole'] as const;

export const seedSessions: SeedSession[] = [
  { id: 'ses_9f3k2', patient: 'Maria G.', mrn: 'MRN-22941', pair: 'English ↔ Spanish', pairNative: 'Español', setting: 'Clinic', tier: 'T2', mode: 'AI_WITH_HUMAN_MONITOR', riskScore: 44, status: 'in_progress', interpreter: 'Daniela Ríos, CHI™', host: 'Dr. Patel', scheduledFor: 'Today · 10:42 AM', durationSec: 412, flags: 2, consent: true },
  { id: 'ses_2m8x1', patient: 'Ahmed H.', mrn: 'MRN-10298', pair: 'English ↔ Arabic', pairNative: 'العربية', setting: 'Benefits office', tier: 'T2', mode: 'AI_WITH_HUMAN_MONITOR', riskScore: 38, status: 'in_progress', interpreter: null, host: 'Caseworker J. Okafor', scheduledFor: 'Today · 11:15 AM', durationSec: 268, flags: 1, consent: true },
  { id: 'ses_7p1q4', patient: 'Lin W.', mrn: 'MRN-88714', pair: 'English ↔ Mandarin', pairNative: '中文', setting: 'Intake call center', tier: 'T1', mode: 'AI_ONLY', riskScore: 19, status: 'in_progress', interpreter: null, host: 'Front desk', scheduledFor: 'Today · 11:30 AM', durationSec: 131, flags: 0, consent: true },
  { id: 'ses_4t6w9', patient: 'Rosa A.', mrn: 'MRN-55201', pair: 'English ↔ Spanish', pairNative: 'Español', setting: 'Legal aid', tier: 'T3', mode: 'HUMAN_ONLY', riskScore: 74, status: 'escalated', interpreter: 'Lucía Fernández, EIPA', host: 'Atty. R. Mendes', scheduledFor: 'Today · 9:05 AM', durationSec: 1230, flags: 3, consent: true },
  { id: 'ses_1r5v8', patient: 'Khai D.', mrn: 'MRN-73016', pair: 'English ↔ Vietnamese', pairNative: 'Tiếng Việt', setting: 'Clinic', tier: 'T2', mode: 'AI_WITH_HUMAN_MONITOR', riskScore: 41, status: 'scheduled', interpreter: 'Minh Trần', host: 'Dr. Nguyen', scheduledFor: 'Today · 1:00 PM', durationSec: 0, flags: 0, consent: false },
  { id: 'ses_8c4n6', patient: 'Wilner J.', mrn: 'MRN-66463', pair: 'English ↔ Haitian Creole', pairNative: 'Kreyòl ayisyen', setting: 'City services', tier: 'T1', mode: 'AI_WITH_HUMAN_MONITOR', riskScore: 22, status: 'completed', interpreter: null, host: '311 Kiosk', scheduledFor: 'Today · 8:20 AM', durationSec: 540, flags: 0, consent: true },
  { id: 'ses_6y2h7', patient: 'Sofia L.', mrn: 'MRN-91742', pair: 'English ↔ Spanish', pairNative: 'Español', setting: 'School', tier: 'T2', mode: 'AI_WITH_HUMAN_MONITOR', riskScore: 47, status: 'completed', interpreter: 'Daniela Ríos, CHI™', host: 'Counselor I. Brooks', scheduledFor: 'Today · 8:00 AM', durationSec: 690, flags: 1, consent: true },
];

export interface Interpreter {
  id: string; name: string; initials: string; pairs: string[]; specialties: string[];
  credentials: { name: string; issuer: string; expiry: string; verified: boolean }[];
  rating: number; sessions: number; acceptance: number; avgJoinSec: number;
  status: 'on-shift' | 'on-break' | 'offline'; languages: string;
}

export const interpreters: Interpreter[] = [
  { id: 'int_01', name: 'Daniela Ríos', initials: 'DR', pairs: ['English ↔ Spanish'], specialties: ['Clinical', 'Pediatrics'], credentials: [{ name: 'CHI™ Certification', issuer: 'NBCMI', expiry: '2028-03-14', verified: true }], rating: 4.9, sessions: 1240, acceptance: 97.2, avgJoinSec: 7.1, status: 'on-shift', languages: 'es-US · en' },
  { id: 'int_02', name: 'Lucía Fernández', initials: 'LF', pairs: ['English ↔ Spanish'], specialties: ['Legal', 'Immigration'], credentials: [{ name: 'EIPA Court Interpreter', issuer: 'State Judiciary', expiry: '2027-11-30', verified: true }], rating: 4.8, sessions: 980, acceptance: 94.6, avgJoinSec: 8.8, status: 'on-shift', languages: 'es-MX · en' },
  { id: 'int_03', name: 'Minh Trần', initials: 'MT', pairs: ['English ↔ Vietnamese'], specialties: ['Clinical', 'Benefits'], credentials: [{ name: 'CHI™ Certification', issuer: 'NBCMI', expiry: '2026-12-31', verified: true }], rating: 4.7, sessions: 762, acceptance: 91.3, avgJoinSec: 9.4, status: 'on-shift', languages: 'vi · en' },
  { id: 'int_04', name: 'Fatima Al-Sayed', initials: 'FA', pairs: ['English ↔ Arabic'], specialties: ['Legal', 'Benefits'], credentials: [{ name: 'NAATI Professional', issuer: 'NAATI', expiry: '2027-06-22', verified: true }], rating: 4.9, sessions: 1115, acceptance: 96.1, avgJoinSec: 6.6, status: 'on-break', languages: 'ar-EG · en' },
  { id: 'int_05', name: 'Chen Wei', initials: 'CW', pairs: ['English ↔ Mandarin'], specialties: ['Clinical', 'Finance'], credentials: [{ name: 'CHI™ Certification', issuer: 'NBCMI', expiry: '2029-01-18', verified: true }], rating: 4.6, sessions: 640, acceptance: 88.9, avgJoinSec: 10.2, status: 'on-shift', languages: 'zh-CN · en' },
  { id: 'int_06', name: 'Jean-Baptiste R.', initials: 'JR', pairs: ['English ↔ Haitian Creole'], specialties: ['City services', 'Emergency'], credentials: [{ name: 'State Language Access Roster', issuer: 'City of Columbus', expiry: '2027-08-09', verified: true }, { name: 'NBCMI Hub', issuer: 'NBCMI', expiry: '2026-11-15', verified: false }], rating: 4.5, sessions: 430, acceptance: 85.4, avgJoinSec: 11.7, status: 'offline', languages: 'ht · en · fr' },
];

export interface Glossary {
  id: string; name: string; pair: string; domain: string; terms: number; updated: string; owner: string;
  sample: { source: string; target: string; note?: string }[];
}
export const glossaries: Glossary[] = [
  { id: 'glo_01', name: 'Riverside Pediatrics — Clinical Core', pair: 'English ↔ Spanish', domain: 'Clinical', terms: 214, updated: '2 d ago', owner: 'Dr. Patel', sample: [
    { source: 'dosage', target: 'dosis', note: 'Never shortened; always paired with unit' },
    { source: 'contraindication', target: 'contraindicación', note: 'Back-translate if flagged' },
    { source: 'informed consent', target: 'consentimiento informado', note: 'Rights-affecting — T2+ handling' },
  ]},
  { id: 'glo_02', name: 'Legal Aid — Housing & Eviction', pair: 'English ↔ Spanish', domain: 'Legal', terms: 187, updated: '5 d ago', owner: 'Atty. R. Mendes', sample: [
    { source: 'eviction notice', target: 'aviso de desalojo', note: 'T3 context' },
    { source: 'affidavit', target: 'declaración jurada', note: 'Interpreter of record required' },
    { source: 'injunction', target: 'medida cautelar' },
  ]},
  { id: 'glo_03', name: 'Benefits Office — Eligibility', pair: 'English ↔ Arabic', domain: 'Benefits', terms: 156, updated: '1 wk ago', owner: 'Caseworker J. Okafor', sample: [
    { source: 'eligibility redetermination', target: 'إعادة تحديد الأهلية' },
    { source: 'benefit suspension', target: 'تعليق المزايا', note: 'Numeric dates — flag mismatch' },
  ]},
  { id: 'glo_04', name: 'City 311 — Services & Permits', pair: 'English ↔ Vietnamese', domain: 'Municipal', terms: 142, updated: '3 d ago', owner: '311 Program', sample: [
    { source: 'permit', target: 'giấy phép' },
    { source: 'utility shutoff notice', target: 'thông báo cắt điện/nước', note: 'Urgency cues → risk bump' },
  ]},
];

export interface ClaimRow { claim: string; tag: 'MEASURED' | 'HYPOTHESIS' | 'ASPIRATIONAL'; evidence: string }
export const claimsRegister: ClaimRow[] = [
  { claim: 'Caption pipeline p50 ≤ 1.5 s, p95 ≤ 3 s', tag: 'HYPOTHESIS', evidence: 'Target SLO · no golden-set run yet · will be published only with method + n' },
  { claim: 'Speech pipeline p50 ≤ 3 s, p95 ≤ 5 s', tag: 'HYPOTHESIS', evidence: 'Target SLO · simulated adapters only; real-provider latency not yet measured' },
  { claim: 'Human handoff < 10 s from flag to interpreter on channel', tag: 'HYPOTHESIS', evidence: 'Target · simulated queue timing in demo; production n = 0' },
  { claim: 'Audit chain verification detects 100% of single-event tampering', tag: 'MEASURED', evidence: 'Demo verifier: 1,400-event seeded chain, 4/4 tamper classes detected · n = 12 synthetic runs' },
  { claim: 'Cross-tenant read/write denial under RLS policies', tag: 'MEASURED', evidence: 'Contract test suite: 38 assertions across 11 tables · CI-gated · demo environment' },
  { claim: 'Back-translation flags numeric/negation errors in T2/T3', tag: 'HYPOTHESIS', evidence: 'Design intent; golden dataset not yet built — labels “uncalibrated” until human-calibrated' },
  { claim: '“HIPAA compliant”, “SOC 2 certified”, “GDPR compliant”', tag: 'ASPIRATIONAL', evidence: 'Not shippable copy — we say “SOC 2-ready design”, “HIPAA-ready architecture” until audit completes' },
  { claim: 'Context survives interpreter handoff', tag: 'HYPOTHESIS', evidence: 'Design requirement; 0 production observations' },
];

export const weeklyVolume = [
  { d: 'Mon', sessions: 34, humanRouted: 12 }, { d: 'Tue', sessions: 41, humanRouted: 15 },
  { d: 'Wed', sessions: 38, humanRouted: 11 }, { d: 'Thu', sessions: 52, humanRouted: 19 },
  { d: 'Fri', sessions: 47, humanRouted: 14 }, { d: 'Sat', sessions: 18, humanRouted: 6 },
  { d: 'Sun', sessions: 12, humanRouted: 4 },
];

export const modeDistribution = [
  { mode: 'AI only', pct: 44, color: '#10b981' },
  { mode: 'AI + monitor', pct: 31, color: '#f59e0b' },
  { mode: 'Human-primary', pct: 14, color: '#f97316' },
  { mode: 'Human-only', pct: 11, color: '#f43f5e' },
];

export const latencyBars = [
  { stage: 'VAD', ms: 24 }, { stage: 'ASR', ms: 640 }, { stage: 'Segment', ms: 30 },
  { stage: 'Translate', ms: 890 }, { stage: 'Quality check', ms: 210 }, { stage: 'TTS', ms: 720 },
];

export const teamMembers = [
  { name: 'Dr. Amara Osei', role: 'Org admin', email: 'amara@riverside-health.example', lastActive: 'Now', mfa: true },
  { name: 'Jordan Ellis', role: 'Host', email: 'j.ellis@riverside-health.example', lastActive: '4 min ago', mfa: true },
  { name: 'Daniela Ríos', role: 'Interpreter', email: 'drios@vetted-interpreters.example', lastActive: '12 min ago', mfa: true },
  { name: 'Priya Raman', role: 'Reviewer', email: 'p.raman@riverside-health.example', lastActive: '1 h ago', mfa: false },
  { name: 'Platform Operator', role: 'Operator (break-glass)', email: 'ops@intevaris.example', lastActive: 'Break-glass only', mfa: true },
];

export const ACTIVITY = [
  { time: '10:44:12', text: 'Policy decision dec_8f2a — T2 clinic → AI_WITH_HUMAN_MONITOR (auto)', tone: 'pine' },
  { time: '10:42:03', text: 'Session ses_9f3k2 started — Maria G. · es-US · consent recorded', tone: 'pine' },
  { time: '10:39:47', text: 'Escalation esc_3119 — numeric mismatch flag (500→50 mg) · monitor alerted', tone: 'brass' },
  { time: '10:31:26', text: 'Attorney request — ses_4t6w9 upgraded to HUMAN_ONLY (rights-affecting)', tone: 'rose' },
  { time: '10:18:54', text: 'Audit chain checkpoint — 1,400 events · verification OK', tone: 'pine' },
  { time: '09:52:10', text: 'Consent re-recorded — ses_1r5v8 (participant requested new link)', tone: 'neutral' },
];
