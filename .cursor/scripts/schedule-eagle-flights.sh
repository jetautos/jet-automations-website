#!/usr/bin/env bash
# Create Salesforce Calendar Events for Eagle Aviation discovery flights / lessons.
# Requires eagle-aviation org auth (see below).
set -euo pipefail

SF="${SF:-/workspace/.tools/node_modules/.bin/sf}"
ORG="${ORG:-eagle-aviation}"

if ! "$SF" org list --all 2>/dev/null | grep -q "$ORG"; then
  if [[ -n "${SFDX_AUTH_URL:-}" ]]; then
    echo "Authenticating to $ORG from SFDX_AUTH_URL..."
    printf '%s' "$SFDX_AUTH_URL" | "$SF" org login sfdx-url \
      --sfdx-url-stdin --alias "$ORG" --set-default
  else
    echo "No org auth for '$ORG'. Set SFDX_AUTH_URL or run:"
    echo "  sf org login sfdx-url --alias $ORG --set-default"
    exit 1
  fi
fi

query() {
  "$SF" data query --target-org "$ORG" --json --query "$1"
}

owner_id="$(query "SELECT Id FROM User WHERE Name = 'Clint Powell' AND IsActive = true LIMIT 1" \
  | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['result']['records'][0]['Id'])")"

create_event_if_missing() {
  local who_id="$1"
  local subject="$2"
  local start="$3"
  local end="$4"
  local description="$5"

  local existing
  existing="$(query "SELECT Id, Subject FROM Event WHERE WhoId = '$who_id' AND StartDateTime = '$start' LIMIT 1" \
    | python3 -c "import sys,json; r=json.load(sys.stdin); recs=r['result']['records']; print(recs[0]['Id'] if recs else '')")"

  if [[ -n "$existing" ]]; then
    echo "Already scheduled: $subject ($existing)"
    return 0
  fi

  local id
  id="$("$SF" data create record --target-org "$ORG" --sobject Event --json \
    --values "Subject='$subject' WhoId='$who_id' OwnerId='$owner_id' StartDateTime=$start EndDateTime=$end Location='KPEZ' Description='$description'" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['id'])")"
  echo "Created: $subject ($id)"
}

# Penny Golden — discovery flight, Jul 4 2026 @ 10:00 AM America/Chicago (CDT, UTC-5)
PENNY_LEAD="00Qal00000dqmmrEAA"
create_event_if_missing "$PENNY_LEAD" \
  "Discovery Flight - Penny Golden" \
  "2026-07-04T15:00:00.000+0000" \
  "2026-07-04T16:30:00.000+0000" \
  "Discovery flight scheduled 10 AM 4 Jul 2026 (from Clint call log)."

# Isaac Correa — return-to-training lesson, Jul 5 2026 @ 10:00 AM America/Chicago
ISAAC_CONTACT="003al00000oapmVAAQ"
create_event_if_missing "$ISAAC_CONTACT" \
  "Flight Lesson - Isaac Correa" \
  "2026-07-05T15:00:00.000+0000" \
  "2026-07-05T16:30:00.000+0000" \
  "Returning student (~40 hrs, finish PPL). Grad target ~5 Jul 2026."

echo ""
echo "Verify in Salesforce Calendar or:"
echo "  sf data query --target-org $ORG --query \"SELECT Id, Subject, StartDateTime, Who.Name FROM Event WHERE WhoId IN ('$PENNY_LEAD','$ISAAC_CONTACT') ORDER BY StartDateTime\""
