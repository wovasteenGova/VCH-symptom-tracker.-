---
name: Symptom Tracker MVP
overview: Build a 100% mobile-first Nuxt 4 + Nuxt UI PWA symptom tracker for veterans that syncs to Supabase accounts and supports a $5 one-time unlock for unlimited tracking/export. The goal is a focused app veterans can use for migraines, headaches, back pain, mental health symptoms, flare-ups, and claim evidence notes without overbuilding.
todos:
  - id: define-schema
    content: Design Supabase tables and RLS policies for symptom logs and one-time entitlements
    status: pending
  - id: build-ui
    content: Build the mobile-first symptom tracker page with add-log form, recent logs, and dashboard summary
    status: pending
  - id: add-data-layer
    content: Create symptom tracker composable for CRUD, free limit checks, and entitlement checks
    status: pending
  - id: wire-payment
    content: Connect a $5 one-time Stripe unlock to the entitlement table
    status: pending
  - id: supporter-observations
    content: Add a share-link flow where trusted family members can submit observations about the veteran's symptoms and daily impact
    status: pending
  - id: add-export
    content: Add paid export/print summary for logs by date range and symptom type
    status: pending
  - id: privacy-copy
    content: Add clear privacy, medical disclaimer, and delete-data controls
    status: pending
isProject: false
---

# Veteran Symptom Tracker MVP

## Product Decision

Use a freemium model with a low one-time unlock, not a forced subscription.

- Free users can create an account and keep a limited number of logs, enough to try the app and see value.
- Paid users unlock unlimited logs, export/print summaries, and better evidence organization.
- Price: `$5 one-time lifetime unlock` for MVP. This feels fair, affordable, and easier to sell to veterans than a recurring subscription.
- Do not make core symptom tracking feel exploitative. The paid value should be convenience, volume, history, and exports.

## App Direction

This is a new standalone app, not a VCH feature page.

- Use Nuxt 4 as the app framework.
- Use Nuxt UI for the component system and interaction patterns.
- Design 100% mobile first. Desktop should feel like a widened mobile app, not a separate dashboard-first layout.
- Ship as a PWA first with installable, responsive, offline-friendly behavior where practical.
- Use VCH only as loose product/design inspiration: veteran-focused copy, clear cards, strong hierarchy, rounded sections, icons, and practical flows.
- Do not copy the VCH layout directly. This app should have its own calmer health-tracking experience.
- Defer native app packaging until later, likely with Capacitor after the PWA is stable.

## Product Philosophy

Frame the app as structured reflection, not continuous suffering monitoring.

The goal is to help veterans remember patterns and real-world impact without making them obsess over symptoms every day. The app should feel low-pressure, supportive, and organizational. It should not psychologically reward people for feeling worse or create a disability identity loop.

Default posture:

- Encourage weekly reflection for most users.
- Use event/flared-up logging when it is clinically or practically useful.
- Always allow an immediate episode log when waiting for the scheduled check-in would lose important context.
- Let supporters submit observations more flexibly because family members often notice functional changes before the veteran processes them.
- Keep the veteran in control of what becomes part of the record.

## Tracking Modes

### Minimal Mode

Recommended default.

Weekly reflection, for example every Friday.

Questions:

- Worst symptom this week?
- What affected daily life most?
- Any flare-ups?
- Missed work, family, social, or daily activities?
- What improved?
- Overall week: stable, difficult, or severe flare-ups.

### Assisted Mode

For veterans who need more frequent capture because of memory issues, TBI, severe PTSD, migraines, chronic flare conditions, or fast-changing symptoms.

Allows:

- Quick event logging during the week.
- Short flare-up entries.
- Limited prompts so the user does not feel pushed into excessive detail.

### Emergency Episode Log

An optional immediate-entry flow for moments that should be captured now instead of waiting for the user's normal reflection time, such as Friday weekly check-in.

Use cases:

- PTSD episode
- Panic episode
- Dissociation
- Severe migraine or pain flare-up
- Sleep disruption that needs to be remembered
- Any event the veteran thinks may be important for care, claim evidence, or pattern tracking

UX rules:

- Keep it short and calm: what happened, when, severity, impact, and optional notes.
- Do not make it feel like a crisis-response tool or medical triage.
- Include a clear crisis disclaimer and emergency resources where appropriate.
- Let the entry roll into the next weekly reflection so the user can review it later with more context.
- Make this available from the main screen as "Log episode now" or similar wording.

