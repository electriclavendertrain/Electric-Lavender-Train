# ELT Deferred-Work Register

This file is the canonical source of truth for ELT work intentionally postponed to a later phase. It is a project-management register, not an implementation specification and not part of the deferred technical-documentation rewrite.

**Register created:** 2026-09-03  
**Last register-wide verification:** 2026-09-03  
**Current completed-item count:** 1

## Required workflow for every ELT task

1. Read this register before beginning work.
2. Do not silently delete an item, condense away any requirement, or mark an item complete.
3. Mark an item `DONE` only when its acceptance criteria are satisfied and concrete completion evidence is recorded here.
4. Add newly deferred work immediately, using the next stable ID in the appropriate namespace.
5. Record dependencies, required client input, status, responsible party, verification dates, completion evidence, and relevant files or services.
6. Preserve completed items in the active record and in the completed-items history.
7. If implementation reveals a new requirement, add it even when the current task cannot complete it.
8. In every final task report, state which register items were added, changed, completed, or left unchanged.
9. If a prompt conflicts with this register, report the conflict instead of silently discarding or overriding the tracked item.
10. A prompt mentioning an item, or a partial implementation, is not completion evidence.

Allowed statuses are `BACKLOG`, `WAITING ON CLIENT`, `READY`, `IN PROGRESS`, `BLOCKED`, and `DONE`.

Status guidance:

- `BACKLOG`: intentionally deferred; prerequisites or scheduling are not yet resolved.
- `WAITING ON CLIENT`: concrete client information, approval, access, content, or a decision is required.
- `READY`: acceptance criteria and prerequisites are clear, and work may begin.
- `IN PROGRESS`: active work has started; record the task/session and keep remaining criteria visible.
- `BLOCKED`: work cannot proceed because a documented dependency outside the responsible party's control is unavailable.
- `DONE`: every acceptance criterion is satisfied and concrete evidence is recorded.

Do not store passwords, API keys, access tokens, recovery codes, secret environment-variable values, or other credentials in this file. Evidence may name where a secret was configured and who verified it, but never its value.

## Active register index

| ID | Status | Summary | Responsible party |
|---|---|---|---|
| ELT-STUDIO-001 | BACKLOG | Rewrite Studio language for a nontechnical client | Developer/content designer |
| ELT-STUDIO-002 | BACKLOG | Review conditional fields and validation messages | Developer/content designer |
| ELT-HANDOFF-001 | BACKLOG | Record the final Sanity Studio walkthrough | Developer/project owner |
| ELT-CONTENT-001 | WAITING ON CLIENT | Obtain and publish four official Homepage band photos | Client; developer for ingestion |
| ELT-CONTENT-002 | READY | Govern temporary image placeholders as development-only test content | Developer/content editor |
| ELT-CONTENT-003 | WAITING ON CLIENT | Obtain final biographies for all four named members | Client; developer/content editor for ingestion |
| ELT-CONTENT-004 | WAITING ON CLIENT | Confirm final music, release, event, merchandise, booking, and contact content | Client; developer/content editor for ingestion |
| ELT-CONTENT-005 | DONE | Finish copying `homepage.bandIntro` into `aboutPage.intro` (kicker/heading) | Developer/content editor |
| ELT-ACCESS-001 | WAITING ON CLIENT | Verify GitHub ownership and access | Client/project owner |
| ELT-ACCESS-002 | WAITING ON CLIENT | Verify Sanity ownership and access | Client/project owner |
| ELT-ACCESS-003 | WAITING ON CLIENT | Verify Netlify ownership and access | Client/project owner |
| ELT-ACCESS-004 | WAITING ON CLIENT | Verify Brevo ownership and access | Client/project owner |
| ELT-ACCESS-005 | WAITING ON CLIENT | Verify Formspree ownership and access | Client/project owner |
| ELT-ACCESS-006 | WAITING ON CLIENT | Verify registrar/domain ownership and access | Client/project owner |
| ELT-LAUNCH-001 | BACKLOG | Configure the Netlify production deployment | Developer/deployment owner |
| ELT-LAUNCH-002 | BACKLOG | Connect Sanity production and publish-triggered builds | Developer/deployment owner |
| ELT-LAUNCH-003 | BACKLOG | Configure and delivery-test Formspree production forms | Developer/client account owner |
| ELT-LAUNCH-004 | BACKLOG | Configure the Brevo newsletter/signup integration | Developer/client account owner |
| ELT-LAUNCH-005 | BACKLOG | Verify Brevo sender identity and domain authentication | Client account owner/developer |
| ELT-LAUNCH-006 | BACKLOG | Inventory and verify production environment variables | Developer/deployment owner |
| ELT-LAUNCH-007 | WAITING ON CLIENT | Domain name selected (`theelectriclavendertrain.com`); purchase/ownership/DNS/HTTPS still open | Client/project owner |
| ELT-LAUNCH-008 | BACKLOG | Connect DNS and the custom domain | Domain/deployment owner |
| ELT-LAUNCH-009 | BACKLOG | Verify HTTPS and redirect behavior | Developer/deployment owner |
| ELT-LAUNCH-010 | BACKLOG | Run end-to-end launch flow tests | Developer/QA; client for receipt confirmation |
| ELT-LAUNCH-011 | BACKLOG | Review monitoring, spam protection, and failure handling | Developer/operations owner |
| ELT-LAUNCH-012 | BACKLOG | Create event-media submission and moderation operations | Client/legal reviewer/developer |
| ELT-LAUNCH-013 | BACKLOG | Configure the scheduled daily rebuild | Developer/deployment owner |
| ELT-LAUNCH-014 | BACKLOG | Specify and add the Studio deployment guard | Developer |
| ELT-POLICY-001 | WAITING ON CLIENT | Review the Privacy Policy against the final system | Client/project owner; developer |
| ELT-POLICY-002 | WAITING ON CLIENT | Decide whether professional legal review is required | Client/project owner |
| ELT-POLICY-003 | WAITING ON CLIENT | Approve and operationalize retention periods | Client/legal reviewer/operations owner |
| ELT-POLICY-004 | WAITING ON CLIENT | Decide what submitted content may be public | Client/legal reviewer |
| ELT-POLICY-005 | BACKLOG | Record third-party service and data-processing responsibilities | Developer/project owner |
| ELT-DOCS-001 | BACKLOG | Review and update project documentation after implementation stabilizes | Developer/technical writer |
| ELT-DOCS-002 | BACKLOG | Update client handoff and maintenance instructions | Developer/project owner |
| ELT-FUTURE-001 | BACKLOG | Consider member detail pages | Product owner/developer |
| ELT-FUTURE-002 | WAITING ON CLIENT | Model press coverage when real material exists | Client/product owner/developer |
| ELT-FUTURE-003 | BACKLOG | Consider event detail pages | Product owner/developer |
| ELT-EXTERNAL-001 | WAITING ON CLIENT | Redesign and hand off Linktree | Client/project owner |
| ELT-SANITY-001 | WAITING ON CLIENT | Decide whether confidential data needs a private production dataset | Client/project owner/developer |
| ELT-SANITY-002 | BACKLOG | Resolve Sanity revision restoration | Developer/Sanity account owner |
| ELT-ARCH-001 | BACKLOG | Revisit a shared `siteSettings` singleton | Product owner/developer |
| ELT-MEDIA-001 | WAITING ON CLIENT | Revisit Mux or another managed video workflow | Client/product owner/developer |
| ELT-SCHED-001 | WAITING ON CLIENT | Revisit private availability scheduling | Client/product owner/developer |

