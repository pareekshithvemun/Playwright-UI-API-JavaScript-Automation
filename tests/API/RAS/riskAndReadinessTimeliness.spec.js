/**
 * Risk and Readiness Insights – Timeliness data population (demoprep).
 *
 * ─── WHY THIS APPROACH ───────────────────────────────────────────────────────────
 *
 * Goal: populate the Timeliness tab on Risk and Readiness Insights with realistic
 * on-time / late / overdue percentages per risk area (high / medium / low).
 *
 * Problem 1 — full Region audience skews the dashboard
 *   Region has ~2,800 learners. If we assign to the whole audience but only grant
 *   completions for ~30 users, the dashboard shows ~99% overdue → every risk area
 *   looks "high risk". That is wrong for demo data.
 *
 * Problem 2 — API will not accept a past startDate (HTTP 412)
 *   We cannot create assignments with a backdated start and grant historical completions
 *   in one run. We must create with startDate = today, wait until due has passed, then
 *   grant completions with dates relative to each assignment's due date.
 *
 * Solution
 *   1. Pick a small fixed cohort from Region (not the full audience).
 *   2. Assign the same cohort to all 16 compliance assignments (userUuids, no audience on create).
 *   3. After due + 2 days, grant on-time / late completions only within that cohort; leave
 *      the rest incomplete (overdue).
 *
 * ─── COHORT & COMPLETION COUNTS (timelinessSettings in test data) ──────────────
 *
 * assignedUserCount and riskProfileCounts per profile — counts must sum to assignedUserCount.
 * Same cohort on every assignment. Region learners shuffled each create run, then first N taken.
 *
 * ─── TWO STEPS ───────────────────────────────────────────────────────────────────
 *
 * CREATE: npm run createRiskAndReadinessTimelinessAssignments
 * COMPLETE (Day 2+): npm run createDataInRiskAndReadinessTimelinessSection
 * COMPLIANCE SETTINGS (one-time): npm run editComplianceSettings
 *   → completion criteria defaults + reorder risk areas (test-data titles first)
 *
 * ─── API CONSTRAINTS ──────────────────────────────────────────────────────────────
 *
 *   startDate     → new Date().toISOString() (today only; past dates → 412)
 *   daysToComplete → 1 (due = start + 1 day)
 *   complete guard → minimumDaysAfterCreateBeforeComplete (2) AND due must have passed
 *   dev override   → SKIP_DUE_DATE_CHECK=true
 */
import {
  test,
  expect,
  generateToken,
  getComplianceJwtToken,
  getBusinessObjective,
  getAllUserApi,
  getAllAudienceApi,
  getAudienceUsersApi,
  getAllAssignmentsApi,
  getSingleAssignmentInfoApi,
  conentCompletionApi,
  deleteAssignmentsApi,
  updateCompletionCriteriaBasicDefaultsApi,
  updateCompletionCriteriaAdvancedDefaultsApi,
  getOrgRiskAreasApi,
  updateRiskAreaSequenceApi,
  reusableFunctions,
  config,
  logger,
  urlData,
  headerData,
} from "../../../path.js";

const fileName = (process.env.FileName || "").trim();
const assignmentDataFilepath = reusableFunctions.getPath(
  "testData/AssignmentTestData",
  `${fileName || "riskAndReadinessTimelinessData"}.json`,
);
const assignmentData = reusableFunctions.readDatafromJsonFilenotasync(
  assignmentDataFilepath,
);
const assignmentRows = assignmentData?.contentForAssignment || [];
const assessmentRows = assignmentData?.contentForAssessments || [];
const timelinessSettings = assignmentData?.timelinessSettings || {};
const completionCriteriaSettings =
  assignmentData?.completionCriteriaSettings || {};

// ===================== Helper Functions =====================

// Throws if a required timelinessSettings key is missing from test data.
function requireTimelinessSetting(settingKey) {
  const value = timelinessSettings[settingKey];
  if (value === undefined || value === null) {
    throw new Error(
      `timelinessSettings.${settingKey} missing in test data (${fileName || "riskAndReadinessTimelinessData"}.json)`,
    );
  }
  return value;
}

// Returns assignedUserCount from timelinessSettings (cohort size for every assignment).
function getAssignedUserCount() {
  return requireTimelinessSetting("assignedUserCount");
}

// Collects unique risk area titles from test-data rows in first-seen order (assessments then assignments).
function collectPrioritizedRiskAreaTitles(contentRows) {
  const seenTitles = new Set();
  const orderedTitles = [];

  for (let row of contentRows) {
    for (let riskAreaTitle of row.riskAreas || []) {
      if (!seenTitles.has(riskAreaTitle)) {
        seenTitles.add(riskAreaTitle);
        orderedTitles.push(riskAreaTitle);
      }
    }
  }

  return orderedTitles;
}

