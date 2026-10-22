/**
 * Percipio AI Coach data seed (not CAISY, not weekly learning goals).
 *
 * HOW WE RUN IT
 * - One spec, three tests. Each npm uses --grep. Do not run this file with no tag.
 * - enableAiCoachSettings @aiCoachSettings — admin PATCH, AI Coach keys only.
 * - createDataInAiCoachForDefaultUsers @aiCoachDefaultUsers — named logins: profile / assessment / goals, plus full-user chats and weekly sessions.
 * - createDataInAiCoachDashboard @aiCoachDashboard — USERCOUNT other learners: profile, assessment, goals/tasks, and one chat (same N people).
 * - fullAiCoachCommand — settings, then defaults, then dashboard (USERCOUNT 100). Includes default and pool chats.
 * - Defaults never go in the USERCOUNT pool. Token collect, profile/goals, and pool chats all run in batches of 20.
 *
 * TWO JOBS — DO NOT MIX THEM
 * - Default users: we log in as them. JSON jobRole + goal title must match. Full logins get all 3 JSON goals.
 *   Skill: exact name, a catalog name that contains it, another of the 20 names, or last an unused catalog skill so the goal still posts.
 *   Chats are real sentences for that job. Scheduled sessions only on those chats.
 * - USERCOUNT pool: dashboard filler only. Rotate job roles, mix skills, short goals.
 *   Not for walkthroughs. A and D: 1 goal. B, C, E: 2 goals. Then one chat. F is GET data only.
 *   Chats are 2–3 generic turns so admin Chat sessions count. No coaching.
 *
 * USERCOUNT
 * - Must be 50, 100, 150, 200… or the test throws. tenth = floor(N * 0.1). A = N - 5*tenth.
 * - At N=100: A50 B–F 10 each. Assessed 90 / Not started 10. Pool goals 120 / 70 achieved / 50 open. Users who set goals 90.
 * - Tasks created = A + 4B + 4C + D + 4E. Never “all tasks done, goal still open.”
 * - 70 / 210 / 90 are ratios for assessment and skill mix, not caps.
 * - Skill table scales with round_to_sum to G and A+B. Different sizes and green vs orange.
 * - A–E chats are the same N people as goals. F has no chat.
 *
 * ROLE SKILL CHECK (each grep test does its own; they do not share memory)
 * - One extra @noemail.com learner (not a demo login) sets each job title in turn and we count how many skills the org returns.
 * - @aiCoachDefaultUsers: log a line per demo login — we never change their job title from defaultUsers.json.
 * - @aiCoachDashboard: only assign job titles that had at least one skill; pick USERCOUNT+1 pool learners (one is for this check only).
 *
 * LEARNER ORDER
 * - GET data → profile → self-assessment → GET data again → POST goals only if both flags true.
 * - Profile skip if already complete. Assessment is always PUT so Q2/Q4 averages stay above 4.5. Re-runs still POST goals (they stack).
 * - Pool A–E: one chat only after goal+tasks succeed. Profile/assessment/goal/task fail → stop that user (no chat).
 * - Chat: start stream (launch_id null) → turns → session-notes → close_session → checkpoint → engagement-blocks.
 * - Full default chats: then POST coaching-sessions with Referer /ai-coach/chat/{launch_id} for each launch from this run. Only after at least one JSON goal was created.
 *
 * DEFAULT KINDS
 * - Untouched: GET data only (Not started). Ready: profile + any valid assessment, no goals, no chat.
 * - Full: same, then 3 JSON goals, then 2–3 JSON chats and one weekly session per chat.
 *
 * NOT IN THIS FILE: API 7, PATCH coaching reschedule, email feedback.
 */
import {
  test,
  logger,
  generateToken,
  generateTokenLearner,
  getAllUserApi,
  reusableFunctions,
  aiCoachOrgSettingsApi,
  getPercipioJobRolesApi,
  getAiCoachClientProfileApi,
  putAiCoachClientProfileApi,
  getAiCoachSelfAssessmentApi,
  putAiCoachSelfAssessmentApi,
  getAiCoachDataApi,
  postAiCoachInsightsCompleteApi,
  getAiCoachRoleBasedSkillsApi,
  postAiCoachGoalApi,
  postAiCoachGoalTasksApi,
  patchAiCoachTaskStatusApi,
  patchAiCoachGoalStatusApi,
  postAiCoachCoachingSessionApi,
  postAiCoachChatStreamApi,
  getAiCoachLaunchesApi,
  getAiCoachSessionNotesApi,
  postAiCoachLaunchCheckpointApi,
  postAiCoachEngagementBlockApi,
  config,
} from "../../../path.js";

const BATCH_SIZE = 20;
const DEFAULT_PASSWORD = config.get("Admindata").password;
const NOEMAIL_SUFFIX = "@noemail.com";
// A–E goal/task counts live with the log label so we do not keep two copies of the plan.
const POOL_GROUPS = {
  A: { label: "group A — 1 goal, 1 task, achieved", goalCount: 1, taskCount: 1, completeTaskCount: 1, shouldAchieve: true },
  B: { label: "group B — 2 goals, 2 tasks each, achieved", goalCount: 2, taskCount: 2, completeTaskCount: 2, shouldAchieve: true },
  C: { label: "group C — 2 goals, 2 tasks each, 1 done", goalCount: 2, taskCount: 2, completeTaskCount: 1, shouldAchieve: false },
  D: { label: "group D — 1 goal, 1 task still open", goalCount: 1, taskCount: 1, completeTaskCount: 0, shouldAchieve: false },
  E: { label: "group E — 2 goals, 2 tasks each still open", goalCount: 2, taskCount: 2, completeTaskCount: 0, shouldAchieve: false },
  F: { label: "group F — GET data only, Not started" },
};

// One skill-list fetch per job title per run; counts stop every goal landing on the same skill name in the dashboard chart.
const roleCatalogPromises = new Map();
const poolSkillUseCounts = new Map();

// Copy and mix live in testData; nothing below should hardcode org UUIDs.
const aiCoachData = reusableFunctions.readDatafromJsonFilenotasync(
  reusableFunctions.getPath("testData/aiCoach", "aiCoachDashboardData.json"),
);
const defaultUsersFile = reusableFunctions.readDatafromJsonFilenotasync(
  reusableFunctions.getPath("testData/usersData", "defaultUsers.json"),
);