## Studio and client handoff

### ELT-STUDIO-001 — Rewrite Studio language for a nontechnical client

- **Description:** Rewrite Sanity Studio field titles, descriptions, groups, document labels, and menu labels so a nontechnical client can understand what each control changes and where it appears.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/content designer; client validates clarity.
- **Dependencies/client inputs:** Finalized schemas, navigation structure, editorial workflows, and preferred client terminology; depends on the implementation stabilizing enough that labels will not immediately become stale.
- **Acceptance criteria:** Every client-editable schema and Studio menu has plain-language labels and useful descriptions; technical/internal controls are clearly distinguished; the client completes a review or walkthrough without unresolved terminology questions; schema tests/TypeGen/build checks still pass.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — requested as deferred work; no completion evidence found.
- **Completion evidence:** Not complete. When done, record the reviewed commit/diff, checks run, review date, and client acceptance.
- **Relevant files/services:** `studio/schemaTypes/`, `studio/structure.ts`, Sanity Studio.

### ELT-STUDIO-002 — Review conditional fields and validation messages

- **Description:** Review conditional field behavior, hidden/visible states, validation messages, and recovery guidance from the client's perspective.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/content designer; client validates usability.
- **Dependencies/client inputs:** ELT-STUDIO-001; finalized conditional logic and production content workflows.
- **Acceptance criteria:** Each conditional field is tested in all triggering states; validation messages identify the problem and a client-actionable fix; hidden fields do not create confusing stale requirements; required/optional behavior matches frontend production guards; client review has no unresolved high-impact usability issue.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — requested as deferred work; no completion evidence found.
- **Completion evidence:** Not complete. When done, record the tested schema states, relevant commit/diff, checks, and client acceptance.
- **Relevant files/services:** `studio/schemaTypes/`, `web/src/sanity/normalize.ts`, Sanity Studio.

### ELT-HANDOFF-001 — Record the final Sanity Studio walkthrough

- **Description:** Create a client-facing Sanity Studio walkthrough video after schemas and labels are final. It must show how to sign in, edit singleton pages, manage reusable records, upload images, preview, publish, and avoid accidental destructive changes.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/project owner; client confirms the walkthrough is usable.
- **Dependencies/client inputs:** ELT-STUDIO-001, ELT-STUDIO-002, final Studio deployment/access, stable schemas, and client collaborator access.
- **Acceptance criteria:** A current video covers every listed workflow using the final interface; it contains no visible secrets or private content; its storage location and date/version are recorded; the client confirms they can complete the core workflows; any discovered follow-up work is added to this register.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — requested as deferred work; no video evidence found.
- **Completion evidence:** Not complete. When done, record the video URL/location, recording date, reviewed Studio version, and client acceptance.
- **Relevant files/services:** Sanity Studio, `studio/`, client handoff materials.

## Client content

### ELT-CONTENT-001 — Official Homepage band photos

- **Description:** Receive and add ideally four high-resolution, professionally shot, official band photos for the Homepage.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client supplies and approves assets/rights; developer or content editor ingests them.
- **Dependencies/client inputs:** Four preferred source files, usage-rights confirmation, photographer credits/credit URLs where required, approved alt text, crop/focal-point guidance, and display order.
- **Acceptance criteria:** Ideally four approved high-resolution images are stored in the production media workflow; rights, credit, alt text, order, and crops are confirmed; Homepage presentation passes responsive/image-quality checks; no development placeholder is published as fallback.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — official final assets were not evidenced.
- **Completion evidence:** Not complete. When done, record asset/document identifiers or approved filenames, rights/credit approval date, production publish evidence, and visual QA results.
- **Relevant files/services:** Sanity `homepage`/`mediaItem`, `studio/schemaTypes/homepage.ts`, `studio/schemaTypes/mediaItem.ts`, `web/src/pages/index.astro`, `web/src/assets/images/`, `docs/content-rights-checklist.md`.

### ELT-CONTENT-002 — Development-only placeholder controls

- **Description:** If temporary layout placeholders are used, label them clearly as test content, keep them development-only, and never publish them as a production fallback.
- **Status:** `READY`
- **Owner/responsible party:** Developer/content editor.
- **Dependencies/client inputs:** None to enforce the rule; final client assets are tracked by ELT-CONTENT-001 and ELT-CONTENT-004.
- **Acceptance criteria:** Every placeholder is unmistakably marked as test content; production dataset/build checks reject or exclude it; no fallback silently promotes a placeholder into production; the final prelaunch content audit finds no placeholder marker or unapproved placeholder asset in rendered production output.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — repository documents state that development fixtures/placeholders exist; a final production audit has not occurred.
- **Completion evidence:** Not complete. This remains active until launch; when done, record guard/test results and the final production content audit.
- **Relevant files/services:** Sanity development/production datasets, `web/src/sanity/normalize.ts`, `web/src/assets/images/`, `docs/content-rights-checklist.md`, `docs/production-runbook.md`.

### ELT-CONTENT-003 — Final member biographies

- **Description:** Receive and add final biographies for Rachel Santa Cruz, Hunter Takao Nakazono, Geert de Lange, and Paul Della Pelle.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client supplies and approves copy; developer/content editor ingests it.
- **Dependencies/client inputs:** Final approved biography for each named member, preferred name/role formatting, and any associated photo/credit approval.
- **Acceptance criteria:** All four named members have client-approved biographies in production; names and roles are verified; no lorem ipsum, test marker, or draft copy remains; About page display is reviewed on supported breakpoints; client explicitly accepts the published copy.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — final approved biographies were not evidenced.
- **Completion evidence:** Not complete. When done, record production document identifiers, approval date, publish evidence, and visual QA.
- **Relevant files/services:** Sanity `bandMember`/`aboutPage`, `studio/schemaTypes/bandMember.ts`, `studio/schemaTypes/aboutPage.ts`, `web/src/pages/about.astro`.

### ELT-CONTENT-004 — Final launch content confirmation

- **Description:** Confirm final music and release data, event listings, merchandise facts/assets, booking information, and contact content as needed for launch.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client owns factual approval and rights; developer/content editor ingests and validates.
- **Dependencies/client inputs:** Approved release metadata/artwork/links; event details/status/ticket links; merchandise names/descriptions/prices/availability/images; booking wording; public contact channels; rights, credits, and alt text where applicable.
- **Acceptance criteria:** Each of the six content areas—music, releases, events, merchandise, booking, and contact—has a recorded client decision; approved content is published to the correct production source; placeholder/test content is absent; links and contact destinations are tested; rights/credits/alt text are documented; client signs off on the rendered result.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — merchandise descriptions written for the three real `development` merch items (client explicitly authorized writing them this session): `7f5f1d86-34ce-4251-86aa-efb2c9f969e4` ("Electric Lavender T-Shirt"), `96f84da1-e551-4fa6-a3e0-5a2f4d82234b` ("Lavender Essential Oil (Large)"), `aac2fd39-3778-4b6f-bacc-28cc3a6ef124` ("Lavender Essential Oil (Small)") — all previously held a literal placeholder string asking for a description. Read back and verified via `sanity exec` immediately after writing (temporary script deleted after use). **This alone does not satisfy this item**: (1) `galleryPage.merch.items` currently selects only `ef2bebab-ca6f-4e7b-897b-4ee13d0f33a1` ("[TEST] Sample Product 1," a test fixture whose image is a live-show photo, not a product photo) — none of the three real items are yet selected onto the live Gallery & Merchandise page, an editorial curation decision left untouched since it's outside "write descriptions"; (2) the T-shirt's `priceDisplay` still contains literal placeholder text ("$25, 2XL & 3XL $30 CLAUDE, edit this as needed") that needs a human price correction, left untouched since only descriptions were authorized; (3) music/release/event/booking content confirmation remains entirely unaddressed. Public contact facts (email, location, mailing address) are documented, but a complete launch-content acceptance record still does not exist.
- **Completion evidence:** Not complete. When done, record a dated checklist by content area, production document/config references, link tests, and client acceptance.
- **Relevant files/services:** Sanity `musicPage`, `musicRelease`, `event`, `showsPage`, `merchItem`, `galleryPage`, `contactPage`; `web/src/data/siteConfig.ts`; `docs/client-questions.md`; relevant route pages under `web/src/pages/`.

