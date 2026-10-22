// This test prepares one learner so the Career Center role page looks ready for that persona.
// Each person in the list runs alone, at the same time as the others. One person does not wait on another.
// Sign-in uses loginName only. This run uses the fake logins in skillsIntelligencePersonasTestsi.json. Jonathan stays in skillsIntelligencePersonas.json.
//
// For each learner, in this order:
// 1. Sign in as that learner. If the login is not in this org, that person is skipped.
// 2. Save the current job role.
// 3. Save the next job role.
// 4. Save the focus skills on the current role, then rate each one that is not 0. A zero is saved and not rated.
// 5. Save the focus skills on the next role, then rate each one that is not 0. A zero is saved and not rated.
//    The sheet decides how many skills each role has. Some roles have three, some have four.
//    After both roles are rated, read the current role once and the next role once.
//    Log every focus skill with the number we sent and the rating the org returned.
// 6. Answer the current-role benchmarks. The first is Proficient. The other two get two different levels. Developing is the most common, then Aspiring, then Advanced, then Novice.
// 7. Complete the courses for the current role.
// 8. Answer the next-role benchmarks the same way. The first is Proficient. The other two get two different levels.
// 9. Complete the courses for the next role.
//
// Recommended content and the career-path review are not part of this test.
// If a role save, a focus-skill save, a rating, a course, or a benchmark does not go through, that step is logged
// and the rest of this learner still runs. If the content site has no answers for a skill benchmark, that benchmark
// is logged and the next skill benchmark is tried.

import {
  test,
  logger,
  config,
  generateToken,
  generateTokenLearner,
  reusableFunctions,
  getAllUserApi,
  searchCustomJobRolesApi,
  saveLearnerJobRoleApi,
  roleSkillsKgApi,
  saveFocusSkillsKgApi,
  rateFocusSkillKgApi,
  conentCompletionApi,
  createSBAssessmentApi,
  getAllBMQuestionBanks,
  getAllBMQuestionsandAnsUuid,
  submitChallengeApi,
  cpLoginPage,
} from "../../../path.js";

// Each object is one learner. Add the next person as another object in this list.
const personas = reusableFunctions.readDatafromJsonFilenotasync(
  reusableFunctions.getPath(
    "testData/skillIntelligence",
    "skillsIntelligencePersonasTestsi.json",
  ),
);

// These names are repeated on purpose. A level listed more times has a higher chance of being picked. Developing is listed 4 times, Aspiring 3, Advanced 2, and Novice 1.
const otherBenchmarkLevels = [
  "Developing",
  "Developing",
  "Developing",
  "Developing",
  "Aspiring",
  "Aspiring",
  "Aspiring",
  "Advanced",
  "Advanced",
  "Novice",
];

// One test per learner. Workers do not share tokens, so one person cannot block another.
test.describe.configure({ mode: "parallel" });

for (const persona of personas) {
  test(`${persona.loginName}`, async ({ request, browser }) => {
    test.setTimeout(1800000);
    await runPersona(request, browser, persona);
  });
}

// Checklist for this login only. The last two review steps are left out on purpose.
async function runPersona(request, browser, persona) {
  const adminJwt = await generateToken(request);
  const orgUsers = (await getAllUserApi(request, adminJwt))?.users || [];
  const adminUserId = reusableFunctions.getAdminUserId({ users: orgUsers });
  const learner = orgUsers.find(
    (user) =>
      (user.loginName || "").toLowerCase() === persona.loginName.toLowerCase(),
  );
  if (!learner) {
    logger.info(`${persona.loginName} is not in this org — skipped`);
    return;
  }
  if (!adminUserId) {
    logger.info(
      `${persona.loginName} | Admin user was not found, so courses will be skipped. Roles, skills, and benchmarks will still run.`,
    );
  }

  const learnerToken = await generateTokenLearner(
    request,
    persona.loginName,
    config.get("Admindata").password,
  );
  const session = {
    learner,
    learnerToken,
    loginName: persona.loginName,
    adminJwt,
    adminUserId,
  };
  const orgId = config.get("Environment").orgId;

  const currentRoleId = await runStep(
    persona.loginName,
    `Save current role ${persona.currentRoleName}`,
    () => saveRole(request, session, persona.currentRoleName, 1),
  );
  const nextRoleId = await runStep(
    persona.loginName,
    `Save next role ${persona.aspirationalRoleName}`,
    () => saveRole(request, session, persona.aspirationalRoleName, 2),
  );
  const currentFocus = await saveFocusSkillsForRole(
    request,
    session,
    currentRoleId,
    persona.currentRoleName,
    persona.currentFocusSkills,
  );
  const nextFocus = await saveFocusSkillsForRole(
    request,
    session,
    nextRoleId,
    persona.aspirationalRoleName,
    persona.aspirationalFocusSkills,
  );
  await logSentAndOrgRatings(
    request,
    session,
    currentRoleId,
    persona.currentRoleName,
    currentFocus,
  );
  await logSentAndOrgRatings(
    request,
    session,
    nextRoleId,
    persona.aspirationalRoleName,
    nextFocus,
  );

  const cpToken = await contentSiteToken(browser, persona.loginName);
  const roleBlocks = [
    { benchmarks: persona.currentBenchmarks, courses: persona.currentCourses },
    {
      benchmarks: persona.aspirationalBenchmarks,
      courses: persona.aspirationalCourses,
    },
  ];
  for (const block of roleBlocks) {
    if (cpToken) {
      const shuffledLevels = reusableFunctions.shuffleDataInArray([
        ...otherBenchmarkLevels,
      ]);
      const pickedLevels = [];
      for (const levelName of shuffledLevels) {
        if (!pickedLevels.includes(levelName)) pickedLevels.push(levelName);
      }
      for (
        let benchmarkIndex = 0;
        benchmarkIndex < block.benchmarks.length;
        benchmarkIndex++
      ) {
        const benchmark = block.benchmarks[benchmarkIndex];
        const level =
          benchmarkIndex === 0
            ? "Proficient"
            : pickedLevels[benchmarkIndex - 1];
        logger.info(
          `${persona.loginName} | ${benchmark.title} | starting this skill benchmark with level ${level}`,
        );
        await answerBenchmark(request, session, cpToken, benchmark, level);
      }
    }
    if (adminUserId) {
      for (const course of block.courses) {
        await runStep(persona.loginName, `Complete ${course.title}`, () =>
          completeCourse(request, orgId, session, course),
        );
      }
    }
  }
}

