import {
  headerData,
  urlData,
  searchCustomJobRolesPayload,
  expect,
  logger,
} from "../../../path.js";

export async function searchCustomJobRolesApi(request, jwt, roleName) {
  try {
    const response = await request.post(urlData.searchCustomJobRolesUrl, {
      data: searchCustomJobRolesPayload(roleName),
      headers: headerData.getPrimaryJobRolesHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    const errors = body?.[0]?.errors || body?.errors || [];
    if (errors.length) {
      throw new Error(errors.map((error) => error.message).join("; "));
    }
    const roles = body?.[0]?.data?.kgPrimaryJobRoles || [];
    logger.info(`Searched custom roles for ${roleName}`);
    return roles;
  } catch (error) {
    logger.error(`Could not search custom roles for ${roleName}: ${error.message}`);
    throw error;
  }
}