// Builds UpdateRiskAreaSequence payload — test-data titles first, remaining org areas after.
function buildRiskAreaSequenceInput(orgRiskAreas, prioritizedTitles) {
  const titleToRiskAreaUuid = new Map(
    orgRiskAreas.map((riskArea) => [riskArea.title, riskArea.riskAreaUUID]),
  );
  const prioritizedUuids = [];

  for (let title of prioritizedTitles) {
    const riskAreaUuid = titleToRiskAreaUuid.get(title);
    if (riskAreaUuid) {
      prioritizedUuids.push(riskAreaUuid);
    } else {
      logger.info(`Risk area title not found in org — skipping: ${title}`);
    }
  }

  const prioritizedUuidSet = new Set(prioritizedUuids);
  const remainingUuids = orgRiskAreas
    .filter((riskArea) => !prioritizedUuidSet.has(riskArea.riskAreaUUID))
    .sort((left, right) => left.sequence - right.sequence)
    .map((riskArea) => riskArea.riskAreaUUID);

  const orderedUuids = [...prioritizedUuids, ...remainingUuids];
  return orderedUuids.map((riskAreaUuid, index) => ({
    riskAreaUuid,
    sequence: index + 1,
  }));
}

// Logs the final risk area sequence (number + title) before calling the reorder API.
function logFinalRiskAreaOrder(orgRiskAreas, orgRiskAreasSeq) {
  const uuidToTitle = new Map(
    orgRiskAreas.map((riskArea) => [riskArea.riskAreaUUID, riskArea.title]),
  );
  const orderLines = orgRiskAreasSeq.map(
    (entry) =>
      `${entry.sequence}. ${uuidToTitle.get(entry.riskAreaUuid) || entry.riskAreaUuid}`,
  );
  logger.info(`Final risk area order:\n${orderLines.join("\n")}`);
}

const timelinessAssignmentSearch = {
  q: requireTimelinessSetting("assignmentSearchQuery"),
};

let jwt;
let allUserResponse;
let adminUserId;
let orgId;
let userUUIDByLogin = {};
let fixedSeedUserIds = [];

// True when SKIP_DUE_DATE_CHECK=true — bypasses minimum-wait and due-date guards on complete.
function shouldSkipDueDateGuard() {
  return process.env.SKIP_DUE_DATE_CHECK === "true";
}

// Creates one compliance assignment via POST /assignments/create (startDate = today, fixed user cohort).
async function createComplianceAssignment(
  request,
  jwtToken,
  {
    assignContent,
    assignName,
    businessObjectiveId,
    daysToComplete,
    assignMentState,
    assGoal,
    userId,
    seedUserIds,
    description,
  },
) {
  const startDate = new Date().toISOString();

  const payload = {
    userUuids: seedUserIds,
    audienceUuids: [],
    contents: assignContent,
    businessObjectiveUuid: businessObjectiveId,
    description,
    name: assignName,
    startDate,
    daysToComplete,
    isContentOrderRequired: false,
    enableEquivalency: true,
    customEmailMessage: "Please complete the assignment before due Date",
    emailScheduledAt: startDate,
    sendAssignmentEmail: false,
    isRetakeRequired: false,
    timezone: "UTC",
    createdBy: userId,
    isEmailRequired: false,
    action: assignMentState,
    category: assGoal,
  };

  logger.info(`Assignment create request for "${assignName}":`);
  logger.info(JSON.stringify(payload, null, 2));

  const response = await request.post(urlData.postassignmentcallUrl, {
    data: payload,
    headers: headerData.createAssignmentHeaders(jwtToken, "application/json"),
  });

  const responseStatus = response.status();
  let responseBody;
  try {
    responseBody = await response.json();
  } catch {
    responseBody = await response.text();
  }

  if (responseStatus !== 200) {
    logger.error(
      `Assignment create failed for "${assignName}" — status ${responseStatus}`,
    );
    logger.error(`Response body: ${JSON.stringify(responseBody, null, 2)}`);
  }

  expect(responseStatus).toBe(200);
  logger.info(`Created compliance assignment: ${assignName}`);
}

// Returns the COURSE contentId from an assignment test-data row.
function getCourseUuidFromAssignmentRow(row) {
  const courseEntry = row.content?.find(
    (item) => item.contentType === "COURSE" && item.contentId,
  );
  return courseEntry?.contentId || null;
}

