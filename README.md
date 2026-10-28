# BloodLink

**United for Lives Across Bangladesh.** BloodLink is a free, community-run platform where people
post blood requests, voluntary donors register by blood group and district, and matching donors are
alerted by email and a private Telegram channel. Every request is reviewed by a moderator before it
goes public, contact numbers stay encrypted, and medical documents are only ever shown to the people
the requester chose.

> Blood group matching only finds potential volunteers. Screening, compatibility testing and donation
> eligibility are always decided by medical staff. BloodLink never charges for anything, and blood must
> never be bought or sold.

---

## Contents

- [Features](#features)
- [Architecture](#architecture)
- [Folder structure](#folder-structure)
- [Data model and indexes](#data-model-and-indexes)
- [Local setup](#local-setup)
- [Configuring the integrations](#configuring-the-integrations)
- [How the notification worker works](#how-the-notification-worker-works)
- [Deploying to a VPS (Docker Compose + nginx + HTTPS)](#deploying-to-a-vps-docker-compose--nginx--https)
- [Testing](#testing)
- [Security and privacy](#security-and-privacy)
- [Known limitations](#known-limitations)

## Features

- **Blood requests** — blood group, units, hospital, district (all 64 districts, grouped into the 8
  divisions), needed-by date (today up to 60 days ahead, in Bangladesh time), urgency, an optional
  prescription or hospital document, and a short description.
- **Moderation** — new requests are `pending` until an admin approves (publishes) or rejects them.
  Admins also handle reported requests and comments, and can see notification job health.
- **Public browsing** — filter by blood group, district, urgency, status (active, fulfilled, expired)
  and needed-by window, plus full-text search on hospital and district. Pagination is URL-driven so
  filtered views can be shared.
- **Donor registry** — Google sign-in, then a donor profile with blood group, district, area, optional
  phone, availability and email alert preferences. Donors can pause alerts or delete their account.
- **Contact privacy** — the requester's phone is stored encrypted and shown masked (`017•••••678`).
  Registered donors can reveal it only if the requester allowed it and the request is live; every
  reveal is rate limited and logged.
- **Comments** — one level of replies, duplicate and rate-limit protection, author/admin deletion,
  reporting, and cursor pagination.
- **Notifications** — on approval, durable jobs are queued: one post to a private Telegram channel and
  individual emails (Brevo) to matching, available, opted-in donors — same district first, then the
  rest of the division, up to a per-request cap and the provider's daily quota.
- **Telegram channel membership** — donors link their Telegram account with a one-time deep link; the
  bot then auto-approves their request to join the private channel.
- **Lifecycle** — the owner marks a request fulfilled; requests whose needed date has passed expire
  automatically and their pending notifications are cancelled.
- **SEO and sharing** — metadata, Open Graph image, sitemap of published requests, robots rules and a
  web app manifest.

## Architecture

```
Browser ──HTTPS──▶ nginx ──▶ Next.js 16 (App Router, standalone server, Node 24)
                               │
                               ├─ Server Components  ─ pages; dynamic parts streamed in <Suspense>
                               ├─ Server Actions     ─ every mutation (create, approve, comment, …)
                               ├─ Route Handlers     ─ uploads, document streaming, Auth.js,
                               │                       Telegram webhook, unsubscribe, health, worker
                               ▼
                 features/*  (services → repositories)  ──▶ MongoDB Atlas
                               │
                               ├──▶ Brevo (email)     ├──▶ Telegram Bot API
                               └──▶ S3-compatible private bucket (Cloudflare R2, …)

cron container ──POST /api/internal/process-notifications (Bearer secret, every 60 s)──▶ app
```

**Rendering.** Pages are Server Components. `next.config.ts` enables `cacheComponents` and
`partialPrefetching`, so each page has a prerendered static shell (headings, copy, layout) and the
request-specific parts — the viewer, database reads, the current time — are pushed into small async
components behind `<Suspense>` with skeleton fallbacks and streamed in. Client Components are used only
for interactive pieces (forms, filters, dialogs, comment threads).

**Layering.** Code is grouped by feature under `src/features/<feature>/`:

| Layer              | Files                         | Responsibility                                                                                                                                                                                                                          |
| ------------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions            | `actions.ts` (`"use server"`) | Re-check the session, validate input with Zod, call a service, invalidate cache tags, return an `ActionResult` (`{ ok, data, message }` or `{ ok: false, error, fieldErrors }`). Unexpected errors are logged and reported generically. |
| Services           | `*.service.ts`                | Business rules: permissions, rate limits, status transitions, encryption, notification queuing. Throw `AppError` with a code for expected failures.                                                                                     |
| Repositories       | `*.repository.ts`             | All MongoDB access: typed collections, projections, atomic updates.                                                                                                                                                                     |
| Permissions        | `requests/permissions.ts`     | Pure functions (`canRevealPhone`, `canMarkFulfilled`, `canTransition`, …) shared by services and UI so they never drift.                                                                                                                |
| Hooks / components | `hooks/`, `components/`       | Client form state (react-hook-form + the same Zod schemas) and feature UI.                                                                                                                                                              |

Shared validators live in `src/lib/validators` and run on both client and server; the server always
re-validates.

**Caching strategy.** Public reads in `src/features/requests/request.queries.ts` (recent requests,
search, request detail, community stats) are `"use cache"` functions with `cacheLife("minutes")` and
tags (`requests`, `request:<id>`, `stats`). Components call them only after `await connection()` inside
`<Suspense>`, so they never run at build time (no database is needed for `next build`) and are then
served from the in-memory cache. Mutations invalidate tags through `invalidateRequests()`:

- Server Actions that need read-your-writes (approve, reject, mark fulfilled) use `updateTag`.
- Low-priority changes (comment counts, new donors, worker expiry from a Route Handler) use
  `revalidateTag(tag, "max")` — stale-while-revalidate.

Per-viewer data (session, ownership, donor status) is never cached; `getViewer()` reads the session and
re-loads the user from MongoDB once per request, so roles and donor status always come from the
database rather than the token. It calls `await connection()` first because the MongoDB driver generates
random session ids, which Next.js forbids during (prefetch-time) prerendering.

**Design tokens.** Every colour, radius, shadow and animation is a Tailwind v4 `@theme` token in
`src/app/globals.css`; components use only semantic classes (`bg-surface`, `text-muted`, `rounded-card`,
…). The specified palette is unchanged. Two extra tokens exist for WCAG AA contrast: white text on
`#FF2442` is only 3.6:1, so filled red controls use `brand-strong` (`#D81B37`, 4.9:1), and small red
text on card surfaces uses `brand-bright` (`#FF5A6E`, 5.1:1). `brand` itself is still used for accents,
glows, icons and large text on the page background.

## Folder structure

```
src/
  app/
    (public)/            home, requests list + detail, new request, become donor, how it works,
                         login, contact, privacy, terms, unsubscribe
    (account)/account/   donor profile, alerts, Telegram linking, account deletion
    (admin)/admin/       moderation queue, reports, notification health
    api/
      auth/[...nextauth]/           Auth.js (Google)
      uploads/prescription/         authenticated document upload → private bucket
      documents/[requestId]/        auth-checked document streaming
      internal/process-notifications/  worker endpoint for the cron container
      telegram/webhook/             bot updates (/start linking, channel join requests)
      unsubscribe/                  one-click email unsubscribe (POST)
      health/                       liveness + MongoDB ping
    layout.tsx, error.tsx, not-found.tsx, sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
  components/            ui/ (design-system primitives), layout/, home/, shared/
  features/
    auth/                Auth.js config, getViewer/requireViewer/requireAdmin, sign-in UI
    requests/            actions, service, repository, cached queries, permissions, cache tags, UI
    comments/            actions, service, repository, UI
    donors/              actions, service (profile, preferences, account deletion), UI
    moderation/          admin actions and UI
    notifications/       job queue, worker, retry policy, Brevo + Telegram providers, templates
    storage/             S3 client (aws4fetch) and file validation (magic bytes)
    users/               user repository and donor matching
  lib/
    constants/           site config, statuses, limits, cache tags, blood groups, districts
    db/                  MongoClient singleton, typed collections, index definitions
    security/            AES-256-GCM encryption, MongoDB-backed rate limiter
    utils/               dates (Bangladesh time), phone, results, action/route helpers
    validators/          Zod schemas shared by client and server
    env.ts               lazily validated environment, grouped per integration
tests/
  unit/                  pure functions (validators, permissions, retry, dates, templates, crypto, …)
  integration/           services, actions and route handlers against a real in-memory MongoDB
  e2e/                   Playwright browser tests
deploy/nginx.conf        reverse proxy example
Dockerfile, docker-compose.yml, .env.example
```

## Data model and indexes

All collections are created on first use; `src/lib/db/indexes.ts` ensures every index once per
process (`createIndexes` is idempotent), so no migration step is needed.

**`users`** — one per Google account: `googleId`, `name`, `email`, `avatar`, `role` (`user` | `admin`),
and an optional embedded `donorProfile` (`fullName`, `bloodGroup`, `division`, `district`, `area`,
encrypted `phone`, `available`, `emailNotifications`, `telegramLinked`, `telegramUserId`).

| Index                                                                                                | Purpose                                                         |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `{ googleId: 1 }` unique                                                                             | Upsert on sign-in                                               |
| `donor_match`: `{ "donorProfile.bloodGroup": 1, "donorProfile.district": 1 }`, partial (donors only) | Donor matching and donor stats                                  |
| `{ "donorProfile.telegramUserId": 1 }` unique, partial                                               | One BloodLink account per Telegram account; join-request lookup |

**`blood_requests`** — `creatorId`, `bloodGroup`, `units`, `hospitalName`, `division`, `district`,
`neededAt` (end of the needed day in Bangladesh time), `contactPhone` (encrypted),
`contactPhoneMasked`, `allowPhoneReveal`, `shareDocumentWithDonors`, `prescription`
(`{ key, contentType, size }`), `description`, `urgency`, `status`
(`pending → published → fulfilled | expired`, or `rejected`), `commentCount`, report fields,
moderation fields (`moderationNote`, `reviewedBy`, `reviewedAt`), `publishedAt`, `fulfilledAt`,
`telegramMessageId`.

| Index                                                      | Purpose                                           |
| ---------------------------------------------------------- | ------------------------------------------------- |
| `{ status: 1, createdAt: -1 }`                             | Public listing, recent requests, moderation queue |
| `{ status: 1, bloodGroup: 1, district: 1, createdAt: -1 }` | Filtered listing                                  |
| `{ status: 1, neededAt: 1 }`                               | Expiry sweep and "needed within" filter           |
| `{ creatorId: 1, createdAt: -1 }`                          | "My requests", pending cap, account deletion      |
| `{ reportCount: -1 }`, partial `reportCount > 0`           | Reported-requests queue                           |
| `request_search`: text on `hospitalName`, `district`       | Search box                                        |

**`comments`** — `requestId`, `authorId`, `parentId` (`null` for top level), `content`, report fields,
`deletedAt` (soft delete keeps reply threads intact).

| Index                                            | Purpose                                    |
| ------------------------------------------------ | ------------------------------------------ |
| `{ requestId: 1, parentId: 1, _id: -1 }`         | Top-level page with an `_id` cursor        |
| `{ parentId: 1, createdAt: 1 }`                  | Replies for a page of parents in one query |
| `{ authorId: 1, createdAt: -1 }`                 | Duplicate check, account deletion          |
| `{ reportCount: -1 }`, partial `reportCount > 0` | Reported-comments queue                    |

**`notification_jobs`** — `requestId`, `recipientId` (`null` for the Telegram post), `channel`
(`email` | `telegram`), `status` (`pending`, `processing`, `sent`, `failed`, `cancelled`), `attempts`,
`nextAttemptAt`, `lockedUntil`, `dedupeKey`, `lastError`, `providerMessageId`, `sentAt`.

| Index                             | Purpose                                                                 |
| --------------------------------- | ----------------------------------------------------------------------- |
| `{ dedupeKey: 1 }` unique         | Idempotent enqueueing (`email:<request>:<donor>`, `telegram:<request>`) |
| `{ status: 1, nextAttemptAt: 1 }` | Claiming due jobs                                                       |
| `{ requestId: 1, status: 1 }`     | Cancelling a request's pending jobs                                     |

**`telegram_links`** — hashed one-time link tokens: `{ tokenHash: 1 }` unique, and a TTL index on
`expiresAt` (tokens live 15 minutes).

**`contact_reveal_logs`** — who revealed which phone number: `{ requestId: 1, userId: 1 }`, and a TTL
index on `createdAt` that deletes entries after 180 days.

**`rate_limits`** — fixed-window counters (`_id` = `policy:subject:window`) and the daily email quota
counter, with a TTL index on `expiresAt`. Limits are shared by all instances and survive restarts:

| Policy               | Limit                                                |
| -------------------- | ---------------------------------------------------- |
| New requests         | 3 per user per day, and at most 2 waiting for review |
| Comments             | 6 per user per minute                                |
| Uploads              | 10 per user per hour                                 |
| Phone reveals        | 10 per user per hour                                 |
| Reports              | 20 per user per day                                  |
| Telegram link tokens | 5 per user per hour                                  |

## Local setup

Requirements: **Node.js 24**, npm, and a MongoDB you can reach (an Atlas free cluster, or
`docker run -d -p 27017:27017 mongo:8`).

```bash
npm install
cp .env.example .env.local
```

Fill in at least `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`,
`DATA_ENCRYPTION_KEY`, `NEXT_PUBLIC_SITE_URL=http://localhost:3000` and `ADMIN_EMAILS` (your Google
address, so you can moderate). Generate secrets with:

```bash
openssl rand -base64 32   # AUTH_SECRET, DATA_ENCRYPTION_KEY
openssl rand -hex 32      # NOTIFICATION_CRON_SECRET, TELEGRAM_WEBHOOK_SECRET
```

```bash
npm run dev               # http://localhost:3000
```

Email, Telegram and document storage are optional locally: until their variables are set, those
features report "not configured" and notification jobs simply wait. To run the worker by hand:

```bash
curl -X POST -H "Authorization: Bearer $NOTIFICATION_CRON_SECRET" \
  http://localhost:3000/api/internal/process-notifications
```

Useful scripts: `npm run lint`, `npm run typecheck`, `npm run format` / `format:check`, and the test
scripts below.

## Configuring the integrations

### Google sign-in (Auth.js)

1. In the [Google Cloud Console](https://console.cloud.google.com/), create a project.
2. **APIs & Services → OAuth consent screen**: choose _External_, set the app name, support email and
   your domain, keep the default `openid`, `email` and `profile` scopes, then publish the app.
3. **Credentials → Create credentials → OAuth client ID → Web application**:
   - Authorized JavaScript origins: `https://DOMAIN` (and `http://localhost:3000` for development)
   - Authorized redirect URIs: `https://DOMAIN/api/auth/callback/google`
     (and `http://localhost:3000/api/auth/callback/google`)
4. Put the client ID and secret in `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`, and a random
   `AUTH_SECRET`. Only Google accounts with a verified email can sign in.
5. Admins: list their Google emails in `ADMIN_EMAILS` (comma-separated). The role is applied at sign-in,
   so an existing user must sign out and in again after being added.

`AUTH_URL` is optional: the app trusts the `Host` / `X-Forwarded-*` headers set by nginx.

### MongoDB Atlas

1. Create a free **M0** cluster (pick a region close to your VPS, e.g. Mumbai or Singapore).
2. **Database Access**: add a database user with a strong password and the _Read and write to any
   database_ role (or scope it to your `MONGODB_DB`).
3. **Network Access**: add your VPS's public IP address. Avoid `0.0.0.0/0` in production; add your own
   IP temporarily for local development.
4. **Connect → Drivers**: copy the `mongodb+srv://…` string into `MONGODB_URI` (URL-encode special
   characters in the password) and choose a database name for `MONGODB_DB`.

Indexes are created automatically on first use. `/api/health` reports `database: "unreachable"` if the
IP allowlist or credentials are wrong.

### Brevo (email)

1. Create a Brevo account. The free plan sends **300 emails per day**.
2. **Senders, Domains & Dedicated IPs → Senders**: add and verify the address you will send from
   (`BREVO_SENDER_EMAIL`). For better deliverability, also authenticate your domain (SPF, DKIM and
   DMARC records) in the _Domains_ tab.
3. **SMTP & API → API keys**: create a v3 key for `BREVO_API_KEY`. If you enable Brevo's "authorised
   IPs" protection, add your VPS IP.
4. Keep `EMAIL_DAILY_LIMIT` below your plan's quota (default **280** for the free 300/day) and set
   `EMAIL_MAX_RECIPIENTS_PER_REQUEST` (default 40). The app counts sent emails per UTC day; anything
   over the limit stays queued until the next day.

Each donor receives an individual email (recipient lists are never shared) with a signed unsubscribe
link.

### Telegram (private donor channel)

1. Talk to [@BotFather](https://t.me/BotFather): `/newbot`, then copy the token into
   `TELEGRAM_BOT_TOKEN` and the username (without `@`) into `TELEGRAM_BOT_USERNAME`.
2. Create a **private channel** for donors.
3. Add the bot to the channel as an **administrator** with at least **Post messages** and
   **Invite users via link** (needed to approve join requests).
4. Find the channel id (it looks like `-100…`): post any message in the channel, then — before setting
   the webhook — run `curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getUpdates"` and read
   `channel_post.chat.id`. Put it in `TELEGRAM_CHANNEL_ID`.
5. Channel → **Invite links → Create a new link** with **Request admin approval** enabled. Put it in
   `TELEGRAM_CHANNEL_INVITE_LINK`.
6. Generate `TELEGRAM_WEBHOOK_SECRET` (`openssl rand -hex 32`) and register the webhook once the site
   is live over HTTPS:

   ```bash
   curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://DOMAIN/api/telegram/webhook",
       "secret_token": "'"$TELEGRAM_WEBHOOK_SECRET"'",
       "allowed_updates": ["message", "chat_join_request"],
       "drop_pending_updates": true
     }'
   # Check it with: curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
   ```

How membership works: on the account page a donor taps **Link Telegram**, which opens
`t.me/<bot>?start=<token>` (single use, valid 15 minutes, stored hashed). The bot links the Telegram
account and replies with the invite link. When the donor requests to join, the webhook approves linked
donors automatically; other join requests stay pending for an admin to review in Telegram. Channel posts
contain only blood group, hospital, district, units, date and a link — never phone numbers or documents.

### Private document storage (Cloudflare R2 or any S3-compatible service)

1. Create a bucket (e.g. `bloodlink-documents`). **Keep it private**: do not enable public `r2.dev`
   access or attach a public custom domain. Documents are streamed only through
   `/api/documents/<requestId>` after an authorization check.
2. Create an API token with **Object Read & Write** scoped to that bucket and set `STORAGE_ACCESS_KEY`
   and `STORAGE_SECRET_KEY`.
3. Set `STORAGE_ENDPOINT` to the S3 endpoint without the bucket
   (`https://<account-id>.r2.cloudflarestorage.com` for R2), `STORAGE_BUCKET`, and `STORAGE_REGION`
   (`auto` for R2; the real region for AWS S3, Backblaze B2 or MinIO).
4. Optional: add a lifecycle rule that deletes objects under the `prescriptions/` prefix after N days to
   clean up uploads that were never attached to a request. The rule cannot tell attached and orphaned
   files apart, so choose N comfortably beyond the 60-day maximum needed-by window (for example 90
   days); after that, documents of long-expired requests are simply no longer available.

Uploads are limited to 5 MB and to JPG, PNG, WEBP and PDF, detected from the file's bytes rather than
its name or declared type. Keys look like `prescriptions/<userId>/<random>.<ext>`, and a request can
only attach a key under its creator's own prefix.

## How the notification worker works

1. **Approve → enqueue.** When an admin approves a request, `enqueueRequestNotifications` writes durable
   jobs to `notification_jobs` and returns immediately: one Telegram job, plus one email job per
   matching donor (same blood group; available; email alerts on; not the requester; same district
   first, then the rest of the division, up to `EMAIL_MAX_RECIPIENTS_PER_REQUEST`).
2. **Idempotency.** Every job has a unique `dedupeKey` (`email:<requestId>:<donorId>`,
   `telegram:<requestId>`) and is inserted with an upsert + `$setOnInsert`, so enqueueing twice never
   creates duplicates or resets a job. The Telegram job additionally records the posted
   `telegramMessageId` on the request, so a crash between posting and saving can't post twice.
3. **Cron.** The `cron` container calls `POST /api/internal/process-notifications` every 60 seconds
   with `Authorization: Bearer $NOTIFICATION_CRON_SECRET`. Each run:
   - expires `published`/`pending` requests whose needed time has passed and cancels their jobs;
   - atomically claims due jobs (`pending` with `nextAttemptAt <= now`, or `processing` whose 5-minute
     lock has expired after a crash) — up to 10 Telegram jobs and up to 25 email jobs, never more than
     the remaining daily email quota;
   - re-checks each job before sending: if the request is no longer live or the donor has opted out or
     become unavailable, the job is `cancelled`.
4. **Retries.** Failures are classified by the provider: HTTP 429 and 5xx (and network errors) are
   retryable, other 4xx are permanent. Retryable jobs go back to `pending` with exponential backoff
   (1, 2, 4, 8 minutes … capped at 6 hours, or the provider's `Retry-After` if longer); after 5 attempts
   or a permanent error the job is `failed` and appears on the admin page.
5. **Quota.** Successful emails increment a per-day counter. When `EMAIL_DAILY_LIMIT` is reached, email
   jobs stay `pending` and continue the next day.
6. **Unconfigured channels** are skipped, not dropped: their jobs wait until the integration is set up.
7. **Closing a request** (fulfilled, rejected or expired) cancels its remaining jobs.

The endpoint returns a JSON summary (`expired`, `sent`, `retrying`, `failed`, `cancelled`,
`emailQuotaRemaining`, `skippedChannels`), which appears in `docker compose logs cron`.

## Deploying to a VPS (Docker Compose + nginx + HTTPS)

The production setup is one small VPS (1 vCPU / 1–2 GB RAM is enough) running the app and the cron
container with Docker Compose, nginx on the host for TLS, and MongoDB Atlas for the database.

1. **Server basics** (Ubuntu 24.04 shown):

   ```bash
   sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx git
   curl -fsSL https://get.docker.com | sh          # Docker Engine + Compose plugin
   sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
   ```

   Point your domain's `A`/`AAAA` records at the server, and add the server IP to the Atlas allowlist.

2. **Configure and start the app:**

   ```bash
   git clone <your-repo-url> bloodlink && cd bloodlink
   cp .env.example .env && chmod 600 .env    # fill in every value
   docker compose up -d --build
   docker compose ps                          # app should become "healthy"
   curl http://127.0.0.1:3000/api/health      # {"status":"ok","database":"ok"}
   ```

   `NEXT_PUBLIC_SITE_URL` is passed as a build argument because it is inlined into the bundles; rebuild
   after changing it. The build downloads the Outfit font from Google Fonts, so it needs internet access.
   The app listens on `127.0.0.1:3000` only.

3. **HTTPS certificate** (while nginx still serves its default site on port 80):

   ```bash
   sudo certbot certonly --nginx -d DOMAIN -d www.DOMAIN
   ```

4. **nginx:** copy the example config, replace `bloodlink.example.com` with your domain, and enable it:

   ```bash
   sudo cp deploy/nginx.conf /etc/nginx/sites-available/bloodlink
   sudo sed -i 's/bloodlink.example.com/DOMAIN/g' /etc/nginx/sites-available/bloodlink
   sudo ln -s /etc/nginx/sites-available/bloodlink /etc/nginx/sites-enabled/bloodlink
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot renew --dry-run               # renewals run automatically via systemd timer
   ```

   The config redirects HTTP to HTTPS, disables proxy buffering so Suspense boundaries stream, caps
   request bodies at 6 MB, caches `/_next/static` for a year, rate limits `/api/` per IP, and returns 404
   for `/api/internal/*` (the cron container reaches the app directly on the Docker network). Security
   headers come from the app (`next.config.ts`).

5. **Telegram webhook:** run the `setWebhook` command from the Telegram section.

**Updating:** `git pull && docker compose up -d --build`. **Logs:** `docker compose logs -f app cron`.

**Scaling out.** A single instance needs nothing else. With several instances, set the same
`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` for every build (`docker build --secret
id=next_actions_key,env=NEXT_SERVER_ACTIONS_ENCRYPTION_KEY …`), configure a `deploymentId`, and add a
shared cache handler so tag invalidation reaches every instance. Rate limits, the job queue and
quotas already live in MongoDB and are safe to share.

## Testing

```bash
npm run test:unit          # pure functions, no database (~1 s)
npm run test:integration   # services, Server Actions and Route Handlers against real MongoDB
npm test                   # both
npm run test:e2e           # Playwright (see playwright.config.ts)
npm run typecheck && npm run lint && npm run format:check
```

- **Unit tests** (`tests/unit`) cover the shared validators, permission rules, retry/backoff policy,
  Bangladesh-time date helpers, phone normalisation and masking, upload validation, email/Telegram
  templates (HTML escaping, no contact details in Telegram posts) and the encryption helpers. They run
  in a non-Bangladesh timezone on purpose.
- **Integration tests** (`tests/integration`) start a throwaway `mongod` with
  [`mongodb-memory-server`](https://github.com/typegoose/mongodb-memory-server) (the binary is downloaded
  from MongoDB's CDN on first run and cached in `node_modules/.cache`; set `MONGOMS_SYSTEM_BINARY` to use
  a local `mongod` instead). Each test file gets its own database. Next.js cache APIs, `auth()` and the
  storage client are mocked; email goes through a fake provider and `fetch` is stubbed, so no real
  Brevo, Telegram or storage request is ever made.
- **E2E tests** (`tests/e2e`) run Playwright against a production build (`npm run build` first) and a
  disposable MongoDB given by `E2E_MONGODB_URI`; install a browser once with
  `npx playwright install chromium`.

Tests written with `it.fails(...)` document known bugs: they pass while the bug exists and start failing
once it is fixed — then remove `.fails`.

## Security and privacy

- **Least exposure of contact data.** Phone numbers (requests and donor profiles) are encrypted with
  AES-256-GCM (`DATA_ENCRYPTION_KEY`) and only a masked copy is ever sent to browsers. Reveals require a
  registered donor, the requester's consent and a live request; they are rate limited and logged
  (logs expire after 180 days). Keep `DATA_ENCRYPTION_KEY` stable and backed up — rotating it makes
  stored numbers unreadable.
- **Documents** are validated by magic bytes, stored in a private bucket under unguessable keys,
  attached only by their uploader, and streamed through an authorization check with
  `Cache-Control: private, no-store`, a sandboxing CSP, `nosniff`, and download-only PDFs.
- **Moderation first.** Pending and rejected requests are visible only to their owner and admins; only
  published, fulfilled and expired requests are public, and URL filters can't request other statuses.
- **Server-side authorization everywhere.** Every Server Action and Route Handler re-checks the session
  and re-reads the user (and role) from MongoDB; client checks are cosmetic. Inputs are validated with
  Zod on the server, free text is stripped of control characters and rendered as text (never as HTML),
  and email templates escape every user-supplied value.
- **Abuse controls.** MongoDB-backed rate limits, a pending-request cap, duplicate comment detection,
  reporting, nginx body-size and request-rate limits.
- **Secrets and endpoints.** The worker endpoint requires a bearer secret compared in constant time and
  is blocked at nginx; the Telegram webhook verifies Telegram's secret token; unsubscribe links are
  HMAC-signed. Never commit `.env`; only `.env.example` is tracked.
- **Headers.** A static Content-Security-Policy, HSTS, `X-Frame-Options: DENY`, `nosniff`, a strict
  referrer policy and a restrictive `Permissions-Policy` are set in `next.config.ts`.
- **Account deletion** removes the user, their requests with documents, comments and jobs, their
  Telegram link tokens and reveal logs, and blanks comments they left on other requests.
- **Email etiquette.** One email per donor (no shared recipient lists), a `List-Unsubscribe` header and
  signed unsubscribe links, and a daily cap.
- **Medical safety.** Copy everywhere reminds users that matching is not a medical decision and that
  blood must never be paid for.

## Known limitations

- **Area is free text.** Matching and filtering use district and division only; the donor's area is
  informational and not normalised.
- **No SMS** notifications — only email and the Telegram channel.
- **Telegram linking requires the bot to be configured** (`TELEGRAM_*` variables and the webhook).
  Without it, the account page shows "Telegram community coming soon" and Telegram jobs wait. Join
  requests from unlinked accounts need manual approval in Telegram.
- **Notifications are sent once**, when a request is approved, with up to about a minute of delay (cron
  interval). The email quota is counted per UTC day for a single Brevo account.
- **Search** uses a MongoDB text index on hospital name and district (whole words, no fuzzy matching).
- **No donation history** — the app doesn't track last donation dates or donor eligibility intervals.
- **English only** interface for now.
- **Single-instance caching by default** — see _Scaling out_ above for multi-instance deployments.
