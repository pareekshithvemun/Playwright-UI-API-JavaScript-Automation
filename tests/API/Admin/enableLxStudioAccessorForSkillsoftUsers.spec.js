import {
  test,
  expect,
  generateToken,
  logger,
  reusableFunctions,
  headerData,
  urlData,
  enableLxStudioAccessorApi,
} from "../../../path.js";

const PAGE_SIZE = 5000;
const SKILLSOFT_SUFFIX = "@skillsoft.com";

let jwt;

test.beforeAll(async ({ request }) => {
  jwt = await generateToken(request);
});

test.describe("Enable LX Studio accessor for active Skillsoft users", () => {
  test("enable is_lx_studio_accessor for active Skillsoft users", async ({
    request,
  }) => {
    test.setTimeout(7200000);

    let host = reusableFunctions.orgHostname();
    let allUsers = await fetchAllUsersFromOrgPaginated(request, jwt);
    let activeSkillsoftUsers = allUsers.filter(isActiveSkillsoftUser);

    logger.info(`[${host}] total users fetched: ${allUsers.length}`);
    logger.info(
      `[${host}] active Skillsoft users to update: ${activeSkillsoftUsers.length}`,
    );

    let successCount = 0;
    let failCount = 0;
    for (let user of activeSkillsoftUsers) {
      let externalId = skillsoftExternalId(user);
      try {
        let ok = await enableLxStudioAccessorApi(
          request,
          jwt,
          user.id,
          externalId,
        );
        if (ok) {
          successCount += 1;
        } else {
          failCount += 1;
        }
      } catch (error) {
        failCount += 1;
        logger.error(
          `[${host}] LX Studio accessor FAIL | ${externalId} | ${error.message}`,
        );
      }
    }

    logger.info(
      `[${host}] LX Studio accessor done | success ${successCount} | fail ${failCount} | target ${activeSkillsoftUsers.length}`,
    );
  });
});

/** Paginate UCM users POST so large orgs are fully covered (shared getAllUsersBody max is too small alone). */
async function fetchAllUsersFromOrgPaginated(request, jwt) {
  let offset = 0;
  let allUsers = [];
  while (true) {
    let res = await request.post(urlData.getUsersUrl, {
      data: {
        q: null,
        max: PAGE_SIZE,
        offset,
        sort: "lastName,firstName",
        roles: [],
      },
      headers: headerData.getAllUsersHeaders(jwt, "application/json"),
    });
    await expect(res.status()).toBe(200);
    let body = await res.json();
    let pageUsers = body?.users ?? [];
    allUsers.push(...pageUsers);
    if (pageUsers.length < PAGE_SIZE) {
      break;
    }
    offset += PAGE_SIZE;
  }
  return allUsers;
}

/** Active user whose loginName or externalId ends with @skillsoft.com. */
function isActiveSkillsoftUser(user) {
  if ((user.status || "").toLowerCase() !== "active") {
    return false;
  }
  return skillsoftExternalId(user) !== null;
}

/** Prefer externalId, else loginName, when the value ends with @skillsoft.com. */
function skillsoftExternalId(user) {
  let externalId = String(user.externalId || "").trim();
  let loginName = String(user.loginName || "").trim();
  if (externalId.toLowerCase().endsWith(SKILLSOFT_SUFFIX)) {
    return externalId;
  }
  if (loginName.toLowerCase().endsWith(SKILLSOFT_SUFFIX)) {
    return loginName;
  }
  return null;
}