test("Turn on AI Coach org settings @aiCoachSettings", async ({ request }, testInfo) => {
  testInfo.setTimeout(120000);
  logger.info("Starting AI Coach org settings");
  const jwt = await generateToken(request);
  await aiCoachOrgSettingsApi(request, jwt, [
    reusableFunctions.addDaysYmd(14),
    reusableFunctions.addMonthsYmd(1),
    reusableFunctions.addMonthsYmd(2),
  ]);
});

test("Seed AI Coach data for default users @aiCoachDefaultUsers", async ({ request }, testInfo) => {
  testInfo.setTimeout(3600000);
  const jwt = await generateToken(request);
  const orgUsers = (await getAllUserApi(request, jwt))?.users || [];
  const foundDefaultUsers = [];
  for (let row of defaultUsersFile?.defaultUsersData || []) {
    const orgUser = orgUsers.find((user) => user.loginName === row.loginName);
    if (!orgUser) {
      logger.info(`${row.loginName} | ${kindForLogin(row.loginName)} | not in this org — skipped`);
      continue;
    }
    foundDefaultUsers.push({
      loginName: row.loginName,
      password: row.passWord || DEFAULT_PASSWORD,
      jobRole: row.jobRole,
      kind: kindForLogin(row.loginName),
      orgUser,
    });
  }
  if (foundDefaultUsers.length === 0) {
    logger.info("No default users in this org — skipping AI Coach default-user seed");
    test.skip();
    return;
  }
  logDefaultUserRoster(foundDefaultUsers);
  const eligiblePoolLearners = orgUsers.filter((user) => isPoolLearner(user, defaultLoginNamesSet()));
  const spareLearner = (await collectLearnersWithTokens(request, eligiblePoolLearners, 1))[0];
  logger.info(
    `${spareLearner.loginName} will check skills by job title only — this login is not one of the demo users we seed`,
  );
  const jobRolesForDefaultUsers = [...new Set(foundDefaultUsers.map((person) => person.jobRole))];
  const skillCountsByRole = await discoverRoleSkillCounts(
    request,
    spareLearner,
    jobRolesForDefaultUsers,
  );
  logDefaultUserSkillWarnings(foundDefaultUsers, skillCountsByRole);
  await runInBatches(
    foundDefaultUsers,
    async (person) => seedDefaultUser(request, person),
    foundDefaultUsers.length,
  );
});

test("Seed AI Coach dashboard data for random learners @aiCoachDashboard", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(7200000);
  const userCount = readUserCount();
  const jwt = await generateToken(request);
  const orgUsers = (await getAllUserApi(request, jwt))?.users || [];
  const defaultLoginSet = defaultLoginNamesSet();
  const shuffledEligiblePoolLearners = reusableFunctions.shuffleDataInArray(
    orgUsers.filter((user) => isPoolLearner(user, defaultLoginSet)),
  );
  if (shuffledEligiblePoolLearners.length < userCount + 1) {
    throw new Error(
      `Need ${userCount + 1} pool learners (${userCount} to seed plus 1 to check skills by job title), found ${shuffledEligiblePoolLearners.length}`,
    );
  }
  roleCatalogPromises.clear();
  poolSkillUseCounts.clear();
  const spareLearner = (await collectLearnersWithTokens(request, shuffledEligiblePoolLearners, 1))[0];
  logger.info(
    `${spareLearner.loginName} will check skills by job title only — not one of the ${userCount} pool users we seed`,
  );
  const eligibleForSeed = shuffledEligiblePoolLearners.filter(
    (user) => user.loginName !== spareLearner.loginName,
  );
  const pickedLearners = await collectLearnersWithTokens(request, eligibleForSeed, userCount);
  const allPoolRoles = poolRoleNamesFromTestData();
  const skillCountsByRole = await discoverRoleSkillCounts(request, spareLearner, allPoolRoles);
  const rolesForPool = rolesWithSkills(skillCountsByRole, allPoolRoles);
  logPoolRoleSkillSummary(skillCountsByRole, allPoolRoles, rolesForPool);
  if (rolesForPool.length === 0) {
    throw new Error(
      "Every pool job title returned zero skills on this org — add skills for those titles, then run again",
    );
  }
  const groups = splitGroups(pickedLearners.length);
  const labeledPoolLearners = assignGroups(pickedLearners, groups);
  assignPoolRoles(labeledPoolLearners, rolesForPool);
  assignSkillsToPeople(
    labeledPoolLearners,
    scaleSkillRows(aiCoachData.goalSkills, groups.m, groups.a + groups.b),
  );
  assignPoolChats(labeledPoolLearners);
  const mix = buildAssessmentMix(groups.m);
  logger.info(
    `Dashboard seed: ${userCount} learners in batches of ${BATCH_SIZE} for profile and goals. Self-assessment completed ${groups.m}, Not started ${groups.f}. A–E get one 2–3 turn chat after a successful goal. F is GET data only.`,
  );
  logger.info(
    `Groups: A ${groups.a} (1 goal, 1 task, achieved) | B ${groups.b} (2 goals, 2 tasks each, achieved) | C ${groups.c} (2 goals, 2 tasks each, 1 done) | D ${groups.d} (1 goal, 1 task open) | E ${groups.e} (2 goals, 2 tasks each open) | F ${groups.f} (GET data only)`,
  );
  await runInBatches(
    labeledPoolLearners,
    async (person) => seedPoolUser(request, person, mix),
    BATCH_SIZE,
  );
  const poolLearnersNeedingChat = labeledPoolLearners.filter((person) => person.needsChat);
  logger.info(`Dashboard chats: ${poolLearnersNeedingChat.length} learners in batches of ${BATCH_SIZE}`);
  await runInBatches(
    poolLearnersNeedingChat,
    async (person) => seedPoolUserChat(request, person, POOL_GROUPS[person.group].label),
    BATCH_SIZE,
  );
});

// ===================== Helper Functions =====================

// USERCOUNT must be 50, 100, 150… so A–F tenths stay whole numbers.
function readUserCount() {
  const raw = (process.env.USERCOUNT || "").trim();
  const userCount = Number(raw);
  if (!raw || !Number.isFinite(userCount) || userCount < 50 || userCount % 50 !== 0) {
    throw new Error("USERCOUNT must be 50, 100, 150, 200 or another multiple of 50");
  }
  return userCount;
}

