#!/usr/bin/env bash
# Reassign which Cloudflare Worker owns which custom domain.
#
# Audits every Workers Custom Domain currently bound in the account, then
# (only when CONFIRM=DEPLOY):
#   - attaches norcalcarbmobile.com + www.norcalcarbmobile.com to the
#     TARGET_SERVICE worker (the canonical NorCal CARB Mobile site)
#   - detaches mobileovitest.com + www.mobileovitest.com from whatever
#     worker currently owns them, so that content stops serving there
#
# Uses an account-scoped token from GitHub org/repo secrets (never printed).
# Read-before-change: the audit always runs; changes only apply with the
# same "type DEPLOY" confirm gate used by cf-deploy.yml.
set -euo pipefail

API="https://api.cloudflare.com/client/v4"
TARGET_SERVICE="${TARGET_SERVICE:-norcalcarbmobile-site}"
ATTACH_HOSTNAMES=("norcalcarbmobile.com" "www.norcalcarbmobile.com")
DETACH_HOSTNAMES=("mobileovitest.com" "www.mobileovitest.com")
CONFIRM="${CONFIRM:-no}"

TOKEN="${CLOUDFLARE_API_TOKEN:-${CF_API_TOKEN:-${CLOUDFLARE_TOKEN:-}}}"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"

if [ -z "$TOKEN" ]; then
  echo "::error::No Cloudflare token. Grant an org/repo secret named CLOUDFLARE_API_TOKEN (or CF_API_TOKEN / CLOUDFLARE_TOKEN), scoped to Account:Workers Scripts:Edit + Zone:Edit + Zone:Read for every zone involved."
  exit 1
fi

cf() { local m="$1" p="$2"; shift 2; curl -sS -X "$m" "$API$p" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"; }
ok() { echo "$1" | jq -e '.success == true' >/dev/null 2>&1; }

# --- Resolve account id ---
if [ -z "$ACCOUNT_ID" ]; then
  echo "Resolving account id ..."
  resp="$(cf GET "/accounts")"
  ok "$resp" || { echo "::error::Account lookup failed: $(echo "$resp" | jq -c '.errors')"; exit 1; }
  ACCOUNT_ID="$(echo "$resp" | jq -r '.result[0].id // empty')"
  [ -n "$ACCOUNT_ID" ] || { echo "::error::No account visible to this token."; exit 1; }
fi
echo "Account id: $ACCOUNT_ID"

# --- Audit: every hostname currently bound to a Worker (always runs) ---
echo "== Current Worker Custom Domains (audit) =="
domains="$(cf GET "/accounts/$ACCOUNT_ID/workers/domains")"
ok "$domains" || { echo "::error::Listing worker domains failed: $(echo "$domains" | jq -c '.errors')"; exit 1; }
echo "$domains" | jq -r '.result[] | "\(.hostname)\t-> \(.service)\t(id: \(.id))"'

if [ "$CONFIRM" != "DEPLOY" ]; then
  echo
  echo "Audit only — re-run with CONFIRM=DEPLOY to apply the reassignment below:"
  for h in "${ATTACH_HOSTNAMES[@]}"; do echo "  attach  $h -> $TARGET_SERVICE"; done
  for h in "${DETACH_HOSTNAMES[@]}"; do echo "  detach  $h"; done
  exit 0
fi

# --- Attach norcalcarbmobile.com (+www) to TARGET_SERVICE ---
echo
echo "== Attaching to $TARGET_SERVICE =="
for host in "${ATTACH_HOSTNAMES[@]}"; do
  zone_name="$(echo "$host" | sed -E 's/^www\.//')"
  zresp="$(cf GET "/zones?name=$zone_name")"
  ok "$zresp" || { echo "::error::Zone lookup failed for $zone_name: $(echo "$zresp" | jq -c '.errors')"; exit 1; }
  zone_id="$(echo "$zresp" | jq -r '.result[0].id // empty')"
  [ -n "$zone_id" ] || { echo "::error::Zone $zone_name not visible to this token."; exit 1; }

  existing_id="$(echo "$domains" | jq -r --arg h "$host" '.result[] | select(.hostname==$h) | .id // empty')"
  existing_service="$(echo "$domains" | jq -r --arg h "$host" '.result[] | select(.hostname==$h) | .service // empty')"
  if [ "$existing_service" = "$TARGET_SERVICE" ]; then
    echo "$host already -> $TARGET_SERVICE, skipping."
    continue
  fi

  payload="$(jq -cn --arg h "$host" --arg s "$TARGET_SERVICE" --arg z "$zone_id" \
    '{environment:"production", hostname:$h, service:$s, zone_id:$z}')"
  if [ -n "$existing_id" ]; then
    r="$(cf PUT "/accounts/$ACCOUNT_ID/workers/domains/$existing_id" --data "$payload")"
  else
    r="$(cf PUT "/accounts/$ACCOUNT_ID/workers/domains" --data "$payload")"
  fi
  ok "$r" && echo "$host -> $TARGET_SERVICE done." || { echo "::error::Attach failed for $host: $(echo "$r" | jq -c '.errors')"; exit 1; }
done

# --- Detach mobileovitest.com (+www) from whatever currently owns it ---
echo
echo "== Detaching mobileovitest.com =="
for host in "${DETACH_HOSTNAMES[@]}"; do
  domain_id="$(echo "$domains" | jq -r --arg h "$host" '.result[] | select(.hostname==$h) | .id // empty')"
  if [ -z "$domain_id" ]; then
    echo "$host has no Worker Custom Domain binding, nothing to detach."
    continue
  fi
  r="$(cf DELETE "/accounts/$ACCOUNT_ID/workers/domains/$domain_id")"
  ok "$r" && echo "$host detached." || { echo "::error::Detach failed for $host: $(echo "$r" | jq -c '.errors')"; exit 1; }
done

echo
echo "== REASSIGNMENT COMPLETE =="
