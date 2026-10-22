/**
 * ONE-TIME SCRIPT — lives under tests/oneTimeScripts/ (not API/UI feature folders).
 *
 * Content Eval only. Fetches every UCM user, matches the FileName list, and
 * for each found person sets status active, password Welcome1, and the
 * Date Created DATE attribute to 9/11/26. Missing people are logged as
 * no user found and skipped.
 *
 * Do not use getAllUserApi — that helper drops @mphasis.com emails.
 *
 * Run: npm run editContentevalMphasisUsers
 * Optional: FileName=contentevalMphasisUsers (default)
 */
import {
  test,
  expect,
  generateToken,
  logger,
  reusableFunctions,
  headerData,
  urlData,
  getAllUsersBody,
  getAllAttributesApi,
  userStatusPutBody,
} from "../../path.js";

const PAGE_SIZE = 2500;
const fileName = (process.env.FileName || "contentevalMphasisUsers").trim();
const testData = reusableFunctions.readDatafromJsonFilenotasync(
  reusableFunctions.getPath("testData/usersData", `${fileName}.json`),
);
const password = String(testData.password || "").trim();
const dateCreatedAttributeName = String(
  testData.dateCreatedAttributeName || "Date Created",
).trim();
const dateCreated = String(testData.dateCreated || "").trim();
const listedUsers = testData.users || [];

test.describe.serial("Content Eval listed users", () => {
  test("Activate listed users and set password and date created", async ({
    request,
  }) => {
    test.setTimeout(600000);
    let jwt = await generateToken(request);
    expect(jwt).toBeTruthy();
    expect(password).toBeTruthy();
    expect(dateCreatedAttributeName).toBeTruthy();
    expect(dateCreated).toBeTruthy();
    expect(listedUsers.length).toBeGreaterThan(0);

    let attributeResult = await getAllAttributesApi(
      request,
      jwt,
      dateCreatedAttributeName,
    );
    let dateCreatedAttributeId = attributeResult?.customAttributeUuid;
    expect(dateCreatedAttributeId).toBeTruthy();
    logger.info(
      `Using ${dateCreatedAttributeName} attribute id=${dateCreatedAttributeId}`,
    );

    let orgUsers = await fetchAllOrgUsers(request, jwt);
    logger.info(`Fetched ${orgUsers.length} users from Content Eval`);

    let updatedCount = 0;
    let notFoundCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (let row of listedUsers) {
      let matches = findOrgUsersForRow(orgUsers, row);
      if (matches.length === 0) {
        notFoundCount += 1;
        logger.info(
          `no user found for ${rowLabel(row)}`,
        );
        continue;
      }
      if (matches.length > 1) {
        skippedCount += 1;
        logger.info(
          `Skipped ${rowLabel(row)} because more than one user matched`,
        );
        continue;
      }

      let user = matches[0];
      if (!user.id) {
        skippedCount += 1;
        logger.info(`Skipped ${rowLabel(row)} because the matched user has no id`);
        continue;
      }

      logger.info(
        `Found ${rowLabel(row)} id=${user.id} status=${user.status || "unknown"}`,
      );

      let didSucceed = await updateFoundUser(
        request,
        jwt,
        user,
        dateCreatedAttributeId,
      );
      if (didSucceed) {
        updatedCount += 1;
      } else {
        failedCount += 1;
      }
    }

    logger.info(
      `Content Eval listed users done. Updated ${updatedCount}. No user found ${notFoundCount}. Skipped ${skippedCount}. Failed ${failedCount}.`,
    );
    expect(failedCount).toBe(0);
  });
});

// ===================== Helper Functions =====================

// Shared getAllUserApi drops non-skillsoft emails; page here so @mphasis.com stays in the list.
async function fetchAllOrgUsers(request, token) {
  let offset = 0;
  let allUsers = [];
  while (true) {
    let response = await request.post(urlData.getUsersUrl, {
      data: getAllUsersBody(null, {
        max: PAGE_SIZE,
        offset,
        sort: "",
      }),
      headers: headerData.getAllUsersHeaders(token, "application/json"),
    });
    expect(response.status()).toBe(200);
    let page = await response.json();
    let pageUsers = page.users || [];
    allUsers.push(...pageUsers);
    if (pageUsers.length < PAGE_SIZE) {
      break;
    }
    offset += PAGE_SIZE;
  }
  return allUsers;
}

function normalizeIdentity(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

// Sheet loginName is an employee number; live UCM loginName/externalId were the username.
function rowIdentityValues(row) {
  return [
    normalizeIdentity(row.loginName),
    normalizeIdentity(row.email),
    normalizeIdentity(row.username),
  ].filter(Boolean);
}

function orgUserIdentityValues(user) {
  return [
    normalizeIdentity(user.email),
    normalizeIdentity(user.loginName),
    normalizeIdentity(user.externalId),
  ].filter(Boolean);
}

function findOrgUsersForRow(orgUsers, row) {
  let wanted = new Set(rowIdentityValues(row));
  return orgUsers.filter((user) =>
    orgUserIdentityValues(user).some((value) => wanted.has(value)),
  );
}

function rowLabel(row) {
  return `${row.loginName} / ${row.username} / ${row.email}`;
}

// Live Date Created attribute value is YYYY-MM-DD, type_name DATE, not the user date field.
function activateListedUserBody(user, dateCreatedAttributeId) {
  let externalId = user.externalId || user.email || user.loginName;
  let body = userStatusPutBody("active", externalId);
  body.password = password;
  body.must_reset_password = false;
  body.custom_attributes = [
    {
      custom_attribute_id: dateCreatedAttributeId,
      value: dateCreated,
      type_name: "DATE",
    },
  ];
  return body;
}

async function updateFoundUser(request, token, user, dateCreatedAttributeId) {
  let response = await request.put(urlData.ediAdminUserUrl(user.id), {
    data: activateListedUserBody(user, dateCreatedAttributeId),
    headers: headerData.editAdminUserHeaders(token, "application/json"),
  });
  if (response.status() !== 200) {
    let errorText = await response.text();
    logger.error(
      `Update failed for id=${user.id} (${response.status()}): ${errorText.slice(0, 400)}`,
    );
    return false;
  }
  logger.info(`Updated id=${user.id}`);
  return true;
}
