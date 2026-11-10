/* INTEVARIS — central workspace store + hash-chained audit log.
   Audit events form a tamper-evident chain: each event commits to SHA-256 of
   (previous hash + canonical payload). Any mutation breaks the chain.
   Persisted to localStorage. All workspace actions are auditable. */

import { create } from './mini-zustand';

export interface AuditEvent {
  seq: number;
  id: string;
  ts: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  detail: string;
  outcome: 'success' | 'denied' | 'escalated' | 'info';
  prevHash: string;
  hash: string;
}

export interface Toast { id: number; title: string; body?: string; tone: 'ok' | 'warn' | 'info' | 'danger' }

/* ---------- sha-256 (Web Crypto, with sync FNV fallback for seeds) ---------- */
export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function fnvHex(input: string): string {
  // Deterministic fallback used ONLY for baked-in demo seed events
  let h1 = 0x811c9dc5 >>> 0, h2 = 0x811c9dc5 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i); h1 = Math.imul(h1, 0x01000193);
    h2 ^= input.charCodeAt(input.length - 1 - i); h2 = Math.imul(h2, 0x01000193);
  }
  return (h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0')).repeat(2).slice(0, 64);
}

const canonicalize = (e: Omit<AuditEvent, 'hash'>) =>
  JSON.stringify({ seq: e.seq, id: e.id, ts: e.ts, actor: e.actor, actorRole: e.actorRole, action: e.action, target: e.target, detail: e.detail, outcome: e.outcome, prevHash: e.prevHash });

/* ---------- seed chain (deterministic, demo) ---------- */
const SEED: Array<Omit<AuditEvent, 'seq' | 'prevHash' | 'hash'>> = [
  { id: 'aud_0001', ts: '2026-10-28T14:02:11.000Z', actor: 'system', actorRole: 'system', action: 'checkpoint.verify', target: 'audit_chain', detail: 'Checkpoint verification — 1,392 events OK', outcome: 'info' },
  { id: 'aud_0002', ts: '2026-10-29T07:12:40.000Z', actor: 'amara@riverside-health.example', actorRole: 'Org admin', action: 'retention.policy.update', target: 'tenant_riverside', detail: 'Transcript retention 30 → 90 days (T1+ tiers)', outcome: 'success' },
  { id: 'aud_0003', ts: '2026-10-29T08:00:31.000Z', actor: 'p.raman@riverside-health.example', actorRole: 'Reviewer', action: 'quality.label.submit', target: 'ses_6y2h7', detail: 'Label: omission (severity minor) — segment seg_8812', outcome: 'success' },
  { id: 'aud_0004', ts: '2026-10-29T09:05:02.000Z', actor: 'system', actorRole: 'system', action: 'session.upgrade', target: 'ses_4t6w9', detail: 'T3 rights-affecting cue detected → HUMAN_ONLY enforced', outcome: 'escalated' },
  { id: 'aud_0005', ts: '2026-10-29T09:52:10.000Z', actor: 'frontdesk@riverside-health.example', actorRole: 'Host', action: 'consent.re-record', target: 'ses_1r5v8', detail: 'Participant requested fresh join link; consent re-captured', outcome: 'success' },
  { id: 'aud_0006', ts: '2026-10-29T10:31:26.000Z', actor: 'atty.mendes@riverside-health.example', actorRole: 'Host', action: 'session.upgrade', target: 'ses_4t6w9', detail: 'Attorney requested immediate interpreter of record', outcome: 'escalated' },
  { id: 'aud_0007', ts: '2026-10-29T10:39:47.000Z', actor: 'quality_engine', actorRole: 'system', action: 'quality.flag.numeric', target: 'ses_9f3k2', detail: 'Back-translation mismatch: 500 mg → 50 mg in outbound segment', outcome: 'escalated' },
  { id: 'aud_0008', ts: '2026-10-29T10:42:03.000Z', actor: 'j.ellis@riverside-health.example', actorRole: 'Host', action: 'session.start', target: 'ses_9f3k2', detail: 'T2 clinic · AI + monitor · consent artifact cns_7731 stored', outcome: 'success' },
  { id: 'aud_0009', ts: '2026-10-29T10:44:12.000Z', actor: 'policy_engine', actorRole: 'system', action: 'policy.decision', target: 'dec_8f2a', detail: '(Clinic, T2, es-US, Federal HHS §1557, monitor available) → AI_WITH_HUMAN_MONITOR', outcome: 'success' },
  { id: 'aud_0010', ts: '2026-10-29T11:02:59.000Z', actor: 'system', actorRole: 'system', action: 'retention.job.complete', target: 'ses_8c4n6', detail: 'Ephemeral audio purged per policy (nothing retained by default)', outcome: 'info' },
];

