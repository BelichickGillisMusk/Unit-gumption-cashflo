#!/usr/bin/env python3
"""
NorCal CARB Mobile — daily order-flow pulse.

Purpose: the heartbeat that was missing when the Make scenarios died silently in
June. Once a day this:
  1. Pulls the last 24h of Squarespace orders (filtered to genuinely NEW
     orders by createdOn — see fetch note below).
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


def created_in_window(order, after, before):
    """True if the order was CREATED within [after, before).

    Squarespace's List Orders `modifiedAfter` filter keys off modifiedOn, so the
    API returns OLD orders that were merely edited (fulfilled/refunded) in the
    window. We re-filter by createdOn so an edit to a stale order can't mask a
    real intake outage on a day with no new sales.
    """
    raw = order.get("createdOn")
    if not raw:
        return False
    try:
        created = dt.datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return False
    return after <= created < before


# ---------------------------------------------------------------- Alerting
def post_slack(webhook, text):
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
    """Fan out to every CONFIGURED channel.

    Returns True when there was nothing to deliver (no channel configured) or at
    least one configured channel delivered. Returns False only when one or more
    channels are configured but EVERY one failed to deliver — that is itself a
    silent failure, so callers must fail the run on a False here rather than let
    the workflow go green with zero notifications.
    """
    prefix = "✅" if ok else "🚨"
    subject = f"{prefix} NorCal order pulse — {'OK' if ok else 'FAILURE'}"
    channels = []
    if env("SLACK_WEBHOOK_URL"):
        channels.append(
            ("slack", lambda: post_slack(env("SLACK_WEBHOOK_URL"), f"{prefix} {text}"))
        )
    if env("SMTP_HOST") and env("ALERT_EMAIL_TO"):
        channels.append(("email", lambda: send_email(subject, text)))

    if not channels:
        log("No alert channels configured — printing summary only:")
        log(text)
        return True

    delivered = 0
    for label, fn in channels:
        try:
            fn()
            delivered += 1
        except Exception as e:  # noqa: BLE001 — try every channel before giving up
            log(f"WARN: {label} alert failed: {e}")
    if delivered == 0:
        log("CRITICAL: all configured alert channels failed to deliver.")
        return False
    return True


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
        # Config gap, not a system outage — but if alert channels ARE set and
        # all fail, that's a real silent failure, so fail the run.
        return 0 if alert(msg, ok=True) else 1

    try:
        fetched = fetch_orders(api_key, iso(day_ago), iso(now))
    except error.HTTPError as e:
        body = e.read().decode(errors="replace")[:300]
        raise RuntimeError(f"Squarespace API HTTP {e.code}: {body}") from e

    # Keep only orders genuinely CREATED in the window (modifiedAfter returns
    # edited-but-old orders too) so the zero-order warning can't be masked.
    new_orders = [o for o in fetched if created_in_window(o, day_ago, now)]
    day = summarize(new_orders)

    weekday = now.weekday() < 5  # Mon–Fri
    lines = [
        f"NorCal order pulse for {now:%Y-%m-%d %H:%M UTC}",
        f"• New orders (last 24h): {day['count']}, ${day['revenue']:,.2f}",
        f"• JMB Construction orders in window: {day['jmb']}",
    ]
    if day["count"] == 0 and weekday:
        lines.append(
            "⚠️ Zero NEW orders in 24h on a weekday — verify Squarespace + intake "
            "are healthy (this is the exact pattern that hid the June outage)."
        )
    delivered = alert("\n".join(lines), ok=True)
    log("Done.")
    return 0 if delivered else 1


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:  # noqa: BLE001
        # Hard failure: alert loudly AND fail the job so GitHub emails too.
        alert(f"NorCal pulse FAILED: {e}", ok=False)
        log(f"FATAL: {e}")
        sys.exit(1)
