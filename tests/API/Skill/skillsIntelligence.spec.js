import {
  test,
  logger,
  generateToken,
  reusableFunctions,
  skillsIntelligenceOrgSettingsApi,
  listRoleClassificationsApi,
  listCuratorJobRolesApi,
  importCuratorJobRolesApi,
  publishCuratorJobRolesApi,
} from "../../../path.js";

const sheetFolder = "testData/skillIntelligence";

// Once per org. Career Center keys only, so other site settings stay as they are.
test("Turn on Career Center org settings @skillsIntelligenceSettings", async ({
  request,
}) => {
  test.setTimeout(120000);
  const jwt = await generateToken(request);
  await skillsIntelligenceOrgSettingsApi(request, jwt);
});

test("Import custom job roles from the sheet @importCustomJobRoles", async ({
  request,
}) => {
  test.setTimeout(2400000);
  const sheetRows = sheetRowsFromFile();
  if (!sheetRows.length) {
    return;
  }

  const jwt = await generateToken(request);
  const classifications = await listRoleClassificationsApi(request, jwt);
  const jobRoles = jobRolesFromSheetRows(sheetRows, classifications);
  logger.info(`Ready to import ${jobRoles.length} roles`);
  await importCuratorJobRolesApi(request, jwt, jobRoles);
});

// Publishing while a role is still importing does nothing, so check the counts first.
// Published roles are not on the unpublished list, so this count reads every custom role.
test("Count draft and importing custom job roles @countCustomJobRoles", async ({
  request,
}) => {
  test.setTimeout(120000);
  const jwt = await generateToken(request);
  const customJobRoles = await allCustomJobRoles(request, jwt, false);
  const countByState = new Map();

  for (const role of customJobRoles) {
    const state = role.state || "no state";
    countByState.set(state, (countByState.get(state) || 0) + 1);
  }

  // importing: the sheet just landed. Do not publish yet. That call does nothing.
  // draft: import is done. Safe to publish. Live skills have not changed yet.
  // Publish only after the status has changed from importing to draft.
  // pending: publish was sent. The role is waiting to go live.
  // published: the role is live. The sheet skills are on the site.
  const draftCount = countByState.get("draft") || 0;
  const importingCount = countByState.get("importing") || 0;
  const pendingCount = countByState.get("pending") || 0;
  const publishedCount = countByState.get("published") || 0;
  logger.info(
    `Draft ${draftCount}. Importing ${importingCount}. Pending ${pendingCount}. Published ${publishedCount}. Total ${customJobRoles.length}.`,
  );
});

test("Publish draft custom job roles @publishCustomJobRoles", async ({
  request,
}) => {
  test.setTimeout(2400000);
  const jwt = await generateToken(request);
  const unpublishedRoles = await allCustomJobRoles(request, jwt, true);
  const draftRoles = unpublishedRoles.filter((role) => role.state === "draft");
  logger.info(`Ready to publish ${draftRoles.length} draft roles`);

  if (!draftRoles.length) {
    logger.info("No draft job roles to publish");
    return;
  }

  for (const role of draftRoles) {
    await publishCuratorJobRolesApi(request, jwt, role.id, role.name);
  }
});

// Importing can take hours. Publish drafts along the way so they are not all left until the end.
test("Wait until importing is done, then publish drafts @waitThenPublishCustomJobRoles", async ({
  request,
}) => {
  test.setTimeout(0);
  const jwt = await generateToken(request);
  const waitMinutes = 5;

  while (true) {
    const customJobRoles = await allCustomJobRoles(request, jwt, false);
    const countByState = new Map();
    for (const role of customJobRoles) {
      const state = role.state || "no state";
      countByState.set(state, (countByState.get(state) || 0) + 1);
    }

    const draftCount = countByState.get("draft") || 0;
    const importingCount = countByState.get("importing") || 0;
    const pendingCount = countByState.get("pending") || 0;
    const publishedCount = countByState.get("published") || 0;
    logger.info(
      `Draft ${draftCount}. Importing ${importingCount}. Pending ${pendingCount}. Published ${publishedCount}. Total ${customJobRoles.length}.`,
    );

    const draftRoles = customJobRoles.filter((role) => role.state === "draft");
    const shouldPublish = importingCount === 0 || draftCount > 20;
    if (shouldPublish && draftRoles.length) {
      logger.info(`Publishing ${draftRoles.length} draft roles`);
      for (const role of draftRoles) {
        await publishCuratorJobRolesApi(request, jwt, role.id, role.name);
      }
    }

    if (importingCount === 0) {
      logger.info("Importing is 0. Finished");
      return;
    }

    logger.info(
      `Importing is ${importingCount}. Waiting ${waitMinutes} minutes`,
    );
    await new Promise((resolve) =>
      setTimeout(resolve, waitMinutes * 60 * 1000),
    );
  }
});