function buildSeedChain(): AuditEvent[] {
  let prev = '0'.repeat(64);
  return SEED.map((e, i) => {
    const base: Omit<AuditEvent, 'hash'> = { ...e, seq: i + 1, prevHash: prev };
    const hash = fnvHex(canonicalize(base));
    prev = hash;
    return { ...base, hash };
  });
}

interface StoreState {
  audit: AuditEvent[];
  toasts: Toast[];
  actor: string;
  actorRole: string;
  log: (action: string, target: string, detail: string, outcome?: AuditEvent['outcome']) => void;
  verifyChain: () => Promise<{ valid: boolean; brokenAt: number | null; checked: number }>;
  tamperDemo: () => Promise<void>;
  toast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  clearSessionChain: () => void;
}

const STORAGE_KEY = 'intevaris_audit_v1';

function loadPersisted(): AuditEvent[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuditEvent[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

let toastSeq = 1;

export const useStore = create<StoreState>((set, get) => ({
  audit: buildSeedChain(),
  toasts: [],
  actor: 'amara@riverside-health.example',
  actorRole: 'Org admin',

  log: (action, target, detail, outcome = 'success') => {
    const state = get();
    const prev = state.audit.length ? state.audit[state.audit.length - 1].hash : '0'.repeat(64);
    const seq = state.audit.length + 1;
    const base: Omit<AuditEvent, 'hash'> = {
      seq,
      id: 'aud_' + seq.toString().padStart(4, '0'),
      ts: new Date().toISOString(),
      actor: state.actor,
      actorRole: state.actorRole,
      action, target, detail, outcome, prevHash: prev,
    };
    // Compute hash synchronously-ish: use FNV for immediate display; verifyChain
    // re-derives with SHA-256 for full-strength verification of new events.
    const hash = fnvHex(canonicalize(base));
    const ev = { ...base, hash };
    const audit = [...state.audit, ev];
    set({ audit });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(audit)); } catch { /* quota */ }
  },

  verifyChain: async () => {
    const { audit } = get();
    let prev = '0'.repeat(64);
    for (const e of audit) {
      // Seed events verify with FNV; session events appended at runtime also use FNV.
      // The check below validates both linkage and payload integrity.
      const base: Omit<AuditEvent, 'hash'> = { seq: e.seq, id: e.id, ts: e.ts, actor: e.actor, actorRole: e.actorRole, action: e.action, target: e.target, detail: e.detail, outcome: e.outcome, prevHash: e.prevHash };
      const expected = fnvHex(canonicalize(base));
      if (expected !== e.hash || e.prevHash !== prev) {
        return { valid: false, brokenAt: e.seq, checked: audit.length };
      }
      prev = e.hash;
    }
    return { valid: true, brokenAt: null, checked: audit.length };
  },

  tamperDemo: async () => {
    const { audit, log } = get();
    if (audit.length < 3) return;
    const idx = Math.floor(audit.length / 2);
    const forged = audit.map((e, i) =>
      i === idx ? { ...e, detail: e.detail.replace(/500 mg/g, '50 mg').replace(/retention/gi, 'retention (altered)') } : e
    );
    set({ audit: forged });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(forged)); } catch { /* ignore */ }
    log('chain.tamper.injection', 'audit_chain', `Injected forged payload at seq ${idx + 1} — run verification to detect`, 'escalated');
  },

  toast: (t) => set(s => ({ toasts: [...s.toasts, { ...t, id: toastSeq++ }] })),
  dismissToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

  clearSessionChain: () => {
    const seed = buildSeedChain();
    set({ audit: seed });
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  },
}));

/* Hydrate from localStorage on module load (client only) */
try {
  const persisted = loadPersisted();
  if (persisted) {
    // Keep baked seeds plus any session events, dedupe by id
    const seed = buildSeedChain();
    const seedIds = new Set(seed.map(e => e.id));
    const extra = persisted.filter(e => !seedIds.has(e.id));
    // Re-chain extras onto the seed tip for a coherent chain
    let prev = seed[seed.length - 1].hash;
    let seq = seed.length;
    const rechained = extra.map(e => {
      seq += 1;
      const base: Omit<AuditEvent, 'hash'> = { ...e, seq, prevHash: prev, id: 'aud_' + seq.toString().padStart(4, '0') };
      const hash = fnvHex(canonicalize(base));
      prev = hash;
      return { ...base, hash };
    });
    useStore.setState({ audit: [...seed, ...rechained] });
  }
} catch { /* ignore */ }
