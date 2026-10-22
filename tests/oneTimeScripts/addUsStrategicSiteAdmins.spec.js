/**
 * ONE-TIME SCRIPT — lives under tests/oneTimeScripts/ (not API/UI feature folders).
 *
 * Adds Site Admins on the US Strategic child sites from FileName JSON.
 * Each site gets its named people plus one common admin on every site.
 * Site Admin role uuid comes from Clayton on that site via getUsers.
 * Site URLs, logins, and password come from that JSON only — not from config.
 *
 * Run: npm run addUsStrategicSiteAdmins
 * Optional: FileName=usStrategicSiteAdmins (default)
 */
import {
  test,
  expect,
  logger,
  reusableFunctions,
  headerData,
  searchUserBody,
  tokenGeneratorWithOrgIdPayload,
} from "../../path.js";

const fileName = (process.env.FileName || "usStrategicSiteAdmins").trim();
const testData = reusableFunctions.readDatafromJsonFilenotasync(
  reusableFunctions.getPath("testData/usersData", `${fileName}.json`),
);
const callerLogin = String(testData.callerLogin || "").trim();
const password = String(testData.password || "").trim();
const commonAdmin = testData.commonAdmin;
const sites = testData.sites || [];

// ===================== Helper Functions =====================

// Sheet URLs often end with /; API paths must not double the slash.
function normalizeSiteUrl(siteUrl) {
  return String(siteUrl || "")
    .trim()
    .replace(/\/+$/, "");
}

// Login is an email; match any of the three UCM identity fields.
function userEmailFieldsMatch(user, searchLower) {
  let email = String(user.email || "")
    .trim()
    .toLowerCase();
  let loginName = String(user.loginName || "")
    .trim()
    .toLowerCase();
  let externalId = String(user.externalId || "")
    .trim()
    .toLowerCase();
  return (
    email === searchLower ||
    loginName === searchLower ||
    externalId === searchLower
  );
}

function emailsMatch(left, right) {
  return (
    String(left || "")
      .trim()
      .toLowerCase() ===
    String(right || "")
      .trim()
      .toLowerCase()
  );
}

// Named people on the site plus the one person who is admin on every site.
// Clayton is already on every site and is only used to sign in and copy role uuid.
function usersForSite(site) {
  let siteAdmins = (site.admins || []).map((admin) => ({
    firstName: String(admin.firstName || "").trim(),
    lastName: String(admin.lastName || "").trim(),
    email: String(admin.email || "").trim(),
  }));
  if (commonAdmin?.email) {
    siteAdmins.push({
      firstName: String(commonAdmin.firstName || "").trim(),
      lastName: String(commonAdmin.lastName || "").trim(),
      email: String(commonAdmin.email || "").trim(),
    });
  }
  return siteAdmins.filter(
    (admin) => admin.email && !emailsMatch(admin.email, callerLogin),
  );
}

// Same create body as the working Annie call; role uuid is Clayton's on this site.
function siteAdminCreateBody(user, roleUuid) {
  let now = new Date().toISOString();
  return {
    status: "active",
    attributes: [],
    scheduled_email: { send_email: false, send_at: now },
    date: now,
    is_lx_studio_accessor: true,
    can_create_community: false,
    role_uuid: roleUuid,
    is_lx_studio_publisher: true,
    external_id: user.email,
    login_name: user.email,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    password,
    is_instructor: true,
  };
}

// Sign in on this site URL with that site's org id so we never pick a host from config.
async function authenticateOnSite(request, siteUrl, login, organizationId) {
  let res = await request.post(`${siteUrl}/api/public/auth/authenticate`, {
    data: tokenGeneratorWithOrgIdPayload(login, password, organizationId),
    headers: headerData.tokenGeneratorApiHeader("application/json"),
  });
  if (res.status() !== 200) {
    let errorText = await res.text();
    logger.error(
      `Could not sign in on ${siteUrl} as ${login} (${res.status()}): ${errorText.slice(0, 300)}`,
    );
    return null;
  }
  let body = await res.json();
  logger.info(`Signed in on ${siteUrl} as ${login}`);
  return body.id_token;
}

// Look up by email so we update an existing person instead of creating a duplicate.
async function findUserOnSite(request, siteUrl, token, email) {
  let searchLower = email.toLowerCase();
  let res = await request.post(`${siteUrl}/api/ucm/users`, {
    data: searchUserBody(email),
    headers: headerData.getAllUsersHeaders(token, "application/json"),
  });
  if (res.status() !== 200) {
    logger.error(`User search failed on ${siteUrl} for ${email}`);
    return null;
  }
  let body = await res.json();
  let users = body.users || [];
  for (let user of users) {
    if (userEmailFieldsMatch(user, searchLower)) {
      return user;
    }
  }
  return null;
}

