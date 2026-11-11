# INTEVARIS — MVP scope and workflow options

**Status: decision draft, not an approved specification.** No backend implementation is authorized by this document. The recommendation and workflow are hypotheses for product-owner and prospective-user validation.

## Evidence labels

- **FACT** — observed in the repository or in the Stage 4 discovery report; the observation is limited to the sources inspected.
- **INFERENCE** — a reasoned interpretation, not a verified customer need.
- **PROPOSAL** — a candidate product decision or workflow requiring approval.
- **UNKNOWN** — information or a decision not established by the available evidence.

## 1. Current product understanding

**FACT — starting point.** The repository is `hussainjuher1-svg/Inquriy-`. At the start of this investigation the session branch `arena/e23b2ffd-inquriy`, fetched `origin/main`, and `HEAD` all pointed to `20c8b88082163fb154569f3ddf5c69fc4e6d16a0`, the merge of the frontend refinement. The working tree was clean. The session branch name is fixed, so the requested new branch was not created. No work is being done on `main`.

**FACT — existing interface and behavior.** `src/App.tsx` routes public pages (`/`, `/how`, `/security`, `/pricing`, `/customers`, `/about`, `/demo`) and a workspace (`/app`, `/app/sessions`, `/app/interpreters`, `/app/live`, `/app/policy`, `/app/audit`, `/app/quality`, `/app/admin`). Navigation, page search, mobile menus and the local risk preview operate in the browser. `src/intevaris/Workspace.tsx` calls `computeRisk` in `src/lib/policy.ts` using selected inputs; the displayed calculation is explicitly illustrative and unvalidated, and is not saved or sent. It must not be used for operational or legal decisions.

**FACT — disconnected capabilities.** The current workspace states that it has no INTEVARIS authentication, organization, operational data, session, interpreter directory, live interpretation, consent capture, evidence, quality, configuration or billing service. The contact page does not send a request. A page title is not evidence of a functioning service or an approved requirement. `src/intevaris/Public.tsx` describes these limitations.

**FACT — discovery boundary.** The Stage 4 investigation found no verified INTEVARIS backend, authentication service, API specification or migrations in the accessible sources examined. This does not establish that none exists elsewhere. The repository contains a separate Daybook application, and the accessible Cadence repository is a separate local interpreter-preparation product; neither is connected to or evidence of an INTEVARIS backend. Existing legacy INTEVARIS seed data, simulated live-session behavior, browser audit store and unreviewed policy defaults are not operational evidence or approved product requirements.

**UNKNOWN — product.** The buyer, actual users, legal context, current workflow, interpretation delivery arrangements, urgency and willingness to pay have not been established. No customer interviews, demand, integrations, regulatory compliance or commitments are asserted here.

## 2. Three MVP directions

The following customers, problems and workflows are **PROPOSALS / INFERENCES**, not observed customer facts. Complexity is relative and assumes the same basic identity, authorization and safe handling foundations.

### A. Interpretation request and session management

- **Candidate customer / user:** an organization coordinating interpretation; an authorized staff member or coordinator handling requests. Whether the organization is a buyer, provider or internal service is **UNKNOWN**.
- **Hypothesized problem:** requests and their outcomes may be difficult to track across manual channels. The prevalence and importance of that problem are **UNKNOWN**.
- **Candidate end-to-end workflow:** an authorized requester submits minimal scheduling and language information; a coordinator reviews it, arranges an interpreter outside the system, records an independently confirmed arrangement, and later records a confirmed outcome or cancellation. A concrete version is in section 5.
- **Candidate data:** organization and user access, minimal request details, preferred time and time zone, language needs, coordinator-entered arrangement reference, status and narrowly scoped history. Do not collect conversation content or sensitive encounter details by default.
- **External integrations:** none are necessary for a manual pilot in which arranging and confirmations occur outside INTEVARIS. A human and an existing external communication/delivery process remain dependencies; whether one exists is **UNKNOWN**. No automatic notifications, booking or external session verification is implied.
- **Security / confidentiality:** request metadata and language needs may themselves be sensitive. Tenant and record-level access, data minimization and secure handling are prerequisites even without audio.
- **Complexity / dependencies:** **medium–high**, conditional on identity, permissions, storage, audit, a coordinator and a real external fulfillment process. Manual verification and exception handling are essential; no verified provider or customer is currently known.
- **Deliverable without live audio/video:** a truthful, authorized record of the coordination workflow and a human-confirmed outcome.
- **Exclude initially:** live interpretation, automated matching, guaranteed availability or qualification verification, automatic communications, recordings, transcripts, AI interpretation, billing and compliance claims.

