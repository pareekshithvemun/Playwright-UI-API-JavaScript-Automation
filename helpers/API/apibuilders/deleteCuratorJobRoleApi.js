import {
  headerData,
  urlData,
  deleteCuratorJobRolePayload,
  deleteDraftCuratorJobRolesPayload,
  expect,
  logger,
} from "../../../path.js";

function reasonRoleWasNotDeleted(body) {
  const firstError = body?.errors?.[0];
  const code = firstError?.extensions?.code;
  const message = (firstError?.message || "").trim();
  if (code && message) return `${code}: ${message}`;
  if (code) return code;
  if (message) return message;
  return "the site refused the delete";
}

export async function deleteCuratorJobRoleApi(request, jwt, jobRoleId, jobRoleName) {
  try {
    const response = await request.post(urlData.curatorGraphqlUrl, {
      data: deleteCuratorJobRolePayload(jobRoleId),
      headers: headerData.generateJwtTokenHeaders(jwt),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    if (body?.errors?.length || body?.data?.skilzDeleteJobRole !== true) {
      const reason = reasonRoleWasNotDeleted(body);
      logger.info(`Not deleted | ${jobRoleName} | ${reason}`);
      return { deleted: false, reason };
    }
    logger.info(`Deleted | ${jobRoleName}`);
    return { deleted: true };
  } catch (error) {
    logger.error(`Could not delete ${jobRoleName}: ${error.message}`);
    throw error;
  }
}

export async function deleteDraftCuratorJobRoleApi(request, jwt, jobRoleId, jobRoleName) {
  try {
    const response = await request.post(urlData.curatorGraphqlUrl, {
      data: deleteDraftCuratorJobRolesPayload(jobRoleId),
      headers: headerData.generateJwtTokenHeaders(jwt),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    if (body?.errors?.length || body?.data?.skilzDeleteCuratorJobRoles !== true) {
      const reason = reasonRoleWasNotDeleted(body);
      logger.info(`Not deleted | ${jobRoleName} | draft | ${reason}`);
      return { deleted: false, reason };
    }
    logger.info(`Deleted | ${jobRoleName} | draft`);
    return { deleted: true };
  } catch (error) {
    logger.error(`Could not delete draft role ${jobRoleName}: ${error.message}`);
    throw error;
  }
}
