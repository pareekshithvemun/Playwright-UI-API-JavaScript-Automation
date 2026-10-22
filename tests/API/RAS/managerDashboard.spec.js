import {
  test,
  expect,
  generateToken,
  fetchRoleUuid,
  getAllUserApi,
  setDirectManagerApi,
  reusableFunctions,
  logger,
} from "../../../path.js";

const SKILLSOFT_SUFFIX = "@skillsoft.com";
const NOEMAIL_SUFFIX = "@noemail.com";
const TEAM_MANAGER_ROLE_NAME = "TeamManager";
const LEARNERS_PER_MANAGER = 10;
const PUT_BATCH_SIZE = 20;

let jwt;
let managers = [];
let learners = [];

test.beforeAll("Generate Token", async ({ request }, testInfo) => {
  testInfo.setTimeout(90000);
  jwt = await generateToken(request);
});

test.describe.serial("Manager dashboard", () => {
  test("Split active users into managers and learners", async ({ request }) => {
    test.setTimeout(1800000);
    expect(jwt).toBeTruthy();

    // Fetch TeamManager role uuid to filter Skillsoft people whose role is TeamManager.
    let teamManagerRoleUuid = await fetchRoleUuid(
      request,
      jwt,
      TEAM_MANAGER_ROLE_NAME,
    );
    expect(teamManagerRoleUuid).toBeTruthy();

    let allUserResponse = await getAllUserApi(request, jwt);
    let orgUsers = allUserResponse?.users || [];
    let activeUsers = orgUsers.filter(isActiveUser);
    managers = [];
    learners = [];
    for (let user of activeUsers) {
      if (isSkillsoftTeamManager(user, teamManagerRoleUuid)) {
        managers.push(user);
      } else if (isNoemailLearner(user)) {
        learners.push(user);
      }
    }

    let host = reusableFunctions.orgHostname();
    logger.info(`[${host}] active users: ${activeUsers.length}`);
    logger.info(
      `[${host}] managers (@skillsoft.com + TeamManager): ${managers.length}`,
    );
    logger.info(`[${host}] learners: ${learners.length}`);
    reusableFunctions.logUsersWithLoginNameAndId(
      managers,
      `[${host}] managers`,
    );
    reusableFunctions.logUsersWithLoginNameAndId(
      learners,
      `[${host}] learners`,
    );
  });

  test("Assign 10 unique learners to each manager", async ({ request }) => {
    test.setTimeout(7200000);

    let managersWithId = managers.filter((user) => user.id);
    // Shuffle so each manager's 10 are mixed last names, not Abbott then Abbott.
    let learnersWithId = reusableFunctions.shuffleDataInArray(
      learners.filter((user) => user.id),
    );
    expect(managersWithId.length).toBeGreaterThan(0);
    expect(learnersWithId.length).toBeGreaterThan(0);

    let host = reusableFunctions.orgHostname();
    let pairs = buildManagerLearnerPairs(managersWithId, learnersWithId);
    expect(pairs.length).toBeGreaterThan(0);

    // 20 PUTs at a time — much faster than one-by-one, without flooding the API.
    let putBatches = reusableFunctions.getChunks(pairs, PUT_BATCH_SIZE);
    let assignedLearnerCount = 0;
    for (let batchIndex = 0; batchIndex < putBatches.length; batchIndex++) {
      let batch = putBatches[batchIndex];
      let results = await Promise.all(
        batch.map((pair) =>
          setDirectManagerApi(request, jwt, pair.learnerId, pair.managerId),
        ),
      );
      for (let result of results) {
        expect(result.success).toBe(true);
      }
      assignedLearnerCount += batch.length;
      logger.info(
        `[${host}] direct manager batch ${batchIndex + 1}/${putBatches.length} | assigned ${assignedLearnerCount}/${pairs.length}`,
      );
    }

    let managersWithFullTeam = pairs.length / LEARNERS_PER_MANAGER;
    logger.info(
      `[${host}] assigned ${assignedLearnerCount} learners across ${managersWithFullTeam} managers`,
    );
  });
});

// ===================== Helper Functions =====================

/** Inactive accounts are out of manager dashboard cohorts. */
function isActiveUser(user) {
  return String(user.status || "").toLowerCase() === "active";
}

/** Managers are TeamManager roleUuid and email ending in @skillsoft.com. */
function isSkillsoftTeamManager(user, teamManagerRoleUuid) {
  let userRoleUuid = String(
    user.roleUuid || user.role_uuid || "",
  ).toLowerCase();
  if (userRoleUuid !== String(teamManagerRoleUuid || "").toLowerCase()) {
    return false;
  }
  let identity = String(
    user.email || user.loginName || user.externalId || "",
  ).toLowerCase();
  return identity.endsWith(SKILLSOFT_SUFFIX);
}

/** Build all learner–manager pairs first so uniqueness is settled before any PUT. */
function buildManagerLearnerPairs(managersWithId, learnersWithId) {
  let pairs = [];
  for (
    let managerIndex = 0;
    managerIndex < managersWithId.length;
    managerIndex++
  ) {
    let manager = managersWithId[managerIndex];
    let team = getUniqueLearnersForManager(
      learnersWithId,
      managerIndex,
      LEARNERS_PER_MANAGER,
    );
    if (team.length < LEARNERS_PER_MANAGER) {
      logger.info(
        `Stopped pairing at ${manager.loginName}: not enough unused learners left`,
      );
      break;
    }
    for (let learner of team) {
      pairs.push({
        learnerId: learner.id,
        managerId: manager.id,
      });
    }
  }
  return pairs;
}

/** Manager 0 gets learners 0–9, manager 1 gets 10–19, and so on — no overlap. */
function getUniqueLearnersForManager(
  learnersWithId,
  managerIndex,
  learnersPerManager,
) {
  let start = managerIndex * learnersPerManager;
  return learnersWithId.slice(start, start + learnersPerManager);
}

/** Learners are role=learner and email ending in @noemail.com. */
function isNoemailLearner(user) {
  if (String(user.role || "").toLowerCase() !== "learner") {
    return false;
  }
  let identity = String(
    user.email || user.loginName || user.externalId || "",
  ).toLowerCase();
  return identity.endsWith(NOEMAIL_SUFFIX);
}