### B. Interpreter directory, qualifications and availability

- **Candidate customer / user:** an organization managing interpreter relationships; a coordinator and possibly interpreters maintaining their own details. The actual commercial model is **UNKNOWN**.
- **Hypothesized problem:** maintaining current language capabilities, credentials and availability may be fragmented. Demand and the acceptable source of truth are **UNKNOWN**.
- **Candidate end-to-end workflow:** an authorized person adds an interpreter profile and language capabilities, a designated human verifies agreed qualification evidence, and a coordinator checks current availability before using the directory. The product must distinguish self-reported, pending, verified and expired information if those states are approved.
- **Candidate data:** minimal professional profile, language/direction, qualification type, issuer, dates, verification provenance and availability windows. Whether documents are necessary is **UNKNOWN**.
- **External integrations:** none for a manually maintained directory; independent verification depends on a human and authoritative sources or approved providers. There is no verified INTEVARIS connection today.
- **Security / confidentiality:** professional and identity information, qualification files and work patterns may be sensitive; visibility, consent to sharing, cross-organization ownership and deletion need decisions.
- **Complexity / dependencies:** **medium–high to high** because freshness, identity linkage, verification liability, expiry and multi-organization sharing must be resolved. An unverified directory cannot safely promise qualified or available interpreters.
- **Deliverable without live audio/video:** an accurately labeled, permissioned directory maintained and reviewed by humans.
- **Exclude initially:** automated credential validation, a marketplace, real-time availability guarantees, automatic matching, rankings and live interpretation.

### C. Interpretation governance, consent, audit and quality

- **Candidate customer / user:** an organization responsible for oversight; a governance or quality lead and authorized reviewers. Its existence and purchasing need are **UNKNOWN**.
- **Hypothesized problem:** organizations may need a reliable record of approved procedures, consent evidence and review outcomes. Required evidence and actual obligations are **UNKNOWN**.
- **Candidate end-to-end workflow:** an authorized owner approves a procedure, records the relevant session or external reference and human-attested evidence, a reviewer records a finding, and an authorized person closes or corrects the case. The legal validity of any consent record requires separate review.
- **Candidate data:** approved policy/version and approver, limited session reference, consent/disclosure evidence if appropriate, reviewer findings and audit metadata. Retention and whether any file or transcript is permissible are **UNKNOWN**.
- **External integrations:** not inherently required for manually entered references, but trustworthy evidence depends on access to the originating process and human review. No existing INTEVARIS evidence service is verified.
- **Security / confidentiality:** potentially highest sensitivity: consent, audit and review data can reveal protected encounter information. Integrity, least privilege, corrections, retention, legal holds and disclosure rules require expert review.
- **Complexity / dependencies:** **high**; depends on defined procedures, qualified reviewers, legal advice and a trusted underlying activity or evidence source. The existing local scorer and demo audit data cannot establish compliance.
- **Deliverable without live audio/video:** a narrowly scoped, human-reviewed register of approved procedures or evidence references, if a real workflow and defensible controls are defined.
- **Exclude initially:** claims of legal compliance, automatic policy enforcement, legal advice, unvalidated risk decisions, immutable-by-assertion audit, automated quality scoring and media capture.

### Comparison at a glance

