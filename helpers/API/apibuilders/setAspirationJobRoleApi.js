import {
  headerData,
  expect,
  logger,
  urlData,
  setAspirationJobRolePayload,
} from "../../../path.js";

export async function setAspirationJobRoleApi(
  request,
  jwt,
  jobRoleUuid,
  aspirationRoleName,
  user
) {
  try {
    let setAspirationJobRolesApiHeaders =
      headerData.setAspirationJobRoleHeaders(jwt, "application/json");
    let res = await request.post(urlData.setAspirationJobRoleUrl, {
      headers: setAspirationJobRolesApiHeaders,
      data: setAspirationJobRolePayload(jobRoleUuid),
    });
    expect(res.status()).toBe(200);
    let resp = await res.json();
    logger.info(
      `Successfully assigned aspirational role uuid ${jobRoleUuid} and name linked to it is ${aspirationRoleName} to user ${user}`
    );
    return resp;
  } catch (e) {
    logger.error(`Failed to set Job Role`);
  }
}
