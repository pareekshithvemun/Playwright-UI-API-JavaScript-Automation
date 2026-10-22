import {
  headerData,
  urlData,
  tokenGeneratorWithOrgIdPayload,
  expect,
  logger,
  reusableFunctions,
  config,
} from "../../../path.js";

export async function generateTokenWithOrgId(request, retryCount = 0) {
  try {
    const username = config.get("Admindata").loginID;
    const password = config.get("Admindata").password;
    const organizationId = config.get("Environment").orgId;

    const res = await request.post(urlData.devtokenGeneratorapiUrl, {
      data: tokenGeneratorWithOrgIdPayload(username, password, organizationId),
      headers: headerData.tokenGeneratorApiHeader("application/json"),
    });
    expect(res.status()).toBe(200);
    const token = await res.json();
    let jwtToken = token["id_token"];
    logger.info(
      `Token has been generated in attempt ${
        retryCount + 1
      } for user ${username} in org ${organizationId}`
    );
    return jwtToken;
  } catch (error) {
    if (retryCount < 10) {
      logger.error(
        `Unable to generate token. Retrying... (Retry ${retryCount + 1} of 10)`
      );
      logger.error(error);
      await reusableFunctions.setTimer(500);
      generateTokenWithOrgId(request, retryCount + 1);
    } else {
      let errorMessage = `Retry limit exceeded (10 attempts). Unable to generate token. Error: ${error}`;
      logger.error(errorMessage);
    }
  }
}