### Family Observation Mode

Supporters can submit observations anytime through private links.

Examples:

- "Dad had trouble standing from the couch and stopped helping carry groceries."
- "My husband isolated most of the weekend and barely slept."
- "She had a migraine and stayed in a dark room most of the day."

The veteran reviews, approves, hides, or deletes observations before export.

## Condition-Specific Defaults

Different conditions should use different tracking behavior.

### Physical Conditions

Physical symptoms can support daily or event-based logging because flare-ups, severity, triggers, duration, and functional limits are often concrete.

Good fit for:

- Migraines
- Headaches
- Back pain
- Radiculopathy
- Knee pain
- Tinnitus
- GI issues
- Sleep apnea symptoms
- Medication side effects

Allow:

- Daily logs
- Flare-up logs
- Trigger tracking
- Duration and severity
- Functional impact notes

Example:

`Back pain flare-up after driving 2 hours. Could not sit longer than 15 minutes. Pain radiated down right leg.`

### Mental Health Conditions

Mental health tracking should default to weekly reflection and functional impact, not constant symptom scanning.

Default questions:

- What affected your week most?
- What situations were difficult?
- Did symptoms affect work, relationships, sleep, hygiene, errands, or family life?
- What helped, even a little?

Avoid making daily mental health symptom scanning the default because it can encourage rumination, catastrophizing, self-analysis loops, and living inside trauma.

Optional detailed/event logging should still exist for veterans who explicitly enable it, especially for:

- Panic episodes
- Dissociation
- Severe PTSD
- TBI or memory issues
- Safety planning or crisis-pattern awareness

The key is optionality. The app should offer detail when needed, not demand it by default. For mental health, the app should default to weekly reflection but always allow an emergency episode log when the veteran believes a PTSD, panic, dissociation, or similar episode should be recorded immediately.

## MVP Scope

Build this as a standalone Nuxt 4 app with Nuxt UI and a PWA-friendly mobile layout.

Primary page:
- `app/pages/index.vue`

Core features:
- Require account login before saving symptom entries. Do not rely on anonymous auth for real user data.
- Auth should support email/password, forgot password email, and Google login through Supabase Auth.
- Home screen starts with a swipe/click condition slider. MVP condition templates: PTSD/Mental Health, Back or Joint Pain, Nerve/Radiculopathy, Migraine/Headache, GERD/IBS, and Sleep Issues.
- The first slider card should always be a condition search card. It searches the larger condition library with debounced/live results after the user stops typing.
- Search results should use compact entry-style rows with a small image on the left and condition/category text on the right. Tapping a result should select that condition and start an entry with the closest matching field template.
- Center add button creates an entry for the currently selected condition.
- Left/right controls move between condition templates.
- When the user starts an entry, the carousel controls disappear and the image card becomes the condition-specific VA evidence form.
- In entry mode, keep the condition artwork as a small square thumbnail on the left and place the condition title plus inputs inside the same card.
- Entry mode should take over the screen on mobile. Hide History and other home content until the user taps Done or Cancel.
- While the entry form is open, show Done and Cancel actions in the top-right header. Closing the form brings back the add button, arrows, and slide indicators.
- Claim entry should use a step-by-step architecture, not one long form. Each step should show about 2 inputs so older users are not overwhelmed.
- Entry steps should include back/forward arrows, a progress indicator, and a primary action that says Continue until the last step, then Finish.
- Severity should use a Nuxt UI slider from 0-10 instead of a typed number input.
- Drafts should be part of the architecture. Starting an entry creates an active draft state; leaving/canceling keeps the draft available, while Finish/Done clears it. Persistence can be added later.
- Show a drafts icon near the profile button only when an active draft exists. Use a small red dot to indicate an unfinished draft.
- History section shows recent entries from both the veteran and approved family/supporter observations.
- Add symptom logs for migraines, headaches, back pain, knee pain, sleep issues, mental health symptoms, tinnitus, stomach issues, medication side effects, and custom symptoms.
- Fields: symptom type, severity `1-10`, date/time, duration, body area, triggers, medication/treatment, missed work/activity, notes.
- Optional evidence context: "could support claim for," "flare-up," "C&P/review note," "doctor visit planned."
- Family/supporter observations: veteran can generate a private link and send it to a spouse, parent, adult child, caregiver, or trusted friend so they can submit notes like "I saw my dad have a hard time working today."
- Tracking modes: Minimal Mode, Assisted Mode, Emergency Episode Log, and Family Observation Mode.
- Condition-specific defaults: physical conditions can support daily/event logs; mental health defaults to weekly reflection unless detailed logging is enabled.
- Dashboard summary: recent logs, average severity, most common symptoms, monthly count.
- Export/print summary for doctor, VSO, or claim prep.

