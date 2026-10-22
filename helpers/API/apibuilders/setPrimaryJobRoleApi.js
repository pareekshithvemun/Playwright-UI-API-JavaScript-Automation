import {
  headerData,
  expect,
  logger,
  urlData,
  setPrimaryJobRolePayload,
} from "../../../path.js";

export async function setPrimaryJobRoleApi(
  request,
  jwt,
  jobRoleUUID,
  roleName,
  user
) {
  try {
    let setPrimaryJobRolesApiHeaders = headerData.setPrimaryJobRoleHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.setPrimaryJobRoleUrl, {
      headers: setPrimaryJobRolesApiHeaders,
      data: setPrimaryJobRolePayload(jobRoleUUID),
    });
    expect(res.status()).toBe(200);
    let resp = await res.json();
    logger.info(
      `primary Job role uuid ${jobRoleUUID} and name of it is ${roleName} has been set for user :${user}`
    );
    return resp;
  } catch (e) {
    logger.error(`Failed to set primary  Job Role`);
  }
}
