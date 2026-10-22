import {
  headerData,
  urlData,
  listCuratorJobRolesPayload,
  expect,
  logger,
} from "../../../path.js";

export async function listCuratorJobRolesApi(request, jwt, limit, offset, includeUnPublishedOnly = false) {
  try {
    const response = await request.post(urlData.curatorGraphqlUrl, {
      data: listCuratorJobRolesPayload(limit, offset, includeUnPublishedOnly),
      headers: headerData.generateJwtTokenHeaders(jwt),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    if (body?.errors?.length) {
      const errorText = body.errors.map((error) => error.message).join("; ");
      throw new Error(errorText);
    }
    const jobRoles = body?.data?.skilzListCuratorJobRoles || [];
    logger.info(`Listed ${jobRoles.length} custom job roles`);
    return jobRoles;
  } catch (error) {
    logger.error(`Could not list custom job roles: ${error.message}`);
    throw error;
  }
}
