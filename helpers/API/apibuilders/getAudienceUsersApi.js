import {
  headerData,
  urlData,
  expect,
  getAudienceUsersPayload,
  reusableFunctions,
  logger,
} from "../../../path.js";

export async function getAudienceUsersApi(request, jwt, audienceId, audName) {
  try {
    let headerofGetAudienceUsers = headerData.getAudienceUsersHeaders(
      jwt,
      "application/json"
    );
    let resofGetAudienceUsers = await request.post(
      urlData.getAudienceUsersUrl(audienceId),
      {
        data: getAudienceUsersPayload(audienceId),
        headers: headerofGetAudienceUsers,
      }
    );
    expect(resofGetAudienceUsers.status()).toBe(200);
    logger.info(`Fetched All users for audience: ${audName}`);
    let resp = await resofGetAudienceUsers.json();
    logger.info(`User lenght before filtering ${resp.users.length}`);
    resp = reusableFunctions.filterUsersByEmail(resp);
    logger.info(`User lenght after filtering ${resp.users.length}`);
    return resp;
  } catch (error) {
    logger.error(
      `Failed to get all user info from audience due to error: ${error}`
    );
  }
}
