import {
  test,
  reusableFunctions,
  getAllUserApi,
  generateToken,
  generateTokenLearner,
  featureTrackingEventForPlaylistApi,
  logger,
  featureTrackingEventForStudyGroupApi,
  createTokensForAiAssitantApi,
  featureTrackingEventForAiAssistantApi,
  config,
} from "../../../path.js";

let jwt,
  allUserResponse,
  aiAssitantJwtTokenResp,
  dataForAiAssistant,
  fileName,
  testDataPath;

// Load test data file
fileName = process.env.FileName || "aiAssistantTestData";
testDataPath = reusableFunctions.getPath(
  "testData/aiSimulation",
  `${fileName}.json`
);

// Read conversations for AI Assistant from test data
let raw = reusableFunctions.readDatafromJsonFilenotasync(testDataPath);
dataForAiAssistant = raw?.conversations || [];

// Configurable run settings
const RUNS = Number(process.env.numberOfTimesToRunScript) || 1;

// 🔑 Feature-specific user counts
const PLAYLIST_USERS_PER_RUN = 15; // e.g. 15 users per run
const STUDYGROUP_USERS_PER_RUN = 10; // e.g. 10 users per run
const AIASSISTANT_USERS_PER_RUN = 8; // e.g. 8 users per run

// Before each test run: Generate admin JWT token
test.beforeEach("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

// Test #1: Get all users for the given orgId
test("Get alluser from orgid", async ({ request }, testInfo) => {
  testInfo.setTimeout(500000); // extend timeout for API
  allUserResponse = await getAllUserApi(request, jwt);
});

// Test #2: Populate data in Feature Usage Report
test("populate data in feature Usage report", async ({ request }, testInfo) => {
  testInfo.setTimeout(800000); // extend timeout for longer runs

  // Run script multiple times as configured
  for (let i = 0; i < RUNS; i++) {
    // Shuffle and pick different sets of users for each feature

    let playlistUsers = reusableFunctions
      .limitTheArrayData(
        reusableFunctions.shuffleDataInArray(allUserResponse.users),
        PLAYLIST_USERS_PER_RUN
      )
      .map((item) => ({ externalId: item.externalId, id: item.id }));

    let studyGroupUsers = reusableFunctions
      .limitTheArrayData(
        reusableFunctions.shuffleDataInArray(allUserResponse.users),
        STUDYGROUP_USERS_PER_RUN
      )
      .map((item) => ({ externalId: item.externalId, id: item.id }));

    let aiAssistantUsers = reusableFunctions
      .limitTheArrayData(
        reusableFunctions.shuffleDataInArray(allUserResponse.users),
        AIASSISTANT_USERS_PER_RUN
      )
      .map((item) => ({ externalId: item.externalId, id: item.id }));

    logger.info(`🎵 Playlist Users: ${JSON.stringify(playlistUsers)}`);
    logger.info(`📚 Study Group Users: ${JSON.stringify(studyGroupUsers)}`);
    logger.info(`🤖 AI Assistant Users: ${JSON.stringify(aiAssistantUsers)}`);

    // -------------------------
    // Playlist Feature Tracking
    // -------------------------
    for (let user of playlistUsers) {
      try {
        let token = await generateTokenLearner(
          request,
          user.externalId,
          config.get("Admindata").password
        );
        if (token) {
          logger.info(`🎵 Playlist event for user: ${user.externalId}`);
          await featureTrackingEventForPlaylistApi(request, token);
        }
      } catch (error) {
        logger.error(
          `❌ Playlist token error for ${user.externalId}: ${error.message}`
        );
      }
    }

    // -------------------------
    // Study Groups Feature Tracking
    // -------------------------
    for (let user of studyGroupUsers) {
      try {
        let token = await generateTokenLearner(
          request,
          user.externalId,
          config.get("Admindata").password
        );
        if (token) {
          logger.info(`📚 Study Group event for user: ${user.externalId}`);
          await featureTrackingEventForStudyGroupApi(request, token);
        }
      } catch (error) {
        logger.error(
          `❌ Study Group token error for ${user.externalId}: ${error.message}`
        );
      }
    }

    // -------------------------
    // AI Assistant Feature Tracking
    // -------------------------
    for (let user of aiAssistantUsers) {
      try {
        let token = await generateTokenLearner(
          request,
          user.externalId,
          config.get("Admindata").password
        );
        if (token) {
          logger.info(
            `🤖 Generating AI Assistant token for ${user.externalId}`
          );
          aiAssitantJwtTokenResp = await createTokensForAiAssitantApi(
            request,
            token
          );

          // Process conversations for AI Assistant
          for (let conversation of dataForAiAssistant) {
            logger.info(`🤖 AI Assistant event for user: ${user.externalId}`);
            await featureTrackingEventForAiAssistantApi(
              request,
              token,
              aiAssitantJwtTokenResp.jwt,
              user.id,
              conversation
            );
          }
        }
      } catch (error) {
        logger.error(
          `❌ AI Assistant token error for ${user.externalId}: ${error.message}`
        );
      }
    }
  }
});
