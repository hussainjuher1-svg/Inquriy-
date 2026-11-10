/* INTEVARIS POLICY ENGINE — editable defaults, needs_legal_review.
   Legal rules are DATA, never hard-coded into logic. Each rule carries source,
   effective date, reviewer status, and a needs_legal_review flag. */

export type Tier = 'T0' | 'T1' | 'T2' | 'T3';
export type Mode =
  | 'AI_ONLY'
  | 'AI_WITH_HUMAN_MONITOR'
  | 'HUMAN_PRIMARY_AI_ASSIST'
  | 'HUMAN_ONLY';
export type Setting = 'Clinic' | 'Legal aid' | 'School' | 'City services' | 'Benefits office' | 'Intake call center';
export type Jurisdiction = 'Federal (HHS §1557)' | 'Ohio' | 'California' | 'Texas' | 'New York' | 'English (UK)';
export type LanguagePair = 'English ↔ Spanish' | 'English ↔ Arabic' | 'English ↔ Mandarin' | 'English ↔ Vietnamese' | 'English ↔ Haitian Creole';

export interface PolicyRule {
  tier: Tier;
  name: string;
  definition: string;
  modes: Mode[];
  credentials: string;
  disclosure: string;
  consent: string;
  retention: string;
  escalation: string;
  source: string;
  sourceUrl: string;
  effectiveDate: string;
  reviewer: string;
  needsLegalReview: boolean;
}