| Dimension | A: requests and sessions | B: interpreter directory | C: governance and quality |
|---|---|---|---|
| Candidate outcome | An authorized coordinator can track a request to a human-confirmed outcome. | A coordinator can find a human-maintained profile with clearly labeled verification. | A reviewer can record and assess approved evidence or procedures. |
| Need / demand | **UNKNOWN**; plausible but unvalidated. | **UNKNOWN**; plausible but unvalidated. | **UNKNOWN**; plausible but unvalidated. |
| External operating dependency | A real person and process to arrange and confirm the service. | People and trusted sources to keep information current. | Approved policies, reviewers and trustworthy source evidence. |
| Relative complexity | Medium–high. | Medium–high to high. | High. |
| Risk of misleading claims | Claiming an arrangement or completed service without confirmation. | Claiming qualification or availability without verification. | Claiming legal validity, compliance or audit integrity without evidence. |
| Live media required? | No, if the customer's workflow allows external delivery. | No. | No, although source evidence may come from an external workflow. |

## 3. Live interpretation: separate decision

**FACT:** The current INTEVARIS frontend does not connect audio, provide interpretation, capture consent or start a live session. **UNKNOWN:** Whether intended customers need integrated live media for their first useful outcome.

| Model | What INTEVARIS could do | Implications and dependencies | First-release assessment |
|---|---|---|---|
| **Externally conducted sessions** | **PROPOSAL:** Track a request and human-attested arrangement/outcome while the actual service takes place outside the product. | Requires a real existing fulfillment process, human confirmation and clear boundaries. INTEVARIS cannot verify delivery automatically or promise an interpreter. | Lowest integration burden **if** prospective users confirm this workflow is useful and safe. |
| **Existing interpretation provider** | **PROPOSAL:** Exchange agreed request and status information with a chosen provider. | Provider contract, documented API, security and privacy review, data-sharing authority, availability, failures, status reconciliation and cost. Provider capability and terms are **UNKNOWN**. | Defer until a specific authorized provider and validated need exist. |
| **Operate a live platform** | **PROPOSAL:** Operate the real-time media and interpretation experience. | Substantially greater reliability, identity, access, consent, confidentiality, latency, incident response, specialist operations and potential recording obligations. | Exclude from the proposed first release; revisit only with a validated need and funded operating model. |

**INFERENCE:** Real-time media is not technically necessary for direction A's proposed coordination outcome. **UNKNOWN:** It may nevertheless be a customer prerequisite; this must be tested rather than assumed.

## 4. Recommended MVP and rationale

**PROPOSAL:** Investigate **direction A: a small, permissioned request-and-outcome register for interpretation arranged and conducted outside INTEVARIS**. It would let an authorized coordinator capture a request, record a manually confirmed arrangement, and close it with a human-attested outcome. It does not supply interpreters, conduct sessions, automatically send messages or independently verify service delivery.

**INFERENCE:** A has a bounded business outcome and can test whether a coordination record is useful without taking on the accuracy obligations of a standalone credential directory or the legal/evidence burden of a full governance product. It creates a possible foundation for later expansion, but it still requires strong access controls and a functioning external process. The relative comparison is not market validation.

**UNKNOWN / decision gate:** Proceed only if the product owner identifies a real prospective user, confirms an existing external fulfillment process and validates that this solves a meaningful problem. If the actual buyer's primary problem is qualification management or governance instead, choose B or C rather than forcing A. No implementation or launch is approved by this recommendation.

**PROPOSAL — acceptance hypothesis to validate:** A coordinator can find an authorized request, see whether an arrangement is genuinely confirmed, and record a human-confirmed outcome without entering conversation content or claiming INTEVARIS delivered interpretation. A cancelled or unresolved request remains visibly distinct from a fulfilled one. Measure usefulness with consenting users and their real, permitted workflow; no target metric or customer outcome is asserted.

## 5. Proposed first end-to-end workflow

All steps, states, actors, fields and permissions below are **PROPOSALS**, not existing behavior. Their business and legal suitability is **UNKNOWN**. The example assumes an externally conducted session and a designated coordinator; it does not assume a provider integration.

### Actors and minimal permissions

| Actor | Proposed permissions / limits |
|---|---|
| Requester | Create a request in their authorized organization; view their permitted requests and ask for cancellation. Whether requesters can edit after submission is **UNKNOWN**. |
| Coordinator | View and manage requests explicitly within their organization and authorized scope; record external confirmation and close or cancel with a reason. A coordinator may also be the requester if approved. |
| Organization access administrator | Manage membership and access. This role does not automatically receive confidential request details unless separately authorized. |
| External interpreter / provider | Arranges or conducts service outside the product. No account, directory access or integration is assumed. |