// Largest-remainder rounding so buckets add to targetSum (70, 210, and 90 ratios).
function roundToSum(weights, targetSum) {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight === 0 || targetSum <= 0) {
    return weights.map(() => 0);
  }
  const raw = weights.map((weight) => (targetSum * weight) / totalWeight);
  const floored = raw.map((value) => Math.floor(value));
  let leftover = targetSum - floored.reduce((sum, value) => sum + value, 0);
  const byFraction = raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((left, right) => right.frac - left.frac);
  for (let i = 0; i < leftover; i++) {
    floored[byFraction[i].index] += 1;
  }
  return floored;
}

// Same A–F split at any N; leftover goes to A so the pieces add to N.
function splitGroups(n) {
  const tenth = Math.floor(n * 0.1);
  return { a: n - 5 * tenth, b: tenth, c: tenth, d: tenth, e: tenth, f: tenth, m: n - tenth };
}

// Stamp each learner with A–F; mixIndex is only used by assessed people.
function assignGroups(people, groups) {
  const labeled = [];
  const sizes = [groups.a, groups.b, groups.c, groups.d, groups.e, groups.f];
  const letters = ["A", "B", "C", "D", "E", "F"];
  let index = 0;
  for (let g = 0; g < letters.length; g++) {
    for (let n = 0; n < sizes[g]; n++) {
      labeled.push({ ...people[index], group: letters[g], mixIndex: labeled.length });
      index += 1;
    }
  }
  return labeled;
}

// Scale the N=100 skill table to this run's G people and A+B green count.
function scaleSkillRows(refRows, goalCount, greenCount) {
  const goalParts = roundToSum(refRows.map((row) => row.refGoals), goalCount);
  const greenParts = roundToSum(refRows.map((row) => row.refGreen), greenCount);
  const rows = [];
  for (let i = 0; i < refRows.length; i++) {
    if (goalParts[i] === 0) {
      continue;
    }
    const green = Math.min(greenParts[i], goalParts[i]);
    rows.push({ name: refRows[i].name, green, orange: goalParts[i] - green });
  }
  return rows;
}

// A+B fill green slots; C+D+E fill orange on the same skill so rows can show both colors.
function assignSkillsToPeople(people, skillRows) {
  const greenPeople = people.filter((person) => person.group === "A" || person.group === "B");
  const orangePeople = people.filter(
    (person) => person.group === "C" || person.group === "D" || person.group === "E",
  );
  let greenIndex = 0;
  let orangeIndex = 0;
  for (let row of skillRows) {
    for (let n = 0; n < row.green && greenIndex < greenPeople.length; n++) {
      greenPeople[greenIndex].skillName = row.name;
      greenIndex += 1;
    }
    for (let n = 0; n < row.orange && orangeIndex < orangePeople.length; n++) {
      orangePeople[orangeIndex].skillName = row.name;
      orangeIndex += 1;
    }
  }
  const leftovers = [...greenPeople.slice(greenIndex), ...orangePeople.slice(orangeIndex)];
  const names = skillRows.map((row) => row.name);
  for (let i = 0; i < leftovers.length && names.length; i++) {
    leftovers[i].skillName = names[i % names.length];
  }
}

// ===================== Role skill check (before seed) =====================

// All job titles listed in testData that the random pool may rotate through.
function poolRoleNamesFromTestData() {
  const roles = [];
  for (let name of [...Object.keys(aiCoachData.roleProfiles || {}), ...(aiCoachData.poolJobRoles || [])]) {
    if (!roles.includes(name)) {
      roles.push(name);
    }
  }
  return roles;
}

// Spare learner only: set profile to each job title, read how many skills the org offers for that title.
async function discoverRoleSkillCounts(request, spareLearner, roleNames) {
  const skillCountsByRole = new Map();
  for (let roleName of roleNames) {
    const profileCopy = aiCoachData.roleProfiles[roleName] || aiCoachData.poolProfile;
    if (!profileCopy) {
      skillCountsByRole.set(roleName, 0);
      continue;
    }
    const profileOk = await saveProfile(
      request,
      spareLearner.token,
      spareLearner.user,
      roleName,
      profileCopy,
    );
    if (!profileOk) {
      skillCountsByRole.set(roleName, 0);
      continue;
    }
    const skillMap = skillsByName(await getAiCoachRoleBasedSkillsApi(request, spareLearner.token));
    skillCountsByRole.set(roleName, skillMap.size);
  }
  return skillCountsByRole;
}

// Keep job titles that had at least one skill when we checked this org.
function rolesWithSkills(skillCountsByRole, roleNames) {
  return roleNames.filter((role) => (skillCountsByRole.get(role) || 0) > 0);
}

// Human-readable summary before we assign job titles to the random pool.
function logPoolRoleSkillSummary(skillCountsByRole, allPoolRoleNames, rolesForPool) {
  logger.info("Random pool — how many skills each job title has on this org:");
  for (let roleName of allPoolRoleNames) {
    const skillCount = skillCountsByRole.get(roleName) || 0;
    if (skillCount > 0) {
      logger.info(`${roleName}: ${skillCount} skills — will assign this title to pool users`);
    } else {
      logger.info(`${roleName}: 0 skills — will not assign this title to pool users`);
    }
  }
  const poolRolesWithSkillCounts = rolesForPool
    .map((role) => `${role} (${skillCountsByRole.get(role) || 0})`)
    .join(", ");
  logger.info(
    `${rolesForPool.length} job titles ready for the pool: ${poolRolesWithSkillCounts}`,
  );
}

// Demo logins keep a fixed job title — we only warn when that title has no skills here.
function logDefaultUserSkillWarnings(defaultUsersInOrg, skillCountsByRole) {
  logger.info("Demo users — skills for each login's job title on this org:");
  for (let person of defaultUsersInOrg) {
    const skillCount = skillCountsByRole.get(person.jobRole) || 0;
    if (skillCount === 0 && person.kind === "full") {
      logger.info(
        `${person.loginName} | ${person.kind} | ${person.jobRole} — 0 skills; this full demo login may not get goals until the org adds skills for that title`,
      );
    } else if (skillCount === 0) {
      logger.info(
        `${person.loginName} | ${person.kind} | ${person.jobRole} — 0 skills (this login is not planned to create goals anyway)`,
      );
    } else {
      logger.info(`${person.loginName} | ${person.kind} | ${person.jobRole} — ${skillCount} skills`);
    }
  }
}