### ELT-CONTENT-005 — Finish copying `homepage.bandIntro` into `aboutPage.intro`

- **Description:** The published `aboutPage.intro` document was only partially migrated from the deprecated `homepage.bandIntro` field: `paragraphs` and `heroImage` already matched `homepage.bandIntro` exactly, but `intro.kicker` and `intro.heading` had never been updated — they still held the page's pre-migration values. Fixed by writing `aboutPage.intro.kicker = "Who We Are"` and `intro.heading = "More Than a Band, We're Family."` directly to the published `development` document via the Sanity CLI's authenticated client (`sanity exec --with-user-token`, temporary script deleted after use). `homepage.bandIntro` was then unset from the `homepage` document and its schema field removed entirely from `studio/schemaTypes/homepage.ts`.
- **Status:** `DONE`
- **Owner/responsible party:** Developer with Sanity Studio access.
- **Dependencies/client inputs:** None — the target values were already known and unambiguous.
- **Acceptance criteria:** ✅ A fresh read-only GROQ query against the published `aboutPage` document shows `intro.kicker == "Who We Are"` and `intro.heading == "More Than a Band, We're Family."`, with `paragraphs`/`heroImage` unchanged. ✅ `homepage.bandIntro` is `null`/undefined on a fresh read. ✅ The `bandIntro` schema field is removed from `studio/schemaTypes/homepage.ts`, `studio/schema.json`, and `web/src/sanity/sanity.types.ts` (regenerated).
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — completed and verified in the same session (see completion evidence).
- **Completion evidence:** Independent read-back via the public Sanity CDN API (`https://4bysltwo.api.sanity.io/v2024-01-01/data/query/development`), performed after the mutating script had already exited and been deleted: `*[_id=="aboutPage"][0].intro` → `{"kicker":"Who We Are","heading":"More Than a Band, We're Family.","paragraphs":["We're a local band...","Thanks for riding the train with us."],"heroImage":{"_ref":"cfa0c05f-07ee-4e1b-a961-90dbc7b04fb0"}}`; `*[_id=="homepage"][0].bandIntro` → `null`. `grep -c "bandIntro" studio/schema.json web/src/sanity/sanity.types.ts` → `0` in both. The `production` dataset was confirmed to hold no `homepage`/`aboutPage` documents both before and after (untouched, as required).
- **Relevant files/services:** Sanity `aboutPage`/`homepage` documents (`development` dataset), `studio/schemaTypes/homepage.ts`, `studio/schema.json`, `web/src/sanity/sanity.types.ts`, `web/src/pages/index.astro`.

## Accounts and access

Verification means more than account creation. Each service record must verify the account owner, email verification, required team/project/site access, correct collaborator invitations, billing/plan dependency, sender/domain verification where applicable, and production credentials/configuration. Never record secret values.

### ELT-ACCESS-001 — GitHub access verification

- **Description:** Verify durable ownership and least-privilege access for the GitHub repository and launch workflow.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/project owner; repository administrator assists.
- **Dependencies/client inputs:** Named long-term account owner, verified email confirmation, intended collaborators and roles, organization/repository ownership decision, and any billing/private-repository requirements.
- **Acceptance criteria:** Account owner and verified-email status are recorded; correct repository/team access and collaborator invitations are verified; billing/plan dependency is documented; sender/domain verification is recorded as not applicable; production integration/deploy access is verified without recording tokens or keys.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — no complete access evidence recorded.
- **Completion evidence:** Not complete. When done, record the owner, verification date, repository/role names, invitation acceptance, plan conclusion, and production integration test—never credentials.
- **Relevant files/services:** GitHub repository, GitHub organization/team settings, deployment integration.

### ELT-ACCESS-002 — Sanity access verification

- **Description:** Verify durable ownership and correct production/development access for the Sanity project and Studio.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/project owner; Sanity project administrator assists.
- **Dependencies/client inputs:** Long-term account owner, verified email, required collaborators/roles, project/dataset access requirements, plan/billing decision, and production deployment owner.
- **Acceptance criteria:** Account owner and verified-email status are recorded; correct project, dataset, and Studio access is tested; collaborator invitations are accepted with appropriate roles; plan/billing dependencies are documented; sender/domain verification is recorded as not applicable; production credentials/configuration are verified by presence and function without recording secret values.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — repository configuration exists, but complete ownership/access acceptance evidence does not.
- **Completion evidence:** Not complete. When done, record the owner, project/role/dataset scope, accepted invitations, plan conclusion, Studio sign-in test, and production integration verification.
- **Relevant files/services:** Sanity Manage, Sanity Studio, development/production datasets, `studio/sanity.config.ts`, `web/src/sanity/client.ts`.

### ELT-ACCESS-003 — Netlify access verification

- **Description:** Verify durable ownership and correct access for the production Netlify team and site.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/project owner; Netlify team administrator assists.
- **Dependencies/client inputs:** Account owner, verified email, intended team members/roles, site ownership choice, billing/plan decision, and deployment responsibility.
- **Acceptance criteria:** Account owner and verified-email status are recorded; required team/site access and collaborator invitations are verified; billing/plan dependency is documented; sender verification is not applicable and custom-domain status is cross-referenced to ELT-ACCESS-006/ELT-LAUNCH-008; production repository connection, build permissions, and configuration access are tested without recording credentials.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — production site/access evidence was not found.
- **Completion evidence:** Not complete. When done, record owner/team/site names, roles, accepted invitations, plan conclusion, and a successful authorized deployment/configuration check.
- **Relevant files/services:** Netlify team/site, GitHub connection, `docs/production-runbook.md`.

### ELT-ACCESS-004 — Brevo access verification

- **Description:** Verify ownership and correct collaborator access for the approved Brevo newsletter service.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/project owner; Brevo administrator assists.
- **Dependencies/client inputs:** Account owner, verified email, collaborators/roles, billing/plan choice, sending identity, domain/DNS access, and production newsletter owner.
- **Acceptance criteria:** Account owner and verified-email status are recorded; correct account access and collaborator invitations are verified; billing/plan dependency is documented; sender identity and domain authentication states are explicitly recorded; hosted signup/list/double-opt-in production configuration is verified without storing passwords, tokens, or private DNS credentials.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — Brevo is approved, but complete account/configuration evidence is absent.
- **Completion evidence:** Not complete. When done, record owner/roles, accepted invitations, plan conclusion, sender/domain verification result, and production signup/configuration test.
- **Relevant files/services:** Brevo account, lists/forms/sender/domain settings, DNS provider, `web/src/lib/newsletter.ts`.

