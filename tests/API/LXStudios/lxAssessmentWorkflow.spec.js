import {
  test,
  expect,
  generateToken,
  logger,
  getAllUserApi,
  reusableFunctions,
  lxAssessmentCreateApi,
  lxAssessmentSaveLearningObjectiveApi,
  lxAssessmentGenerateDescriptionApi,
  lxAssessmentAsyncQuestionGenerationApi,
  lxAssessmentAsyncQuestionGenerationStatusApi,
  lxAssessmentSaveRecommendationsApi,
  lxAssessmentSearchContentApi,
  lxAssessmentSkillsApi,
  createContentContainerApi,
  listWorkspacesApi,
  getProjectsInWorkspaceApi,
  createProjectApi,
  listKnowledgeSourceDocumentsApi,
  shareDocumentsToContainerApi,
  publishAssessmentApi,
  questionBankUuidMappingApi,
} from "../../../path.js";

let testDataArray = reusableFunctions.loadAndFilterTestData(
  "testData/LxStudios/Assessment",
  "lxAssessmentTestData",
  process.env.assessmentTestName,
  "title",
  "Assessment",
);

test.describe.configure({ mode: "parallel" });

(testDataArray || []).forEach((data, index) => {
  test.describe(`LX Studio Assessment Workflow - ${
    data.title || `Test ${index + 1}`
  }`, () => {
    let jwt, userId;
    let workspaceId, projectId, assessmentContainerId;
    let skillId, internalAssessmentId, learningObjectiveUuids;
    let documentIds = [];
    let jobId;

    test.beforeAll(
      "Generate Token and setup",
      async ({ request }, testInfo) => {
        testInfo.setTimeout(40000);
        jwt = await generateToken(request);
        logger.info("JWT Token generated successfully");
        let allUserResponse = await getAllUserApi(request, jwt);
        userId = reusableFunctions.getAdminUserId(allUserResponse);
      },
    );

    test("Get default workspace and project", async ({ request }) => {
      const result = await reusableFunctions.getDefaultWorkspaceAndProject({
        listWorkspacesApi,
        getProjectsInWorkspaceApi,
        createProjectApi,
        request,
        jwt,
        projectName: data.projectName,
      });

      workspaceId = result.workspaceId;
      projectId = result.projectId;
      logger.info(`Workspace ID: ${workspaceId}, Project ID: ${projectId}`);
    });

    test("Create content container", async ({ request }) => {
      assessmentContainerId = await createContentContainerApi(
        request,
        jwt,
        projectId,
        workspaceId,
        data.containerType,
      );
      logger.info(`Content container created: ${assessmentContainerId}`);
    });

    test("Share knowledge source documents to container", async ({
      request,
    }) => {
      test.skip(!data.documentNames?.length, "No documents to share");

      let existingDocsResponse = await listKnowledgeSourceDocumentsApi(
        request,
        jwt,
        workspaceId,
      );
      let existingDocs =
        existingDocsResponse?.data?.listKnowledgeSourceDocuments
          ?.knowledgeSourceDocuments || [];

      documentIds = [];
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

      await shareDocumentsToContainerApi(
        request,
        jwt,
        documentIds,
        assessmentContainerId,
      );
      logger.info(
        `Shared ${documentIds.length} document(s) to assessment container`,
      );
    });

    test("Get skill IDs", async ({ request }) => {
      const assessmentData = data.assessmentData;
      skillId = [];

      for (let skillName of assessmentData.skillname) {
        let id = await lxAssessmentSkillsApi(request, jwt, skillName);
        logger.info(`Skill ID retrieved for "${skillName}": ${id}`);
        skillId.push(id);
      }
    });

    test("Create assessment", async ({ request }) => {
      test.setTimeout(300000);

      internalAssessmentId = await lxAssessmentCreateApi(request, jwt, {
        ...data.assessmentData,
        assessmentContainerId,
        skills: skillId,
        modifiedBy: userId,
      });

      logger.info(`Created assessment with ID: ${internalAssessmentId}`);
    });

    test("Save learning objectives", async ({ request }) => {
      const learningObjectives = data.learningObjectives;

      learningObjectiveUuids = await lxAssessmentSaveLearningObjectiveApi(
        request,
        jwt,
        learningObjectives,
        internalAssessmentId,
        assessmentContainerId,
      );
    });

    test("Generate description", async ({ request }) => {
      let response = await lxAssessmentGenerateDescriptionApi(
        request,
        jwt,
        internalAssessmentId,
        assessmentContainerId,
      );

      logger.info(
        `Generated description: ${response.description?.substring(0, 80)}...`,
      );
    });

    test("Async question generation", async ({ request }) => {
      test.setTimeout(3000000);

      let response = await lxAssessmentAsyncQuestionGenerationApi(
        request,
        jwt,
        internalAssessmentId,
        assessmentContainerId,
        learningObjectiveUuids,
        data.assessmentData.selectedQuestionType,
        data.assessmentData.numberOfQuestions,
        documentIds,
        workspaceId,
        data.assessmentData.difficultyLevel,
      );

      jobId = response.jobId;
      logger.info(
        `Question generation job started - jobId: ${jobId}, status: ${response.jobStatus}`,
      );
    });
    test("Save content recommendations", async ({ request }) => {
      const recommendationsData = data.recommendations;
      let resolvedRecommendations = [];

      const normalize = (str) =>
        str
          ?.trim()
          .toLowerCase()
          .replace(/[\u2018\u2019\u201A\u201B']/g, "'")
          .replace(/[\u201C\u201D\u201E\u201F"]/g, '"');

      for (let rec of recommendationsData) {
        try {
          let results = await lxAssessmentSearchContentApi(
            request,
            jwt,
            rec.contentName,
            userId,
          );

          let matched = results.find(
            (r) =>
              normalize(r.title) === normalize(rec.contentName) &&
              normalize(r.contentType) === normalize(rec.contentType),
          );

          if (!matched) {
            logger.warn(
              `No match found for "${rec.contentName}" (${rec.contentType}) in search results - skipping this recommendation`,
            );
            continue;
          }

          logger.info(
            `Resolved "${rec.contentName}" (${rec.contentType}) to contentId: ${matched.contentUuid}`,
          );

          resolvedRecommendations.push({
            contentId: matched.contentUuid,
            contentType: rec.contentType,
          });
        } catch (error) {
          logger.error(
            `Failed to resolve "${rec.contentName}" (${rec.contentType}): ${error.message}`,
          );
        }
      }

      if (resolvedRecommendations.length > 0) {
        await lxAssessmentSaveRecommendationsApi(
          request,
          jwt,
          resolvedRecommendations,
          internalAssessmentId,
        );
      } else {
        logger.warn("No content recommendations resolved - skipping save");
      }
    });

    test("Poll question generation status", async ({ request }) => {
      test.setTimeout(3000000);

      let response = await lxAssessmentAsyncQuestionGenerationStatusApi(
        request,
        jwt,
        jobId,
      );

      logger.info(
        `Question generation completed - jobId: ${jobId}, status: ${response.jobStatus}`,
      );
    });

    test("Publish assessment", async ({ request }, testInfo) => {
      testInfo.setTimeout(2000000);
      let uuidMappingResponse = null;
      uuidMappingResponse = await questionBankUuidMappingApi(
        request,
        jwt,
        learningObjectiveUuids,
        internalAssessmentId,
      );

      await publishAssessmentApi(
        request,
        jwt,
        assessmentContainerId,
        internalAssessmentId,
        userId,
        uuidMappingResponse,
      );
      logger.info(
        `Assessment published for container: ${assessmentContainerId}`,
      );
    });
  });
});