// Give each pool user a job title (group F skips profile). rolesForPool omits titles with zero skills.
function assignPoolRoles(people, rolesForThisOrg) {
  const roles = rolesForThisOrg?.length ? rolesForThisOrg : poolRoleNamesFromTestData();
  let index = 0;
  for (let person of people) {
    if (person.group !== "F") {
      person.jobRole = roles[index % roles.length];
      index += 1;
    }
  }
}

// A–E each get one script and one duration. F has no chat.
function assignPoolChats(people) {
  const durations = aiCoachData.chatDurationsSeconds || [300];
  const scripts = aiCoachData.poolChatScripts || [];
  let index = 0;
  for (let person of people) {
    if (person.group === "F") {
      continue;
    }
    person.durationSeconds = durations[index % durations.length];
    person.scriptIndex = scripts.length ? index % scripts.length : 0;
    index += 1;
  }
}

// Load the skill list once per job title during seeding; reuse for the next person on the same title. Do not cache an empty list.
function skillsForRole(request, token, jobRole) {
  if (!roleCatalogPromises.has(jobRole)) {
    const promise = getAiCoachRoleBasedSkillsApi(request, token).then((body) => {
      const skillMap = skillsByName(body);
      if (skillMap.size === 0) {
        roleCatalogPromises.delete(jobRole);
      }
      return skillMap;
    });
    roleCatalogPromises.set(jobRole, promise);
  }
  return roleCatalogPromises.get(jobRole);
}

// Prefer the planned 20-name (or a catalog name that contains it); else another 20-name or any catalog skill. Skip names this person already used.
function pickDashboardSkill(skillMap, wantedName, usedNames = new Set()) {
  const preferred = wantedName
    ? unusedSkill(skillFromMapByName(skillMap, wantedName) || skillFromMapCloseName(skillMap, wantedName), usedNames)
    : null;
  const fromTwenty = aiCoachData.goalSkills
    .map((row) => unusedSkill(skillFromMapByName(skillMap, row.name) || skillFromMapCloseName(skillMap, row.name), usedNames))
    .filter(Boolean);
  const candidates = preferred ? [preferred] : fromTwenty;
  const pool = candidates.length ? candidates : [...skillMap.values()].filter((skill) => !usedNames.has(skill.name));
  let best = null;
  let bestCount = Infinity;
  for (let skill of pool) {
    const used = poolSkillUseCounts.get(skill.name) || 0;
    if (used < bestCount) {
      best = skill;
      bestCount = used;
    }
  }
  if (best) {
    poolSkillUseCounts.set(best.name, bestCount + 1);
  }
  return best;
}

// Turn weight counts into a flat list of scores 1-5, one entry per person.
function expandCounts(counts) {
  const values = [];
  for (let i = 0; i < counts.length; i++) {
    for (let n = 0; n < counts[i]; n++) {
      values.push(i + 1);
    }
  }
  return values;
}

// Each person gets 3 distinct options; leftover votes go to the options that still need them.
function assignThreeChoices(optionNames, voteCounts, personCount) {
  const remaining = [...voteCounts];
  const rows = [];
  for (let p = 0; p < personCount; p++) {
    const picked = [];
    for (let n = 0; n < 3; n++) {
      let best = -1;
      for (let i = 0; i < remaining.length; i++) {
        if (!picked.includes(i) && (best === -1 || remaining[i] > remaining[best])) {
          best = i;
        }
      }
      picked.push(best);
      remaining[best] = Math.max(0, remaining[best] - 1);
    }
    rows.push(picked.map((index) => optionNames[index]));
  }
  return rows;
}

// Precompute M answer rows so Q2≠Q4 and Q1≠Q3≠Q5 on the Assessments tab.
function buildAssessmentMix(m) {
  return {
    q2Scores: expandCounts(roundToSum(aiCoachData.q2Weights, m)),
    q4Scores: expandCounts(roundToSum(aiCoachData.q4Weights, m)),
    q1Picks: assignThreeChoices(aiCoachData.q1Choices, roundToSum(aiCoachData.q1Weights, m * 3), m),
    q3Picks: assignThreeChoices(aiCoachData.q3Choices, roundToSum(aiCoachData.q3Weights, m * 3), m),
    q5Picks: assignThreeChoices(aiCoachData.q5Choices, roundToSum(aiCoachData.q5Weights, m * 3), m),
  };
}

// One line: login | bucket | what we did. Grep the login when batches run in parallel.
function logSeed(loginName, bucket, message) {
  logger.info(`${loginName} | ${bucket} | ${message}`);
}

// Same two GET-data flags we require before POST goals, and before any chat stream.
function hasCompletedProfileAndAssessment(dataBody) {
  return dataBody?.is_profile_completed === true && dataBody?.self_assessment_is_completed === true;
}

function logGetDataFlags(loginName, bucket, dataBody) {
  logSeed(
    loginName,
    bucket,
    `called GET data: profile ${dataBody?.is_profile_completed === true ? "complete" : "not complete"}, self-assessment ${dataBody?.self_assessment_is_completed === true ? "complete" : "not complete"}`,
  );
}

// Untouched defaults and pool F: GET data only so the donut stays Not started.
function logNotStartedByPlan(loginName, bucket) {
  logSeed(loginName, bucket, "called GET data on purpose so this learner has Not started data");
  logSeed(
    loginName,
    bucket,
    "intentionally skipped profile, self-assessment, goals, and chat as per plan. Done.",
  );
}

// Print who we found so a missing demo login is obvious before seeding starts.
function logDefaultUserRoster(defaultUsersInOrg) {
  const names = (kind) =>
    defaultUsersInOrg.filter((person) => person.kind === kind).map((person) => person.loginName).join(", ") ||
    "none";
  logger.info(`Default users found in this org: ${defaultUsersInOrg.length}`);
  logger.info(`Untouched (GET data only, Not started): ${names("untouched")}`);
  logger.info(`Ready (profile + self-assessment, no goals, no chat): ${names("ready")}`);
  logger.info(`Full (profile + assessment + 3 goals + chats): ${names("full")}`);
}

// Untouched / ready / full come from testData, not from whoever is missing in the org.
function kindForLogin(loginName) {
  if (aiCoachData.untouchedLogins.includes(loginName)) {
    return "untouched";
  }
  if (aiCoachData.readyLogins.includes(loginName)) {
    return "ready";
  }
  if (aiCoachData.fullLogins.includes(loginName)) {
    return "full";
  }
  return "untouched";
}

function defaultLoginNamesSet() {
  return new Set((defaultUsersFile?.defaultUsersData || []).map((row) => row.loginName));
}

