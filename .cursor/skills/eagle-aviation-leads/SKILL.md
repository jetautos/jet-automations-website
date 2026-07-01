# Eagle Aviation — Salesforce Leads & Activity Reports

Use this skill when the user asks about **EA leads**, **Eagle Aviation leads**, **lead updates**, **pipeline status**, **who was contacted**, **Clint's outreach**, or **website form conversions**.

## Org & CLI

- **Salesforce alias:** `eagle-aviation`
- **Instance:** `business-nosoftware-9237.my.salesforce.com`
- **Org ID:** `00Dal00001TJcl7EAD`
- **CLI:** `/workspace/.tools/node_modules/.bin/sf` (or `sf` if on PATH)

Always verify connection first:

```bash
sf org list --target-org eagle-aviation
```

## What to run (standard report)

Run these queries and synthesize a human-readable summary:

### 1. Current pipeline

```bash
sf data query --target-org eagle-aviation \
  --query "SELECT Status, COUNT(Id) cnt FROM Lead GROUP BY Status"
```

### 2. All leads (newest first)

```bash
sf data query --target-org eagle-aviation \
  --query "SELECT Id, FirstName, LastName, Email, Phone, Company, Status, Description, CreatedDate, LastModifiedDate, LastActivityDate FROM Lead ORDER BY CreatedDate DESC"
```

### 3. Status change history

```bash
sf data query --target-org eagle-aviation \
  --query "SELECT LeadId, Field, OldValue, NewValue, CreatedDate, CreatedBy.Name FROM LeadHistory WHERE Field = 'Status' ORDER BY CreatedDate DESC LIMIT 30"
```

### 4. Logged activity (tasks)

```bash
sf data query --target-org eagle-aviation \
  --query "SELECT Id, Subject, Status, ActivityDate, WhoId, Who.Name, Description, CreatedDate, LastModifiedDate, Owner.Name FROM Task WHERE WhoId IN (SELECT Id FROM Lead) ORDER BY LastModifiedDate DESC LIMIT 25"
```

### 5. New leads since a date (if user asks for recent)

```bash
sf data query --target-org eagle-aviation \
  --query "SELECT Id, FirstName, LastName, Email, Status, CreatedDate FROM Lead WHERE CreatedDate >= YYYY-MM-DDT00:00:00Z ORDER BY CreatedDate DESC"
```

## How to interpret leads

### Real website leads vs test

| Type | How to identify |
|------|-----------------|
| **Real** | `Company = 'Eagle Aviation Students'` — came from https://www.eagleaviationhq.com form |
| **Test/internal** | `Company = 'test'`, name "Test Form", or `jgranato6549@gmail.com` |

Exclude test leads from pipeline summaries unless user asks for all records.

### Expected workflow (team norm)

**Clint Powell** owns outreach on real leads. Good records include:

1. **Status** updated (New → Contacted → Qualified)
2. **Task** logged (Call, Email, Other) with notes
3. Auto **"Thanks for contacting Eagle Aviation!"** email on form submit (does not replace manual follow-up)

Flag gaps: status changed but **no manual call/email task** after auto-reply.

## Known context (as of Jun 2026)

- **7 real website leads** from form; all moved to **Contacted**
- **Penny Golden** — discovery flight scheduled **Jul 4, 2026 @ 10 AM** (strongest lead)
- **Pierson Pilgrim** — mother contacted Clint; 16yo Part 61 inquiry
- **Loyal Gephart** — interested, discussing with wife
- **Garret Vaughn** — call attempted, unavailable
- **Richard Chapa** — left voicemail (×2)
- **Martin Rackley** — emailed
- **Evelyn Valportodesa** — Contacted but only auto thank-you logged; **follow-up gap**
- Leads reassigned from **Eagle Inquiries** queue to **Clint Powell** (Jun 29)
- Website has **no GA4/analytics** — leads are the primary conversion metric

## Report format for the user

When asked for updates, include:

1. **At a glance** — counts by status, new since last period
2. **Status changes** — who changed, when, old → new
3. **Activity** — calls/emails with Clint's notes
4. **Highlights** — booked discovery flights, hot leads, gaps
5. **Test records** — separate short section or omit

Keep tone practical. Clint records outreach well — call that out when activity is thorough.

## Related (not leads)

- **Marketing site:** `eagle-aviation/` in jet-automations-website repo → https://www.eagleaviationhq.com
- **Student app:** separate repo `jetautos/eagle-student-app` → https://app.eagleaviationhq.com
- **Web-to-Lead oid:** `00Dal00001TJcl7EAD`

## Do not

- Confuse EA marketing site leads with **Daedalians** org (`daedalians-readonly`) or other orgs
- Treat auto thank-you emails as manual outreach unless user asks for all activity
- Share refresh tokens or auth URLs in reports
