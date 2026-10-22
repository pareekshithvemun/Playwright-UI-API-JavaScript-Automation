/**
 * Risk and Readiness Insights – Assessments tab data (demoprep).
 *
 * ─── ASSESSMENTS vs TIMELINESS ───────────────────────────────────────────────────
 *
 * Timeliness tab → compliance assignments + completion vs due date (separate spec).
 * Assessments tab → course test attempts (pass / fail / retries) on compliance courses.
 *
 * No assignment due-date wait here — learners take the course test via learner API.
 *
 * ─── APPROACH ────────────────────────────────────────────────────────────────────
 *
 *   1. Thirty shuffled Region learners per run (not full audience).
 *   2. Ten courses with mapped assessments — contentForAssessments in test data.
 *   3. One shared cohort of 30 learners picked once in beforeAll, then all ten courses
 *      run in parallel (Promise.all) — same learners on every course.
 *   4. attemptBucketCounts (assessmentSettings) per riskProfile split the 30 learners on
 *      each course across pass-on-1st / pass-on-2nd / pass-on-3rd+ buckets (not all in one bucket).
 *   5. After each learner's final successful pass, grant course completion via conentCompletionApi
 *      in batches of completionBatchSize (15) — 2 calls per course (20 total for 10 courses).
 *   6. Cohort (audience, user count) from timelinessSettings — 30 shuffled Region learners per run.
 *
 * ─── npm COMMAND ─────────────────────────────────────────────────────────────────
 *
 *   npm run createDataInRiskAndReadinessAssessmentsSection
 *
 * Run after createRiskAndReadinessTimelinessAssignments (Day 0) or anytime learners exist.
 * Same test data: FileName=riskAndReadinessTimelinessData
 */
import { test } from "@playwright/test";
import {
  generateToken,
  generateTokenLearner,
  getAllAudienceApi,
  getAudienceUsersApi,
  getCourseQandAApi,
  getvideoIdFromCourseIdApi,
  createTestApi,
  submitChallengeApi,
  conentCompletionApi,
  getAllUserApi,
  reusableFunctions,
  logger,
  cpLoginPage,
  config,
} from "../../../path.js";

const fileName = (process.env.FileName || "").trim();
const assignmentDataFilepath = reusableFunctions.getPath(
  "testData/AssignmentTestData",
  `${fileName || "riskAndReadinessTimelinessData"}.json`,
);
const assignmentData = reusableFunctions.readDatafromJsonFilenotasync(
  assignmentDataFilepath,
);
const assessmentCourseRows = assignmentData?.contentForAssessments || [];
const assessmentSettings = assignmentData?.assessmentSettings || {};
const timelinessSettings = assignmentData?.timelinessSettings || {};

let cpToken;
let adminJwt;
let orgId;
let adminUserId;
let fixedSeedLearners = [];

function requireTimelinessSetting(settingKey) {
  const value = timelinessSettings[settingKey];
  if (value === undefined || value === null) {
    throw new Error(
      `timelinessSettings.${settingKey} missing in test data — cohort settings are shared with Timeliness spec`,
    );
  }
  return value;
}

function getAssignedUserCount() {
  return requireTimelinessSetting("assignedUserCount");
}

function getCourseIdFromRow(row) {
  return row.courseId || null;
}

function getUniqueCourseRows(rows) {
  const seenCourseIds = new Set();
  const uniqueRows = [];

  for (let row of rows) {
    const courseId = getCourseIdFromRow(row);
    if (!courseId || seenCourseIds.has(courseId)) {
      continue;
    }
    seenCourseIds.add(courseId);
    uniqueRows.push(row);
  }

  return uniqueRows;
}

function getAttemptBucketCountsForProfile(riskProfile) {
  const profileKey = riskProfile || "medium";
  const buckets = assessmentSettings.attemptBucketCounts?.[profileKey];
  if (!buckets) {
    throw new Error(
      `assessmentSettings.attemptBucketCounts.${profileKey} missing in test data`,
    );
  }

  const passOn1stAttempt = buckets.passOn1stAttempt;
  const passOn2ndAttempt = buckets.passOn2ndAttempt;
  const passOn3rdOrMoreAttempts = buckets.passOn3rdOrMoreAttempts;
  const assignedUserCount = getAssignedUserCount();
  const bucketTotal =
    passOn1stAttempt + passOn2ndAttempt + passOn3rdOrMoreAttempts;

  if (bucketTotal !== assignedUserCount) {
    throw new Error(
      `assessmentSettings.attemptBucketCounts.${profileKey} must sum to ${assignedUserCount}, got ${bucketTotal}`,
    );
  }

  return { passOn1stAttempt, passOn2ndAttempt, passOn3rdOrMoreAttempts };
}