// Grants course completion for a list of user IDs at the given datetime.
async function grantCompletionForUsers(
  request,
  jwtToken,
  userIds,
  contentUuid,
  completionDatetime,
  durationSeconds,
) {
  if (!userIds.length) {
    return;
  }

  const payload = reusableFunctions.createJsonObjectwithjustUUIDS(
    userIds,
    [contentUuid],
    completionDatetime,
    durationSeconds,
  );

  await conentCompletionApi(request, jwtToken, orgId, adminUserId, payload);
}

// Ensures minimum wait and due date have passed before granting timeliness completions.
function assertTimelinessCompleteIsAllowed(assignmentInfo, daysToComplete) {
  if (shouldSkipDueDateGuard()) {
    logger.info("SKIP_DUE_DATE_CHECK=true — bypassing due-date wait guard");
    return;
  }

  const dueDateIso = reusableFunctions.getDueDateFromAssignment(
    assignmentInfo,
    daysToComplete,
  );
  const startDateIso = assignmentInfo?.startDate;
  const minimumDays = requireTimelinessSetting(
    "minimumDaysAfterCreateBeforeComplete",
  );

  if (!dueDateIso || !startDateIso) {
    throw new Error(
      "Cannot resolve assignment start/due dates — run create command first",
    );
  }

  if (
    !reusableFunctions.hasMinimumWaitElapsedAfterStart(
      startDateIso,
      minimumDays,
    )
  ) {
    throw new Error(
      `Timeliness complete blocked: wait at least ${minimumDays} day(s) after create (start=${startDateIso}). Due=${dueDateIso}. Re-run after due has passed.`,
    );
  }

  if (!reusableFunctions.hasDueDatePassed(dueDateIso)) {
    throw new Error(
      `Timeliness complete blocked: due date not passed yet (due=${dueDateIso}). Re-run after due crosses.`,
    );
  }
}

const timelinessRecreateHint =
  "Cancel this assignment, re-run createRiskAndReadinessTimelinessAssignments, then run createDataInRiskAndReadinessTimelinessSection.";

// Returns assigned userIds when count matches cohort size; null + skip hint when audience-only or wrong count.
function resolveTimelinessUserIds(
  assignmentInfo,
  assignmentName,
  expectedUserCount,
) {
  const audienceUuids = assignmentInfo?.audienceUuids?.length
    ? assignmentInfo.audienceUuids
    : assignmentInfo?.audienceIds || [];
  const userIds = assignmentInfo?.userIds?.length
    ? assignmentInfo.userIds
    : assignmentInfo?.userUuids || [];

  if (audienceUuids.length > 0 && userIds.length === 0) {
    logger.info(
      `${assignmentName}: audience mapped [${audienceUuids.join(", ")}] but no individual userIds — need ${expectedUserCount}. ${timelinessRecreateHint} Skipping.`,
    );
    return null;
  }

  if (userIds.length !== expectedUserCount) {
    logger.info(
      `${assignmentName}: has ${userIds.length} userIds, expected ${expectedUserCount}. ${timelinessRecreateHint} Skipping.`,
    );
    return null;
  }

  return userIds;
}

// One line per user so we can see assignment, bucket, and grant date together.
function logTimelinessBucketUsers(userIds, assignmentName, bucket, grantDate) {
  const dateLabel = grantDate || "none (no grant)";
  for (let userId of userIds) {
    const user = allUserResponse?.users?.find((item) => item.id === userId);
    const loginName = user?.loginName || "unknown";
    logger.info(
      `${assignmentName} | bucket=${bucket} | date=${dateLabel} | loginName=${loginName} | id=${userId}`,
    );
  }
}

// Loads JWT, org context, assigner map, and optionally shuffled learner cohort from Region audience.
async function loadOrgContext(request, pickCohort = true) {
  jwt = await generateToken(request);
  orgId = config.get("Environment").orgId;
  allUserResponse = await getAllUserApi(request, jwt);
  adminUserId = reusableFunctions.getAdminUserId(allUserResponse);

  userUUIDByLogin = {};
  const assignerLogins = [
    ...new Set(assignmentRows.map((row) => row.assignedBy).filter(Boolean)),
  ];
  for (let loginName of assignerLogins) {
    const user = allUserResponse?.users?.find((item) =>
      item.loginName.includes(loginName),
    );
    if (user) {
      userUUIDByLogin[loginName] = user.id;
    } else {
      logger.info(
        `Assigner ${loginName} not found; assignments will use the org admin.`,
      );
    }
  }

  if (!pickCohort) {
    return;
  }

  const learnerSourceAudience = requireTimelinessSetting(
    "learnerSourceAudience",
  );
  const audienceUuid = await getAllAudienceApi(
    learnerSourceAudience,
    request,
    jwt,
  );
  if (!audienceUuid) {
    throw new Error(`Audience not found: ${learnerSourceAudience}`);
  }

  const audienceUserResponse = await getAudienceUsersApi(
    request,
    jwt,
    audienceUuid,
    learnerSourceAudience,
  );
  const audienceUsers = audienceUserResponse?.users || [];

  const assignedUserCount = getAssignedUserCount();
  const fixedSeedUsers = reusableFunctions.pickLearnersFromUsers(
    audienceUsers,
    assignedUserCount,
  );
  fixedSeedUserIds = fixedSeedUsers.map((user) => user.id);
  reusableFunctions.logUsersWithLoginNameAndId(
    fixedSeedUsers,
    `Fixed seed cohort: ${fixedSeedUsers.length} learners from ${learnerSourceAudience} (shuffled pick)`,
  );
}

