# Autometa admin console

Independent Next.js application for platform administrators.
Run npm ci, npm run lint, npm run typecheck and npm run build from this folder.
For host development, use npm run dev -- --port 3200 with .env.local copied from .env.example.

The complete local stack starts from ../backend using Docker Compose.
Open http://localhost:3200 and sign in with credentials provisioned by the trusted backend
admin:bootstrap command. The local credentials file is ../backend/.local/admin-credentials.txt.

Available: real tenant counts, business search/status filters, suspension/reactivation,
tenant timezone distribution, account/key counts and administrative audit history.
Customer conversations are not exposed. Billing, automation and production features are labeled planned.

Authentication uses a server proxy and HttpOnly cookies; tokens are not stored in browser storage.
APP_ORIGIN must match this app's public URL for mutation/CSRF checks. Only super-admin accounts
can sign in here. See ../backend/docs/local-testing.md for the full test sequence.
