#!/usr/bin/env bash
# Reassign which Cloudflare Worker owns which custom domain.
#
# Audits every Workers Custom Domain currently bound in the account, then
# (only when CONFIRM=DEPLOY):
#   - attaches norcalcarbmobile.com + www.norcalcarbmobile.com to the
#     TARGET_SERVICE worker (the canonical NorCal CARB Mobile site)
#   - detaches mobileovitest.com + www.mobileovitest.com from whatever
#     worker currently owns them, ONLY if DETACH_MOBILEOVITEST=true —
#     mobileovitest.com has its own separate site, so detaching it is
#     opt-in rather than automatic (see PR discussion).
#
# Uses an account-scoped token from GitHub org/repo secrets (never printed).
# Read-before-change: the audit always runs; changes only apply with the
# same "type DEPLOY" confirm gate used by cf-deploy.yml.
set -euo pipefail

API="https://api.cloudflare.com/client/v4"
TARGET_SERVICE="${TARGET_SERVICE:-norcalcarbmobile-site}"
ATTACH_HOSTNAMES=("norcalcarbmobile.com" "www.norcalcarbmobile.com")
DETACH_HOSTNAMES=("mobileovitest.com" "www.mobileovitest.com")
DETACH_MOBILEOVITEST="${DETACH_MOBILEOVITEST:-false}"
CONFIRM="${CONFIRM:-no}"

TOKEN="${CLOUDFLARE_API_TOKEN:-${CF_API_TOKEN:-${CLOUDFLARE_TOKEN:-}}}"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"

if [ -z "$TOKEN" ]; then
  echo "::error::No Cloudflare token. Grant an org/repo secret named CLOUDFLARE_API_TOKEN (or CF_API_TOKEN / CLOUDFLARE_TOKEN), scoped to Account:Workers Scripts:Edit + Zone:Edit + Zone:Read for every zone involved."
  exit 1
fi

cf() { local m="$1" p="$2"; shift 2; curl -sS -X "$m" "$API$p" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"; }
ok() { echo "$1" | jq -e '.success == true' >/dev/null 2>&1; }

# --- Resolve account id (fail if ambiguous — never silently guess) ---
if [ -z "$ACCOUNT_ID" ]; then
  echo "Resolving account id ..."
  resp="$(cf GET "/accounts")"
  ok "$resp" || { echo "::error::Account lookup failed: $(echo "$resp" | jq -c '.errors')"; exit 1; }
  count="$(echo "$resp" | jq -r '.result | length')"
  if [ "$count" -eq 0 ]; then
    echo "::error::No account visible to this token."
    exit 1
  elif [ "$count" -gt 1 ]; then
    echo "::error::Token can see $count accounts — set CLOUDFLARE_ACCOUNT_ID explicitly to avoid touching the wrong one. Candidates:"
    echo "$resp" | jq -r '.result[] | "  \(.id)  \(.name)"'
    exit 1
  fi
  ACCOUNT_ID="$(echo "$resp" | jq -r '.result[0].id')"
fi
echo "Account id: $ACCOUNT_ID"

# --- Audit: every hostname currently bound to a Worker (always runs, all pages) ---
echo "== Current Worker Custom Domains (audit) =="
domains='{"result":[]}'
page=1
while :; do
  resp="$(cf GET "/accounts/$ACCOUNT_ID/workers/domains?page=$page&per_page=50")"
  ok "$resp" || { echo "::error::Listing worker domains failed: $(echo "$resp" | jq -c '.errors')"; exit 1; }
  domains="$(jq -cn --argjson a "$domains" --argjson b "$resp" '{result: ($a.result + $b.result)}')"
  total_pages="$(echo "$resp" | jq -r '.result_info.total_pages // 1')"
  [ "$page" -ge "$total_pages" ] && break
  page=$((page + 1))
done
echo "$domains" | jq -r '.result[] | "\(.hostname)\t-> \(.service)\t(id: \(.id))"'

if [ "$CONFIRM" != "DEPLOY" ]; then
  echo
  echo "Audit only — re-run with CONFIRM=DEPLOY to apply the reassignment below:"
  for h in "${ATTACH_HOSTNAMES[@]}"; do echo "  attach  $h -> $TARGET_SERVICE"; done
  if [ "$DETACH_MOBILEOVITEST" = "true" ]; then
    for h in "${DETACH_HOSTNAMES[@]}"; do echo "  detach  $h"; done
  else
    echo "  (mobileovitest.com left untouched — set DETACH_MOBILEOVITEST=true to also detach it)"
  fi
  exit 0
fi

# --- Attach norcalcarbmobile.com (+www) to TARGET_SERVICE ---
# PUT /accounts/{account_id}/workers/domains upserts by hostname — there is
# no separate update-by-id endpoint, so this is the only call needed whether
# or not the hostname already has a (different) Worker attached.
echo
echo "== Attaching to $TARGET_SERVICE =="
for host in "${ATTACH_HOSTNAMES[@]}"; do
  existing_service="$(echo "$domains" | jq -r --arg h "$host" '.result[] | select(.hostname==$h) | .service // empty')"
  if [ "$existing_service" = "$TARGET_SERVICE" ]; then
    echo "$host already -> $TARGET_SERVICE, skipping."
    continue
  fi

  zone_name="$(echo "$host" | sed -E 's/^www\.//')"
  zresp="$(cf GET "/zones?name=$zone_name")"
  ok "$zresp" || { echo "::error::Zone lookup failed for $zone_name: $(echo "$zresp" | jq -c '.errors')"; exit 1; }
  zone_id="$(echo "$zresp" | jq -r '.result[0].id // empty')"
  [ -n "$zone_id" ] || { echo "::error::Zone $zone_name not visible to this token."; exit 1; }

  payload="$(jq -cn --arg h "$host" --arg s "$TARGET_SERVICE" --arg z "$zone_id" \
    '{environment:"production", hostname:$h, service:$s, zone_id:$z}')"
  r="$(cf PUT "/accounts/$ACCOUNT_ID/workers/domains" --data "$payload")"
  ok "$r" && echo "$host -> $TARGET_SERVICE done." || { echo "::error::Attach failed for $host: $(echo "$r" | jq -c '.errors')"; exit 1; }
done

# --- Detach mobileovitest.com (+www), opt-in only ---
echo
if [ "$DETACH_MOBILEOVITEST" != "true" ]; then
  echo "== Skipping mobileovitest.com (DETACH_MOBILEOVITEST != true) =="
else
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
fi

echo
echo "== REASSIGNMENT COMPLETE =="
