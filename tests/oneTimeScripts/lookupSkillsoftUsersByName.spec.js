/**
 * ONE-TIME / read-only — looks up Skillsoft users in the active org by first + last name.
 * Fills email and job title. Does not create or update users.
 *
 * Run: NODE_ENV=percipiodemo npx playwright test tests/oneTimeScripts/lookupSkillsoftUsersByName.spec.js
 * Optional: FileName=lookupSkillsoftUsersByName (default)
 */
import {
  test,
  expect,
  generateToken,
  getAllUserApi,
  reusableFunctions,
  headerData,
  urlData,
  logger,
} from "../../path.js";

const SKILLSOFT_SUFFIX = "@skillsoft.com";
const MISSING_MAIL = "missing mail";
const MISSING_TITLE = "missing title";
const NOT_FOUND = "not found";
const fileName = (process.env.FileName || "lookupSkillsoftUsersByName").trim();
const rows = reusableFunctions.readDatafromJsonFilenotasync(
  reusableFunctions.getPath("testData/usersData", `${fileName}.json`),
);

let jwt;

test.beforeAll("Generate Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Lookup Skillsoft email and title by first and last name", async ({
  request,
}) => {
  test.setTimeout(300000);
  expect(jwt).toBeTruthy();

  let fetchResult = await getAllUserApi(request, jwt);
  let orgUsers = fetchResult?.users || [];
  let skillsoftUsers = orgUsers.filter((user) =>
    isSkillsoftEmail(userEmail(user)),
  );

  logger.info(
    `Skillsoft users available for name match: ${skillsoftUsers.length}`,
  );

  let foundCount = 0;
  let notFoundCount = 0;
  logger.info("First Name\tLast Name\tEmail\tTitle\tTeam");

  for (let row of rows) {
    let match = findSkillsoftUserByName(skillsoftUsers, row);
    if (!match) {
      match = await searchSkillsoftUserByName(request, jwt, row);
    }
    if (!match) {
      match = await searchSkillsoftUserByGuessedEmail(request, jwt, row);
    }

    if (!match) {
      notFoundCount += 1;
      logger.info(
        `${row.firstName}\t${row.lastName}\t${NOT_FOUND}\t${NOT_FOUND}\t${row.team}`,
      );
      continue;
    }

    foundCount += 1;
    let detail = await fetchUserById(request, jwt, match.id);
    let source = detail || match;
    let email = userEmail(source) || userEmail(match) || MISSING_MAIL;
    let title = userTitle(source) || userTitle(match) || MISSING_TITLE;
    logger.info(
      `${row.firstName}\t${row.lastName}\t${email}\t${title}\t${row.team}`,
    );
  }

  logger.info(
    `Lookup done. Found ${foundCount}. Not found ${notFoundCount}. Listed ${rows.length}.`,
  );
});

// ===================== Helper Functions =====================

// Accents and extra spaces should not block a first + last name match.
function normalizeName(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function userEmail(user) {
  return String(user?.email || "").trim();
}

function isSkillsoftEmail(email) {
  return email.toLowerCase().endsWith(SKILLSOFT_SUFFIX);
}

// Job title may be a user field or the Job Title custom attribute.
function userTitle(user) {
  let direct = String(
    user?.jobTitle || user?.job_title || user?.title || user?.jobRole || "",
  ).trim();
  if (direct) {
    return direct;
  }
  let attributes = user?.customAttributes || user?.custom_attributes || [];
  if (!Array.isArray(attributes)) {
    return "";
  }
  for (let attribute of attributes) {
    let attributeName = String(
      attribute.name || attribute.attributeName || "",
    )
      .trim()
      .toLowerCase();
    if (attributeName !== "job title" && attributeName !== "title") {
      continue;
    }
    let rawValue =
      attribute.value ??
      attribute.text ??
      (Array.isArray(attribute.values) ? attribute.values[0] : "");
    let title = String(rawValue || "").trim();
    if (title) {
      return title;
    }
  }
  return "";
}

function namesMatch(user, row) {
  return (
    normalizeName(user.firstName) === normalizeName(row.firstName) &&
    normalizeName(user.lastName) === normalizeName(row.lastName)
  );
}

// Prefer an active Skillsoft user when more than one name match exists.
function findSkillsoftUserByName(users, row) {
  let matches = users.filter((user) => namesMatch(user, row));
  if (!matches.length) {
    return null;
  }
  let activeMatches = matches.filter(
    (user) => String(user.status || "").toLowerCase() === "active",
  );
  let pool = activeMatches.length ? activeMatches : matches;
  let withEmail = pool.find((user) => userEmail(user));
  return withEmail || pool[0];
}

async function searchSkillsoftUserByName(request, jwt, row) {
  let searchResult = await getAllUserApi(
    request,
    jwt,
    `${row.firstName} ${row.lastName}`,
  );
  let searchedUsers = (searchResult?.users || []).filter((user) =>
    isSkillsoftEmail(userEmail(user)),
  );
  return findSkillsoftUserByName(searchedUsers, row);
}

// Same first.last@skillsoft.com pattern used by most Skillsoft logins in this org.
async function searchSkillsoftUserByGuessedEmail(request, jwt, row) {
  let guesses = guessedSkillsoftEmails(row);
  for (let guess of guesses) {
    let searchResult = await getAllUserApi(request, jwt, guess);
    let users = searchResult?.users || [];
    let match = users.find((user) => {
      let email = userEmail(user).toLowerCase();
      let login = String(user.loginName || "").trim().toLowerCase();
      let externalId = String(user.externalId || "").trim().toLowerCase();
      return (
        email === guess ||
        login === guess ||
        externalId === guess
      );
    });
    if (match && isSkillsoftEmail(userEmail(match) || guess)) {
      return match;
    }
  }
  return null;
}

function guessedSkillsoftEmails(row) {
  let first = normalizeName(row.firstName).replace(/ /g, ".");
  let last = normalizeName(row.lastName).replace(/ /g, ".");
  let compactFirst = first.replace(/\./g, "");
  return [
    `${first}.${last}${SKILLSOFT_SUFFIX}`,
    `${compactFirst}.${last}${SKILLSOFT_SUFFIX}`,
  ];
}

// List search often omits job title; GET /api/ucm/users/{id} has the full profile.
async function fetchUserById(request, jwt, userId) {
  if (!userId) {
    return null;
  }
  let response = await request.get(urlData.ediAdminUserUrl(userId), {
    headers: headerData.getAllUsersHeaders(jwt, "application/json"),
  });
  if (response.status() !== 200) {
    return null;
  }
  let body = await response.json();
  return body.user || body;
}
