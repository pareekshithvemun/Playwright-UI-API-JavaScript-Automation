import {
  test,
  logger,
  generateToken,
  reusableFunctions,
  listCuratorJobRolesApi,
  deleteCuratorJobRoleApi,
  deleteDraftCuratorJobRoleApi,
} from "../../../path.js";

const PAGE_LIMIT = 100;
const REFRESH_WHEN_SECONDS_LEFT = 15;

test("Remove all custom job roles", async ({ request }, testInfo) => {
  testInfo.setTimeout(2400000);
  let adminToken = await freshAdminToken(request);
  const failedRoleIds = new Set();
  const deletedRoleNames = [];
  const notDeletedRoles = [];
  let pageNumber = 0;

  try {
    while (true) {
      pageNumber += 1;
      adminToken = await adminTokenIfStillFresh(request, adminToken);
      const jobRoles = await listCuratorJobRolesApi(
        request,
        adminToken.jwt,
        PAGE_LIMIT,
        0,
      );
      const rolesStillToDelete = jobRoles.filter(
        (role) => !failedRoleIds.has(role.id),
      );

      if (rolesStillToDelete.length === 0) {
        break;
      }

      logger.info(`Page ${pageNumber}: ${jobRoles.length} custom job roles`);

      for (const role of rolesStillToDelete) {
        adminToken = await adminTokenIfStillFresh(request, adminToken);
        try {
          const isDraftRole = Boolean(role.state) && role.state !== "published";
          const result = isDraftRole
            ? await deleteDraftCuratorJobRoleApi(request, adminToken.jwt, role.id, role.name)
            : await deleteCuratorJobRoleApi(request, adminToken.jwt, role.id, role.name);
          if (result.deleted) {
            deletedRoleNames.push(role.name);
          } else {
            failedRoleIds.add(role.id);
            notDeletedRoles.push({ name: role.name, reason: result.reason });
          }
        } catch (error) {
          failedRoleIds.add(role.id);
          notDeletedRoles.push({ name: role.name, reason: error.message });
          logger.info(`Not deleted | ${role.name} | ${error.message}`);
        }
      }

      if (jobRoles.length < PAGE_LIMIT) {
        break;
      }
    }
  } finally {
    logger.info(`Deleted count: ${deletedRoleNames.length}`);

    logger.info(`Not deleted list (${notDeletedRoles.length}):`);
    if (notDeletedRoles.length === 0) {
      logger.info("Not deleted | none");
    }
    for (const role of notDeletedRoles) {
      logger.info(`Not deleted | ${role.name} | ${role.reason}`);
    }
  }
});

// Admin token lasts about 10 minutes. Read exp from the token and replace it while a minute is still left.
async function freshAdminToken(request) {
  const jwt = await generateToken(request);
  const { exp } = await reusableFunctions.jwtDecoder(jwt);
  const expiresAtText = new Date(exp * 1000).toISOString();
  logger.info(`Admin token is ready. It expires at ${expiresAtText}.`);
  return { jwt, expiresAt: exp };
}

async function adminTokenIfStillFresh(request, adminToken) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const secondsLeft = adminToken.expiresAt - nowInSeconds;
  if (secondsLeft > REFRESH_WHEN_SECONDS_LEFT) {
    return adminToken;
  }
  logger.info(
    `Admin token has ${secondsLeft} seconds left. Getting a new one before it expires.`,
  );
  return freshAdminToken(request);
}