### ELT-ACCESS-005 — Formspree access verification

- **Description:** Verify ownership and correct collaborator access for the Formspree production project and forms.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/project owner; Formspree administrator assists.
- **Dependencies/client inputs:** Account owner, verified email, collaborators/roles, billing/plan choice, notification destination ownership, final production domain, and form-management responsibility.
- **Acceptance criteria:** Account owner and verified-email status are recorded; project/form access and collaborator invitations are verified; billing/plan dependency is documented; notification/sender/domain restriction states are recorded where applicable; four production forms and their deployed configuration are verified without recording endpoint IDs as secrets or any secret values.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — implementation expects Formspree, but account/project access evidence is absent.
- **Completion evidence:** Not complete. When done, record owner/roles, accepted invitations, plan conclusion, notification/domain verification, and successful production delivery evidence.
- **Relevant files/services:** Formspree account/project/forms, Gmail notification destination, `web/src/lib/formDelivery.ts`, `docs/contact-booking.md`.

### ELT-ACCESS-006 — Registrar/domain ownership verification

- **Description:** Verify durable ownership and recovery/access arrangements for the registrar and production domain.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/project owner; registrar account administrator assists.
- **Dependencies/client inputs:** Domain choice, legal/long-term owner, verified email, access roles or delegation method, billing/renewal owner, and DNS-management responsibility.
- **Acceptance criteria:** Account/domain owner and verified-email status are recorded; required registrar/DNS access and any collaborator/delegated access are verified; billing, renewal, and auto-renew decisions are documented; registrant/domain verification is complete where applicable; production DNS configuration access is tested without recording passwords, recovery codes, or transfer/auth tokens.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — final domain ownership/access decision is not evidenced.
- **Completion evidence:** Not complete. When done, record registrar, domain, owner, role/access verification, renewal/billing decision, verification state, and DNS-control test—never credentials.
- **Relevant files/services:** Domain registrar, DNS provider, Netlify custom-domain settings.

## Backend and launch services

### ELT-LAUNCH-001 — Netlify production deployment

- **Description:** Configure the production Netlify site, repository connection, build settings, deploy contexts, and production deploy workflow.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/deployment owner.
- **Dependencies/client inputs:** ELT-ACCESS-001, ELT-ACCESS-003, approved production branch/workflow, ELT-LAUNCH-006, and production content readiness.
- **Acceptance criteria:** Netlify uses the documented base/build/publish settings; production builds from the intended repository/branch; deploy previews and production context are intentionally configured; a production deploy succeeds with production data; rollback/ownership procedure is recorded; no test content is exposed.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — docs state deployment is not configured.
- **Completion evidence:** Not complete. When done, record site name/URL, deploy ID/date, settings review, build result, and acceptance owner.
- **Relevant files/services:** Netlify, GitHub, `web/`, `docs/production-runbook.md`.

### ELT-LAUNCH-002 — Sanity production integration and publish webhook

- **Description:** Connect the production site to the correct Sanity production dataset and configure any required publish/build webhook.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/deployment owner.
- **Dependencies/client inputs:** ELT-ACCESS-002, ELT-ACCESS-003, ELT-LAUNCH-001, ELT-LAUNCH-006, approved production dataset/content, and webhook scope/trigger ownership.
- **Acceptance criteria:** Production builds use the intended project/dataset; no development dataset is used; a scoped publish webhook triggers a Netlify build; a published test change appears after a successful rebuild; failure/retry ownership is documented; any secret signing/config values remain outside the register.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — production integration/webhook remains deferred in repository docs.
- **Completion evidence:** Not complete. When done, record dataset/environment names, webhook name/scope, test document and timestamps, resulting deploy evidence, and reviewer.
- **Relevant files/services:** Sanity project/dataset/webhooks, Netlify build hooks, `web/src/sanity/client.ts`, `docs/production-runbook.md`.

### ELT-LAUNCH-003 — Formspree production configuration and delivery testing

- **Description:** Configure production Formspree handling for Booking, Merch, Other, and Content Removal Request forms and verify real delivery.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer and client Formspree/Gmail account owner.
- **Dependencies/client inputs:** ELT-ACCESS-005, ELT-LAUNCH-001, final production domain, confirmed notification destination, retention operations, and production environment configuration.
- **Acceptance criteria:** All four forms exist and map to the correct inquiry types; notification destinations and Reply-To behavior are verified; production-domain restrictions are configured appropriately; honeypot/spam behavior is reviewed; real deployed submissions reach the intended inbox and success/error states work; retention handling is operational.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — production endpoints and delivery evidence are absent.
- **Completion evidence:** Not complete. When done, record form names, deployed test date, anonymized receipt evidence, domain restriction check, failure-path test, and accepting owner.
- **Relevant files/services:** Formspree, Gmail, Netlify environment settings, `web/src/lib/formDelivery.ts`, `web/src/components/ContactForms.astro`, `docs/contact-booking.md`.

### ELT-LAUNCH-004 — Brevo newsletter/signup integration

- **Description:** Configure the approved Brevo hosted signup/preferences flow, double opt-in, list/preferences, and the site's newsletter destination.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer and client Brevo account owner.
- **Dependencies/client inputs:** ELT-ACCESS-004, intended subscriber fields and preference categories, approved copy, ELT-LAUNCH-005, ELT-LAUNCH-006, ELT-POLICY-001, and ELT-POLICY-003.
- **Acceptance criteria:** Hosted signup is live over HTTPS; double opt-in, consent copy, preferences, confirmation, unsubscribe, and suppression behavior are tested; the production site points to the correct hosted URL; test markers are absent; Privacy Policy statements match observed configuration.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — Brevo is approved but production configuration is not evidenced.
- **Completion evidence:** Not complete. When done, record hosted-form/list names, test dates and results, production link verification, and client acceptance.
- **Relevant files/services:** Brevo, Netlify environment settings, `web/src/lib/newsletter.ts`, `web/src/components/Newsletter.astro`, `web/src/pages/privacy.astro`.

### ELT-LAUNCH-005 — Brevo sender identity and domain authentication

- **Description:** Verify the production sender identity and complete Brevo domain authentication required for reliable newsletter delivery.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Client account/domain owner and developer.
- **Dependencies/client inputs:** ELT-ACCESS-004, ELT-ACCESS-006, final sending address/domain, DNS access, and any plan requirements.
- **Acceptance criteria:** Sender email/identity is verified; required domain authentication records are published and pass Brevo verification; sending/reply-to identity is client-approved; a test campaign reaches representative inboxes without authentication failures; DNS record values themselves need not be copied into this register.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — sender/domain authentication evidence is absent.
- **Completion evidence:** Not complete. When done, record sender/domain names, verification status/date, test campaign result, and reviewer—never credentials.
- **Relevant files/services:** Brevo sender/domain settings, registrar/DNS provider.

### ELT-LAUNCH-006 — Production environment-variable inventory and verification

