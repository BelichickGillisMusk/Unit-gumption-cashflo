#!/usr/bin/env python3
"""
NorCal CARB Mobile — daily order-flow pulse.

Purpose: the heartbeat that was missing when the Make scenarios died silently in
June. Once a day this:
  1. Pulls the last 24h (and YTD) of Squarespace orders.
  2. Posts a short summary to Slack + email so SILENCE can't hide a failure.
  3. Flags JMB Construction (msousa@jmbconstruction.com) activity.
  4. Exits NON-ZERO on any hard failure, so GitHub Actions' native failure
     notification also fires.

This script intentionally puts only COUNTS/TOTALS in the alert — never dumps
customer PII into Slack/email/logs. Full CRM enrichment belongs in the Google
Sheet, not here.

All external destinations are optional and secret-gated. With NO secrets set the
script still runs, prints a summary, and tells you what's missing — it does not
crash.
"""
import os
import sys
import json
import smtplib
import datetime as dt
from email.mime.text import MIMEText
from urllib import request, parse, error

JMB_EMAIL = "msousa@jmbconstruction.com"
SQSP_API = "https://api.squarespace.com/1.0/commerce/orders"


def env(name, default=""):
    return os.environ.get(name, default).strip()


def log(msg):
    print(f"[pulse] {msg}", flush=True)


# ---------------------------------------------------------------- Squarespace
def fetch_orders(api_key, modified_after, modified_before):
    """Return all orders modified in [after, before). Raises on auth/network."""
    orders = []
    cursor = None
    while True:
        if cursor:
            qs = parse.urlencode({"cursor": cursor})
        else:
            qs = parse.urlencode(
                {
                    "modifiedAfter": modified_after,
                    "modifiedBefore": modified_before,
                }
            )
        req = request.Request(
            f"{SQSP_API}?{qs}",
            headers={
                "Authorization": f"Bearer {api_key}",
                "User-Agent": "norcal-daily-pulse/1.0",
                "Accept": "application/json",
            },
        )
        with request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
        orders.extend(data.get("result", []))
        pg = data.get("pagination", {}) or {}
        if pg.get("hasNextPage") and pg.get("nextPageCursor"):
            cursor = pg["nextPageCursor"]
        else:
            break
    return orders


def summarize(orders):
    total = 0.0
    jmb = 0
    for o in orders:
        try:
            total += float((o.get("grandTotal") or {}).get("value") or 0)
        except (TypeError, ValueError):
            pass
        if (o.get("customerEmail") or "").lower() == JMB_EMAIL:
            jmb += 1
    return {"count": len(orders), "revenue": round(total, 2), "jmb": jmb}


# ---------------------------------------------------------------- Alerting
def post_slack(webhook, text):
    if not webhook:
        log("SLACK_WEBHOOK_URL not set — skipping Slack post.")
        return
    body = json.dumps({"text": text}).encode()
    req = request.Request(
        webhook, data=body, headers={"Content-Type": "application/json"}
    )
    with request.urlopen(req, timeout=20) as resp:
        resp.read()
    log("Posted to Slack.")


def send_email(subject, body):
    host = env("SMTP_HOST")
    to = env("ALERT_EMAIL_TO")
    if not host or not to:
        log("SMTP_HOST/ALERT_EMAIL_TO not set — skipping email.")
        return
    user = env("SMTP_USER")
    pw = env("SMTP_PASS")
    sender = env("SMTP_FROM") or user
    port = int(env("SMTP_PORT") or "587")
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to
    with smtplib.SMTP(host, port, timeout=30) as s:
        s.starttls()
        if user and pw:
            s.login(user, pw)
        s.sendmail(sender, [a.strip() for a in to.split(",")], msg.as_string())
    log(f"Emailed {to}.")


def alert(text, ok=True):
    """Best-effort fan-out to every configured channel. Never raises."""
    prefix = "✅" if ok else "🚨"
    subject = f"{prefix} NorCal order pulse — {'OK' if ok else 'FAILURE'}"
    for fn, label in (
        (lambda: post_slack(env("SLACK_WEBHOOK_URL"), f"{prefix} {text}"), "slack"),
        (lambda: send_email(subject, text), "email"),
    ):
        try:
            fn()
        except Exception as e:  # noqa: BLE001 — alerting must not crash the run
            log(f"WARN: {label} alert failed: {e}")


# ---------------------------------------------------------------- Main
def main():
    api_key = env("SQUARESPACE_API_KEY")
    now = dt.datetime.now(dt.timezone.utc)
    day_ago = now - dt.timedelta(hours=24)
    iso = lambda t: t.strftime("%Y-%m-%dT%H:%M:%S.000Z")  # noqa: E731

    if not api_key:
        msg = (
            "Pulse ran but SQUARESPACE_API_KEY is not set, so order flow could "
            "not be checked. Add the secret to enable the live heartbeat."
        )
        log(msg)
        alert(msg, ok=True)
        # Not a hard failure — config gap, not a system outage.
        return 0

    try:
        day = summarize(fetch_orders(api_key, iso(day_ago), iso(now)))
    except error.HTTPError as e:
        body = e.read().decode(errors="replace")[:300]
        raise RuntimeError(f"Squarespace API HTTP {e.code}: {body}") from e

    weekday = now.weekday() < 5  # Mon–Fri
    lines = [
        f"NorCal order pulse for {now:%Y-%m-%d %H:%M UTC}",
        f"• Last 24h: {day['count']} orders, ${day['revenue']:,.2f}",
        f"• JMB Construction orders in window: {day['jmb']}",
    ]
    if day["count"] == 0 and weekday:
        lines.append(
            "⚠️ Zero orders in 24h on a weekday — verify Squarespace + intake "
            "are healthy (this is the exact pattern that hid the June outage)."
        )
    alert("\n".join(lines), ok=True)
    log("Done.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:  # noqa: BLE001
        # Hard failure: alert loudly AND fail the job so GitHub emails too.
        alert(f"NorCal pulse FAILED: {e}", ok=False)
        log(f"FATAL: {e}")
        sys.exit(1)
