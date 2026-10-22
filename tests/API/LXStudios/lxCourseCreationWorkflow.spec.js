import {
  test,
  expect,
  generateToken,
  logger,
  getAllUserApi,
  reusableFunctions,
  createContentContainerForCourseApi,
  listWorkspacesApi,
  getProjectsInWorkspaceApi,
  createProjectApi,
  getAvailableTemplatesApi,
  getTemplateIdByName,
  aiContentGenStreamChatApi,
  urlData,
} from "../../../path.js";

// Loads test data from testData/LxStudios/CourseCreation/lxCourseCreationTestData.json
// If courseCreationTestName env var is set, filters entries by "title" field (supports comma-separated values)
// If not set, all entries in the JSON are used
//
// Org scope (siteType):
//   Default / TriggerInAllSites / EU / US variants → org list from testData/orgsData/allOrgs.json (see getOrgEntriesForSiteType).
//   siteType=TriggerInConfigOrg → only the org in active config (NODE_ENV → config/*.json): Environment.baseURL + Environment.orgId.
//
// Commands:
//   npm run createCourseInLXStudios                  → all sites, all test data
//   npm run createCourseInLXStudiosInParentSites     → parent sites only
//   npm run createCourseInLXStudiosInAllChildSites   → child sites only (a + b series)
//   siteType=TriggerInConfigOrg npm run createCourseInLXStudios → single org from config only
//   courseCreationTestName='Course From Scratch' npm run createCourseInLXStudios → filter by title
let testDataArray = reusableFunctions.loadAndFilterTestData(
  "testData/LxStudios/CourseCreation",
  "lxCourseCreationTestData",
  process.env.courseCreationTestName,
  "title",
  "CourseCreation",
);

testDataArray.forEach((data, index) => {
  test.describe(`LX Studio Course Creation Workflow - ${data.title}`, () => {
    test("Create course containers across orgs", async ({ request }) => {
      test.setTimeout(10000000);

      const siteType = process.env.siteType || "TriggerInAllSites";

      const orgsData = reusableFunctions.readDatafromJsonFilenotasync(
        "testData/orgsData/allOrgs.json",
      );
      const filteredOrgs = reusableFunctions.getOrgEntriesForSiteType(
        orgsData,
        siteType,
      );

      logger.info(`Total orgs available: ${filteredOrgs.length} (source: ${siteType})`);
      logger.info(
        `Orgs to process: ${filteredOrgs.length} (siteType: ${siteType})`,
      );

      const results = [];
      let successCount = 0;
      let failCount = 0;

      for (const [baseURL, orgId] of filteredOrgs) {
        const orgName = baseURL
          .replace("https://", "")
          .replace(".percipio.com", "");

        try {
          logger.info(`\n========== Processing: ${orgName} ==========`);

          urlData.devtokenGeneratorapiUrl = `${baseURL}/api/public/auth/authenticate`;
          urlData.getUsersUrl = `${baseURL}/api/ucm/users`;
          urlData.lxStudioGraphQLUrl = `${baseURL}/lx-studio/api/lx-studio-service/graphql`;
          urlData.aiContentGenGetAvailableTemplatesUrl = `${baseURL}/ai-content-gen/api/getAvailableTemplates`;
          urlData.aiContentGenStreamChatUrl = `${baseURL}/ai-content-gen/api/stream/chat`;
          urlData.Org_ID = orgId;

          const jwt = await generateToken(request);
          logger.info(`Token generated for ${orgName}`);

          const allUserResponse = await getAllUserApi(request, jwt);
          const userId = reusableFunctions.getAdminUserId(allUserResponse);

          const wsResult =
            await reusableFunctions.getDefaultWorkspaceAndProject({
              listWorkspacesApi,
              getProjectsInWorkspaceApi,
              createProjectApi,
              request,
              jwt,
              projectName: data.projectName,
            });

          const { workspaceId, projectId } = wsResult;
          logger.info(`Workspace: ${workspaceId}, Project: ${projectId}`);

          const courseContainerId = await createContentContainerForCourseApi(
            request,
            jwt,
            projectId,
            workspaceId,
            data.locale,
          );
          logger.info(`Container created: ${courseContainerId}`);

          const chatData = data.aiChatData;

          const availableTemplates = await getAvailableTemplatesApi(
            request,
            jwt,
            courseContainerId,
          );
          const templateId = getTemplateIdByName(
            availableTemplates,
            chatData.templateName,
          );
          logger.info(
            `Template "${chatData.templateName}" resolved to ID: ${templateId}`,
          );

          const messages = [
            {
              role: "assistant",
              content: chatData.initialAssistantMessage,
            },
            { role: "user", content: chatData.userMessage },
          ];
          const context = {
            templateId,
            audioProvider: chatData.audioProvider,
            audioVoice: chatData.audioVoice,
          };

          const response = await aiContentGenStreamChatApi(
            request,
            jwt,
            courseContainerId,
            messages,
            chatData.courseStep,
            context,
          );

          expect(response.success).toBe(true);
          logger.info(
            `AI chat started - conversationId: ${response.data.conversationId}`,
          );

          results.push({ orgName, orgId, containerId: courseContainerId });
          successCount++;
          logger.info(`Done: ${orgName}`);
        } catch (error) {
          logger.error(`Failed for ${orgName}: ${error.message}`);
          failCount++;
          continue;
        }
      }

      logger.info("\n========== SUMMARY ==========");
      logger.info(`Site type: ${siteType}`);
      logger.info(`Total orgs: ${filteredOrgs.length}`);
      logger.info(`Successful: ${successCount}`);
      logger.info(`Failed: ${failCount}`);
      const tableLines = [
        `\nResults (Table):`,
        `${"Org Name".padEnd(15)} | ${"Org ID".padEnd(40)} | ${"Container ID".padEnd(40)}`,
        `${"-".repeat(15)} | ${"-".repeat(40)} | ${"-".repeat(40)}`,
      ];
      results.forEach((r) =>
        tableLines.push(`${r.orgName.padEnd(15)} | ${r.orgId.padEnd(40)} | ${r.containerId.padEnd(40)}`),
      );
      tableLines.push(`\nResults (JSON):`);
      tableLines.push(JSON.stringify(results, null, 2));
      logger.info(tableLines.join("\n"));
      logger.info("=============================\n");
    });
  });
});
