import {
  test,
  expect,
  generateToken,
  logger,
  reusableFunctions,
  headerData,
  urlData,
  getAllUsersBody,
  putUserInactiveInOrg,
} from "../../../path.js";

const KEEP_ACTIVE_EMAILS = new Set([
  "kowshik.bikkina@skillsoft.com",
  "clayton.crouch@skillsoft.com",
]);

let jwt;

test.beforeAll(async ({ request }) => {
  jwt = await generateToken(request);
});

test.describe(
  "Deactivate active users except keep list from org @ucmDeactivateAllExceptKeepListFromOrg",
  () => {
    test("deactivate all active users except keep list", async ({ request }) => {
      test.setTimeout(7200000);

      const usersBefore = await fetchAllUsersFromOrg(request, jwt);
      const activeUsersToDeactivate = usersBefore.filter(
        (user) => user.status === "active" && !isKeepActiveUser(user),
      );

      logUserStatusSummary("BEFORE script", usersBefore, activeUsersToDeactivate);

      for (const user of activeUsersToDeactivate) {
        try {
          await putUserInactiveInOrg(
            request,
            jwt,
            user,
            `deactivate OK | ${userLabel(user)} | was active`,
          );
        } catch (error) {
          logger.error(
            `[${reusableFunctions.orgHostname()}] deactivate FAIL | ${userLabel(user)} | ${error.message}`,
          );
        }
      }

      const usersAfter = await fetchAllUsersFromOrg(request, jwt);
      logUserStatusSummary("AFTER script", usersAfter);

      const beforeCounts = countUsersByStatus(usersBefore);
      const afterCounts = countUsersByStatus(usersAfter);
      const host = reusableFunctions.orgHostname();
      logger.info(`[${host}] === Change summary (before → after) ===`);
      logger.info(
        `[${host}] total users: ${beforeCounts.total} → ${afterCounts.total}`,
      );
      logger.info(
        `[${host}] inactive: ${beforeCounts.inactive} → ${afterCounts.inactive}`,
      );
      logger.info(
        `[${host}] active: ${beforeCounts.active} → ${afterCounts.active}`,
      );
    });
  },
);

/** Full org user list from UCM (no filter in shared getAllUserApi). Filtering stays in this spec. */
async function fetchAllUsersFromOrg(request, jwt) {
  const res = await request.post(urlData.getUsersUrl, {
    data: getAllUsersBody(null),
    headers: headerData.getAllUsersHeaders(jwt, "application/json"),
  });
  await expect(res.status()).toBe(200);
  const body = await res.json();
  const users = body?.users ?? [];
  logger.info(
    `[${reusableFunctions.orgHostname()}] fetched ${users.length} users from org (unfiltered API response)`,
  );
  return users;
}

function countUsersByStatus(users) {
  const inactiveUsers = users.filter((user) => user.status === "inactive");
  const activeUsers = users.filter((user) => user.status === "active");
  return {
    total: users.length,
    inactive: inactiveUsers.length,
    active: activeUsers.length,
  };
}

function logUserStatusSummary(phaseLabel, users, activeUsersToDeactivate = []) {
  const host = reusableFunctions.orgHostname();
  const counts = countUsersByStatus(users);

  logger.info(`[${host}] === User status summary (${phaseLabel}) ===`);
  logger.info(`[${host}] total users in org: ${counts.total}`);
  logger.info(`[${host}] inactive: ${counts.inactive}`);
  logger.info(`[${host}] active: ${counts.active}`);

  if (phaseLabel.startsWith("BEFORE")) {
    logger.info(
      `[${host}] active to deactivate: ${activeUsersToDeactivate.length}`,
    );
  }
}

function userLabel(user) {
  return (
    user.email || user.loginName || user.externalId || user.id || "unknown"
  );
}

function isKeepActiveUser(user) {
  const emailLower = String(user.email ?? "")
    .trim()
    .toLowerCase();
  const loginLower = String(user.loginName ?? "")
    .trim()
    .toLowerCase();
  return (
    KEEP_ACTIVE_EMAILS.has(emailLower) || KEEP_ACTIVE_EMAILS.has(loginLower)
  );
}