- **Description:** Maintain and verify the complete production configuration-variable inventory without storing secret values.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/deployment owner.
- **Dependencies/client inputs:** Final service integrations, deploy contexts, responsible secret/config owners, and access to production settings.
- **Acceptance criteria:** Every required variable is listed by name, purpose, sensitivity, owner, target context, and verification state; production values are configured in the correct service/context; no secret value is committed or written here; obsolete variables are removed deliberately; a clean production build and relevant runtime flows verify the inventory.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — documentation names several variables, but no completed production inventory/evidence exists.
- **Completion evidence:** Not complete. When done, record the redacted inventory location, review date, deploy/build ID, flow tests, and reviewers.
- **Relevant files/services:** Netlify environment settings, local example env files if present, `web/src/lib/formDelivery.ts`, `web/src/lib/newsletter.ts`, `web/src/sanity/client.ts`, `docs/production-runbook.md`.

### ELT-LAUNCH-007 — Domain purchase and ownership decision

- **Description:** Decide the final production domain, purchaser, legal/long-term owner, registrar, billing source, renewal policy, and contingency if the preferred domain is unavailable.
- **Status:** `WAITING ON CLIENT` — name selected; purchase/ownership/registrar/billing/DNS/HTTPS still unresolved.
- **Owner/responsible party:** Client/project owner.
- **Dependencies/client inputs:** Purchase confirmation, ownership/registrar/billing/renewal decisions (name is now selected — see below).
- **Acceptance criteria:** Final domain and owner are explicitly approved; availability/purchase status is verified; registrar, billing, renewal, and recovery responsibilities are recorded; ELT-ACCESS-006 can be completed; no placeholder/provisional domain remains in production-facing copy.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — **the client selected `theelectriclavendertrain.com`** as the production domain name (recorded via direct instruction in this task). `siteConfig.siteUrl` was updated to `https://theelectriclavendertrain.com` accordingly, and every canonical/`og:url`/structured-data URL now derives from it (verified in the production build output). This confirms the NAME only — it is explicitly NOT evidence of purchase, ownership verification, registrar selection, billing, renewal, DNS configuration, or HTTPS provisioning, all of which remain unresolved. Kept `WAITING ON CLIENT` rather than `DONE`/`READY` because none of those remaining criteria are satisfied.
- **Completion evidence:** Not complete. Name selection alone does not satisfy this item's acceptance criteria. When fully done, record registrar, purchase/approval date, owner, renewal decision, and the ELT-ACCESS-006 cross-reference.
- **Relevant files/services:** Domain registrar, DNS provider, Netlify, `web/src/data/siteConfig.ts`, project documentation.

### ELT-LAUNCH-008 — DNS and custom-domain connection

- **Description:** Configure DNS and connect the approved custom domain to the production Netlify site.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Domain owner/DNS administrator and deployment owner.
- **Dependencies/client inputs:** ELT-LAUNCH-001, ELT-LAUNCH-007, ELT-ACCESS-003, ELT-ACCESS-006, DNS-control authorization, and canonical host choice.
- **Acceptance criteria:** Required DNS records resolve correctly; the custom domain is attached to the correct site; apex and `www` behavior matches the canonical-host decision; conflicting/obsolete records are handled deliberately; propagation is verified from independent resolvers; ownership and maintenance responsibility are recorded.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — custom-domain configuration evidence is absent.
- **Completion evidence:** Not complete. When done, record domain, canonical host, change date, redacted DNS summary, resolver checks, and Netlify verification.
- **Relevant files/services:** Registrar/DNS provider, Netlify custom-domain settings.

### ELT-LAUNCH-009 — HTTPS and redirects

- **Description:** Verify TLS/HTTPS provisioning and all required canonical, host, protocol, and legacy-path redirects.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/deployment owner.
- **Dependencies/client inputs:** ELT-LAUNCH-008, canonical URL/path decisions, known legacy URLs, and final deployment.
- **Acceptance criteria:** Certificate is valid and auto-renewing; HTTP redirects to HTTPS; alternate host redirects to the canonical host; expected legacy/renamed paths redirect once without loops; status codes and query/path preservation are intentional; internal canonical URLs and sitemap references use the production origin.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — no production domain exists to verify.
- **Completion evidence:** Not complete. When done, record certificate/domain checks, redirect matrix and results, crawler/header checks, and reviewer.
- **Relevant files/services:** Netlify, registrar/DNS, production site, route/redirect configuration.

### ELT-LAUNCH-010 — End-to-end launch flow tests

- **Description:** Test booking, contact/general inquiry, merchandise inquiry, content removal, newsletter signup/preferences, and fan/event-media submission flows end to end against production-like or production services.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/QA; client account owners verify receipts and operations.
- **Dependencies/client inputs:** ELT-LAUNCH-003, ELT-LAUNCH-004, ELT-LAUNCH-012, production deployment/domain, approved test accounts/data, and recipient/moderator participation.
- **Acceptance criteria:** Each flow has success, validation, cancellation/back-navigation, and provider/failure-path checks where applicable; notifications/confirmations reach intended destinations; no unrelated mailing-list enrollment occurs; privacy/consent links are correct; mobile, keyboard, and assistive-technology basics are verified; test data is removed under the approved retention process.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — required production services are not configured.
- **Completion evidence:** Not complete. When done, record a dated test matrix, deploy/environment, anonymized provider receipts, defects/resolutions, cleanup evidence, and client acceptance.
- **Relevant files/services:** Production site, Formspree, Gmail, Brevo, Google Forms/Drive or final fan-media provider, relevant pages/components under `web/src/`.

### ELT-LAUNCH-011 — Monitoring, spam protection, and failure handling

- **Description:** Review operational monitoring, spam/abuse protection, provider failures, notification failures, build failures, and user-facing recovery paths.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/operations owner; client owns response procedures.
- **Dependencies/client inputs:** Final providers/deployment, acceptable alert recipients, risk tolerance, volume expectations, and support/escalation ownership.
- **Acceptance criteria:** Build/deploy and critical integration failure signals are defined; alert recipients and response procedures are documented; Formspree and fan-media spam controls are tested; rate/abuse and false-positive tradeoffs are reviewed; user-visible failures offer safe recovery/contact options; monitoring data retention and privacy are documented; a failure drill is recorded.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — no launch operations acceptance evidence exists.
- **Completion evidence:** Not complete. When done, record monitoring names/scopes, alert test results, spam/failure test matrix, response owner, and approved runbook links.
- **Relevant files/services:** Netlify, Sanity webhook/builds, Formspree, Gmail, Brevo, fan-media provider, `docs/production-runbook.md`, `docs/data-retention-procedure.md`.

### ELT-LAUNCH-012 — Event-media submission and moderation operations

- **Description:** Create the approved event-media submission workflow (currently planned as Google Forms/Drive), establish ownership/moderation, and finalize its consent, privacy, rights, and retention operations before enabling it.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Client/project owner, legal reviewer, moderator, and developer/content editor.
- **Dependencies/client inputs:** Form/account owner; final consent/license language; treatment of identifiable people and minors; public/private-use decision; retention approval; moderation owner; final form URL.
- **Acceptance criteria:** A real form exists under durable ownership; required fields and consent language are approved; moderation and monthly review/deletion processes are documented and tested; selected versus unselected media handling is clear; the production Sanity setting points to the verified form; policies match actual behavior; an end-to-end submission is tested and cleaned up.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — repository docs say the feature is approved but the form and operations are not created.
- **Completion evidence:** Not complete. When done, record form name/URL, owner/moderator, approval dates, enabled Sanity document reference, test result, and retention-review evidence.
- **Relevant files/services:** Google Forms/Drive or final provider, Sanity `galleryPage.eventMediaSubmission`, `studio/schemaTypes/galleryPage.ts`, `web/src/pages/terms.astro`, `web/src/pages/privacy.astro`, `docs/data-retention-procedure.md`, `docs/content-rights-checklist.md`.

