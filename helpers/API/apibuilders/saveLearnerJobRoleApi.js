import {
  headerData,
  urlData,
  saveLearnerJobRolePayload,
  expect,
  logger,
} from "../../../path.js";

export async function saveLearnerJobRoleApi(request, jwt, jobRoleUuid, order, roleName, loginName) {
  try {
    const response = await request.post(urlData.setAspirationJobRoleUrl, {
      data: saveLearnerJobRolePayload(jobRoleUuid, order),
      headers: headerData.setAspirationJobRoleHeaders(jwt, "application/json"),
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    const errors = body?.[0]?.errors || body?.errors || [];
    if (errors.length) {
      throw new Error(errors.map((error) => error.message).join("; "));
    }
    const roleKind = order === 1 ? "current role" : "next role";
    logger.info(`Saved ${roleKind} | ${roleName} | ${loginName}`);
    return body;
  } catch (error) {
    logger.error(`Could not save ${roleName} for ${loginName}: ${error.message}`);
    throw error;
  }
}