// A step that did not go through is logged here. The caller already recorded the failure. This learner continues.
async function runStep(loginName, step, action) {
  try {
    return await action();
  } catch (error) {
    logger.info(
      `${loginName} | ${step} did not finish — ${error.message}. Moving on to the next step.`,
    );
    return null;
  }
}

// Benchmark answers live on the content site. Courses can still be completed if this sign-in does not work.
async function contentSiteToken(browser, loginName) {
  try {
    const page = await browser.newPage();
    const cpLogin = new cpLoginPage(browser, page);
    const cpToken = await cpLogin.getRefreshTokenFromLocalStorage();
    if (!cpToken) {
      logger.info(
        `${loginName} | Could not sign in to the content site, so skill benchmarks were skipped. Courses will still be completed.`,
      );
    }
    return cpToken;
  } catch (error) {
    logger.info(
      `${loginName} | Could not open the content site — ${error.message}. Skill benchmarks were skipped. Courses will still be completed.`,
    );
    return null;
  }
}

// Order 1 is the current role. Order 2 is the next role. The id comes from search, not from the file.
async function saveRole(request, session, roleName, order) {
  const roles = await searchCustomJobRolesApi(
    request,
    session.learnerToken,
    roleName,
  );
  const match = roles.find((role) =>
    reusableFunctions.sameName(role.jobRoleName, roleName),
  );
  if (!match?.jobRoleUuid) {
    throw new Error(`No custom role named ${roleName}`);
  }
  await saveLearnerJobRoleApi(
    request,
    session.learnerToken,
    match.jobRoleUuid,
    order,
    roleName,
    session.loginName,
  );
  return match.jobRoleUuid;
}

// The sheet names the focus skills for this role. A missing role, a missing skill, or a failed save does not stop the other skills.
async function saveFocusSkillsForRole(
  request,
  session,
  jobRoleId,
  roleName,
  focusSkills,
) {
  if (!jobRoleId) {
    logger.info(
      `${session.loginName} | ${roleName} was not saved, so focus skills and ratings for that role were skipped`,
    );
    return null;
  }
  const skillsOnRole = await runStep(
    session.loginName,
    `Load skills for ${roleName}`,
    () => roleSkillsKgApi(request, session.learnerToken, jobRoleId, roleName),
  );
  if (!skillsOnRole) return null;
  const chosen = [];
  for (const focusSkill of focusSkills) {
    const match = skillsOnRole.find((skill) =>
      reusableFunctions.sameName(skill.name, focusSkill.skillName),
    );
    if (!match?.id) {
      logger.info(
        `${session.loginName} | ${focusSkill.skillName} is not on ${roleName}, so that skill was skipped`,
      );
      continue;
    }
    chosen.push({
      skillId: match.id,
      skillName: focusSkill.skillName,
      selfRating: focusSkill.selfRating,
    });
  }
  if (!chosen.length) {
    logger.info(
      `${session.loginName} | No focus skills matched on ${roleName}. Moving on to the next step.`,
    );
    return null;
  }
  await runStep(session.loginName, `Save focus skills on ${roleName}`, () =>
    saveFocusSkillsKgApi(
      request,
      session.learnerToken,
      jobRoleId,
      chosen.map((skill) => skill.skillId),
      roleName,
      session.loginName,
    ),
  );
  for (const skill of chosen) {
    if (!skill.selfRating) continue;
    await runStep(session.loginName, `Rate ${skill.skillName}`, () =>
      rateFocusSkillKgApi(
        request,
        session.learnerToken,
        skill.skillId,
        skill.selfRating,
        skill.skillName,
        session.loginName,
      ),
    );
  }
  return chosen;
}