**PROPOSAL — minimum information to test:** organization and authorized requester; requested language or pair; requested date/time and time zone or a clearly identified scheduling need; a minimal non-sensitive contact/coordination reference; status; coordinator; and a minimal, manually recorded arrangement/outcome reference. Whether any participant identifiers or additional context are necessary is **UNKNOWN**. Prohibit unnecessary clinical, legal or conversation content. No database schema is specified.

### State transitions and human actions

1. **Start / submit:** An authenticated, authorized requester enters the agreed minimal details and submits. **Proposed state:** `submitted`. Validation failure leaves the request unsent and explains what needs correction; a successful save is acknowledged only after persistence succeeds.
2. **Review:** A coordinator opens an authorized request, checks completeness and accepts responsibility. **Proposed state:** `in review`. If information is missing, it stays unresolved while the coordinator seeks clarification through the approved external process; no automatic message is implied.
3. **Arrange externally:** The coordinator contacts an interpreter or provider using the organization's existing authorized process. INTEVARIS does not send, call, schedule or validate credentials. If no suitable arrangement is available, the request remains `in review` and the coordinator records only a permitted minimal note or status reason.
4. **Record confirmation:** Only after an explicit external confirmation, the coordinator records the minimum permitted reference and confirms the arrangement in INTEVARIS. **Proposed transition:** `in review → arranged`. The label means **human-recorded external confirmation**, not that an interpreter has joined or a service has occurred. Qualification and availability must not be asserted beyond what the coordinator actually verified.
5. **Record outcome:** After the scheduled external service, the coordinator obtains an outcome through the agreed process and explicitly records what was confirmed. **Proposed transition:** `arranged → completed` only when the coordinator has confirmed the agreed completion criterion. The record says who attested and when; it is not independent verification or evidence of quality. If confirmation is unavailable, the request remains `arranged` or is flagged for follow-up; it is not auto-completed.
6. **Cancel or correct:** An authorized coordinator may cancel an unresolved request with an appropriate reason: `submitted`, `in review` or `arranged → cancelled`. A cancellation request from a requester is not itself proof that an external booking was cancelled; external cancellation must be handled and confirmed separately. Corrections to completed or cancelled records require an authorized, recorded correction procedure rather than silently rewriting history.

**PROPOSAL — transition safeguards:** Reject unauthorized or invalid transitions; check for stale edits and duplicate submissions; require explicit confirmation before marking `arranged`, `completed` or `cancelled`; show save failures without a false success state. The exact permitted corrections, no-show and rescheduling behavior require owner validation. No automated interpretation, scheduling or legal decision follows from a status change.

### Audit, approvals, failure cases and dependencies

- **PROPOSAL — audit:** Record minimal server-side actor, organization, request reference, action, time, outcome and relevant status change. Restrict audit access and avoid storing message bodies or sensitive conversation content. Evidence integrity, correction handling and retention require security and legal review; a status event is not proof of what happened externally.
- **PROPOSAL — human approvals:** A coordinator explicitly records external arrangement confirmation and the completion/cancellation outcome. Any additional supervisor approval is **UNKNOWN**, not assumed. No communication is automatically sent.
- **PROPOSAL — failures:** Deny access outside membership and record scope; preserve a clear unsaved state on storage/network failure; surface stale updates and duplicates for human resolution; keep unavailable, unconfirmed, rescheduled or disputed outcomes unresolved until the approved process resolves them. For an external cancellation failure, do not imply it succeeded.
- **UNKNOWN — dependencies:** A prospective user's real workflow, an authorized human coordinator, an actual external interpreter/provider process, identity and permission decisions, a safe data environment, and approved retention and escalation procedures. No provider or credentials have been verified.

## 6. First-release boundaries

**PROPOSAL — include only if direction A is approved:** identity and authorization appropriate for the pilot; minimal organization-scoped request capture and retrieval; human-owned review, external arrangement attestation and outcome/cancellation recording; minimal audit metadata; explicit unavailable/error states and a tested deletion/retention process appropriate to the approved data.

