import {
  test,
  config,
  logger,
  reusableFunctions,
  generateToken,
  getAllUserApi,
  getAudienceUsersApi,
  getAllAudienceApi,
  urlData,
  ExcelJS,
  path,
  fs,
} from "../../../path.js";

let jwt;
let orgId = config.get("Environment").orgId;

async function collectAudienceLearnersForOrgs(
  request,
  orgsToProcess,
  totalOrgsAvailable,
  excelStem
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Users Data");
  worksheet.addRow(["orgid", "userid", "baseURL"]);
  logger.info("orgid\tuserid\tbaseURL");

  let totalUsersCollected = 0;
  let successfulOrgs = 0;
  let failedOrgs = 0;

  for (const [baseURL, currentOrgId] of orgsToProcess) {
    try {
      logger.info(`\n========== Processing: ${baseURL} ==========`);

      urlData.devtokenGeneratorapiUrl = `${baseURL}/api/public/auth/authenticate`;
      urlData.baseUrlOfgetAllAudience = `${baseURL}/api/ucm/audiences/audience-list-page`;
      urlData.getAudienceUsersUrl = (audienceId) =>
        `${baseURL}/api/ucm/users/${audienceId}/audience-users`;
      urlData.Org_ID = currentOrgId;

      logger.info(`Org_ID: ${urlData.Org_ID}`);

      const orgJwt = await generateToken(request);
      const audienceUUID = await getAllAudienceApi("Region", request, orgJwt);

      if (!audienceUUID) {
        logger.warn(`No Region audience`);
        failedOrgs++;
        continue;
      }

      const response = await getAudienceUsersApi(
        request,
        orgJwt,
        audienceUUID,
        "Region"
      );

      if (!response || !response.users || response.users.length === 0) {
        logger.warn(`No users found`);
        failedOrgs++;
        continue;
      }

      const learnerIds = response.users
        .filter((user) => user.role === "learner")
        .map((user) => user.id);

      if (learnerIds.length === 0) {
        logger.warn(`No learner users`);
        failedOrgs++;
        continue;
      }

      const userLimit = Number(process.env.userCount) || 120;
      const shuffledLearnerIds =
        reusableFunctions.shuffleDataInArray(learnerIds);
      const limitedUsers = reusableFunctions.limitTheArrayData(
        shuffledLearnerIds,
        userLimit
      );
      const repeatedArray = limitedUsers.flatMap((id) => [id, id]);

      repeatedArray.forEach((userId) => {
        worksheet.addRow([currentOrgId, userId, baseURL]);
        logger.info(`${currentOrgId}\t${userId}\t${baseURL}`);
      });

      totalUsersCollected += repeatedArray.length;
      successfulOrgs++;
      logger.info(
        `✓ entered ${repeatedArray.length} entries, each user twice one for START and one for END`
      );
    } catch (error) {
      logger.error(`❌ Error: ${error.message}`);
      failedOrgs++;
      continue;
    }
  }

  logger.info("\n========== SUMMARY ==========");
  logger.info(`Total orgs available: ${totalOrgsAvailable}`);
  logger.info(`Orgs processed: ${orgsToProcess.length}`);
  logger.info(`Successful: ${successfulOrgs}`);
  logger.info(`Failed: ${failedOrgs}`);
  logger.info(`Total users: ${totalUsersCollected}`);
  const timestamp = new Date().getTime();
  const excelFilePath = path.resolve(
    "testData/userExcel",
    `${excelStem}_${timestamp}.xlsx`
  );
  if (!fs.existsSync(path.dirname(excelFilePath))) {
    fs.mkdirSync(path.dirname(excelFilePath), { recursive: true });
  }
  await workbook.xlsx.writeFile(excelFilePath);
  logger.info(`Excel: ${excelFilePath}`);
  logger.info("=============================\n");
}

test("Get users from all orgs", async ({ request }) => {
  test.setTimeout(10000000);

  try {
    const orgsData = reusableFunctions.readDatafromJsonFilenotasync(
      "testData/orgsData/allOrgs.json"
    );
    const urlToOrgIdMap = orgsData.urlToOrgIdMap;
    const orgEntries = Object.entries(urlToOrgIdMap);
    const orgLimit = process.env.orgLimit ? Number(process.env.orgLimit) : null;
    const orgsToProcess = orgLimit ? orgEntries.slice(0, orgLimit) : orgEntries;

    logger.info(`Total orgs in map: ${orgEntries.length}`);
    logger.info(`Orgs in this run: ${orgsToProcess.length}`);

    await collectAudienceLearnersForOrgs(
      request,
      orgsToProcess,
      orgEntries.length,
      "users_all_orgs"
    );
  } catch (error) {
    logger.error("Fatal error:", error);
    throw error;
  }
});

test("Get users from active config org", async ({ request }) => {
  test.setTimeout(10000000);

  try {
    const baseURL = config.get("Environment.baseURL");
    const mappedOrgId = config.get("Environment").orgId;
    const orgsToProcess = [[baseURL, mappedOrgId]];
    logger.info(`Orgs in this run: ${orgsToProcess.length}`);

    await collectAudienceLearnersForOrgs(
      request,
      orgsToProcess,
      1,
      "users_config_org"
    );
  } catch (error) {
    logger.error("Fatal error:", error);
    throw error;
  }
});

test.describe("Default users from config org", () => {
  test.beforeAll("get Token", async ({ request }) => {
    jwt = await generateToken(request);
    logger.info(jwt);
    logger.info(process.env.NODE_ENV);
  });

  test("Get default users", async ({ request }) => {
    test.setTimeout(1000000);
    let pathofuserData = "testData/usersData/defaultUsers.json";
    let defaultUsersData =
      reusableFunctions.readDatafromJsonFilenotasync(pathofuserData);
    let usersArray = defaultUsersData.defaultUsersData;
    let filterUserIds = usersArray.map((user) => user.userID);
    let resp = await getAllUserApi(request, jwt);
    const defaultUserIds = resp.users
      .filter((user) => filterUserIds.includes(user.loginName))
      .map((user) => user.id);
    let users = reusableFunctions.limitTheArrayData(
      defaultUserIds,
      process.env.userCount ? process.env.userCount : 120
    );
    let repeatedArray = users.flatMap((item) => [item, item]);
    const baseURL = config.get("Environment.baseURL");

    logger.info(`User array size: ${repeatedArray.length}`);
    logger.info(`BaseURL: ${baseURL}`);
    logger.info("\n========== USER DATA ==========");
    repeatedArray.forEach((userId) => {
      logger.info(`${orgId}\t${userId}\t${baseURL}`);
    });
    logger.info("===============================\n");
  });
});