export const TIER_META: Record<Tier, { name: string; definition: string; tone: string; chip: string }> = {
  T0: { name: 'T0 · Informational', definition: 'General information, no rights at stake', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200', chip: 'bg-emerald-500' },
  T1: { name: 'T1 · Routine', definition: 'Scheduling, wayfinding, routine logistics', tone: 'text-sky-700 bg-sky-50 border-sky-200', chip: 'bg-sky-500' },
  T2: { name: 'T2 · Sensitive', definition: 'Clinical, benefits, education, finance', tone: 'text-amber-800 bg-amber-50 border-amber-200', chip: 'bg-amber-500' },
  T3: { name: 'T3 · Rights-affecting', definition: 'Consent, legal, immigration, emergency', tone: 'text-rose-700 bg-rose-50 border-rose-200', chip: 'bg-rose-500' },
};

export const MODE_META: Record<Mode, { label: string; short: string; tone: string; dot: string }> = {
  AI_ONLY: { label: 'AI only', short: 'AI', tone: 'text-emerald-800 bg-emerald-50 border-emerald-200', dot: '#10b981' },
  AI_WITH_HUMAN_MONITOR: { label: 'AI + human monitor', short: 'AI + MON', tone: 'text-amber-800 bg-amber-50 border-amber-200', dot: '#f59e0b' },
  HUMAN_PRIMARY_AI_ASSIST: { label: 'Human-primary · AI assist', short: 'HUM + AI', tone: 'text-orange-800 bg-orange-50 border-orange-200', dot: '#f97316' },
  HUMAN_ONLY: { label: 'Human only', short: 'HUMAN', tone: 'text-rose-800 bg-rose-50 border-rose-200', dot: '#f43f5e' },
};

export const DEFAULT_RULES: PolicyRule[] = [
  {
    tier: 'T0', name: 'Informational',
    definition: 'General information; no rights, safety, or liberty at stake.',
    modes: ['AI_ONLY'],
    credentials: 'None required',
    disclosure: 'Brief spoken + on-screen AI notice in the participant’s language, before content begins',
    consent: 'Implicit — notice acknowledged by session join',
    retention: 'Transcript only · 30-day default · deletable on request',
    escalation: 'Any quality flag → human notified within 30 s; participant told a human can join on request',
    source: 'HHS §1557 ACA implementing rule (reference; verify before reliance)',
    sourceUrl: 'https://www.hhs.gov/civil-rights/for-individuals/section-1557/index.html',
    effectiveDate: '2024-05-01', reviewer: 'Unreviewed — proposed default', needsLegalReview: true,
  },
  {
    tier: 'T1', name: 'Routine',
    definition: 'Scheduling, intake logistics, wayfinding, appointment reminders.',
    modes: ['AI_WITH_HUMAN_MONITOR', 'AI_ONLY'],
    credentials: 'Trained monitor on channel (or on-call)',
    disclosure: 'Spoken + on-screen AI notice; monitor presence disclosed',
    consent: 'Explicit tap-to-consent, recorded before audio',
    retention: 'Transcript + consent artifact · 90-day default · legal-hold capable',
    escalation: 'Numeric/negation mismatch or distress signal → auto-escalation to monitor in <10 s',
    source: 'Internal risk framework v0.9; aligned to ISO 31000 risk vocabulary',
    sourceUrl: 'https://www.iso.org/standard/65694.html',
    effectiveDate: '2026-10-01', reviewer: 'Internal review · pending counsel sign-off', needsLegalReview: true,
  },
  {
    tier: 'T2', name: 'Sensitive',
    definition: 'Clinical, benefits, education, finance — material consequence if mistranslated.',
    modes: ['AI_WITH_HUMAN_MONITOR'],
    credentials: 'Trained human monitor, terminology-vetted for the domain',
    disclosure: 'Full AI disclosure in participant language + named monitor on channel',
    consent: 'Explicit recorded consent, retained with session evidence pack',
    retention: 'Transcript + consent + flags · 90-day default · legal-hold capable',
    escalation: 'Back-translation check on flagged segments; monitor takeover <10 s; clinician notified on dosage flags',
    source: 'HHS §1557 (qualified interpreter expectations); Ohio Adm. Code Rule 87 (Rule 87 — court interpretation context); verify applicability per setting',
    sourceUrl: 'https://casetext.com/regulation/ohio-administrative-code/rule-87',
    effectiveDate: '2026-10-01', reviewer: 'Unreviewed — proposed default · needs_legal_review', needsLegalReview: true,
  },
  {
    tier: 'T3', name: 'Rights-affecting',
    definition: 'Consent, legal, immigration, emergency — liberty or major rights at stake.',
    modes: ['HUMAN_ONLY'],
    credentials: 'Credentialed interpreter of record, ID-verified, on channel before rights-affecting segment',
    disclosure: 'Human interpretation disclosed; AI absent or silent assist only with full record',
    consent: 'Two-party recorded consent; rights notice read aloud in participant language',
    retention: 'Full evidence pack · immutable · 7-year default · legal-hold enforced',
    escalation: 'Any distress, “I don’t understand”, or rights cue → interpreter takes over immediately; attorney/advocate loop-in offered',
    source: 'California AB 1242 (interpreters in court settings, reference); Ohio Rule 87 (certified interpreter contexts); counsel review required per deployment',
    sourceUrl: 'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240AB1242',
    effectiveDate: '2026-10-01', reviewer: 'Unreviewed — proposed default · needs_legal_review', needsLegalReview: true,
  },
];

export interface PolicyInput {
  setting: Setting;
  tier: Tier;
  pair: LanguagePair;
  jurisdiction: Jurisdiction;
  availability: boolean; // is a qualified human available now?
}
export interface PolicyDecision {
  input: PolicyInput;
  rule: PolicyRule;
  primaryMode: Mode;
  allowedModes: Mode[];
  blocked: boolean;
  failsafe: string[];
  notes: string[];
  overrideAllowed: boolean;
  evaluatedAt: string;
  decisionId: string;
}

export function decide(input: PolicyInput, rules: PolicyRule[] = DEFAULT_RULES): PolicyDecision {
  const rule = rules.find(r => r.tier === input.tier) ?? rules[0];
  const notes: string[] = [];
  let allowedModes = [...rule.modes];

  // Jurisdiction modifiers (data-driven; each carries needs_legal_review upstream)
  if ((input.setting === 'Legal aid') && (input.tier === 'T2' || input.tier === 'T3')) {
    allowedModes = ['HUMAN_PRIMARY_AI_ASSIST', 'HUMAN_ONLY'];
    notes.push('Legal-aid setting raises the floor to human-primary for T2+ (needs_legal_review).');
  }
  if (input.jurisdiction === 'California' && input.tier === 'T2' && input.setting === 'Clinic') {
    allowedModes = Array.from(new Set([...allowedModes, 'HUMAN_PRIMARY_AI_ASSIST' as Mode]));
    notes.push('AB 2079-aligned preference: interpreter of record available for clinical encounters (reference only).');
  }
  if (input.jurisdiction === 'English (UK)') {
    notes.push('UK deployment: Equality Act 2010 duty to make reasonable adjustments applies; counsel review required.');
  }
  // Empty mode set (rule edited to nothing) → fail-safe closed, never open
  if (allowedModes.length === 0) {
    allowedModes = ['HUMAN_ONLY'];
    notes.push('Rule has no permitted modes — fail-safe default: HUMAN_ONLY. Restore at least one mode in the Rule Editor.');
  }

  // Fail-safe: if a required human is unavailable, never silently fall back to AI.
  const strictestNeedsHuman = allowedModes.every(m => m !== 'AI_ONLY');
  const failsafe: string[] = [];
  let blocked = false;
  if (!input.availability && strictestNeedsHuman) {
    blocked = true;
    failsafe.push('A required human is not currently available. AI-only is NOT a permitted fallback for this tier.');
    failsafe.push('Offer: waitlist the next qualified interpreter (est. < 10 min), schedule a callback, or book a future slot.');
    failsafe.push('Permitted override exists only with an explicit, recorded reason and supervisor countersign.');
  } else if (!input.availability && allowedModes.includes('AI_ONLY')) {
    failsafe.push('Human unavailable — routine AI-only mode remains permitted for this tier. Monitor queue notified.');
  }

  const primaryMode = allowedModes[0];
  const decisionId = 'dec_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36);
  return {
    input, rule, primaryMode, allowedModes, blocked, failsafe, notes,
    overrideAllowed: input.tier === 'T2',
    evaluatedAt: new Date().toISOString(),
    decisionId,
  };
}

export interface RiskSignal { id: string; label: string; weight: number; detail: string }
export const RISK_SIGNALS: RiskSignal[] = [
  { id: 'consent_t3', label: 'Rights-affecting content expected', weight: 30, detail: 'Consent, legal, immigration, or emergency language likely' },
  { id: 'dosage', label: 'Medication / dosage content', weight: 18, detail: 'Numbers + clinical terms amplify mistranslation harm' },
  { id: 'distress', label: 'Distress or urgency cues', weight: 12, detail: 'Participant flagged distressed, in crisis, or under pressure' },
  { id: 'complex_terms', label: 'Complex terminology', weight: 10, detail: 'Domain-specific vocabulary (legal, clinical, benefits)' },
  { id: 'poor_audio', label: 'Poor audio / connection quality', weight: 8, detail: 'Noise, low bandwidth, or unstable channel' },
  { id: 'rushed', label: 'Time-pressured encounter', weight: 6, detail: 'Fast speech or compressed appointment window' },
];

export interface RiskAssessment { score: number; tier: Tier; reasons: string[] }

export function computeRisk(setting: Setting, signals: string[]): RiskAssessment {
  const settingBase: Record<Setting, number> = {
    'Clinic': 26, 'Legal aid': 34, 'School': 18, 'City services': 14, 'Benefits office': 24, 'Intake call center': 16,
  };
  const reasons: string[] = [];
  let score = settingBase[setting];
  reasons.push(`Setting floor: ${setting} (${settingBase[setting]})`);
  for (const s of signals) {
    const sig = RISK_SIGNALS.find(r => r.id === s);
    if (sig) { score += sig.weight; reasons.push(`+${sig.weight} ${sig.label}`); }
  }
  score = Math.min(96, score);
  const tier: Tier = score >= 58 ? 'T3' : score >= 34 ? 'T2' : score >= 18 ? 'T1' : 'T0';
  return { score, tier, reasons };
}
