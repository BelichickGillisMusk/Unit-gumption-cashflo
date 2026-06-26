# NorCal Automation — Daily Order Pulse

This is the **durable, 24/7 heartbeat** for NorCal CARB Mobile order flow. It
runs on GitHub's servers via `.github/workflows/norcal-daily-pulse.yml` — no
Make scenario, no Claude session, and no laptop has to be open.

## Why this exists
In June, the Make.com automations stopped silently: the CRM "catcher" scenario
was never switched on, and the Slack alerter auto-disabled itself after its
Gmail token expired. Make only alerts on scenarios that *run and error* — an
**off** scenario produces no errors and therefore no alerts. Nobody logs into
Make, so the failure was invisible for weeks while orders kept coming in.

This job fixes the two real gaps:
- **Heartbeat** — it reports every day whether order flow looks healthy, so
  *absence of work* is visible instead of looking like success.
- **Alerts where you actually look** — Slack + `bryan@norcalcarbmobile.com`,
  plus GitHub's own failure email as a backstop.

## What it does each morning (14:23 UTC)
Cron is always UTC and does **not** shift with daylight saving, so this lands at
~7:23am Pacific in summer (PDT) and ~6:23am in winter (PST).

1. Pulls the last 24h of Squarespace orders and keeps only the ones genuinely
   **created** in that window (count + revenue).
2. Flags JMB Construction (`msousa@jmbconstruction.com`) activity.
3. Posts a short summary (a few lines) to Slack + email.
4. Warns if there were **zero new orders on a weekday** (the exact pattern that
   hid the June outage).
5. **Fails the workflow loudly** on any hard error — and also if every
   configured alert channel fails to deliver (so the run can't go green with
   zero notifications) — giving you a second alert from GitHub Actions itself.

Only counts/totals ever leave the job — no customer PII is posted to Slack,
email, or logs.

## Required GitHub repository secrets
Set these under **Settings → Secrets and variables → Actions → New repository
secret**. The job runs without them (it'll just tell you what's missing), but
each one unlocks a piece:

| Secret | Needed for | How to get it |
|---|---|---|
| `SQUARESPACE_API_KEY` | Live order pull | Squarespace → Settings → Developer/API keys → create a key with **Orders (read)** scope |
| `SLACK_WEBHOOK_URL` | Slack alerts | Slack → create an **Incoming Webhook** for the channel you want, copy the `https://hooks.slack.com/...` URL |
| `ALERT_EMAIL_TO` | Email alerts | `bryan@norcalcarbmobile.com` (comma-separate for more) |
| `SMTP_HOST` | Email transport | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | Email transport | `587` |
| `SMTP_USER` | Email auth | the sending mailbox |
| `SMTP_PASS` | Email auth | an **app password** (not the account password) |
| `SMTP_FROM` | From address | optional; defaults to `SMTP_USER` |

> Slack alerts here use an **Incoming Webhook URL**, which is independent of the
> Make/Claude Slack connection — so it can't be taken down by the same token
> expiry that killed the old alerter.

## Test it now
Push the branch, then in the repo: **Actions → NorCal Daily Order Pulse → Run
workflow**. With no secrets it prints what's missing; with `SLACK_WEBHOOK_URL`
set it posts a live heartbeat immediately.

## Not yet included (deliberately)
- **CRM sheet enrichment** (NAP + email, JMB earmark for every payer) writes
  customer PII and belongs in the Google Sheet, not a git repo. That can be
  added as a secret-gated step using a Google **service account** once the
  target sheet is re-created (the old one, `1-sifc44…`, is deleted/missing).
- **Old-Stripe (prior year) payments** — connect that account or drop its
  export and it can be merged into the same report.