**PROPOSAL — out of scope:** operating or integrating live audio/video; AI interpretation or transcription; recording conversation content; auto-matching, verified-credential claims or live availability guarantees; standalone interpreter marketplace or full directory; automatic emails/SMS or auto-send; automated consent or legal determinations; operational use of the unvalidated scorer; broad quality/compliance certification; payments, billing and unrelated business features; Daybook or Cadence data or integrations.

**UNKNOWN:** Whether even the proposed minimum is suitable for sensitive real-world data without additional customer, contractual, security or legal controls. No production readiness or compliance is implied.

## 7. Security and confidentiality considerations

**PROPOSAL — before handling real data:**

1. Confirm data ownership, categories, permitted purposes and whether external references or identifiers may be stored. A language request and scheduling metadata can be sensitive even without a transcript.
2. Use production-appropriate identity and server-enforced organization **and** request-level authorization. Test cross-organization, unauthorized-role, revoked-access and direct-object access cases. Browser controls are not security boundaries.
3. Minimize collection; avoid free-text sensitive details, media, transcripts and credential files unless separately approved. Use encryption in transit and appropriate protection at rest, backups and secrets.
4. Define auditable human actions, minimal event details, restricted audit access and correction processes. Do not use the legacy browser-local simulation as an audit system.
5. Agree retention, deletion, backup expiry, legal holds, exports, incident response and support access with the owner and appropriate advisers before launch. Do not infer statutory retention periods from demo code.
6. Review the external coordination process, unintended disclosures, inaccessible or incorrect contact details, stale data and manual-confirmation errors. External confirmations and status labels must not overstate what is known.
7. Threat-model identity, tenant isolation, logs, external communication and any future provider integration; test failure handling and secure operational recovery before processing actual records.

**UNKNOWN:** Applicable jurisdiction, contracts, specific laws and assurance requirements. These considerations are not a legal or compliance certification.

## 8. Product-owner decisions required

1. **Customer and user:** Who is the first customer and day-to-day user, and what evidence shows which problem matters most? Which of A, B or C should be selected?
2. **Existing systems:** Is there an INTEVARIS backend, existing product, provider, workflow or owner not visible in discovery? Is an external fulfillment process already available and authorized?
3. **Outcome and scope:** What specifically constitutes a useful request, a confirmed arrangement, completion, cancellation and a corrected or disputed outcome? What happens for urgent, unavailable, rescheduled or no-show cases?
4. **People and authority:** Who may request, coordinate, attest, cancel, administer access and see each record? Are interpreters employees, contractors or external providers, and can they work across organizations?
5. **Data and confidentiality:** Which fields are truly necessary? Are participant identifiers, sensitive context, consent evidence or files allowed? What retention, deletion, jurisdiction and residency requirements apply?
6. **Service boundaries:** Is external delivery acceptable for MVP? If not, which provider and capabilities are required, and who approves contracts, security and costs?
7. **Validation and approval:** Which prospective users will validate the workflow, what outcome would justify proceeding, and who signs off on product, security, operational and legal readiness?

## 9. Next architecture phase

**PROPOSAL:** After the owner answers the blocking questions and chooses a direction, conduct a focused architecture phase: document the approved workflow and trust boundaries; threat-model identities, tenant and record access; define a minimal conceptual data model and retention policy; evaluate identity, storage and deployment options against actual constraints; and write testable acceptance criteria, including authorization and failure cases. Produce a reviewed implementation plan only after those decisions. This document does not create schemas, APIs, accounts, infrastructure or a deployment.

## References and limits

- **FACT:** `src/App.tsx`, `src/intevaris/Public.tsx`, `src/intevaris/Workspace.tsx` and `src/lib/policy.ts` describe the current routed interface and local scorer.
- **FACT:** The Stage 4 backend discovery report was reviewed from the conversation; it is not a separate tracked document in this checkout. Its conclusion was limited to accessible sources and did not establish global nonexistence of a backend.
- **FACT:** `README.md` identifies Daybook as a separate local-pilot application. No Daybook or Cadence service or data was connected during this scope exercise.
- **UNKNOWN:** Customer research, operating procedures, legal requirements, third-party arrangements and any inaccessible backend remain outside the available evidence.