// ===================== Test Suites =====================

// One-time: org completion criteria defaults + risk area dashboard order for test-data titles.
test.describe
  .serial("Risk Timeliness – compliance completion criteria @riskComplianceSettings", () => {
  let complianceJwt;
  let adminJwt;

  test.beforeAll(async ({ request }, testInfo) => {
    testInfo.setTimeout(100000);
    complianceJwt = await getComplianceJwtToken(request);
    adminJwt = await generateToken(request);
  });

  test("Set org default pass score and viewAllCourses off @riskComplianceSettings", async ({
    request,
  }) => {
    await updateCompletionCriteriaBasicDefaultsApi(
      request,
      complianceJwt,
      completionCriteriaSettings,
    );
    await updateCompletionCriteriaAdvancedDefaultsApi(
      request,
      complianceJwt,
      completionCriteriaSettings,
    );

    const timelinessOrgId = config.get("Environment").orgId;
    const prioritizedTitles = collectPrioritizedRiskAreaTitles([
      ...assessmentRows,
      ...assignmentRows,
    ]);
    const orgRiskAreas = await getOrgRiskAreasApi(
      request,
      adminJwt,
      timelinessOrgId,
    );
    const orgRiskAreasSeq = buildRiskAreaSequenceInput(
      orgRiskAreas,
      prioritizedTitles,
    );

    logFinalRiskAreaOrder(orgRiskAreas, orgRiskAreasSeq);
    await updateRiskAreaSequenceApi(
      request,
      adminJwt,
      timelinessOrgId,
      orgRiskAreasSeq,
    );
  });
});

// Day 0: create one in-progress compliance assignment per contentForAssignment row (fixed cohort).
test.describe
  .serial("Risk Timeliness – create assignments @riskTimelinessCreate", () => {
  test.beforeAll(async ({ request }, testInfo) => {
    testInfo.setTimeout(100000);
    await loadOrgContext(request);
  });

  test("Create one compliance assignment per shortlisted course @riskTimelinessCreate", async ({
    request,
  }, testInfo) => {
    testInfo.setTimeout(900000);

    const respOfBusinessObjective = await getBusinessObjective(request, jwt);
    const daysToComplete = requireTimelinessSetting("daysToComplete");
    const existingAssignmentsResponse = await getAllAssignmentsApi(
      request,
      jwt,
      timelinessAssignmentSearch,
    );
    const existingByName = new Map(
      (existingAssignmentsResponse?.data || []).map((item) => [
        item.name?.trim(),
        item,
      ]),
    );

    for (let row of assignmentRows) {
      const existingAssignment = existingByName.get(row.name.trim());
      if (existingAssignment?.status === "in_progress") {
        logger.info(
          `Skipping create — assignment already in progress: ${row.name} (id=${existingAssignment.id})`,
        );
        continue;
      }

      if (existingAssignment?.status === "draft") {
        logger.info(
          `Removing draft assignment before recreate: ${row.name} (id=${existingAssignment.id})`,
        );
        await deleteAssignmentsApi(request, jwt, existingAssignment.id);
      }

      if (existingAssignment?.status === "canceled") {
        logger.info(
          `Canceled assignment cannot be deleted — skipping create: ${row.name} (id=${existingAssignment.id})`,
        );
        continue;
      }

      const businessObjectiveId = await reusableFunctions.findIdByName(
        row.BusinessObjective,
        respOfBusinessObjective,
      );
      const assignerId = userUUIDByLogin[row.assignedBy] || adminUserId;

      await createComplianceAssignment(request, jwt, {
        assignContent: row.content,
        assignName: row.name,
        businessObjectiveId,
        daysToComplete,
        assignMentState: row.assignmentState,
        assGoal: row.assGoal,
        userId: assignerId,
        seedUserIds: fixedSeedUserIds,
        description:
          row.description ||
          "<p>Risk and Readiness Timeliness seed assignment</p>",
      });
    }
  });
});

