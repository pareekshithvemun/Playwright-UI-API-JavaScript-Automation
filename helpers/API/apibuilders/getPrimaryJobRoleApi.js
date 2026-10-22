import { headerData, expect, logger, urlData, getPrimaryJobRolesPayload } from "../../../path.js";

export async function getPrimaryJobRoleApi(request, jwt) {
  try {
    let getPrimaryJobRolesApiHeaders = headerData.getPrimaryJobRolesHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.getPrimaryJobRolesUrl, {
      headers: getPrimaryJobRolesApiHeaders,
      data: getPrimaryJobRolesPayload()
    });
    expect(res.status()).toBe(200);
    let resp = await res.json();
    logger.info(`All Job roles has been extracted`);
    return resp;
  } catch (e) {
    logger.error(`Failed to extract Job Roles`);
  }
}
