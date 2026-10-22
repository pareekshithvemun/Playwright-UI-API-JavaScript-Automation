import {
  headerData,
  urlData,
  reusableFunctions,
  expect,
  logger,
  getAllUsersBody,
} from "../../../path.js";

const USERS_PAGE_SIZE = 2500;

export async function getAllUserApi(request, jwt, query = null) {
  try {
    let allUsers = await fetchUsersFromOrgPaginated(request, jwt, query);
    logger.info("Fetched All users from org");
    logger.info(`User lenght before filtering ${allUsers.length}`);
    let resp = reusableFunctions.filterUsersByEmail({ users: allUsers });
    logger.info(`User lenght after filtering ${resp.users.length}`);
    return resp;
  } catch (error) {
    logger.error(
      `Failed to get all user info from org due to error: ${JSON.stringify(
        error,
      )}`,
    );
  }
}

// ===================== Helper Functions =====================

// UCM caps a single page; walk offset until a short page means the last page.
async function fetchUsersFromOrgPaginated(request, jwt, query) {
  let offset = 0;
  let allUsers = [];
  let headerofGetUserFromOrg = headerData.getAllUsersHeaders(
    jwt,
    "application/json",
  );

  while (true) {
    let resofGetAllUsers = await request.post(urlData.getUsersUrl, {
      data: getAllUsersBody(query, { max: USERS_PAGE_SIZE, offset, sort: "" }),
      headers: headerofGetUserFromOrg,
    });
    expect(resofGetAllUsers.status()).toBe(200);
    let page = await resofGetAllUsers.json();
    let pageUsers = page?.users ?? [];
    allUsers.push(...pageUsers);
    if (pageUsers.length < USERS_PAGE_SIZE) {
      break;
    }
    offset += USERS_PAGE_SIZE;
  }

  return allUsers;
}