// Day 2+: grant on-time and late completions per risk profile; leave overdue learners incomplete.
test.describe
  .serial("Risk Timeliness – grant completions @riskTimelinessComplete", () => {
  test.beforeAll(async ({ request }, testInfo) => {
    testInfo.setTimeout(1000000);
    await loadOrgContext(request, false);
  });

  test("Grant mixed completions for on time, late, and overdue learners @riskTimelinessComplete", async ({
    request,
  }, testInfo) => {
    testInfo.setTimeout(1000000);

    const daysToComplete = requireTimelinessSetting("daysToComplete");
    const onTimeDaysBeforeDue = requireTimelinessSetting(
      "onTimeCompletionDaysBeforeDue",
    );
    const lateDaysAfterDue = requireTimelinessSetting(
      "lateCompletionDaysAfterDue",
    );
    const durationSeconds = requireTimelinessSetting(
      "completionDurationSeconds",
    );
    const expectedUserCount = getAssignedUserCount();

    await reusableFunctions.setTimer(8000);
    const allAssignmentsResponse = await getAllAssignmentsApi(
      request,
      jwt,
      timelinessAssignmentSearch,
    );

    for (let row of assignmentRows) {
      const assignmentRecord = allAssignmentsResponse?.data?.find(
        (item) =>
          item.name?.trim() === row.name.trim() &&
          item.status === "in_progress",
      );

      if (!assignmentRecord) {
        logger.error(`Assignment not found or not in progress: ${row.name}`);
        continue;
      }

      const singleAssignmentResponse = await getSingleAssignmentInfoApi(
        request,
        jwt,
        assignmentRecord.id,
      );

      const assignedUserIds = resolveTimelinessUserIds(
        singleAssignmentResponse,
        row.name,
        expectedUserCount,
      );
      if (!assignedUserIds) {
        continue;
      }

      assertTimelinessCompleteIsAllowed(
        singleAssignmentResponse,
        daysToComplete,
      );

      const dueDateIso = reusableFunctions.getDueDateFromAssignment(
        singleAssignmentResponse,
        daysToComplete,
      );
      const onTimeDate = reusableFunctions.getIsoDateOffsetFromBase(
        dueDateIso,
        -onTimeDaysBeforeDue,
      );
      const lateDate = reusableFunctions.getIsoDateOffsetFromBase(
        dueDateIso,
        lateDaysAfterDue,
      );

      logger.info(
        `${row.name}: due=${dueDateIso}, onTime grant=${onTimeDate}, late grant=${lateDate}`,
      );

      const contentUuidFromAssignment =
        singleAssignmentResponse?.contents?.[0]?.contentItemUuid;
      const contentUuid =
        contentUuidFromAssignment || getCourseUuidFromAssignmentRow(row);

      if (!contentUuid) {
        logger.error(`No course UUID for assignment: ${row.name}`);
        continue;
      }

      const profileKey = row.riskProfile || "medium";
      const profileCounts =
        timelinessSettings.riskProfileCounts?.[profileKey];
      if (!profileCounts) {
        throw new Error(
          `timelinessSettings.riskProfileCounts.${profileKey} missing in test data`,
        );
      }
      const {
        firstSlice: onTimeUserIds,
        secondSlice: lateUserIds,
        thirdSlice: overdueUserIds,
      } = reusableFunctions.splitArrayIntoThreeSlices(
        assignedUserIds,
        profileCounts.onTimeLearnerCount,
        profileCounts.lateLearnerCount,
      );

      logger.info(
        `${row.name} (profile=${row.riskProfile || "medium"}): onTime=${onTimeUserIds.length}, late=${lateUserIds.length}, overdue=${overdueUserIds.length}`,
      );
      logTimelinessBucketUsers(
        onTimeUserIds,
        row.name,
        "on time",
        onTimeDate,
      );
      logTimelinessBucketUsers(lateUserIds, row.name, "late", lateDate);
      logTimelinessBucketUsers(
        overdueUserIds,
        row.name,
        "overdue",
        null,
      );

      await grantCompletionForUsers(
        request,
        jwt,
        onTimeUserIds,
        contentUuid,
        onTimeDate,
        durationSeconds,
      );
      await grantCompletionForUsers(
        request,
        jwt,
        lateUserIds,
        contentUuid,
        lateDate,
        durationSeconds,
      );

      await reusableFunctions.setTimer(2000);
    }
  });
});