function getFailedAttemptsFor3rdOrMoreBucket() {
  const fromSettings =
    assessmentSettings.failedAttemptsBeforePassFor3rdOrMoreBucket;
  if (fromSettings === undefined || fromSettings === null) {
    throw new Error(
      "assessmentSettings.failedAttemptsBeforePassFor3rdOrMoreBucket missing in test data",
    );
  }
  return fromSettings;
}

function getCompletionBatchSize() {
  const batchSize = assessmentSettings.completionBatchSize;
  if (!batchSize || batchSize < 1) {
    throw new Error(
      "assessmentSettings.completionBatchSize must be a positive number",
    );
  }
  return batchSize;
}

function buildLearnerAttemptPlans(learners, riskProfile) {
  const { passOn1stAttempt, passOn2ndAttempt } =
    getAttemptBucketCountsForProfile(riskProfile);
  const failedAttemptsFor3rdOrMore = getFailedAttemptsFor3rdOrMoreBucket();
  const shuffledLearners = reusableFunctions.shuffleDataInArray([...learners]);
  const { firstSlice, secondSlice, thirdSlice } =
    reusableFunctions.splitArrayIntoThreeSlices(
      shuffledLearners,
      passOn1stAttempt,
      passOn2ndAttempt,
    );

  const attemptPlans = [];

  for (let learner of firstSlice) {
    attemptPlans.push({ learner, failedAttemptsBeforePass: 0 });
  }
  for (let learner of secondSlice) {
    attemptPlans.push({ learner, failedAttemptsBeforePass: 1 });
  }
  for (let learner of thirdSlice) {
    attemptPlans.push({
      learner,
      failedAttemptsBeforePass: failedAttemptsFor3rdOrMore,
    });
  }

  return attemptPlans;
}