// Random pool only: active learner, @noemail.com email, not a named demo login.
function isPoolLearner(user, defaultLoginSet) {
  return (
    !defaultLoginSet.has(user.loginName) &&
    String(user.status || "").toLowerCase() === "active" &&
    String(user.role || "").toLowerCase() === "learner" &&
    String(user.email || "").toLowerCase().endsWith(NOEMAIL_SUFFIX)
  );
}

// Skip profile PUT when GET data already shows it complete. Always PUT assessment so Q2/Q4 stay above 4.5.
async function ensureProfileAndAssessment(options) {
  const { request, token, loginName, bucket, orgUser, jobRoleSearch, profileCopy, answersBuilder, dataBody } =
    options;
  let latest = dataBody;
  if (latest?.is_profile_completed === true) {
    logSeed(loginName, bucket, "profile already complete — skipped");
  } else {
    const profileOk = await saveProfile(request, token, orgUser, jobRoleSearch, profileCopy);
    if (!profileOk) {
      logSeed(loginName, bucket, "profile was not saved — skipped");
      return { ok: false, dataBody: latest };
    }
    logSeed(loginName, bucket, `completed profile as ${jobRoleSearch}`);
  }
  const wasAssessed = latest?.self_assessment_is_completed === true;
  const assessOk = await saveAssessment(request, token, answersBuilder);
  if (!assessOk) {
    logSeed(loginName, bucket, "self-assessment was not saved — skipped");
    return { ok: false, dataBody: latest };
  }
  logSeed(
    loginName,
    bucket,
    wasAssessed ? "updated self-assessment so rating averages stay above 4.5" : "completed self-assessment",
  );
  latest = await getAiCoachDataApi(request, token);
  logGetDataFlags(loginName, bucket, latest);
  return { ok: true, dataBody: latest };
}

// Job-role and skill payloads nest objects; walk every object.
function walkObjects(body, visit) {
  const stack = [body];
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") {
      continue;
    }
    if (Array.isArray(node)) {
      for (let item of node) {
        stack.push(item);
      }
      continue;
    }
    visit(node);
    for (let value of Object.values(node)) {
      if (value && typeof value === "object") {
        stack.push(value);
      }
    }
  }
}

// Prefer an exact title match so a search does not pick a nearby job role.
function pickJobRoleName(body, search) {
  const names = [];
  walkObjects(body, (node) => {
    if (node.jobRoleName) {
      names.push(node.jobRoleName);
    }
  });
  const wanted = String(search).toLowerCase();
  return names.find((name) => String(name).toLowerCase() === wanted) || names[0] || "";
}

// API 9 nests skills under job roles; we only keep id + name and match later by name.
function skillsByName(body) {
  const map = new Map();
  walkObjects(body, (node) => {
    const skillId = [node.percipio_uuid, node.uuid, node.id].find((value) => typeof value === "string");
    const skillName = node.name || node.skillName || node.skill_name || node.title;
    if (typeof skillId === "string" && typeof skillName === "string" && !node.jobRoleName && !map.has(skillName)) {
      map.set(skillName, { id: skillId, name: skillName });
    }
  });
  return map;
}

// Match catalog name ignoring case; ids stay whatever API 9 returned.
function skillFromMapByName(skillMap, wantedName) {
  if (skillMap.has(wantedName)) {
    return skillMap.get(wantedName);
  }
  const wantedLower = String(wantedName).toLowerCase();
  for (let [name, skill] of skillMap) {
    if (String(name).toLowerCase() === wantedLower) {
      return skill;
    }
  }
  return null;
}

// Catalogs often use a longer Percipio name (Strategic Thinking And Planning, Data Driven Decision Making).
function skillFromMapCloseName(skillMap, wantedName) {
  const wantedLower = String(wantedName).toLowerCase();
  const wantedWords = wantedLower.split(/\s+/).filter(Boolean);
  let best = null;
  let bestRank = -1;
  let bestExtra = Infinity;
  for (let [name, skill] of skillMap) {
    const nameLower = String(name).toLowerCase();
    let rank = -1;
    if (nameLower.includes(wantedLower)) {
      rank = 3;
    } else if (wantedWords.length > 1 && wantedWords.every((word) => word.length > 2 && nameLower.includes(word))) {
      rank = 2;
    } else if (wantedWords[0] && wantedWords[0].length >= 5 && nameLower.includes(wantedWords[0])) {
      rank = 1;
    }
    if (rank < 0) {
      continue;
    }
    const extra = Math.abs(nameLower.length - wantedLower.length);
    if (rank > bestRank || (rank === bestRank && extra < bestExtra)) {
      best = skill;
      bestRank = rank;
      bestExtra = extra;
    }
  }
  return best;
}

// A demo login cannot attach the same catalog skill twice.
function unusedSkill(skill, usedNames) {
  return skill && !usedNames.has(skill.name) ? skill : null;
}

// Keep the JSON goal title. Prefer the planned skill; last resort is any unused catalog skill so all 3 demo goals still post.
function skillForName(skillMap, wantedName, usedNames, loginName) {
  const planned =
    unusedSkill(skillFromMapByName(skillMap, wantedName), usedNames) ||
    unusedSkill(skillFromMapCloseName(skillMap, wantedName), usedNames);
  if (planned) {
    if (planned.name !== wantedName) {
      logSeed(loginName, "full", `${wantedName} is not an exact catalog name — using ${planned.name}`);
    }
    return planned;
  }
  for (let row of aiCoachData.goalSkills) {
    const fallback =
      unusedSkill(skillFromMapByName(skillMap, row.name), usedNames) ||
      unusedSkill(skillFromMapCloseName(skillMap, row.name), usedNames);
    if (fallback) {
      logSeed(loginName, "full", `${wantedName} is not in this role catalog — using ${fallback.name}`);
      return fallback;
    }
  }
  for (let skill of skillMap.values()) {
    if (!usedNames.has(skill.name)) {
      logSeed(
        loginName,
        "full",
        `${wantedName} is not in this role catalog — using ${skill.name} so this demo login still gets the JSON goal`,
      );
      return skill;
    }
  }
  logSeed(
    loginName,
    "skill",
    `${wantedName} is not in this role catalog (${skillMap.size} skills) — skipped so demo data stays matched`,
  );
  return null;
}

