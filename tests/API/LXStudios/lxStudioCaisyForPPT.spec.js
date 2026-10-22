import {
  test,
  generateToken,
  listWorkspacesApi,
  getProjectsInWorkspaceApi,
  createContentContainerApi,
  initializeConversationUploadApi,
  s3UploadApi,
  submitConversationUploadedApi,
  getConversationStatusApi,
  startConvProcessingApi,
  createProjectApi,
  getStockPeopleGroupsApi,
  editConversationApi,
  upsertPeopleGroupsAndQuestionsApi,
  upsertSectionAndRubricConfigurationApi,
  publishPresentationCaisyApi,
  logger,
  reusableFunctions,
} from "../../../path.js";

let testDataArray = reusableFunctions.loadAndFilterTestData(
  "testData/LxStudios/PPT",
  "pptTestData",
  process.env.FileName,
  "fileName",
  "PPT"
);

test.describe.configure({ mode: "parallel" });

testDataArray.forEach((data, index) => {
  test.describe(`LX Studio PPT Workflow - ${data.pptName} (Dataset ${index + 1})`, () => {
    let jwt;
    let workspaceId, projectId, conversationId;
    let stockPeopleGroupsResponse;

    test.beforeAll("Generate Token", async ({ request }, testInfo) => {
      testInfo.setTimeout(60000);
      jwt = await generateToken(request);
      logger.info("JWT Token generated successfully");
    });

    test("Get default workspace and project", async ({ request }) => {
      const result = await reusableFunctions.getDefaultWorkspaceAndProject({
        listWorkspacesApi,
        getProjectsInWorkspaceApi,
        createProjectApi,
        request,
        jwt,
        projectName: data.ProjectName,
      });
      workspaceId = result.workspaceId;
      projectId = result.projectId;
    });

    test("Complete workflow: Create Container -> Upload File -> Process", async ({ request }) => {
      test.setTimeout(300000);

      let containerId = await createContentContainerApi(request, jwt, projectId, workspaceId, "presentationPractice");
      logger.info(`Created content container with ID: ${containerId}`);

      const uploadInitResponse = await initializeConversationUploadApi(request, jwt, "pptx", data.pptName, containerId, "lx-studio");
      const { url: uploadUrl, conversationId: convId, fields } = uploadInitResponse.data.initializeConversationUpload;
      conversationId = convId;
      logger.info(`Upload initialized with conversation ID: ${conversationId}`);

      await s3UploadApi(request, uploadUrl, fields, `testData/LxStudios/PPT/${data.fileName}`);
      logger.info("Waiting for 40 seconds before submitting conversation uploaded");
      await reusableFunctions.setTimer(40000);

      await submitConversationUploadedApi(request, jwt, conversationId, "pptx");

      logger.info("Polling status until Uploaded...");
      while (true) {
        const statusResponse = await getConversationStatusApi(request, jwt, conversationId);
        const status = statusResponse.data.getConversationStatus.status;
        logger.info(`Conversation status: ${status} for UUID: ${conversationId}`);
        if (status === "Uploaded") break;
        await reusableFunctions.setTimer(4000);
      }

      await startConvProcessingApi(request, jwt, conversationId, data.triggerAiGen);
      logger.info(`Processing started with AI Gen: ${data.triggerAiGen}`);

      logger.info("Polling status until Draft...");
      while (true) {
        const statusResponse = await getConversationStatusApi(request, jwt, conversationId);
        const status = statusResponse.data.getConversationStatus.status;
        logger.info(`Conversation status: ${status} for UUID: ${conversationId}`);
        if (status === "Draft") break;
        await reusableFunctions.setTimer(4000);
      }
    });

    test.describe("Manual PPT Configuration", () => {
      test.skip(data.triggerAiGen, "Skipping manual config - AI Gen enabled");

      test("Edit description and name for PPT presentation", async ({ request }) => {
        await editConversationApi(request, jwt, conversationId, data.pptName, data.pptDescription, false);
        logger.info(`PPT description updated for conversation`);
      });

      test("Get stock people groups for PPT configuration", async ({ request }) => {
        stockPeopleGroupsResponse = await getStockPeopleGroupsApi(request, jwt, "en-US");
        logger.info(`Retrieved ${stockPeopleGroupsResponse.data.getStockPeopleGroups.length} stock people groups`);
      });

      test("Configure people groups and questions", async ({ request }) => {
        const { peopleGroups, personNameToUuid } = buildPeopleGroups(stockPeopleGroupsResponse, data.peopleGroups);
        const slideQuestions = buildSlideQuestions(data.slideQuestions, personNameToUuid, peopleGroups, data.sectionsConfig);

        await upsertPeopleGroupsAndQuestionsApi(request, jwt, conversationId, peopleGroups, slideQuestions, true);
        logger.info(`People groups and questions configured`);
      });

      test("Configure sections and rubrics", async ({ request }) => {
        const sectionRubrics = buildSectionRubrics(data.sectionRubrics);

        await upsertSectionAndRubricConfigurationApi(request, jwt, conversationId, data.sectionsConfig, sectionRubrics, true);
        logger.info(`Sections and rubrics configured`);
      });
    });

    test("Publish PPT presentation", async ({ request }) => {
      await publishPresentationCaisyApi(request, jwt, conversationId);
      logger.info(`PPT presentation published: ${conversationId}`);
    });
  });
});