// Both roles are already rated. This is one read for this role. Log every focus skill we sent and the rating the org returned.
async function logSentAndOrgRatings(
  request,
  session,
  jobRoleId,
  roleName,
  chosen,
) {
  if (!jobRoleId || !chosen?.length) return;
  const skillsAfterRating = await runStep(
    session.loginName,
    `Read ratings back for ${roleName}`,
    () => roleSkillsKgApi(request, session.learnerToken, jobRoleId, roleName),
  );
  if (!skillsAfterRating) return;
  for (const skill of chosen) {
    const stored = skillsAfterRating.find((item) =>
      reusableFunctions.sameName(item.name, skill.skillName),
    );
    const sent = skill.selfRating || 0;
    const orgRating = stored ? (stored.rating ?? "none") : "no skill";
    logger.info(
      `${session.loginName} | ${skill.skillName} on ${roleName} | we sent ${sent} | org rating ${orgRating}`,
    );
  }
}

// One completion call per course. A missing course id must not block the other courses.
async function completeCourse(request, orgId, session, course) {
  const granted = await conentCompletionApi(
    request,
    session.adminJwt,
    orgId,
    session.adminUserId,
    reusableFunctions.createJsonObjectwithjustUUIDS(
      [session.learner.id],
      [course.courseId],
      reusableFunctions.getPreviousDayFormattedDate(),
    ),
  );
  if (!granted) throw new Error("the completion call did not go through");
  logger.info(`Completed course | ${course.title} | ${session.loginName}`);
}

// Missing content-site answers skip this benchmark and try the next one.
async function answerBenchmark(request, session, cpToken, benchmark, level) {
  const answers = await answersForBenchmark(
    request,
    cpToken,
    benchmark,
    session.loginName,
  );
  if (!answers) return;
  await runStep(session.loginName, `Answer ${benchmark.title}`, async () => {
    const questions = await questionsForBenchmark(
      request,
      session.learnerToken,
      benchmark.benchmarkId,
    );
    if (!questions.length) {
      logger.info(
        `${session.loginName} | ${benchmark.title} had no questions. Trying the next skill benchmark.`,
      );
      return;
    }
    const correctCount =
      await reusableFunctions.decideNumberOfQuestionToBeAnsweredCorrectly(
        level,
        questions.length,
      );
    let sentAsCorrect = 0;
    for (
      let questionIndex = 0;
      questionIndex < questions.length;
      questionIndex++
    ) {
      const question = questions[questionIndex];
      const answerText =
        questionIndex < correctCount
          ? answerForQuestion(answers, question.questionUuid)
          : "null";
      if (questionIndex < correctCount && answerText !== "null")
        sentAsCorrect += 1;
      await submitChallengeApi(
        request,
        benchmark.benchmarkId,
        question.questionUuid,
        question.questionType,
        question.challengeUuid,
        question.questionPosition,
        answerText,
        session.learnerToken,
      );
    }
    logger.info(
      `${session.loginName} | ${benchmark.title} | answered ${sentAsCorrect} of ${questions.length} questions as correct. The rest were left blank.`,
    );
  });
}

async function questionsForBenchmark(request, learnerToken, benchmarkId) {
  const response = await createSBAssessmentApi(
    request,
    benchmarkId,
    learnerToken,
  );
  const questions = response?.[0]?.data?.createChallenge?.questions || [];
  return questions.map((question) => ({
    questionType: question.questionType,
    questionPosition: question.position,
    questionUuid: question.questionUuid,
    challengeUuid: question.challengeUuid,
  }));
}

// No answers on the content site means this benchmark is left and the next one is tried.
async function answersForBenchmark(request, cpToken, benchmark, loginName) {
  const answers = [];
  try {
    const questionBanks = await getAllBMQuestionBanks(
      request,
      benchmark.benchmarkId,
      cpToken,
    );
    for (const bank of questionBanks || []) {
      answers.push(
        await getAllBMQuestionsandAnsUuid(
          request,
          bank.questionBankUuid,
          cpToken,
        ),
      );
    }
  } catch {
    answers.length = 0;
  }
  const hasAnswers = answers.some((bankAnswers) =>
    (bankAnswers || []).some((answer) => answer.finalAnswersTxt),
  );
  if (hasAnswers) return answers;
  logger.info(
    `${benchmark.title} | ${loginName} | Answers are not available, so trying the next skill benchmark`,
  );
  return null;
}

function answerForQuestion(answers, questionUuid) {
  for (const bankAnswers of answers) {
    const match = (bankAnswers || []).find(
      (answer) => answer.questionUuid === questionUuid,
    );
    if (match?.finalAnswersTxt) {
      return match.finalAnswersTxt.replace(/\\"/g, '"');
    }
  }
  return "null";
}