// GET returns Q1..Q6; sort_order is the only safe order to PUT answers.
function sortedQuestions(assessmentBody) {
  const questions = assessmentBody?.questions || assessmentBody?.data || [];
  return [...questions].sort((left, right) => (left.sort_order || 0) - (right.sort_order || 0));
}

// Other needs a real sentence in other_notes or the PUT is incomplete; skip Other → null.
function checkboxAnswer(question, choices) {
  const hasOther = choices.includes("Other");
  const note = aiCoachData.otherNotesByQuestion?.[String(question.sort_order)];
  return {
    question_id: question.question_id,
    answer: { additionalProp1: choices },
    other_notes: hasOther ? note || "I have something specific to add that is not in this list." : null,
  };
}

// Score 1-5 for Q2 / Q4; more people get 4 and 5 so those two averages stay above 4.5.
function ratingAnswer(question, score) {
  return { question_id: question.question_id, answer: { additionalProp1: score } };
}

// Q6 is free text; unique enough so rows do not look copied.
function textAnswer(question, text) {
  return { question_id: question.question_id, answer: { additionalProp1: text } };
}

// Skip Other so a default-user PUT stays a simple valid checkbox.
function firstThreeChoices(question) {
  const choices = (question?.options?.choices || question?.choices || []).map(
    (choice) => choice.value || choice.label || choice,
  );
  return choices.filter((choice) => choice !== "Other").slice(0, 3);
}

// USERCOUNT mix: this person gets one precomputed row so the org bars look uneven.
function answersFromMix(questions, mix, mixIndex) {
  return [
    checkboxAnswer(questions[0], mix.q1Picks[mixIndex]),
    ratingAnswer(questions[1], mix.q2Scores[mixIndex]),
    checkboxAnswer(questions[2], mix.q3Picks[mixIndex]),
    ratingAnswer(questions[3], mix.q4Scores[mixIndex]),
    checkboxAnswer(questions[4], mix.q5Picks[mixIndex]),
    textAnswer(questions[5], `Working on the skills that matter for this role ${mixIndex + 1}`),
  ];
}

// Default ready/full: 4 or 5 on the two rating questions so they do not pull the average down.
function anyValidAnswers(questions, loginName) {
  return [
    checkboxAnswer(questions[0], firstThreeChoices(questions[0])),
    ratingAnswer(questions[1], 5),
    checkboxAnswer(questions[2], firstThreeChoices(questions[2])),
    ratingAnswer(questions[3], 5),
    checkboxAnswer(questions[4], firstThreeChoices(questions[4])),
    textAnswer(questions[5], `Ready to grow in my role as ${loginName}`),
  ];
}

// Short titles are enough for random users; the admin tile shows skill name and counts.
function poolTasksForSkill(skillName, taskCount) {
  const tasks = [
    { title: `Practice ${skillName}`, description: `Do one small practice for ${skillName}.`, due_date: reusableFunctions.addDaysYmd(14) },
  ];
  if (taskCount === 2) {
    tasks.push({
      title: `Apply ${skillName}`,
      description: `Use ${skillName} on a real piece of work.`,
      due_date: reusableFunctions.addDaysYmd(28),
    });
  }
  return tasks;
}

// Dashboard profile/goals and chats both use 20 so Percipio is not hit with all 100 at once.
async function runInBatches(learners, worker, batchSize = BATCH_SIZE) {
  const batches = reusableFunctions.getChunks(learners, batchSize);
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    await Promise.all(
      batch.map(async (learner) => {
        try {
          await worker(learner);
        } catch (error) {
          logger.error(`${learner.loginName} stopped part way because a Percipio call failed`);
        }
      }),
    );
    logger.info(`Finished batch ${batchIndex + 1} of ${batches.length} (${batch.length} people)`);
  }
}

// Keep taking pool learners until we have enough tokens, or throw if the org runs out.
async function collectLearnersWithTokens(request, eligibleLearners, learnerCount) {
  const learnersWithTokens = [];
  for (let batch of reusableFunctions.getChunks(eligibleLearners, BATCH_SIZE)) {
    if (learnersWithTokens.length >= learnerCount) {
      break;
    }
    const results = await Promise.all(
      batch.map(async (orgUser) => {
        const token = await generateTokenLearner(request, orgUser.loginName, DEFAULT_PASSWORD);
        if (!token) {
          logger.info(`${orgUser.loginName} has no token — skipped this person and picked another from the pool`);
          return null;
        }
        return { user: orgUser, token, loginName: orgUser.loginName };
      }),
    );
    for (let learnerWithToken of results) {
      if (learnerWithToken && learnersWithTokens.length < learnerCount) {
        learnersWithTokens.push(learnerWithToken);
      }
    }
  }
  if (learnersWithTokens.length < learnerCount) {
    throw new Error(`Need ${learnerCount} learners with tokens, only got ${learnersWithTokens.length}`);
  }
  return learnersWithTokens;
}

// Search by name, reuse client_id if GET already has one, otherwise generate once.
async function saveProfile(request, token, orgUser, jobRoleSearch, profileCopy) {
  const jobRoleName = pickJobRoleName(await getPercipioJobRolesApi(request, token, jobRoleSearch), jobRoleSearch);
  if (!jobRoleName) {
    logger.info(`No job role named "${jobRoleSearch}" in this org — skipped this learner's profile`);
    return false;
  }
  const existing = await getAiCoachClientProfileApi(request, token);
  await putAiCoachClientProfileApi(request, token, {
    userId: existing?.user_id || orgUser.id,
    clientId: existing?.client_id || reusableFunctions.uuidGenerator(),
    jobRoleName,
    keyResponsibilities: profileCopy.keyResponsibilities,
    careerAspiration: profileCopy.careerAspiration,
    motivation: profileCopy.motivation,
  });
  return true;
}

// GET questions, PUT answers, then clear the review-insights home task.
async function saveAssessment(request, token, answersBuilder) {
  const questions = sortedQuestions(await getAiCoachSelfAssessmentApi(request, token));
  if (questions.length < 6) {
    logger.info("Self-assessment did not come back with all six questions — skipped this learner");
    return false;
  }
  await putAiCoachSelfAssessmentApi(request, token, answersBuilder(questions));
  await postAiCoachInsightsCompleteApi(request, token);
  return true;
}