// Helper: Build people groups from stock groups response + group names array
function buildPeopleGroups(stockPeopleGroupsResponse, groupNames) {
  const stockGroups = stockPeopleGroupsResponse.data.getStockPeopleGroups;

  const personNameToUuid = {};
  stockGroups.forEach((g) => g.persons.forEach((p) => {
    personNameToUuid[p.person.name.toLowerCase()] = p.person.uuid;
  }));

  const peopleGroups = groupNames.map((groupName) => {
    const stockGroup = stockGroups.find((g) => g.name.toLowerCase() === groupName.toLowerCase());
    if (!stockGroup) {
      logger.warn(`Stock group not found: ${groupName}`);
      return null;
    }
    return {
      id: reusableFunctions.uuidGenerator(),
      name: stockGroup.name,
      description: stockGroup.description,
      people: stockGroup.persons.map((p) => ({ id: p.person.uuid, type: "stock" })),
    };
  }).filter(Boolean);

  return { peopleGroups, personNameToUuid };
}

// Helper: Build slide questions from flat array in test data
function buildSlideQuestions(slideQuestionsData, personNameToUuid, peopleGroups, sectionsConfig) {
  const groupNameToId = {};
  peopleGroups.forEach((g) => { groupNameToId[g.name.toLowerCase()] = g.id; });

  // Group questions by slide index
  const slideMap = {};
  (slideQuestionsData || []).forEach((q) => {
    const slideIndex = q.slide - 1;
    if (!slideMap[slideIndex]) slideMap[slideIndex] = [];
    slideMap[slideIndex].push({
      personId: personNameToUuid[q.person.toLowerCase()],
      peopleGroupId: groupNameToId[q.group.toLowerCase()],
      questions: [{
        questionUuid: reusableFunctions.uuidGenerator(),
        question: q.question,
        responseGuidelines: q.responseGuidelines,
      }],
    });
  });

  const totalSlides = Math.max(...sectionsConfig.sections.map((s) => s.endSlide)) + 1;
  const result = [];
  for (let i = 0; i < totalSlides; i++) {
    result.push({ slideIndex: i, questions: slideMap[i] || [] });
  }
  return result;
}

// Helper: Build section rubrics array for API
function buildSectionRubrics(sectionRubrics) {
  return sectionRubrics.map((rubric) => ({
    deliveryStyle: {
      weightPercent: rubric.deliveryStyle.weightPercent,
      criteria: Object.entries(rubric.deliveryStyle.criteria).map(([display, points]) => ({
        display, points, requiredForExpertLevel: false,
      })),
    },
    contentAndStructure: {
      weightPercent: rubric.contentAndStructure.weightPercent,
      criteria: Object.entries(rubric.contentAndStructure.criteria).map(([display, points]) => ({
        display, points, requiredForExpertLevel: false,
      })),
    },
  }));
}