Free limit:
- Free account can store around `10-20` logs total.
- Show clear messaging before limit: "Unlock unlimited logs and exports for $5."

Paid unlock:
- Add a user entitlement table, for example `user_entitlements` with `user_id`, `product_key`, `status`, `stripe_payment_intent_id`, `unlocked_at`.
- Product key: `symptom_tracker_lifetime`.
- Add a simple Stripe one-time payment flow for the standalone app.

## Data Model

Use Supabase with RLS. This app should use a dedicated Supabase project if possible, not the VCH content/project database, because symptom logs are more private and the schema will evolve separately.

MCP currently points at the VCH Supabase project. Do not apply symptom tracker health-data tables to that project unless the user explicitly decides to share infrastructure.

Local schema draft:
- `supabase/symptom_tracker_schema.sql`

Suggested tables:

- `symptom_logs`
  - `id uuid`
  - `user_id uuid`
  - `symptom_type text`
  - `severity integer`
  - `logged_at timestamptz`
  - `duration_minutes integer nullable`
  - `body_area text nullable`
  - `triggers text[] nullable`
  - `treatments text[] nullable`
  - `impact text nullable`
  - `notes text nullable`
  - `claim_context text nullable`
  - `created_at timestamptz`
  - `updated_at timestamptz`

- `user_entitlements`
  - `id uuid`
  - `user_id uuid`
  - `product_key text`
  - `status text`
  - `stripe_payment_intent_id text nullable`
  - `unlocked_at timestamptz`
  - `created_at timestamptz`

- `supporter_links`
  - `id uuid`
  - `user_id uuid`
  - `token_hash text`
  - `label text nullable`
  - `relationship text nullable`
  - `active boolean`
  - `expires_at timestamptz nullable`
  - `created_at timestamptz`

- `supporter_observations`
  - `id uuid`
  - `user_id uuid`
  - `supporter_link_id uuid`
  - `observer_name text nullable`
  - `relationship text nullable`
  - `observed_at timestamptz`
  - `symptom_type text nullable`
  - `severity integer nullable`
  - `impact text`
  - `notes text nullable`
  - `review_status text`
  - `created_at timestamptz`

## Supporter Observation Flow

Start with share links. Do not build SMS intake in the first MVP.

- The veteran creates a private supporter link from their tracker settings.
- The veteran sends that link to a trusted family member or caregiver.
- The supporter opens a simple mobile form with no account required.
- The supporter can write what they saw, when it happened, how it affected daily life or work, and optionally choose a symptom type/severity.
- Submitted observations appear in the veteran's tracker as "Family/supporter notes."
- The veteran can approve, hide, or delete observations before including them in exports.
- Supporter links can be disabled by the veteran.

Why not SMS first:

- SMS requires a paid phone provider such as Twilio.
- It creates spam/abuse and identity-verification questions.
- It is harder to explain privacy and consent.
- It is a good paid/premium feature later, but share links are faster and safer for MVP.

## Implementation Approach

1. Build the tracker page UI first as a mobile-first Nuxt UI PWA experience.
2. Add a composable like `app/composables/forms/useSymptomTracker.js` or `app/composables/data/useSymptomTrackerData.js` for CRUD operations.
3. Add Supabase tables and RLS through MCP only.
4. Add entitlement checking in the composable/page.
5. Add `$5` unlock button using a simple Stripe one-time payment flow.
6. Add supporter share links and family observation review.
7. Add export/print summary for paid users.
8. Add a clear privacy disclaimer: the app helps you organize notes, but it is not medical advice, legal advice, or a substitute for official VA records.

## UX Structure

```mermaid
flowchart TD
  user[