// Create goal + tasks, then complete / achieve only as the group or default plan says. false = do not chat.
async function createGoalWithTasks(request, token, loginName, bucket, skill, title, tasks, completeTaskCount, shouldAchieve) {
  let created;
  try {
    created = await postAiCoachGoalApi(request, token, title, skill.id, skill.name);
  } catch (error) {
    logger.error(`${loginName} | ${bucket} | could not create goal "${title}"`);
    return false;
  }
  if (!created?.goalId) {
    logSeed(loginName, bucket, `goal "${title}" came back with no id — skipped its tasks`);
    return false;
  }
  logSeed(loginName, bucket, `created goal "${title}" on ${skill.name}`);
  let createdTasks = [];
  try {
    createdTasks = (await postAiCoachGoalTasksApi(request, token, created.goalId, tasks)).tasks || [];
  } catch (error) {
    logger.error(`${loginName} | ${bucket} | could not create tasks for goal "${title}"`);
    return false;
  }
  for (let task of tasks) {
    logSeed(loginName, bucket, `created task "${task.title}" in goal "${title}"`);
  }
  for (let i = 0; i < completeTaskCount; i++) {
    const id = createdTasks[i]?.task_id || createdTasks[i]?.id;
    if (!id) {
      continue;
    }
    await patchAiCoachTaskStatusApi(request, token, id);
    logSeed(loginName, bucket, `completed task "${tasks[i].title}" in goal "${title}"`);
  }
  if (shouldAchieve) {
    await patchAiCoachGoalStatusApi(request, token, created.goalId);
    logSeed(loginName, bucket, `achieved goal "${title}"`);
  }
  return true;
}

// Untouched stops after GET data. Ready stops after assessment. Full continues to matched JSON goals, then chats.
async function seedDefaultUser(request, person) {
  logSeed(person.loginName, person.kind, `${person.jobRole} — starting`);
  const token = await generateTokenLearner(request, person.loginName, person.password);
  if (!token) {
    logSeed(person.loginName, person.kind, "has no token — skipped this default user");
    return;
  }
  const dataBody = await getAiCoachDataApi(request, token);
  logGetDataFlags(person.loginName, person.kind, dataBody);
  if (person.kind === "untouched") {
    logNotStartedByPlan(person.loginName, "untouched");
    return;
  }
  const profileCopy = aiCoachData.roleProfiles[person.jobRole];
  if (!profileCopy) {
    logSeed(person.loginName, person.kind, `no profile text in testData for ${person.jobRole} — skipped`);
    return;
  }
  const ensured = await ensureProfileAndAssessment({
    request,
    token,
    loginName: person.loginName,
    bucket: person.kind,
    orgUser: person.orgUser,
    jobRoleSearch: person.jobRole,
    profileCopy,
    answersBuilder: (questions) => anyValidAnswers(questions, person.loginName),
    dataBody,
  });
  if (!ensured.ok) {
    logSeed(person.loginName, person.kind, "profile or self-assessment was not saved — skipping goals and chat");
    return;
  }
  if (person.kind !== "full") {
    logSeed(person.loginName, "ready", "intentionally skipped goals and chat as per plan. Done.");
    return;
  }
  if (!hasCompletedProfileAndAssessment(ensured.dataBody)) {
    logSeed(person.loginName, "full", "profile or self-assessment not complete — skipping goals and chat");
    return;
  }
  const skillMap = skillsByName(await getAiCoachRoleBasedSkillsApi(request, token));
  const usedNames = new Set();
  let goalsCreated = 0;
  for (let planned of aiCoachData.defaultFullGoals[person.loginName] || []) {
    const skill = skillForName(skillMap, planned.skillName, usedNames, person.loginName);
    if (!skill) {
      continue;
    }
    usedNames.add(skill.name);
    const goalOk = await createGoalWithTasks(
      request,
      token,
      person.loginName,
      "full",
      skill,
      planned.title,
      planned.tasks.map((task, index) => ({
        title: task.title,
        description: task.description,
        due_date: reusableFunctions.addDaysYmd(index === 0 ? 14 : 28),
      })),
      planned.completeTaskCount,
      planned.achieveGoal,
    );
    if (goalOk) {
      goalsCreated += 1;
    }
  }
  if (goalsCreated === 0) {
    logSeed(person.loginName, "full", "no goal created — skipping chat");
    return;
  }
  logSeed(person.loginName, "full", `${goalsCreated} goals created — starting chats and weekly sessions`);
  await seedDefaultUserChats(request, token, person);
}

// F stops after GET data. A–E: profile → assessment → gate → 1 or 2 goals → one chat if at least one goal landed.
async function seedPoolUser(request, person, mix) {
  const bucket = POOL_GROUPS[person.group].label;
  logSeed(person.loginName, bucket, person.group === "F" ? "starting" : `starting as ${person.jobRole}`);
  const dataBody = await getAiCoachDataApi(request, person.token);
  logGetDataFlags(person.loginName, bucket, dataBody);
  if (person.group === "F") {
    logNotStartedByPlan(person.loginName, bucket);
    return;
  }
  const ensured = await ensureProfileAndAssessment({
    request,
    token: person.token,
    loginName: person.loginName,
    bucket,
    orgUser: person.user,
    jobRoleSearch: person.jobRole,
    profileCopy: aiCoachData.roleProfiles[person.jobRole] || aiCoachData.poolProfile,
    answersBuilder: (questions) => answersFromMix(questions, mix, person.mixIndex),
    dataBody,
  });
  if (!ensured.ok) {
    logSeed(person.loginName, bucket, "profile or self-assessment was not saved — skipping goals and chat");
    return;
  }
  if (!hasCompletedProfileAndAssessment(ensured.dataBody)) {
    logSeed(person.loginName, bucket, "profile or self-assessment not complete — skipping goals and chat");
    return;
  }
  const plan = POOL_GROUPS[person.group];
  const skillMap = await skillsForRole(request, person.token, person.jobRole);
  const usedNames = new Set();
  let goalsCreated = 0;
  for (let g = 0; g < plan.goalCount; g++) {
    const skill = pickDashboardSkill(skillMap, g === 0 ? person.skillName : null, usedNames);
    if (!skill) {
      logSeed(
        person.loginName,
        bucket,
        `${person.jobRole} has no skill left to pick for goal ${g + 1} on this org — skipped`,
      );
      continue;
    }
    if (g === 0 && person.skillName && skill.name !== person.skillName) {
      logSeed(
        person.loginName,
        bucket,
        `${person.skillName} is not offered for ${person.jobRole} on this org — using ${skill.name} instead`,
      );
    }
    usedNames.add(skill.name);
    const goalOk = await createGoalWithTasks(
      request,
      person.token,
      person.loginName,
      bucket,
      skill,
      `Improve ${skill.name}`,
      poolTasksForSkill(skill.name, plan.taskCount),
      plan.completeTaskCount,
      plan.shouldAchieve,
    );
    if (goalOk) {
      goalsCreated += 1;
    }
  }
  if (goalsCreated === 0) {
    logSeed(person.loginName, bucket, "no goal created — skipping chat");
    return;
  }
  logSeed(person.loginName, bucket, `${goalsCreated} goals created — queued for chat`);
  person.needsChat = true;
}