// Site Admin is not in the roles API; Clayton already has that role uuid on each site.
async function roleUuidFromClayton(request, siteUrl, token) {
  let clayton = await findUserOnSite(request, siteUrl, token, callerLogin);
  let roleUuid = clayton?.roleUuid;
  if (!roleUuid) {
    logger.error(
      `Could not get Site Admin role uuid from ${callerLogin} on ${siteUrl}`,
    );
    return null;
  }
  logger.info(`Using Clayton role uuid from getUsers on ${siteUrl}`);
  return roleUuid;
}

async function createSiteAdminOnSite(
  request,
  siteUrl,
  token,
  user,
  roleUuid,
) {
  let res = await request.post(`${siteUrl}/api/ucm/users/new`, {
    data: siteAdminCreateBody(user, roleUuid),
    headers: headerData.createUserHeader(token, "application/json"),
  });
  if (res.status() !== 200) {
    let errorText = await res.text();
    logger.error(
      `Create failed on ${siteUrl} for ${user.email} (${res.status()}): ${errorText.slice(0, 400)}`,
    );
    return false;
  }
  logger.info(`Created Site Admin ${user.email} on ${siteUrl}`);
  return true;
}

async function updateSiteAdminOnSite(
  request,
  siteUrl,
  token,
  userId,
  user,
  roleUuid,
) {
  let res = await request.put(`${siteUrl}/api/ucm/users/${userId}`, {
    data: siteAdminCreateBody(user, roleUuid),
    headers: headerData.editAdminUserHeaders(token, "application/json"),
  });
  if (res.status() !== 200) {
    let errorText = await res.text();
    logger.error(
      `Update failed on ${siteUrl} for ${user.email} (${res.status()}): ${errorText.slice(0, 400)}`,
    );
    return false;
  }
  logger.info(`Updated Site Admin ${user.email} on ${siteUrl}`);
  return true;
}

test.describe.serial("US Strategic Site Admins", () => {
  test("Add site admins on each listed child site", async ({ request }) => {
    test.setTimeout(600000);
    expect(callerLogin).toBeTruthy();
    expect(password).toBeTruthy();
    expect(sites.length).toBeGreaterThan(0);

    logger.info(
      "Config banner can show demoprep. API calls use only the site URLs from the FileName JSON.",
    );
    for (let site of sites) {
      logger.info(
        `Will call ${site.siteName}: ${normalizeSiteUrl(site.siteUrl)}`,
      );
    }

    let createdCount = 0;
    let updatedCount = 0;
    let failedCount = 0;

    for (let site of sites) {
      let siteUrl = normalizeSiteUrl(site.siteUrl);
      let siteUsers = usersForSite(site);
      logger.info(
        `Starting ${site.siteName} (${siteUrl}) with ${siteUsers.length} Site Admins`,
      );

      let organizationId = String(site.organizationId || "").trim();
      if (!organizationId) {
        logger.error(`No organization id in data for ${site.siteName}`);
        failedCount += siteUsers.length;
        continue;
      }

      let token = await authenticateOnSite(
        request,
        siteUrl,
        callerLogin,
        organizationId,
      );
      if (!token) {
        failedCount += siteUsers.length;
        continue;
      }

      let roleUuid = await roleUuidFromClayton(request, siteUrl, token);
      if (!roleUuid) {
        failedCount += siteUsers.length;
        continue;
      }

      for (let user of siteUsers) {
        let existing = await findUserOnSite(
          request,
          siteUrl,
          token,
          user.email,
        );
        let didSucceed = existing
          ? await updateSiteAdminOnSite(
              request,
              siteUrl,
              token,
              existing.id,
              user,
              roleUuid,
            )
          : await createSiteAdminOnSite(
              request,
              siteUrl,
              token,
              user,
              roleUuid,
            );
        if (didSucceed) {
          if (existing) {
            updatedCount += 1;
          } else {
            createdCount += 1;
          }
        } else {
          failedCount += 1;
        }
      }
    }

    logger.info(
      `US Strategic Site Admins done. Created ${createdCount}. Updated ${updatedCount}. Failed ${failedCount}.`,
    );
    expect(failedCount).toBe(0);
  });
});