### ELT-LAUNCH-013 — Scheduled daily rebuild

- **Description:** Configure a separate scheduled daily production rebuild so time-based event classification updates even when no Sanity document is published.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/deployment owner.
- **Dependencies/client inputs:** ELT-LAUNCH-001, stable production build, schedule ownership, alerting, and an agreed Pacific-time-aware trigger window.
- **Acceptance criteria:** A daily schedule triggers the correct production build independently of the Sanity webhook; timing is chosen with Pacific calendar behavior in mind; a test run succeeds; missed/failed schedules are observable; ownership and disable/change procedures are documented.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — explicitly deferred in existing docs.
- **Completion evidence:** Not complete. When done, record scheduler/job name, timezone/timing rationale, test run/deploy ID, alert check, and owner.
- **Relevant files/services:** Netlify scheduled functions/build hooks or selected scheduler, `docs/production-runbook.md`, `docs/developer-guide.md`.

### ELT-LAUNCH-014 — Studio deployment guard

- **Description:** Specify and implement an honest guard that reduces accidental Sanity Studio deployment against the wrong dataset, while documenting that direct CLI invocation can bypass an npm lifecycle guard.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer.
- **Dependencies/client inputs:** A real Studio deployment workflow, intended dataset, command conventions, and ELT-ACCESS-002.
- **Acceptance criteria:** The guarded command/file and checked dataset value are explicit; failure behavior is tested; developer instructions state which command to use; bypass limitations are documented accurately; deployment succeeds for the intended configuration and fails safely for the tested wrong configuration.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — existing docs state no Studio deployment or guard exists.
- **Completion evidence:** Not complete. When done, record commit/diff, commands/tests, expected failures, deployment evidence, and documentation link.
- **Relevant files/services:** `studio/package.json`, `studio/sanity.config.ts`, Studio deployment service, `docs/phase3-plan.md`, `docs/developer-guide.md`.

## Policy and documentation

### ELT-POLICY-001 — Privacy Policy review

- **Description:** Review the Privacy Policy after production services are configured so it accurately describes real data flows, tracking/cookies, providers, rights, and operational practices.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/project owner and developer; legal reviewer if engaged.
- **Dependencies/client inputs:** Final Formspree, Gmail, Brevo, fan-media, hosting, monitoring, and retention configurations; client factual approval; ELT-POLICY-002 decision.
- **Acceptance criteria:** Every stated provider/data flow matches the live system; conditional/future language is removed or retained intentionally; retention, cookies/tracking, contact rights, children/minors, submitted media, and third-party responsibilities are reviewed; effective/update date is correct; client and any required legal reviewer approve publication.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — current policy contains intentionally provisional language.
- **Completion evidence:** Not complete. When done, record reviewed commit/diff, live-configuration checklist, approval date/parties, and deployed URL.
- **Relevant files/services:** `web/src/pages/privacy.astro`, `docs/data-retention-procedure.md`, `docs/content-rights-checklist.md`, all production data processors.

### ELT-POLICY-002 — Professional legal-review decision

- **Description:** Confirm whether professional legal review is required for the Privacy Policy, Terms, submission consent/license, minors/identifiable-person handling, retention practices, and launch jurisdiction.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/project owner.
- **Dependencies/client inputs:** Risk tolerance, business/legal context, target launch date, jurisdictions/audience, and willingness/budget to engage qualified counsel.
- **Acceptance criteria:** A dated client decision is recorded; if review is required, scope, responsible counsel, timing, dependencies, and accepted deliverables are recorded; if declined, the client explicitly acknowledges the decision and any unresolved items remain tracked rather than being marked legally approved.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — professional review remains an open decision.
- **Completion evidence:** Not complete. When done, record the decision, date, responsible party, scope/outcome, and related item updates without storing privileged advice unnecessarily.
- **Relevant files/services:** `web/src/pages/privacy.astro`, `web/src/pages/terms.astro`, `docs/content-rights-checklist.md`, `docs/data-retention-procedure.md`.

### ELT-POLICY-003 — Submission retention decisions and operations

- **Description:** Decide and operationalize retention periods/criteria for contact, booking, merchandise/general inquiries, content-removal requests, newsletter records, and fan/event-media submissions.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/legal reviewer/operations owner.
- **Dependencies/client inputs:** Client approval, ELT-POLICY-002, live-provider retention capabilities, active-engagement/closed definitions, and named review owners.
- **Acceptance criteria:** Each data category has an approved retention/deletion rule; provider limitations and suppression/backup exceptions are accurately documented; Gmail/Formspree quarterly review and fan-media monthly review are scheduled with named owners and review logs; deletion-request procedure is tested; public policy and internal procedure agree.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — draft criteria exist, but final approval and operations are not in evidence.
- **Completion evidence:** Not complete. When done, record approvals, final rules by category, calendar/review-log locations, a completed practice review, and policy/procedure revisions.
- **Relevant files/services:** Gmail, Formspree, Brevo, Google Forms/Drive or final fan-media provider, `docs/data-retention-procedure.md`, `web/src/pages/privacy.astro`.

### ELT-POLICY-004 — Public versus private submitted content

- **Description:** Confirm what submitted contact, booking, newsletter, and fan-media content may become public and what must remain private, including consent, credits, identifiable people, and minors.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/legal reviewer.
- **Dependencies/client inputs:** Editorial/moderation intent, consent/license language, publicity/credit expectations, minors/identifiable-person policy, and ELT-POLICY-002.
- **Acceptance criteria:** A category-by-category decision is documented; inquiry/newsletter data is not repurposed for publication or marketing without the required consent; fan-media publication/credit/removal rules are approved and reflected in form/policies; private booking details remain out of public datasets/output; moderator guidance and escalation paths are recorded.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — final consent/publication decision is not evidenced.
- **Completion evidence:** Not complete. When done, record the approved decision matrix, approval date, form/policy changes, moderation guidance, and production verification.
- **Relevant files/services:** Formspree/Gmail, Brevo, fan-media provider, Sanity datasets, `web/src/pages/privacy.astro`, `web/src/pages/terms.astro`, `docs/content-rights-checklist.md`.

### ELT-POLICY-005 — Third-party service and data-processing responsibilities

- **Description:** Record which party owns, configures, monitors, pays for, and responds to data requests/failures for each third-party service.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/project owner; client accepts operational ownership.
- **Dependencies/client inputs:** Final service list and plans, account/access verification, policy decisions, vendor behavior review, and named client operators.
- **Acceptance criteria:** GitHub, Sanity, Netlify, Brevo, Formspree, Gmail, registrar/DNS, fan-media provider, embedded media, and any monitoring service have documented owner, purpose, data handled, billing owner, access owner, incident/support responsibility, retention/deletion responsibility, and relevant vendor-policy links; documents match live configurations.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — responsibilities are scattered and incomplete.
- **Completion evidence:** Not complete. When done, record the approved responsibility matrix location/version, review date, client acceptance, and cross-links to access/retention evidence.
- **Relevant files/services:** All third-party services; `web/src/pages/privacy.astro`, `web/src/pages/terms.astro`, `web/src/pages/third-party-notices/`, client handoff/runbook.

### ELT-DOCS-001 — Post-stabilization technical documentation review