// Collect launch_id values from GET launches so we can diff before vs after a new stream.
function launchIdsFromBody(body) {
  const fromLaunchId = new Set();
  const fromId = new Set();
  walkObjects(body, (node) => {
    if (typeof node.launch_id === "string") {
      fromLaunchId.add(node.launch_id);
    }
    if (typeof node.id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(node.id)) {
      fromId.add(node.id);
    }
  });
  return fromLaunchId.size ? fromLaunchId : fromId;
}

// Prefer the id from SSE; if the stream omitted it, take the launch that was not in the snapshot.
async function resolveLaunchId(request, token, streamLaunchId, idsBefore) {
  if (streamLaunchId) {
    return streamLaunchId;
  }
  const after = launchIdsFromBody(await getAiCoachLaunchesApi(request, token));
  for (let id of after) {
    if (!idsBefore.has(id)) {
      return id;
    }
  }
  return null;
}

// One closed conversation: start with launch_id null, send user lines, then checkpoint + engagement-blocks.
async function runClosedChat(request, token, loginName, bucket, userLines, durationSeconds) {
  const idsBefore = launchIdsFromBody(await getAiCoachLaunchesApi(request, token));
  const recentMessages = [];
  const start = await postAiCoachChatStreamApi(request, token, {
    text: "",
    launchId: null,
    recentMessages: [],
    pageContext: { route_id: "chat_free", entry_trigger: "page_open" },
  });
  if (start.assistantText) {
    recentMessages.push({ role: "assistant", content: start.assistantText });
  }
  let launchId = await resolveLaunchId(request, token, start.launchId, idsBefore);
  for (let line of userLines.filter((text) => String(text || "").trim())) {
    const turn = await postAiCoachChatStreamApi(request, token, {
      text: line,
      launchId,
      recentMessages: [...recentMessages],
      pageContext: { route_id: "chat_free", entry_trigger: "page_open" },
    });
    recentMessages.push({ role: "user", content: line });
    if (turn.assistantText) {
      recentMessages.push({ role: "assistant", content: turn.assistantText });
    }
    launchId = turn.launchId || launchId;
  }
  if (!launchId) {
    launchId = await resolveLaunchId(request, token, null, idsBefore);
  }
  if (!launchId) {
    logSeed(loginName, bucket, "chat started but came back with no chat id — skipped closing it");
    return null;
  }
  await getAiCoachSessionNotesApi(request, token, launchId);
  await postAiCoachChatStreamApi(request, token, {
    text: "",
    launchId,
    recentMessages: [...recentMessages],
    pageContext: { route_id: "chat_free", entry_trigger: "page_open" },
    clientAction: { type: "close_session", phase: "commitment_prompt" },
  });
  await postAiCoachLaunchCheckpointApi(request, token, launchId);
  const endedAt = new Date();
  const startedAt = new Date(endedAt.getTime() - durationSeconds * 1000);
  await postAiCoachEngagementBlockApi(request, token, launchId, {
    id: reusableFunctions.uuidGenerator(),
    startedAt: startedAt.toISOString(),
    lastActivityAt: endedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    closeReason: "session_reset",
  });
  logSeed(loginName, bucket, `completed a chat (${userLines.length} turns, ${durationSeconds}s)`);
  return launchId;
}

// Learner calendar shows the session only when Referer is this chat url.
async function scheduleSessionOnLaunch(request, token, loginName, launchId, weekday) {
  const created = await postAiCoachCoachingSessionApi(request, token, {
    launchId,
    scheduledAtLocal: `${reusableFunctions.addDaysYmd(7 + weekday)}T10:00:00`,
    timezone: aiCoachData.coachingTimezone || "Asia/Calcutta",
    weekday,
    endDate: reusableFunctions.addMonthsYmd(3),
  });
  if (created) {
    logSeed(loginName, "full", "scheduled a weekly session on this chat");
  }
}

// Full demo logins: meaningful JSON chats, then one weekly session per launch from this run.
async function seedDefaultUserChats(request, token, person) {
  const scripts = aiCoachData.defaultFullChats?.[person.loginName] || [];
  if (scripts.length === 0) {
    logSeed(person.loginName, "full", "no chat scripts in testData — skipped chat");
    return;
  }
  const durations = aiCoachData.chatDurationsSeconds || [300];
  const launchIds = [];
  for (let i = 0; i < scripts.length; i++) {
    const launchId = await runClosedChat(
      request,
      token,
      person.loginName,
      "full",
      scripts[i].messages || [],
      durations[i % durations.length],
    );
    if (launchId) {
      launchIds.push(launchId);
    }
  }
  for (let i = 0; i < launchIds.length; i++) {
    await scheduleSessionOnLaunch(request, token, person.loginName, launchIds[i], i % 5);
  }
  logSeed(
    person.loginName,
    "full",
    `${launchIds.length} chats completed, ${launchIds.length} scheduled sessions. Done.`,
  );
}

// One 2–3 turn chat so admin Chat sessions count. Called only after goal+tasks succeed. No coaching.
async function seedPoolUserChat(request, person, bucket) {
  const scripts = aiCoachData.poolChatScripts || [];
  const userLines = (scripts[person.scriptIndex] || scripts[0])?.messages || [];
  if (userLines.length < 2) {
    logSeed(person.loginName, bucket, "poolChatScripts needs at least 2 turns — skipped chat");
    return;
  }
  let launchId = null;
  try {
    launchId = await runClosedChat(
      request,
      person.token,
      person.loginName,
      bucket,
      userLines,
      person.durationSeconds,
    );
  } catch (error) {
    logSeed(person.loginName, bucket, "chat did not finish — trying one more time");
    launchId = await runClosedChat(
      request,
      person.token,
      person.loginName,
      bucket,
      userLines,
      person.durationSeconds,
    );
  }
  if (launchId) {
    logSeed(person.loginName, bucket, "no scheduled session. Done.");
  }
}
