<!-- Draft states: 0 = draft, 1 = unpublished changes (journey only), 2 = published, 3 = retired -->

## Framework setup

- **`npm i`** — install all required packages.

## Cursor context

- **Rules / skill index:** `.cursor/rules/framework-structure-and-skills.mdc`
- **Optional notes:** `.cursor/AGENTS.md`
- **Guides:** `.cursor/skills/how-to-use-automation/SKILL.md`, `.cursor/skills/automated-features-summary/SKILL.md`, `.cursor/skills/high-level-scripts-and-features/SKILL.md`

## Cross-site command tracker

Features, prerequisites, and descriptions: [`docs/Tracking-all-sites-commands.csv`](docs/Tracking-all-sites-commands.csv)

## Generic commands

- **`export NODE_ENV="envName"`** — set the environment before running a script.
- **`npx playwright test "fileName"`** — run a single spec file.
- **`npm run "ScriptName"`** — run any script defined in `package.json`.

---

## TestData commands (run in this order)

**Dependency rule:** run these steps only in the order below; later steps depend on earlier ones.

1. **`npm run initialSetup`** (`listAttributeCreation` `editOrgSettings` `createDefaultUsers` `editProfileForDefaultUsers` `createRegionAudienceAndAddAdmin`) — all at once — `-d`
2. **`npm run checkLicencepoolsAndAppendToAudience`** — appends all org licence pools to audience **`AUDIENCE_NAME`** (defaults to Region in the npm script). Compare gate uses **`testData/LicencePool/checkAndAppendLicencePoolsToAudience.json`** (`expectedPoolNamesInOrg`). Optional: **`LICENCE_POOL_BULK_FILE`** = otherBaseName → **`testData/LicencePool/otherBaseName.json`**. All at once — `-d`
   - **2a.** **`npm run appendAllOrgLicencePoolsToAudience`** — maps **every** licence pool the API returns for the org to **`AUDIENCE_NAME`** (default Region); **no** compare gate. Use when the tenant’s pool list does not match the reference JSON (e.g. **platformtest** with fewer pools). All at once — `-d`
   - **2b.** **`npm run appendNamedLicencePoolsToAudience`** — maps only pools listed in **`testData/LicencePool/appendNamedLicencePoolsToAudience.json`** (or **`FileName`** = baseName for another file in that folder). Same **`AUDIENCE_NAME`** default. All at once — `-d`
3. **`npm run checkLicencepoolsAndAppendToAudienceForChildSite`** — same behaviour as (2) for the **child-site** org in your config; same test data file pattern. All at once — `-d`
4. **`npm run createChildSites`** (only for **preval**) — creates child sites with all available licence pools (10 seats each); runs in parallel — `-d`
   - Fetches **all** licence pools from the parent org dynamically and assigns them to child sites.
   - **4a.** **`npm run createAndShareContentToChildSites`** (or **`ByDomains`** / **`FromFile`**) — creates/reuses published linked content and shares to **every** child site (FileName/SITE_NAME do not filter; share PUT replaces the list) — `-d`
     - JWT + content + hierarchy in `beforeAll` once; share tests run one after another (no `describe.parallel`).
5. **`npm run createUsers`** — all at once — `-d`
   - **5a.** Before step **12** (`createAssignment`), run **`npm run createUserForAssignment`** if assignment data uses assigner **Talent_Enablement** or you need that assigner profile. It creates TeamManager logins like `Talent_Enablement_` plus a random number; defaults to **`USERCOUNT=1`**. Skip if matching users already exist in the org. All at once — `-d`
6. **`npm run createDataInSkillsDiscoveryDashboard`** — all at once — `-d`
   - Publish badges in site settings **before** running the Area creation script.