function buildQandAFromCourseResponse(courseQandAResponse) {
  const qandaArray = [];
  const videos = courseQandAResponse?.assessmentTabData?.videos || [];

  for (let video of videos) {
    const assessmentQuestions = video?.assessmentQuestions || [];
    for (let question of assessmentQuestions) {
      if (!question?.questionUuid) {
        continue;
      }

      const answerArray = [];
      const questionType = question.questionType;

      if (questionType === "MULTIPLE_CHOICE") {
        for (let option of question.answers || []) {
          if (option.correct === true) {
            answerArray.push(option.uuid);
          }
        }
      }

      if (questionType === "MATCHING") {
        for (let target of question.targets || []) {
          const subQuestionUuid = target.uuid;
          const subAnswer = target.matches?.[0];
          if (subAnswer) {
            const matchPair = JSON.stringify(
              `"${subQuestionUuid}":["${subAnswer}"]`,
            )
              .replace(/\\"/g, '"')
              .slice(1, -1);
            answerArray.push(matchPair);
          }
        }
      }

      qandaArray.push({
        questionuuid: question.questionUuid,
        questionType: questionType.toLowerCase(),
        answer: answerArray,
        allAnswers: question.answers || [],
      });
    }
  }

  return qandaArray;
}

function formatAnswerForSubmit(questionType, qandaEntry, useWrongAnswer) {
  if (questionType === "multiple_choice") {
    if (useWrongAnswer && qandaEntry.allAnswers?.length) {
      const wrongOption = qandaEntry.allAnswers.find(
        (option) => option.correct !== true,
      );
      if (wrongOption) {
        return JSON.stringify([wrongOption.uuid]).replace(/\\"/g, '"');
      }
    }
    return JSON.stringify(qandaEntry.answer).replace(/\\"/g, '"');
  }

  if (questionType === "matching") {
    if (useWrongAnswer) {
      return "null";
    }
    const formatted = JSON.stringify(qandaEntry.answer)
      .replace(/\\"/g, '"')
      .replace(/",/g, ",")
      .replace(/""/g, '"')
      .slice(1, -2);
    return formatted;
  }

  return JSON.stringify(qandaEntry.answer).replace(/\\"/g, '"');
}

async function submitAllChallengeAnswers(
  request,
  learnerToken,
  courseId,
  assessmentTestId,
  challengeQuestions,
  qandaLookup,
  useWrongAnswer,
) {
  for (let challenge of challengeQuestions) {
    const qandaEntry = qandaLookup.find(
      (item) =>
        item.questionuuid === challenge.questionuuid &&
        item.questionType === challenge.questionType,
    );

    if (!qandaEntry) {
      logger.error(
        `No Q&A match for courseId=${courseId}, assessmentTestId=${assessmentTestId}, question ${challenge.questionuuid} (${challenge.questionType})`,
      );
      continue;
    }

    const answerParams = formatAnswerForSubmit(
      challenge.questionType,
      qandaEntry,
      useWrongAnswer,
    );

    logger.info(
      `Submit challenge answer: courseId=${courseId}, assessmentTestId=${assessmentTestId}, questionUuid=${challenge.questionuuid}, challengeId=${challenge.challengeid}`,
    );

    await submitChallengeApi(
      request,
      courseId,
      challenge.questionuuid,
      challenge.questionType,
      challenge.challengeid,
      challenge.position,
      answerParams,
      learnerToken,
    );
  }
}

async function runCourseTestAttemptsForLearner(
  request,
  learnerToken,
  courseId,
  courseName,
  assessmentTestId,
  qandaLookup,
  failedAttemptsBeforePass,
  learnerLoginName,
) {
  const courseLabel = courseName || courseId;
  const totalAttempts = failedAttemptsBeforePass + 1;

  for (let attempt = 0; attempt <= failedAttemptsBeforePass; attempt++) {
    const isLastAttempt = attempt === failedAttemptsBeforePass;
    const useWrongAnswer = !isLastAttempt;
    const attemptNumber = attempt + 1;

    const testResponse = await createTestApi(
      request,
      learnerToken,
      assessmentTestId,
      courseId,
    );
    const questionList =
      testResponse?.[0]?.data?.createAssessmentChallenge?.questions || [];

    const challengeQuestions = questionList.map((item) => ({
      challengeid: item.challengeUuid,
      questionuuid: item.questionUuid,
      questionType: item.questionType,
      position: item.position,
    }));

    if (!challengeQuestions.length) {
      logger.error(
        `${learnerLoginName} course ${courseId} attempt ${attempt + 1}: no challenge questions returned`,
      );
      return false;
    }

    await submitAllChallengeAnswers(
      request,
      learnerToken,
      courseId,
      assessmentTestId,
      challengeQuestions,
      qandaLookup,
      useWrongAnswer,
    );

    if (isLastAttempt) {
      logger.info(
        `${learnerLoginName} | ${courseLabel} | attempt ${attemptNumber}/${totalAttempts} — successfully passed assessment`,
      );
    } else {
      logger.info(
        `${learnerLoginName} | ${courseLabel} | attempt ${attemptNumber}/${totalAttempts} — failed assessment`,
      );
    }
  }

  return true;
}

async function grantCompletionInBatches(
  request,
  jwtToken,
  userIds,
  courseId,
  courseName,
) {
  if (!userIds.length) {
    return;
  }

  const batchSize = getCompletionBatchSize();
  const durationSeconds =
    timelinessSettings.completionDurationSeconds ||
    requireTimelinessSetting("completionDurationSeconds");
  const completionDatetime = new Date().toISOString();
  const userBatches = reusableFunctions.getChunks(userIds, batchSize);
  const courseLabel = courseName || courseId;

  for (let batchIndex = 0; batchIndex < userBatches.length; batchIndex++) {
    const userBatch = userBatches[batchIndex];
    const payload = reusableFunctions.createJsonObjectwithjustUUIDS(
      userBatch,
      [courseId],
      completionDatetime,
      durationSeconds,
    );

    await conentCompletionApi(
      request,
      jwtToken,
      orgId,
      adminUserId,
      payload,
    );
    logger.info(
      `${courseLabel}: grant completion batch ${batchIndex + 1}/${userBatches.length} — ${userBatch.length} learner(s)`,
    );
  }
}

async function resolveCourseAssessmentReady(request, jwtToken, courseId) {
  const courseQandAResponse = await getCourseQandAApi(
    request,
    cpToken,
    courseId,
  );
  const qandaLookup = buildQandAFromCourseResponse(courseQandAResponse);

  if (!qandaLookup.length) {
    logger.info(
      `Skipping course ${courseId} — no assessment questions in CP Q&A response.`,
    );
    return null;
  }

  const assessmentInfo = await getvideoIdFromCourseIdApi(
    request,
    jwtToken,
    courseId,
  );
  const assessmentTestId =
    assessmentInfo?.[0]?.data?.courseWithLT?.assessmentTestId;

  if (!assessmentTestId) {
    logger.info(
      `Skipping course ${courseId} — no assessmentTestId mapped to this course.`,
    );
    return null;
  }

  return { qandaLookup, assessmentTestId };
}

const uniqueAssessmentCourseRows = getUniqueCourseRows(assessmentCourseRows);

async function runAssessmentsForCourse(request, row) {
  const courseId = getCourseIdFromRow(row);
  if (!courseId) {
    logger.error("Skipping assessments — row missing courseId");
    return;
  }

  const courseAssessment = await resolveCourseAssessmentReady(
    request,
    adminJwt,
    courseId,
  );
  if (!courseAssessment) {
    logger.info(`Course ${courseId}: skipped — not ready for assessments.`);
    return;
  }

  const defaultLearnerPassword =
    assessmentSettings.defaultLearnerPassword ||
    config.get("Admindata").password;
  const riskProfile = row.riskProfile || "medium";
  const bucketCounts = getAttemptBucketCountsForProfile(riskProfile);
  const learnerAttemptPlans = buildLearnerAttemptPlans(
    fixedSeedLearners,
    riskProfile,
  );
  const passedUserIds = [];

  logger.info(
    `Course ${row.courseName || courseId} (${courseId}) → assessmentTestId=${courseAssessment.assessmentTestId} (profile=${riskProfile}): ${learnerAttemptPlans.length} learner(s), buckets pass1st=${bucketCounts.passOn1stAttempt} pass2nd=${bucketCounts.passOn2ndAttempt} pass3rd+=${bucketCounts.passOn3rdOrMoreAttempts}`,
  );

  for (let attemptPlan of learnerAttemptPlans) {
    const learner = attemptPlan.learner;
    const learnerToken = await generateTokenLearner(
      request,
      learner.loginName,
      defaultLearnerPassword,
    );

    const passedAssessment = await runCourseTestAttemptsForLearner(
      request,
      learnerToken,
      courseId,
      row.courseName,
      courseAssessment.assessmentTestId,
      courseAssessment.qandaLookup,
      attemptPlan.failedAttemptsBeforePass,
      learner.loginName,
    );

    if (passedAssessment && learner.id) {
      passedUserIds.push(learner.id);
    }
  }

  await grantCompletionInBatches(
    request,
    adminJwt,
    passedUserIds,
    courseId,
    row.courseName,
  );
}

async function loadAssessmentContext(browser, request) {
  test.setTimeout(600000);

  const page = await browser.newPage();
  const cpLoginPageObj = new cpLoginPage(browser, page);
  cpToken = await cpLoginPageObj.getRefreshTokenFromLocalStorage();
  await page.close();

  adminJwt = await generateToken(request);
  orgId = config.get("Environment").orgId;
  const allUserResponse = await getAllUserApi(request, adminJwt);
  adminUserId = reusableFunctions.getAdminUserId(allUserResponse);

  const learnerSourceAudience = requireTimelinessSetting(
    "learnerSourceAudience",
  );
  const audienceUuid = await getAllAudienceApi(
    learnerSourceAudience,
    request,
    adminJwt,
  );
  if (!audienceUuid) {
    throw new Error(`Audience not found: ${learnerSourceAudience}`);
  }

  const audienceUserResponse = await getAudienceUsersApi(
    request,
    adminJwt,
    audienceUuid,
    learnerSourceAudience,
  );
  const audienceUsers = audienceUserResponse?.users || [];
  const assignedUserCount = getAssignedUserCount();

  fixedSeedLearners = reusableFunctions.pickLearnersFromUsers(
    audienceUsers,
    assignedUserCount,
  );
  reusableFunctions.logUsersWithLoginNameAndId(
    fixedSeedLearners,
    `Assessments fixed cohort: ${fixedSeedLearners.length} learners from ${learnerSourceAudience} (shuffled pick)`,
  );

  logger.info(
    `Assessments run: ${uniqueAssessmentCourseRows.length} course test(s) in parallel, ${fixedSeedLearners.length} shared learner(s)`,
  );
}

test.describe("Risk Readiness – course assessments", () => {
  test.beforeAll(async ({ browser, request }) => {
    await loadAssessmentContext(browser, request);
  });

  if (!uniqueAssessmentCourseRows.length) {
    test("contentForAssessments must list at least one course", () => {
      throw new Error(
        "contentForAssessments is empty in test data — add courses with mapped assessments",
      );
    });
    return;
  }

  test("All course assessments (shared cohort, parallel courses)", async ({
    request,
  }, testInfo) => {
    const perCourseTimeoutMs = 900000;
    testInfo.setTimeout(perCourseTimeoutMs * uniqueAssessmentCourseRows.length);

    await Promise.all(
      uniqueAssessmentCourseRows.map((row) =>
        runAssessmentsForCourse(request, row),
      ),
    );
  });
});