- **Description:** Review and update the project documentation after implementation and launch configuration stabilize. This is the currently deferred technical-documentation rewrite; this register is not part of that rewrite.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/technical writer.
- **Dependencies/client inputs:** Stable implementation, resolved launch services/policies, completed QA, and client workflow decisions.
- **Acceptance criteria:** Documentation is checked against current code and live configuration; obsolete planning/history claims are corrected or clearly historical; duplicated/conflicting source-of-truth statements are reconciled; setup, architecture, data flows, commands, deployment, privacy, and deferred-work links are accurate; documentation review/build/link checks pass.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — intentionally deferred; not performed in this tracking task.
- **Completion evidence:** Not complete. When done, record reviewed files, commit/diff, verification commands/results, and reviewer acceptance.
- **Relevant files/services:** `docs/`, repository root documentation, implementation under `studio/` and `web/`.

### ELT-DOCS-002 — Client handoff and maintenance instructions

- **Description:** Update the final client handoff and maintenance guidance for content editing, accounts, deployment, forms/newsletter, domain/DNS, retention reviews, incident response, and support boundaries.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer/project owner; client accepts ownership.
- **Dependencies/client inputs:** ELT-HANDOFF-001, completed access checks, final service configuration, policy/retention decisions, and named client operators.
- **Acceptance criteria:** Instructions reflect the final system; routine tasks have owners and frequencies; safe publishing and rollback/recovery paths are explained in plain language; no secrets are embedded; links/resources are accessible to the client; a handoff session is completed and open questions become new register items.
- **Date added:** 2026-09-03
- **Last verified date:** 2026-09-03 — final handoff depends on incomplete launch work.
- **Completion evidence:** Not complete. When done, record handoff artifact locations/versions, meeting/date, attendees, client acceptance, and resulting register changes.
- **Relevant files/services:** Client handoff materials, `docs/production-runbook.md`, `docs/data-retention-procedure.md`, Sanity Studio, all production accounts.

## Existing repository deferrals imported on 2026-09-03

These items were explicitly deferred in existing repository documents. Importing them prevents the new canonical register from losing work that was previously scattered across prose. Their inclusion does not authorize implementation.

### ELT-FUTURE-001 — Member detail pages

- **Description:** Revisit dedicated member routes such as `/about/[slug]`; no member slug/detail route currently exists.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Product owner/developer.
- **Dependencies/client inputs:** Real need for content beyond the existing profile dialog, route/content design, slug/canonical decisions, and client approval.
- **Acceptance criteria:** Product need and unique page content are approved; schema, query, static paths, template, canonical/SEO, navigation, privacy/accessibility, redirects, and tests are complete; existing dialogs/cards behave intentionally.
- **Date added:** 2026-09-03 (imported from existing deferred notes)
- **Last verified date:** 2026-09-03 — `docs/about.md` and `docs/developer-guide.md` describe it as deferred.
- **Completion evidence:** Not complete. When done, record approval, implementation diff, content migration, route/SEO/accessibility tests, and deploy evidence.
- **Relevant files/services:** `studio/schemaTypes/bandMember.ts`, `web/src/pages/about.astro`, `docs/about.md`, `docs/developer-guide.md`.

### ELT-FUTURE-002 — Press coverage model

- **Description:** Add press/articles/mentions only when real coverage exists and its presentation has been decided.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/product owner; developer implements after approval.
- **Dependencies/client inputs:** Real press items, publication/quote/link permissions, desired placement, credit/citation requirements, and content model decision.
- **Acceptance criteria:** Approved real coverage and rights are documented; display/product decision is accepted; schema/query/UI/SEO/accessibility are implemented and tested; no invented or placeholder coverage is published.
- **Date added:** 2026-09-03 (imported from existing deferred notes)
- **Last verified date:** 2026-09-03 — existing docs say press is not modeled.
- **Completion evidence:** Not complete. When done, record approved sources/permissions, implementation and tests, production documents, deploy evidence, and client acceptance.
- **Relevant files/services:** Sanity member/about content, About route, `docs/about.md`, `docs/developer-guide.md`.

### ELT-FUTURE-003 — Event detail pages

- **Description:** Revisit public event detail routes such as `/shows/[slug]`; private events must never receive public detail pages.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Product owner/developer.
- **Dependencies/client inputs:** Product/content need beyond show cards, client approval, public/private rules, slug migration quality, and detail-page design.
- **Acceptance criteria:** Product scope is approved; only eligible public events route; slug selection/static paths/template/canonical/structured-data URLs are correct; private/hidden data cannot leak; duplicates/redirects/404s/accessibility/responsive behavior are tested.
- **Date added:** 2026-09-03 (imported from existing deferred notes)
- **Last verified date:** 2026-09-03 — `docs/shows.md` and `docs/developer-guide.md` describe it as deferred.
- **Completion evidence:** Not complete. When done, record approval, route/schema/query implementation, privacy/SEO/accessibility tests, migration, and deploy evidence.
- **Relevant files/services:** `studio/schemaTypes/event.ts`, `web/src/pages/shows.astro`, `web/src/sanity/queries.ts`, `docs/shows.md`.

### ELT-EXTERNAL-001 — Linktree redesign and handoff

- **Description:** Make the ELT website the authoritative schedule and booking destination; update Linktree destinations, ordering, labels, branding, and temporary campaign links accordingly.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/project owner.
- **Dependencies/client inputs:** Linktree account access, final production URLs/domain, approved social/streaming/merch/payment destinations, label/order decisions, and campaign expiry decisions.
- **Acceptance criteria:** Homepage, Shows, and Booking destinations are correct and prominent; duplicate/outdated schedule/contact links are removed or demoted; every remaining link is tested and approved; branding/order are accepted; ownership/maintenance responsibility is handed off.
- **Date added:** 2026-09-03 (imported from existing deferred notes)
- **Last verified date:** 2026-09-03 — tracked as open in `docs/client-questions.md`.
- **Completion evidence:** Not complete. When done, record reviewed public Linktree URL, link audit, update date, client acceptance, and maintenance owner.
- **Relevant files/services:** Linktree, production ELT site, `docs/client-questions.md`, `web/src/data/siteConfig.ts`.

### ELT-SANITY-001 — Private production dataset decision

- **Description:** Decide whether confidential private-booking information should ever be stored in Sanity; current public datasets and `busyOnly` content must contain no confidential details.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/project owner and developer/security reviewer.
- **Dependencies/client inputs:** Actual business need, paid-plan willingness, data classification, access roles, private scheduling workflow, and security/privacy review.
- **Acceptance criteria:** A dated keep-private-elsewhere or private-dataset decision is approved; if no, public-model safeguards remain verified; if yes, a separately reviewed design covers plan, dataset privacy, non-public build credentials, query/projection audit, access, migration, incident/retention handling, and full privacy tests before any confidential content enters Sanity.
- **Date added:** 2026-09-03 (imported from existing deferred notes)
- **Last verified date:** 2026-09-03 — existing docs leave the decision open and prohibit confidential public-dataset content.
- **Completion evidence:** Not complete. When done, record the decision/approval and either safeguard audit or private-dataset implementation/security evidence—never secret values.
- **Relevant files/services:** Sanity project/datasets, `studio/schemaTypes/event.ts`, `web/src/sanity/queries.ts`, `docs/shows.md`, `docs/client-questions.md`.

### ELT-SANITY-002 — Sanity revision restoration