// The list call returns one page. Walk the pages so the counts cover every custom role.
async function allCustomJobRoles(request, jwt, includeUnPublishedOnly) {
  const pageSize = 200;
  const customJobRoles = [];
  let offset = 0;

  while (offset < 20000) {
    const page = await listCuratorJobRolesApi(
      request,
      jwt,
      pageSize,
      offset,
      includeUnPublishedOnly,
    );
    customJobRoles.push(...page);
    if (page.length < pageSize) {
      return customJobRoles;
    }
    offset += pageSize;
  }

  return customJobRoles;
}

function sheetRowsFromFile() {
  const fileName = (process.env.FileName || "").trim();
  if (!fileName) {
    logger.info(
      "Set FileName to the csv name under testData/skillIntelligence, without .csv",
    );
    return [];
  }
  const sheetPath = reusableFunctions.getPath(sheetFolder, `${fileName}.csv`);
  const sheetRows = reusableFunctions.readDataFromExcel(sheetPath, "Sheet1");
  if (!sheetRows.length) {
    logger.info(`No rows in ${fileName}.csv`);
  }
  return sheetRows;
}

// The sheet has one row per skill. The import call wants one object per role, with every skill on it.
function jobRolesFromSheetRows(sheetRows, classifications) {
  const roleByName = new Map();

  for (const row of sheetRows) {
    const roleName = String(row.name || "").trim();
    const skillName = String(row.skill || "").trim();
    if (!roleName || !skillName) {
      logger.info("Skipped a sheet row with no role name or skill name");
      continue;
    }

    let jobRole = roleByName.get(roleName);
    if (!jobRole) {
      const classificationName = String(row.classification || "").trim();
      const classificationNumber = classificationNumberFor(
        classificationName,
        classifications,
      );
      jobRole = {
        name: roleName,
        description: row.description || "",
        jobrole_classification: classificationNumber,
        level: Number(row["role level"]),
        skills: [],
        key_responsibilities: [],
        additional_details: {
          hierarchy: hierarchyFromRow(row),
        },
        locale: "en-US",
      };
      roleByName.set(roleName, jobRole);
    }

    jobRole.skills.push({
      name: skillName,
      level: Number(row["skill level"]),
    });
  }

  return [...roleByName.values()];
}

// New sites: the sheet must use 1 Support, 2 Professional, 3 Management, 4 Executive.
// A word is only safe when this org already returns kgGetRoleClassifications.
// testsi returned an empty list, so the word file failed and the number file worked.
function classificationNumberFor(classificationName, classifications) {
  const raw = String(classificationName || "").trim();
  if (/^[1-4]$/.test(raw)) {
    return Number(raw);
  }

  const wanted = raw.toLowerCase();
  const match = classifications.find(
    (item) =>
      String(item.name || "")
        .trim()
        .toLowerCase() === wanted,
  );
  const classificationNumber = Number(match?.number);
  if (!match || Number.isNaN(classificationNumber)) {
    throw new Error(`No classification number for ${classificationName}`);
  }
  return classificationNumber;
}

function hierarchyFromRow(row) {
  const pairs = [
    ["Area", row["level1=Area"]],
    ["Function", row["level2=Function"]],
    ["Family", row["level3=Family"]],
  ];
  return pairs
    .filter(([, value]) => String(value || "").trim())
    .map(([label, value]) => ({ label, value: String(value).trim() }));
}
