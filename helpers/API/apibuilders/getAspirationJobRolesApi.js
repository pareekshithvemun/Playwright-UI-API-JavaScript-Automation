import {
  headerData,
  expect,
  logger,
  urlData,
  getSimilarJobRolesPayload
} from "../../../path.js";

export async function getAspirationJobRolesApi(request, jwt, jobRoleUUID) {
  try {
    let getAspirationJobRolesApiHeaders = headerData.getAspirationJobRolesHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.getAspirationJobRolesUrl, {
      headers: getAspirationJobRolesApiHeaders,
      data: getSimilarJobRolesPayload(jobRoleUUID)
    });
    expect(res.status()).toBe(200);
    let resp = await res.json();
    logger.info(`All Aspiration Job roles has been extracted`);
    return resp;
  } catch (e) {
    logger.error(`Failed to extract Job Roles`);
  }
}