7. **`npm run createAreaWithSingleWorker`** — all at once — `-d`
8. **`npm run createChannelsAndAppendToSubjects`** — all at once — `-d`
9. **`npm run createNewLabJourneys`** — all at once — `-d`
10. **`npm run createPlaylistAndLiveCourses`** (`createPlaylistForExistingUsers` `createILTLiveCourses`) — all at once — `-d`
11. **`npm run createStrips`** — five different locale strips merged into one command — all at once — `-d`
12. **`npm run createAssignment`** — all assignment data merged into one file — all at once — `-d`
    - Assigner prerequisites: see **step 5a**. If you skip **`createUserForAssignment`** and no user matches, **`createAssignment`** may use the first user from the user list instead of a named assigner.
13. **`npm run createFixedSkillBenchmarkDataForDefaultUsers`** — all at once — `-d`
14. **`npm run createLearningPrograms`** — all at once — `-d`
15. **`npm run createJustBanner`** — individual — `-d`
16. **`npm run createLocaleBannerWithWorkers`** — individual — `-d`
17. **`npm run earnJourneyAndTrackBadgesForDefaultUsers`** — individual — `-d` — learners must **manually click tracks** to generate badges.
18. **`npm run earnJourneyAndTrackBadgesForExistingUsers`** — individual — `-d` — same manual track clicks as step **17**.
19. **`npm run createDataInSkillBenchmarkDashboardWithAspiring`** — individual — `-d`
20. **`npm run createDataInSkillBenchmarkDashboardWithDeveloping`** — individual — `-d`
21. **`npm run createDataInSkillBenchmarkDashboardWithProficient`** — individual — `-d`
22. **`npm run skillGainFromNoviceAdvanced`** — individual — `-d`
23. **`npm run skillGainFromAspiringDeveloping`** — individual — `-d`
24. **`npm run createDataInSkillBenchmarkDashboardWithDevelopingForLB`** — individual — `-d`
25. **`npm run createDataInSkillBenchmarkDashboardWithProficientForLB`** — individual — `-d`
26. **`npm run populateDataInFeatureUsageReport`** — all at once — `-d`
27. **`npm run createDataInLearningProgramDashboard`** — all at once — `-d`
28. **`npm run completeAssignments`** — all at once — `-d`
29. **`npm run createDataInActivityDashboard`** — all at once — `-d`
30. **`npm run increaseViewcountInActivityDashboard`** — all at once
31. **`npm run increaseVisitorsAndUCAInExecutiveDashboard`** — individual
32. **`npm run createDynamicContent`** — all at once — `-d`
33. **`npm run createContentConfig`** — individual — `-d` (`FileName=contentConfig` by default in `package.json`)
    - You still upload underlying content yourself where the product expects it. In Admin UI, controls are under **Compliance**; if Compliance is missing for the tenant, enable it in org/site settings for that site, then run the script.
    - For **US** sites, add the full site URL (same string as environment **`baseURL`**, e.g. `https://yoursite.percipio.com`) to **`testData/contentConfig/USAurls.js`** before running. That list steers the login helper to the US compliance content-config tool instead of the EU one. If the URL is missing, the run falls back to the EU tool and token retrieval can fail for US-only tenants.
34. **`npm run createCertitudeCourses`** — all at once — `-d` (through **16a**); badges must be enabled wherever the UI shows badge-related options for this flow
    - **`createDynamicContent`**, **`createContentConfig`**, and **`createCertitudeCourses`** can be chained as **`npm run createDynamicAndContentConfigAndCertitude`**; use only if you accept that the chain can fail mid-run. In the UI, content items live under **Content → Content Items**.
35. **`npm run CERT_PATH_1_createCertificationPathJourneys`** — individual — create journeys + completion/waiver in parallel
36. **`npm run CERT_PATH_2_createDataInCertificationDashboard`** — individual — monthly dashboard data
37. **`npm run CERT_PATH_3_createStartedDataInCertificationDashboard`** — individual — started state only
38. **`npm run CERT_PATH_4_createPracticingObtainingDataInCertificationDashboard`** — individual — practicing/obtaining milestones
39. **`npm run CERT_PATH_5_createDefaultCertDataInCertificationDashboard`** — individual — default certification courses
40. **`npm run CERT_PATH_REMOVE_removePublishedCertPaths`** — individual — cleanup / retire paths
41. **`npm run addRoleAndAspirationRole`** — all at once — `-d`
    - **Channel name** must be unique. Reusing the same name causes the system to append a number and still create the channel.