- **Description:** Investigate and resolve the known Sanity revision-restoration problem without hiding it behind an undocumented workaround.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Developer and Sanity account/project owner.
- **Dependencies/client inputs:** Reproducible failure details, affected environment/documents, expected restoration workflow, project access, and any Sanity support dependency.
- **Acceptance criteria:** Reproduction and impact are documented; root cause or vendor limitation is confirmed; an approved durable resolution or explicitly accepted limitation is implemented/documented; restore behavior is tested safely without losing production content; client/editor guidance is updated.
- **Date added:** 2026-09-03 (imported from existing deferred notes)
- **Last verified date:** 2026-09-03 — `docs/developer-guide.md` names a known separately tracked problem but provides no completion evidence.
- **Completion evidence:** Not complete. When done, record reproduction, resolution/support reference, safe test evidence, affected versions, and client guidance acceptance.
- **Relevant files/services:** Sanity Studio/Manage/history, project documentation.

### ELT-ARCH-001 — Shared `siteSettings` singleton

- **Description:** Revisit whether repeated global public values should move from code to a client-editable `siteSettings` singleton once there is a real second consumer.
- **Status:** `BACKLOG`
- **Owner/responsible party:** Product owner/developer.
- **Dependencies/client inputs:** Demonstrated reuse/editing need, field ownership decision, global CTA/content requirements, and migration plan.
- **Acceptance criteria:** A product need is proven and approved; only appropriate public/editorial values move; secrets, route paths, navigation behavior, and layout controls remain code-owned; schema/query/fallback/migration/preview/production guards are implemented; all consumers and docs are tested.
- **Date added:** 2026-09-03 (imported from existing deferred notes)
- **Last verified date:** 2026-09-03 — existing docs say to wait for a real second consumer.
- **Completion evidence:** Not complete. When done, record approved scope, migration and implementation diff, tests, production document, and editor acceptance.
- **Relevant files/services:** `web/src/data/siteConfig.ts`, `studio/schemaTypes/`, `web/src/sanity/queries.ts`, `docs/developer-guide.md`.

### ELT-MEDIA-001 — Managed video workflow decision

- **Description:** Revisit Mux or another managed video-hosting workflow after actual upload frequency, Studio-only workflow needs, budget, and YouTube/Vimeo discoverability are known.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/product owner and developer.
- **Dependencies/client inputs:** Video strategy, expected volume/quality, budget, editorial workflow, privacy/accessibility needs, discoverability goals, and ownership/access decisions.
- **Acceptance criteria:** Requirements and provider comparison are documented; client selects current approach or a new provider; costs, ownership, processing/data responsibilities, captions/posters/fallbacks, performance, privacy, migration, and failure handling are accepted; any implementation is tested end to end.
- **Date added:** 2026-09-03 (imported from existing deferred notes)
- **Last verified date:** 2026-09-03 — Mux is documented only as an option.
- **Completion evidence:** Not complete. When done, record decision, analysis, client acceptance, and—if changed—implementation/configuration and playback/accessibility test evidence.
- **Relevant files/services:** YouTube/Vimeo/current embed workflow, possible Mux account, Sanity video fields, `docs/developer-guide.md`.

### ELT-SCHED-001 — Private availability scheduling

- **Description:** Revisit a private availability workflow or `availabilityBlock` model; do not merge tentative holds/vacations/rehearsals with public confirmed-event records.
- **Status:** `WAITING ON CLIENT`
- **Owner/responsible party:** Client/product owner and developer.
- **Dependencies/client inputs:** Actual scheduling workflow, authoritative private calendar, confidentiality needs, integration appetite/budget, and operational owner.
- **Acceptance criteria:** Availability versus confirmed-event responsibilities are explicitly separated; authoritative system and privacy boundaries are approved; public UI claims remain accurate; if integrated, access/auth, conflicts, sync/failure handling, retention, and privacy are designed and tested without leaking private schedule details.
- **Date added:** 2026-09-03 (imported from existing deferred notes)
- **Last verified date:** 2026-09-03 — existing docs deliberately keep availability out of Sanity.
- **Completion evidence:** Not complete. When done, record decision, system ownership, approved design or no-change rationale, privacy review, and integration/test evidence if applicable.
- **Relevant files/services:** Client calendar/scheduling service, Sanity `event`, booking workflow, `docs/phase3-plan.md`, `docs/developer-guide.md`.

## Completed-items history

No items were `DONE` when this register was created on 2026-09-03.

When an item becomes `DONE`:

1. Leave its full detailed entry in place with status `DONE` and concrete completion evidence.
2. Add one append-only row below. Never delete or rewrite older history rows except to correct a factual error, and record that correction in the change log.

| ID | Completed date | Acceptance summary | Evidence reference | Accepted by |
|---|---|---|---|---|
| ELT-CONTENT-005 | 2026-09-03 | `aboutPage.intro.kicker`/`.heading` patched to the target values via authenticated Sanity client; `homepage.bandIntro` unset and its schema field removed. | Independent read-back queries in ELT-CONTENT-005's own entry above; `grep -c "bandIntro"` on regenerated `schema.json`/`sanity.types.ts` → `0`. | Automated (agent session) — not yet reviewed by a human. |

## Register change log

| Date | Change | Items affected | Evidence/notes |
|---|---|---|---|
| 2026-09-03 | Created canonical register; seeded all requested Studio/handoff, client-content, account/access, backend/launch, policy, and documentation work; imported explicitly deferred items found in existing repository documents. | All items above | Source review included `docs/client-questions.md`, `docs/developer-guide.md` §18, `docs/phase3d-handoff.md`, `docs/phase3-plan.md`, `docs/shows.md`, `docs/about.md`, `docs/contact-booking.md`, `docs/gallery-merch.md`, `docs/production-runbook.md`, `docs/data-retention-procedure.md`, and `docs/content-rights-checklist.md`. No deferred work was implemented and no item was marked `DONE`. |
| 2026-09-03 | Added `ELT-CONTENT-005` after a Sanity schema-cleanup task's read-only data-safety check found `aboutPage.intro`'s live `kicker`/`heading` still hold pre-migration values, blocking removal of `homepage.bandIntro`. No other item changed; `ELT-STUDIO-001`/`ELT-STUDIO-002` were left `BACKLOG` (this task's Studio field-order/deprecated-field cleanup did not satisfy their broader client-facing-language acceptance criteria). No item marked `DONE`. | ELT-CONTENT-005 (added) | Read-only GROQ query against the `development` dataset; see ELT-CONTENT-005's own entry for the exact values compared. |
| 2026-09-03 | Completed `ELT-CONTENT-005` (approved, verified content migration + schema removal — see its entry for full evidence). Updated `ELT-LAUNCH-007` to record the client's domain-name selection (`theelectriclavendertrain.com`), kept `WAITING ON CLIENT` since purchase/ownership/DNS/HTTPS remain unresolved — naming alone does not satisfy its acceptance criteria. Updated `ELT-CONTENT-004`'s verification notes with concrete development merchandise-description evidence and two newly observed content gaps (real merch items not yet selected onto the live Gallery & Merchandise page; the T-shirt's `priceDisplay` still carries placeholder text) — kept `WAITING ON CLIENT`, not satisfied. No other register item changed; `ELT-STUDIO-001`/`ELT-STUDIO-002` left `BACKLOG` as before. | ELT-CONTENT-005 (DONE), ELT-LAUNCH-007 (changed), ELT-CONTENT-004 (changed) | Independent read-back queries, regenerated-schema `grep` checks, and `astro build` output inspection — see each item's own entry. |
