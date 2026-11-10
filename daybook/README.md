# Daybook local pilot

Daybook is a separate application at `/daybook`; the existing INTEVARIS demo remains at its original routes. It does not use the connected Supabase project or INTEVARIS demonstration data.

## Start locally

Requires Node 22.13+ (the built-in `node:sqlite` API is experimental in Node 22), npm, and a writable local filesystem.

```sh
npm ci
npm run daybook:dev
# Open http://localhost:5173/daybook and create an owner account.
```

Vite proxies `/api/daybook` to the Node API on port 3001. SQLite data is stored in `daybook/data/daybook.sqlite` and is not committed. Registration starts an empty workspace; no sample customers are inserted automatically. A business can set its timezone and FAQ details in Business settings. The owner can create staff or administrator accounts there. Staff can access operational records for their business; staff cannot change settings or create team accounts. Administrators can change settings and view the team but cannot create team accounts. Team members can change their passwords. There is no email invitation or password reset flow.

Environment variables are listed in `.env.example`. Set them in the **server process environment** (the file is a template and isn't automatically loaded by the Node API). To enable AI, set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` or `OPENAI_BASE_URL` before starting the server. The API uses an OpenAI-compatible chat-completions endpoint and keeps the credential server-side. Without a key, the assistant explicitly reports that configuration is missing. Conversations stay in browser memory when the panel is closed, but reset on reload, sign-out or starting a new conversation. The last 20 messages are sent for context. No communication is sent to customers.

## Getting better answers

Complete the business profile in **Business settings**, then add accurate, business-specific entries under **Assistant business knowledge**: for example booking preparation, how estimates are prepared, service details or cancellation rules. Owners and administrators can add, edit and delete entries; staff can read them. No business policies or customer records are seeded automatically. Review and update the entries when the business changes. For general service-business questions, the assistant can use a small built-in guide to common workflows and sectors; that guidance is not a source of facts about your particular business.

The assistant can use an evidence-based daily overview, live record and relationship lookups, manually recorded communications and recorded change history. Counts in the overview are calculated by the server and use the configured business timezone. Some categories overlap, and a missing communication or follow-up is not proof that no action occurred outside Daybook. Returned lists and long fields are bounded and marked as truncated; the assistant can request additional pages or a specific record. Record chips labelled “Records consulted” open actual workspace records; they show what was retrieved, not a guarantee that the model's answer is correct. Drafts are editable and never sent automatically.

**Privacy:** Questions and conversation history are sent to the configured AI provider. The provider can request business settings, user-authored knowledge, summaries, filtered records and related records, recorded communications, and activity history through read-only server-side tools. Data returned can include customer details, internal notes, business policies and history. The provider may request multiple queries. Access is scoped to the authenticated business, but data is not minimized at field level. Use a provider that supports OpenAI-compatible tool calling, review its data processing terms and obtain appropriate permission before using sensitive data. User-authored knowledge and records are treated as untrusted data in the prompt, but prompt instructions alone do not guarantee safe or correct model behaviour. AI answers must be reviewed; the model can still make mistakes.

Users can manually record communications on customer and inquiry details. These records do not send messages or automatically detect contact; absence of an entry is not proof that contact did not occur. The recorded date and time are entered as business-local wall time and do not retain a historical timezone if business settings later change.

## Optional demo data

Use a separate database and explicit credentials. Never seed a real business database:

```sh
DAYBOOK_DB=daybook/data/demo.sqlite DEMO_EMAIL=demo@example.test DEMO_PASSWORD='choose-a-unique-password' node daybook/seed-demo.mjs
DAYBOOK_DB=daybook/data/demo.sqlite npm run daybook:dev
```

The demo business and all seeded records are labelled DEMONSTRATION/DEMO. No seed runs by default.

## Tests and deployment

```sh
npm run daybook:test
npm run daybook:test:ui
npm run build
NODE_ENV=production DAYBOOK_DB=/persistent/path/daybook.sqlite DAYBOOK_PORT=3001 node daybook/server/index.mjs
```

The production Node process serves `dist` and the API from the same origin. Put it behind HTTPS and a reverse proxy; use a persistent disk and restrict database file access. Production cookies require HTTPS. The UI tests run in jsdom with mocked API responses; they do not replace real-browser or mobile testing. The existing `vercel.json` is for the original static app and **does not deploy the Daybook API or provide persistent SQLite**; deploy Daybook to a Node host with persistent storage instead. Back up SQLite using the SQLite online backup API or `VACUUM INTO` against a live database, store encrypted backups off-host, and test restoration. Do not copy only the database file while WAL writes are active.

This is a local pilot, not production-ready multi-tenant hosting. The Node SQLite API is experimental; the in-process login throttle is not distributed; there is no account recovery, staff removal, email verification, fine-grained per-record permissions, security review, real-browser end-to-end test suite, or external observability. Use a managed database and hardened session/rate-limit infrastructure before a hosted rollout. Activity history records changes but is not tamper-proof. Records can be edited but not deleted through this interface. Assignment is a text field, not a staff relationship. Notification preferences, business logo upload, persistent assistant conversations, and automatic customer-update tracking are not implemented. Dashboard attention indicators reflect only the explicit statuses and dates described by the interface, not actual external communications. Assistant responses are unverified model output.

For the dedicated Daybook preview, the root URL now redirects to `/daybook`; the ordinary `npm run dev` still opens the original app. If another program already uses port 5173, Vite may choose a different port: open the Local address printed in the terminal. Keep the terminal running while using the app.
