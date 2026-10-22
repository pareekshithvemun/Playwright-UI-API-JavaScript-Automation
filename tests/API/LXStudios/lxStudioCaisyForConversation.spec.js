import {
  test,
  config,
  generateToken,
  listWorkspacesApi,
  getProjectsInWorkspaceApi,
  createContentContainerApi,
  createProjectApi,
  createOrUpdateSimulationCaisyApi,
  getJobStatusCaisyApi,
  publishScenarioCaisyApi,
  publishContentCaisyApi,
  getAllUserApi,
  createCategoryApi,
  getScenarioGroupsByOrgApi,
  logger,
  reusableFunctions,
  listKnowledgeSourceDocumentsApi,
  shareDocumentsToContainerApi,
  getSkillIdsByNames,
} from "../../../path.js";

let testDataArray = reusableFunctions.loadAndFilterTestData(
  "testData/LxStudios/Conversation",
  "conversationTestData",
  process.env.conversationTitle,
  "title",
  "Conversation",
);

test.describe.configure({ mode: "parallel" });

(testDataArray || []).forEach((data) => {
  test.describe(`LX Studio Caisy for Conversation - ${data.title}`, () => {
    let jwt, adminUserId, orgId;
    let workspaceId, projectId, containerId, categoryId;

    test.beforeAll(
      "Generate Token and setup",
      async ({ request }, testInfo) => {
        testInfo.setTimeout(40000);
        jwt = await generateToken(request);
        let allUserResponse = await getAllUserApi(request, jwt);
        adminUserId = reusableFunctions.getAdminUserId(allUserResponse);
        orgId = config.get("Environment.orgId");
        logger.info(`Org ID: ${orgId}`);
      },
    );

    test("Get workspace and project", async ({ request }) => {
      let result = await reusableFunctions.getDefaultWorkspaceAndProject({
        listWorkspacesApi,
        getProjectsInWorkspaceApi,
        createProjectApi,
        request,
        jwt,
        projectName: data.ProjectName,
      });
      workspaceId = result.workspaceId;
      projectId = result.projectId;
      logger.info(`Workspace: ${workspaceId}, Project: ${projectId}`);
    });

    test("Get or create category", async ({ request }) => {
      categoryId = await getOrCreateCategoryId(
        request,
        jwt,
        data.categoryName,
        orgId,
      );
      logger.info(
        `Using category ID: ${categoryId} for '${data.categoryName}'`,
      );
    });

    test("Create container, tag documents, create scenario", async ({
      request,
    }, testInfo) => {
      testInfo.setTimeout(300000);

      // Create content container
      containerId = await createContentContainerApi(
        request,
        jwt,
        projectId,
        workspaceId,
        "caisyForYou",
      );
      logger.info(`Container created: ${containerId}`);

      // Tag existing documents to container (if any)
      if (data.documentNames?.length > 0) {
        let existingDocsResponse = await listKnowledgeSourceDocumentsApi(
          request,
          jwt,
          workspaceId,
        );
        let existingDocs =
          existingDocsResponse?.data?.listKnowledgeSourceDocuments
            ?.knowledgeSourceDocuments || [];

        let documentIds = [];
        for (let docName of data.documentNames) {
          let found = existingDocs.find(
            (d) => d.title?.toLowerCase() === docName.toLowerCase(),
          );
          if (found) {
            documentIds.push(found.id);
            logger.info(`Found document: ${docName} (${found.id})`);
          } else {
            logger.warn(`Document not found: ${docName}`);
          }
        }

        if (documentIds.length > 0) {
          await shareDocumentsToContainerApi(
            request,
            jwt,
            documentIds,
            containerId,
          );
          logger.info(`Shared ${documentIds.length} document(s) to container`);
        }
      }

      // Fetch skill IDs if skillNames provided
      let skillIds = [];
      if (data.skillNames?.length > 0) {
        skillIds = await getSkillIdsByNames(request, jwt, data.skillNames);
        logger.info(`Resolved ${skillIds.length} skill ID(s)`);
      }

      // Build metaData for createOrUpdateSimulation: start from test data, then add resolved skillIds
      let metaDataForCaisy = { ...(data.metaData || {}) };
      if (skillIds.length > 0) {
        metaDataForCaisy.skillIds = skillIds;
      }

      // Create scenario
      let scenarioResponse = await createOrUpdateSimulationCaisyApi(
        request,
        jwt,
        containerId,
        adminUserId,
        data.title,
        data.description,
        categoryId,
        data.behavior,
        data.scenarioPrompt,
        metaDataForCaisy,
      );
      logger.info(`Scenario created: ${data.title}`);

      // Poll job status
      let jobId = scenarioResponse.data?.createOrUpdateSimulation?.jobId;
      if (jobId) {
        await pollJobStatus(request, jwt, jobId);
      }

      // Publish scenario (ai-simulator)
      await publishScenarioCaisyApi(
        request,
        jwt,
        containerId,
        false,
        "en-US",
      );
      logger.info("Scenario published");

      // Publish content (lx-studio)
      await publishContentCaisyApi(request, jwt, containerId, {
        title: data.title,
        description: data.description,
        invokerUuid: adminUserId,
        organizationUuid: orgId,
        contentSource: data.metaData?.sourceName,
      });
      logger.info("Content published");
    });
  });
});

async function getOrCreateCategoryId(request, jwt, categoryName, ownerId) {
  let response = await getScenarioGroupsByOrgApi(request, jwt, ownerId);
  let categories = response.data.getScenarioGroupsByOrg;
  let existing = categories.find((c) => c.name === categoryName);

  if (existing) {
    return existing.id;
  }

  let createResponse = await createCategoryApi(
    request,
    jwt,
    categoryName,
    ownerId,
  );
  return createResponse.data.createCategory.id;
}

async function pollJobStatus(request, jwt, jobId) {
  for (let i = 0; i < 30; i++) {
    let response = await getJobStatusCaisyApi(request, jwt, jobId);
    let status = response.data.getJobStatus.jobStatus;
    logger.info(`Job status: ${status} (${i + 1}/30)`);

    if (status === "COMPLETED") {
      logger.info("Job completed!");
      return;
    }
    await reusableFunctions.setTimer(10000);
  }
  logger.warn("Job polling timeout");
}
