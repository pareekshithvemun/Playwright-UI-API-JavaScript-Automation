/**
 * ONE-TIME SCRIPT — lives under tests/oneTimeScripts/ (not API/UI feature folders).
 *
 * Create 1 Learning Admin (no custom attributes), then 17 learners
 * (one per Available Collection). Every learner gets Created By =
 * Learning Admin user uuid (UI shows FirstName LastName) plus exactly one
 * collection attribute.
 *
 * Run: NODE_ENV=percipioeval npm run createLearningAdminAndCollectionLearners
 * Optional: FileName=collectionLearnersPercipioeval (default)
 */
import {
  test,
  expect,
  generateToken,
  fetchRoleUuid,
  getAllAttributesApi,
  createOrgUserWithAttributesApi,
  reusableFunctions,
  headerData,
  urlData,
  logger,
  config,
} from "../../path.js";

const fileName = (process.env.FileName || "collectionLearnersPercipioeval").trim();
const testDataPath = reusableFunctions.getPath(
  "testData/usersData",
  `${fileName}.json`,
);
const testData = reusableFunctions.readDatafromJsonFilenotasync(testDataPath);
const password = testData.password || config.get("Admindata").password;
const learningAdminData = testData.learningAdmin;
const learnerRows = testData.learners || [];

let jwt;
let learningAdminRoleUuid;
let learnerRoleUuid;
let learnerRoleString = "learner";
let createdByAttributeId;
let attributeIdByName = {};
let learningAdminDisplayName;
let learningAdminUserId;

// ===================== Helper Functions =====================

// Stable noemail.com login from first + last name only (no timestamp).
function buildEmail(firstName, lastName) {
  const safeFirst = String(firstName || "user")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const safeLast = String(lastName || "test")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return `${safeFirst}.${safeLast}@noemail.com`;
}

// Resolves LearningAdmin role uuid (org role name has no space).
async function resolveLearningAdminRoleUuid(request, token) {
  const withoutSpace = await fetchRoleUuid(request, token, "LearningAdmin");
  if (withoutSpace) return withoutSpace;
  return fetchRoleUuid(request, token, "Learning Admin");
}

// Looks up customAttributeUuid by display name; throws if missing in this org.
async function requireAttributeId(request, token, attributeName) {
  const result = await getAllAttributesApi(request, token, attributeName);
  const attributeId = result?.customAttributeUuid;
  if (!attributeId) {
    throw new Error(`Custom attribute not found in org: ${attributeName}`);
  }
  return attributeId;
}

// Builds Created By (USER uuid) plus one collection VALUE attribute for a learner.
function buildLearnerCustomAttributes(learnerRow, createdByUserId) {
  const collectionValue = learnerRow.isMultiValue
    ? [learnerRow.attributeValue]
    : learnerRow.attributeValue;
  return [
    {
      custom_attribute_id: createdByAttributeId,
      value: createdByUserId,
      type_name: "USER",
    },
    {
      custom_attribute_id: attributeIdByName[learnerRow.attributeName],
      value: collectionValue,
      type_name: "VALUE",
    },
  ];
}

// Logs Partner Content Options allowed values for debugging.
async function logPartnerContentOptionValues(request, token, partnerAttributeId) {
  try {
    const response = await request.get(
      urlData.getValuesOfListAttriHeadersUrl(partnerAttributeId),
      { headers: headerData.getValuesOfListAttriHeaders(token) },
    );
    if (response.status() !== 200) {
      logger.info(`Partner Content Options values lookup returned ${response.status()}`);
      return;
    }
    const body = await response.json();
    const rawList = Array.isArray(body)
      ? body
      : Array.isArray(body.values)
        ? body.values
        : Array.isArray(body.attributeValues)
          ? body.attributeValues
          : [];
    const values = rawList
      .map((entry) =>
        typeof entry === "string" ? entry : entry.value || entry.name || "",
      )
      .filter(Boolean);
    logger.info(
      `Partner Content Options allowed values (${values.length}): ${values.join(" | ")}`,
    );
  } catch (error) {
    logger.error(`Could not list Partner Content Options values: ${error.message}`);
  }
}

test.beforeAll(async ({ request }) => {
  test.setTimeout(180000);
  jwt = await generateToken(request);
  expect(jwt).toBeTruthy();

  learningAdminRoleUuid = await resolveLearningAdminRoleUuid(request, jwt);
  expect(learningAdminRoleUuid).toBeTruthy();
  learnerRoleUuid = await fetchRoleUuid(request, jwt, "learner");
  if (!learnerRoleUuid) {
    learnerRoleUuid = await fetchRoleUuid(request, jwt, "Learner");
  }
  if (!learnerRoleUuid) {
    learnerRoleString = "learner";
    logger.info("Learner role uuid not in role-privileges; using role string learner");
  }

  createdByAttributeId = await requireAttributeId(request, jwt, "Created By");
  const uniqueAttributeNames = [
    ...new Set(learnerRows.map((row) => row.attributeName)),
  ];
  for (const attributeName of uniqueAttributeNames) {
    attributeIdByName[attributeName] = await requireAttributeId(
      request,
      jwt,
      attributeName,
    );
  }

  if (attributeIdByName["Partner Content Options"]) {
    await logPartnerContentOptionValues(
      request,
      jwt,
      attributeIdByName["Partner Content Options"],
    );
  }

  logger.info(
    `Ready to create Learning Admin + ${learnerRows.length} collection learners`,
  );
});

test.describe.serial("Learning Admin and collection learners", () => {
  test("Create Learning Admin with no custom attributes", async ({ request }) => {
    const email = buildEmail(
      learningAdminData.firstName,
      learningAdminData.lastName,
    );
    const result = await createOrgUserWithAttributesApi(request, jwt, {
      firstName: learningAdminData.firstName,
      lastName: learningAdminData.lastName,
      email,
      password,
      roleUuid: learningAdminRoleUuid,
      customAttributes: [],
    });
    expect(result.success).toBe(true);
    learningAdminUserId = result.id;
    expect(learningAdminUserId).toBeTruthy();
    learningAdminDisplayName = `${learningAdminData.firstName} ${learningAdminData.lastName}`;
    logger.info(
      `Learning Admin ${learningAdminDisplayName} id=${learningAdminUserId}`,
    );
    logger.info(`Learning Admin email: ${email}`);
  });

  for (const learnerRow of learnerRows) {
    test(`Create learner for ${learnerRow.label}`, async ({ request }) => {
      expect(learningAdminUserId).toBeTruthy();
      expect(attributeIdByName[learnerRow.attributeName]).toBeTruthy();

      const email = buildEmail(learnerRow.firstName, learnerRow.lastName);
      const result = await createOrgUserWithAttributesApi(request, jwt, {
        firstName: learnerRow.firstName,
        lastName: learnerRow.lastName,
        email,
        password,
        roleUuid: learnerRoleUuid || undefined,
        role: learnerRoleUuid ? undefined : learnerRoleString,
        customAttributes: buildLearnerCustomAttributes(
          learnerRow,
          learningAdminUserId,
        ),
      });
      expect(result.success).toBe(true);
      logger.info(
        `Learner ${email}: Created By=${learningAdminDisplayName}; ${learnerRow.attributeName}=${learnerRow.attributeValue}`,
      );
    });
  }
});