42. **Learning program — `lpaction`:**
    - **`save`** — LP stays in **draft**.
    - **`launch`** — LP moves to **scheduled**.
43. **Caisy (conversation):**
    - **`"behavior"`** — e.g. **`Accepting`**; can also be **Defensive**, **Dismissive**, **Critical**.
    - Completion and **Waiver** APIs expect **time in seconds** (not milliseconds).
44. **Caisy Dashboard:**
    - There is **no** automation script. Prepare a data sheet and call the endpoint built to curate Caisy dashboard data. Reference tickets (data sheets and curl / endpoint details):
      - [INF-87730](https://skillsoftdev.atlassian.net/browse/INF-87730) — US sites: keep **separate** US vs EU files (different S3 buckets); presales **1–16**, `https://learnvantagedemo.percipio.com`
      - [INF-92345](https://skillsoftdev.atlassian.net/browse/INF-92345) — EU sites; presales **17–25**
      - [SREP-22321](https://skillsoftdev.atlassian.net/browse/SREP-22321) & [SREP-21908](https://skillsoftdev.atlassian.net/browse/SREP-21908) — curl request (filename, URL, endpoint)
    - **Feature UUIDs:** playlist **`64c8ae9a-2281-4c8d-b0e7-a2ed3e605cb1`** · study group **`6cbcf29a-a469-4cb4-ab06-afe1844f2b3e`**
45. **`npm run createCustomLandingPages`** — custom landing pages from **`testData/customLandingPages/`** (`FileName` basename). **`AUDIENCE_NAME`** = org audience for the root page (default in `package.json`: Region); override on the CLI if needed. If unset, the spec uses the first **`audienceName`** in the JSON array. Auto-converts API response shape when pasting exports.
46. **LX Studios**

- **Recommended run order (assets → create content → course metadata):** use the same `ProjectName` / `projectName` across `testData/LxStudios/` so flows resolve one LX project via `getDefaultWorkspaceAndProject`.
  1.  `npm run uploadKnowledgeSource`
  2.  `npm run uploadMediaLibrary`
  3.  `npm run createPPTInLXStudios`
  4.  `npm run createConversationInLXStudios`
  5.  `npm run createAssessmentInLXStudios`
  6.  `npm run createCourseInLXStudios`
  7.  `npm run updateCourseThumbnailAndKnowledgeSource`  
      Optional cleanup before a refresh: `deleteAllContainers` / `deletePPTContainers` / `deleteCaisyContainers` / `deleteAssessmentContainers` (see below).
- **PPT (Presentation Practice):** `npm run createPPTInLXStudios` | `createPPTInLXStudiosSpecific` | `createPPTInLXStudiosMultiple` — individual — `-d`
- **Conversation (Caisy):** `npm run createConversationInLXStudios` | `createConversationInLXStudiosSpecific` | `createConversationInLXStudiosMultiple` — individual — `-d`
- **Assessment:** `npm run createAssessmentInLXStudios` | `createAssessmentInLXStudiosSpecific` | `createAssessmentInLXStudiosMultiple` — individual — `-d`
- **Course:** `npm run createCourseInLXStudios` or `createCourseInLXStudiosAllOrgs` (`siteType: TriggerInAllSites`, all orgs from `testData/orgsData/allOrgs.json`) | `createCourseInLXStudiosInConfigOrg` (single org: `Environment.baseURL` + `Environment.orgId` from active config, `siteType: TriggerInConfigOrg`) | `createCourseInLXStudiosInParentSites` | `createCourseInLXStudiosInAllChildSites` | `createCourseInLXStudiosInEUParentSites` | `createCourseInLXStudiosInEUAllSites` | `createCourseInLXStudiosInEUChildSites` | `createCourseInLXStudiosInUSParentSites` | `createCourseInLXStudiosInUSAllSites` | `createCourseInLXStudiosInUSChildSites` — individual — `-d`
- **Course metadata:** `npm run updateCourseThumbnailAndKnowledgeSource` | `updateCourseThumbnailAndKnowledgeSourceInParentSites` | `updateCourseThumbnailAndKnowledgeSourceInChildSites` | `updateCourseThumbnailAndKnowledgeSourceInConfigOrg` (active config org only) — individual — `-d`
- **Assets:** `npm run uploadKnowledgeSource` | `uploadKnowledgeSourceSpecific` | `uploadMediaLibrary` | `uploadMediaLibrarySpecific` — individual — `-d`
- **Cleanup:** `npm run deleteAllContainers` | `deleteAssessmentContainers` | `deleteCaisyContainers` | `deletePPTContainers` (`WorkspaceName=Kowshik` in `package.json`) — individual — `-d`
  - For specific PPT rows use **`FileName=`** (filters `pptTestData.json`). Conversation/Assessment still key off **`conversationTitle`** / **`assessmentTestName`**. EU/US course commands run once; the spec iterates orgs internally.
- **Course cloning via DBA (content-intelligence DB):** copying an existing LX/course container from prod into **multiple test orgs** uses region-specific PostgreSQL scripts (**database:** `content-intelligence`; **EU:** EUDC; **US:** USDC). **Not** Playwright/npm. Runbooks: EU [DBA-15336](https://skillsoftdev.atlassian.net/browse/DBA-15336) · US [DBA-15338](https://skillsoftdev.atlassian.net/browse/DBA-15338).

---

## Risk and Readiness Insights dashboard

Populates **Risk and Readiness Insights** in Admin (typically **demoprep** / presales tenants). The dashboard has three areas:

| Tab             | What automation fills it                                                                | npm command                                                |
| --------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Timeliness**  | Compliance assignment completion vs due date (on-time / late / overdue %) per risk area | See **Day 0** + **Day 2+** below                           |
| **Assessments** | Course test attempts (pass, fail, retries) per risk area                                | `createDataInRiskAndReadinessAssessmentsSection`           |
| **Overview**    | Aggregates Timeliness + Assessments                                                     | **No separate script** — appears after both tabs have data |

**Test data:** `testData/AssignmentTestData/riskAndReadinessTimelinessData.json`  
All commands below use **`FileName=riskAndReadinessTimelinessData`** (already set in `package.json`).

### Before you run

1. **`export NODE_ENV=…`** — point at the org that has the compliance courses and **Region** audience (e.g. demoprep).
2. **Region audience** — must have enough **learners** with allowed email domains (`noemail.com` or `skillsoft.com`). The script shuffles eligible learners and picks **30** (not the full Region audience, and not admins/managers).
3. **Assigner user** — assignments use **`Talent_Enablement`** as assigner. If that login does not exist, run **TestData step 5a** first: **`npm run createUserForAssignment`**.
4. **Assessments only** — the spec opens a browser once to obtain a CP token for course Q&A; admin JWT is used for the rest.

### Run order (follow for a correct Timeliness tab)

Timeliness assignments use **today’s date** as `startDate` (the API rejects backdated starts). Completions are granted **after the due date has passed**, with a minimum **2-day** wait after create. You cannot do create + complete in one run on Day 0.

#### Day 0 — compliance settings, assignments, and assessments

Run **one or both** of these (assessments do not depend on assignment due dates). For a fresh org, run compliance settings **once** before assessments so learners can take course tests without watching every video and with a **70%** pass score.

| Step  | Command                                                      | What it does                                                                                                                                                                           |
| ----- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **0** | **`npm run editComplianceSettings`**                         | One-time org completion criteria: **minimumTestScore 70**, **viewAllCourses false** (content-player-settings APIs).                                                                    |
| **A** | **`npm run createRiskAndReadinessTimelinessAssignments`**    | Creates **16** compliance assignments for **30** Region learners (`userUuids`, not full audience). Logs picked cohort (`loginName \| id`). Skips rows already **in_progress**.         |
| **B** | **`npm run createDataInRiskAndReadinessAssessmentsSection`** | One shared cohort of **30** learners; all `contentForAssessments` courses in parallel (`Promise.all`); mixed pass-on-1st/2nd/3rd+ by `riskProfile`; grant completion in batches of 15. |

**Shortcut (0 + A + B):**

```bash
npm run fullRiskAndReadinessInsightsSetupCommand
```

This runs **`editComplianceSettings`**, then **`createRiskAndReadinessTimelinessAssignments`**, then **`createDataInRiskAndReadinessAssessmentsSection`**. It does **not** grant Timeliness completions.

#### Day 2 or later — Timeliness completions

Wait until **both** are true (see `timelinessSettings` in test data):

- At least **`minimumDaysAfterCreateBeforeComplete`** days (default **2**) after assignment create
- Assignment **due date** has passed (`daysToComplete` default **1** → due = start + 1 day)

Then run:

```bash
npm run createDataInRiskAndReadinessTimelinessSection
```

This grants **on-time** and **late** admin completions for slices of the **same 30 users** on each assignment; remaining users stay incomplete (**overdue**). Per-assignment mix comes from `riskProfileCounts` in JSON (e.g. high: 3 on-time / 6 late / 21 overdue out of 30). Logs list **which users** are in each bucket (`loginName \| id`) per assignment. Re-running complete on the same assignment uses the same user order from the assignment API, so buckets stay the same.

**Dev-only bypass** (local debugging, not for real demo data):

```bash
SKIP_DUE_DATE_CHECK=true npm run createDataInRiskAndReadinessTimelinessSection
```

### End-to-end checklist

| #   | When                 | Command                                          | Timeliness tab             | Assessments tab        | Overview |
| --- | -------------------- | ------------------------------------------------ | -------------------------- | ---------------------- | -------- |
| 0   | Day 0 (once per org) | `editComplianceSettings`                         | —                          | Prerequisite for tests | —        |
| 1   | Day 0                | `createRiskAndReadinessTimelinessAssignments`    | Assignments created        | —                      | —        |
| 2   | Day 0 (same day OK)  | `createDataInRiskAndReadinessAssessmentsSection` | —                          | Test attempts          | Partial  |
| 3   | Day 2+               | `createDataInRiskAndReadinessTimelinessSection`  | On-time / late / overdue % | —                      | Full     |

After step **3**, refresh **Risk and Readiness Insights** in Admin to verify all three tabs.

### What the test data controls

| JSON section                             | Purpose                                                                                                     |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `completionCriteriaSettings`             | Org pass score (70%) and advanced rules (`viewAllCourses` false) for course-test automation                 |
| `timelinessSettings`                     | Cohort size (30), Region audience, due/completion timing, `riskProfileCounts` per high/medium/low           |
| `contentForAssignment`                   | **16** compliance assignment rows (names, courses, risk profile)                                            |
| `assessmentSettings.attemptBucketCounts` | Per profile, how many of the 30 learners pass on 1st / 2nd / 3rd+ attempt (must sum to `assignedUserCount`) |
| `assessmentSettings.completionBatchSize` | Grant-completion batch size (**15** → 2 API calls per course for 30 learners)                               |
| `contentForAssessments`                  | **10** courses that have mapped course tests                                                                |

To change attempt mix or cohort size, edit the JSON — do not hardcode duplicates in the specs.

### Cohort selection (shared helper)

Both Timeliness **create** and Assessments use **`pickLearnersFromUsers`** in `helpers/UI/commonFunctions.js`:

1. Fetch Region audience users via API
2. Keep only users whose email ends with **`noemail.com`** or **`skillsoft.com`**
3. Keep only **`role === "learner"`** (must have `id` and `loginName`)
4. Shuffle and take **`assignedUserCount`** (default **30**)

Assessments picks **one** shared cohort of 30 in `beforeAll`, then runs all courses in `contentForAssessments` in parallel inside a single test (`Promise.all`).

### Logs (what to expect)

| Step                | Log highlights                                                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create assignments  | `Fixed seed cohort: 30 learners…` then `loginName=… \| id=…` for each picked user                                                                                             |
| Complete Timeliness | Per assignment: counts + three lists — **on time**, **late**, **overdue (no grant)** with `loginName \| id`                                                                   |
| Assessments         | Per course: `courseId → assessmentTestId=…`; per answer: `courseId`, `assessmentTestId`, `questionUuid`, `challengeId`; per learner attempt: `(intentional fail)` or `(pass)` |

### Jenkins

Same command names in the pipeline **`command`** dropdown:  
`editComplianceSettings`, `createRiskAndReadinessTimelinessAssignments`, `createDataInRiskAndReadinessAssessmentsSection`, `createDataInRiskAndReadinessTimelinessSection`, `fullRiskAndReadinessInsightsSetupCommand`.

More detail: [`docs/Tracking-all-sites-commands.csv`](docs/Tracking-all-sites-commands.csv) (Risk and Readiness Insights rows).

---

### Hire / terminate from sheet (one org per run)

- **Folder:** `testData/terminationandnewHire/`
- **`npm run ucmDeactivateTerminatedFromSheet`** — **Termination** and **End Contingent Worker Contract** rows (`--grep @ucmDeactivateFromSheet`); any status other than Hire / Change Job / a deactivation status is skipped with a log line (no API changes). Default **`FileName=contentevalDeactivateInfogainApr23`** (`contentevalDeactivateInfogainApr23.csv`). For `https://contenteval.percipio.com`, run **`export NODE_ENV=contenteval`** first. To use **`hireAndTerminate`** instead, override **`FileName`**, e.g. **`NODE_ENV=contenteval FileName=hireAndTerminate npx playwright test tests/API/Admin/deactivateOrAddUsers.spec.js --grep @ucmDeactivateFromSheet`**
- **`npm run ucmHireFromSheet`** — **Hire**, **Hire Employee**, and **Change Job** rows for percipiodemo and contenteval when hostname matches (`--grep @ucmHireFromSheet`). Per email: UCM search first — **active** → skip; **inactive** → reactivate with **`must_reset_password: true`** and **`HIRE_PASSWORD`** (default `Welcome1`); **not found** → percipiodemo pool swap or contenteval create.
- **`npm run ucmHireAndDeactivateFromSheet`** — runs deactivate + hire in one go
- **`ucmHireFromSheet`** / **`ucmHireAndDeactivateFromSheet`** default **`FileName=hireAndTerminate`**. Basename only (no extension): spec loads **`<basename>.xlsx`** if present, else **`<basename>.csv`**; same parser for both.
- Optional **First Name** / **Last Name** for non-`@skillsoft.com` deactivate lookup (`firstname.lastname`). **Local:** `NODE_ENV=…`. **Jenkins:** URL + admin.
- **`npm run createLearningAdminAndCollectionLearners`** — **one-time** script (`tests/oneTimeScripts/`). Creates 1 Learning Admin (no attributes) then 17 learners (one per Available Collection) with **Created By** set to that admin. Set **`export NODE_ENV=percipioeval`**. **`FileName`** defaults to **collectionLearnersPercipioeval**.
- **`npm run ucmDeactivateAllExceptKeepListFromOrg`** — org from active config (`export NODE_ENV=percipioeval` or other env). Deactivates every **active** user except **Kowshik.Bikkina@skillsoft.com** and **Clayton.Crouch@skillsoft.com**. Before/after counts in logs. No test data file.
- **`npm run enableLxStudioAccessorForSkillsoftUsers`** — org from **`NODE_ENV`** (e.g. **`percipiodemo`**). Fetches all UCM users (paginated), keeps **active** users whose **loginName** or **externalId** ends with **`@skillsoft.com`**, then PUT **`is_lx_studio_accessor: true`** for each.
- **Percipio Demo `newuser_*` pool:** there is **no create script**. Add users by **Excel/CSV import in the site** (UCM User Management). **LX accessor is set on that import** (`isLXStudioAccessor=true`) — do **not** run **`enableLxStudioAccessorForSkillsoftUsers`** as a follow-on for this pool. After import, put the new emails in **`testData/usersData/presales1bUsers.json`**, then run **`createPlaylistsForSalesTeam`**, **`completeSkillBenchmarkForSalesTeam`**, **`earnBadgesForSaleTeam`**. Do **not** run hire-from-sheet as part of this seed. Full list: **`.cursor/skills/how-to-use-automation/SKILL.md`** section **7a**.
- **`npm run ucmInactivateExternalUsersFromSiteForMonth`** — single org from **`NODE_ENV`**. Export CSV, filter external active learners for month/year, inactivate each. Example: **`NODE_ENV=contenteval USERS_EXPORT_MONTH=6 USERS_EXPORT_YEAR=2026 npm run ucmInactivateExternalUsersFromSiteForMonth`**
- **`npm run ucmInactivateExternalUsersMonthlyCron`** — multi-site monthly job. Sites list: **`testData/orgsData/monthlyExternalUserSites.json`**. Writes **`config/runtimeOrg.json`** per site (shared admin + URL/orgId), uses **IST today − 2 months** for the export filter, then runs the inactivate spec. Jenkins fires **8:00 AM IST on the 6th** each month. Add a site = one JSON row (no new config file).

---

## Jenkins pipeline documentation

Full pipeline behaviour (commands, Docker, cron, troubleshooting): **`Jenkinsfile`** in this repo and your Jenkins job configuration.

### Child site commissioning (preval / proservices)

**Run in this order**

1. **Parent — create sites & users**  
   `createChildSites`, `createChildSitesOnlyNew`, `editUserInChildSite` (create/edit child sites and user setup).

2. **Parent — share linked content**  
   `createAndShareContentToChildSites` (or `ByDomains` / `FromFile` — same behaviour). Always every hierarchy child. Do **not** use `FileName` or `SITE_NAME` to share a batch: the share API **replaces** the site list, so a subset unshares older children. Same scripts as **TestData step 4a** above.

3. **Each child — onboarding & UX**  
   In this exact order: `prevalChildSitesSetup` → `createAreaForChildSites` → `createCustomLandingPages` → `createBannersForChildSites`.  
   For **`createCustomLandingPages`**, set **`AUDIENCE_NAME`** (and **`FileName`** workbook basename) to match the child org’s audience when Jenkins/npm defaults do not apply.

**Data & Jenkins**

- **Catalog:** `testData/childSites/childSitesConfig.json` (preval children including **platformeval01–platformeval100** and other tenants).
- **Targeted rows:** e.g. `FileName=platformeval21-50` → `testData/childSites/platformeval21-50.json`; `FileName=platformeval51-100` → `testData/childSites/platformeval51-100.json`.
- **Jenkins:** `url` dropdown and `testData/jenkins/jenkins-config.json` → `urlToOrgIdMap` align with the same platformeval child URLs through **100**.

**Utilities (anytime)**

- **List parent + child org IDs:** `npm run listChildSites` (same as `npx playwright test tests/API/Admin/listChildSites.spec.js`). Set **`NODE_ENV`** to the parent config (e.g. `preval` for `https://platformeval.percipio.com`); check logs for parent `orgId` and each child `orgId` + domain.
- **Edit one child site:** set `SITE_NAME` in the `editUserInChildSiteSpecific` script in `package.json`, then `npm run editUserInChildSiteSpecific`.

**Script detail: share vs areas**

- **`createAndShareContentToChildSites`** (parent): data `testData/childSites/shareContentToSitesData.json`. Reuses published linked content by title when present; otherwise creates and publishes. Always shares to every `hierarchy[0].children` org. **`FileName`** / **`SITE_NAME`** do not filter targets (share PUT replaces `sharedTo`). Logs published parent count and child-site count before any share call. More in `createAndShareContentToChildSites.spec.js` header. (Aligns with **TestData step 4a** / commissioning §2.)
- **`createAreaForChildSites`** (per child): same titles as linked content; fetch by title, reuse UUID or create/publish; then areas/journeys. Data: `testData/childSites/shareContentToSitesData.json` and `testData/childSites/childSiteAreaAndJournies.json`.
