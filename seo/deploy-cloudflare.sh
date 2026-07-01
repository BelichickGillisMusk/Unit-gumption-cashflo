#!/usr/bin/env bash
# Deploy NorCal CARB Mobile SEO changes to Cloudflare via the API.
# Uses a zone-scoped token from GitHub org/repo secrets (never printed).
# Read-before-change and fail-open snippet => safe to run against production.
set -euo pipefail

API="https://api.cloudflare.com/client/v4"
SNIPPET_NAME="inject_master_schema"
ZONE_NAME="norcalcarbmobile.com"

# Accept whichever secret name is configured.
TOKEN="${CLOUDFLARE_API_TOKEN:-${CF_API_TOKEN:-${CLOUDFLARE_TOKEN:-}}}"
ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"

if [ -z "$TOKEN" ]; then
  echo "::error::No Cloudflare token. Grant an org/repo secret named CLOUDFLARE_API_TOKEN (or CF_API_TOKEN / CLOUDFLARE_TOKEN) to this repo, scoped to the ${ZONE_NAME} zone with Snippets:Edit, Zone Settings:Edit, Cache Purge:Purge, Zone:Read."
  exit 1
fi

cf() { local m="$1" p="$2"; shift 2; curl -sS -X "$m" "$API$p" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"; }
ok() { echo "$1" | jq -e '.success == true' >/dev/null 2>&1; }

# --- Resolve zone id ---
if [ -z "$ZONE_ID" ]; then
  echo "Resolving zone id for $ZONE_NAME ..."
  resp="$(cf GET "/zones?name=$ZONE_NAME")"
  ok "$resp" || { echo "::error::Zone lookup failed: $(echo "$resp" | jq -c '.errors')"; exit 1; }
  ZONE_ID="$(echo "$resp" | jq -r '.result[0].id // empty')"
  [ -n "$ZONE_ID" ] || { echo "::error::Zone $ZONE_NAME not visible to this token."; exit 1; }
fi
echo "Zone id: $ZONE_ID"

# --- 1) SSL: read; only fix if Flexible ---
echo "== SSL/TLS =="
ssl="$(cf GET "/zones/$ZONE_ID/settings/ssl")"
mode="$(echo "$ssl" | jq -r '.result.value // "unknown"')"
echo "Current SSL mode: $mode"
if [ "$mode" = "flexible" ]; then
  r="$(cf PATCH "/zones/$ZONE_ID/settings/ssl" --data '{"value":"strict"}')"
  ok "$r" && echo "SSL -> Full (strict)" || echo "::warning::SSL change failed: $(echo "$r" | jq -c '.errors')"
else
  echo "SSL is '$mode' (not Flexible) — left unchanged."
fi

# --- 2) Build snippet from template + schema ---
echo "== Build snippet =="
node -e 'const fs=require("fs");const t=fs.readFileSync("seo/cf-inject-snippet.template.js","utf8");const d=JSON.parse(fs.readFileSync("seo/norcalcarbmobile.schema.json","utf8"));fs.writeFileSync("snippet.js",t.replace("__SCHEMA__",JSON.stringify(d)));'
echo "snippet.js size: $(wc -c < snippet.js) bytes"

# --- 3) Upload snippet (multipart) ---
echo "== Upload snippet =="
up="$(curl -sS -X PUT "$API/zones/$ZONE_ID/snippets/$SNIPPET_NAME" \
  -H "Authorization: Bearer $TOKEN" \
  -F 'metadata={"main_module":"snippet.js"};type=application/json' \
  -F 'files=@snippet.js;filename=snippet.js;type=application/javascript')"
ok "$up" || { echo "::error::Snippet upload failed: $(echo "$up" | jq -c '.errors')"; exit 1; }
echo "Snippet '$SNIPPET_NAME' uploaded."

# --- 4) Bind rule (merge, don't clobber existing rules) ---
echo "== Snippet rules =="
rules="$(cf GET "/zones/$ZONE_ID/snippets/snippet_rules")"
existing="$(echo "$rules" | jq -c '[.result[]? | select(.snippet_name != "'"$SNIPPET_NAME"'")]')"
newrule="$(jq -cn --arg n "$SNIPPET_NAME" '{enabled:true,description:"Inject LocalBusiness JSON-LD",expression:"http.host in {\"norcalcarbmobile.com\" \"www.norcalcarbmobile.com\"}",snippet_name:$n}')"
payload="$(jq -cn --argjson ex "${existing:-[]}" --argjson nr "$newrule" '{rules:($ex + [$nr])}')"
rr="$(cf PUT "/zones/$ZONE_ID/snippets/snippet_rules" --data "$payload")"
ok "$rr" || { echo "::error::Snippet rule bind failed: $(echo "$rr" | jq -c '.errors')"; exit 1; }
echo "Snippet rule bound to homepage + www."

# --- 5) Bot settings: REPORT ONLY (crawler-block check) ---
echo "== Bot settings (report only — verify Googlebot isn't blocked) =="
cf GET "/zones/$ZONE_ID/bot_management" | jq -c '.result // {note:"no bot_management access on this plan/token", errors:.errors}' || true

# --- 6) Purge cache ---
echo "== Purge cache =="
p="$(cf POST "/zones/$ZONE_ID/purge_cache" --data '{"purge_everything":true}')"
ok "$p" && echo "Cache purged." || echo "::warning::Purge failed: $(echo "$p" | jq -c '.errors')"

echo "== DEPLOY COMPLETE =="
