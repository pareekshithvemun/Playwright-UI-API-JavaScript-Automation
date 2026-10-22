/**
 * ═══════════════════════════════════════════════════════════════════════
 * 🚀 Certification Path Data Creation - Fully Optimized (Multi-Level Parallel)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 📊 PARALLELIZATION LEVELS:
 * 1. Test-Level: --workers for multiple test execution
 * 2. API-Level: Promise.all() for concurrent API calls (19 journeys at once)
 * 3. Browser-Level: Batched page operations (3 concurrent pages for stability)
 * 4. User-Level: Multiple users processing simultaneously (2 concurrent)
 *
 * ⏱️  PERFORMANCE: ~35-40 minutes saved per full execution cycle!
 *
 * ───────────────────────────────────────────────────────────────────────
 * 📋 COMMANDS (Run in Order):
 * ───────────────────────────────────────────────────────────────────────
 *
 * 1️⃣  npm run createJourneysForCertificationPath
 *     Tag: @onetimescript | Tests: 20 (parallel) | Time: ~3-5 min
 *     Creates 18 journeys + adds tracks + marks 190 users complete
 *     USE: ONE-TIME setup
 *
 * 2️⃣  npm run createDataInCertificationDashboard ⭐
 *     Tag: @datascript | Tests: 3 (parallel) | Time: ~4-5 min
 *     Fetches journeys + marks 190 users complete + video interactions
 *     USE: MONTHLY refresh
 *
 * 3️⃣  npm run createStartedDataInCertificationDashboard
 *     Tag: @started | Tests: 2 (parallel) | Time: ~3-4 min
 *     Fetches journeys + 190 users watch videos (started status)
 *     USE: Started engagement data
 *
 * 4️⃣  npm run createPracticingObtainingDataInCertificationDashboard
 *     Tag: @practicingobtaining | Tests: 1 | Time: ~2-3 min
 *     ~65 users watch videos in 13 milestone journeys (3 users/batch for stability)
 *     USE: Special milestone tracking
 *
 * 5️⃣  npm run createDefaultCertDataInCertificationDashboard
 *     Tag: @defaultcertpathsdata | Tests: 1 | Time: ~3-4 min
 *     5 users × 17 courses (2 users parallel, browser-safe batching)
 *     USE: Default user enrollment
 *
 * ⚠️  NOTE: "Completion & waiver" has BOTH @onetimescript AND @datascript
 * ═══════════════════════════════════════════════════════════════════════
 */

// ===================== Imports & Constants =====================
import {
  test,
  generateToken,
  reusableFunctions,
  createCertificationPathApi,
  getCertificationPathSubjectsApi,
  patchSubjectstoCertificationPathApi,
  addAudToJourneyApi,
  addtrackToCertificateJourneyApi,
  getjourneyId,
  publishJourney,
  getJourneyInfo,
  deletetrackapi,
  getAllAudienceApi,
  getAllUserApi,
  conentCompletionApi,
  loginLPUiPage,
  getAudienceUsersApi,
  logger,
  config,
  courseCompletionLP,
} from "../../../path.js";

let jwt,
  journeyMap = new Map(),
  audUserApiResp,
  adminUserId,
  auduuid,
  userDetailsforDataScript,
  shuffledaudUserData;

const fileName = process.env.FileName;
const certificationpath = reusableFunctions.getPath(
  "testData/certificationPaths",
  `${fileName}.json`,
);
const defaultUsersDataFromJsonFile = reusableFunctions.getPath(
  "testData/usersData",
  `defaultUsers.json`,
);
const data = reusableFunctions.readDatafromJsonFilenotasync(certificationpath);
const totalData = data?.certificationPaths || [];
const courses = data?.courses || [];
let defaultUsers = reusableFunctions.readDatafromJsonFilenotasync(
  defaultUsersDataFromJsonFile,
).defaultUsersData;

test.use({ browserName: "webkit" });

// ===================== Helper Functions =====================
function getSubjectUuids(subjectPairs, subjects) {
  // Extract Subject UUIDs based on JourneyName
  const primaryUuids = new Set(),
    secondaryUuids = new Set();
  subjects.forEach((subject) => {
    subjectPairs.forEach((pair) => {
      if (
        pair.primarySubjectTitle === subject.primarySubjectTitle &&
        pair.secondarySubjectTitle === subject.secondarySubjectTitle
      ) {
        primaryUuids.add(pair.primarySubjectUuid);
        secondaryUuids.add(pair.secondarySubjectUuid);
      }
    });
  });
  return {
    primaryUuids: [...primaryUuids],
    secondaryUuids: [...secondaryUuids],
  };
}

function getAllContentItemUuids(certificationPaths, journeyName) {
  // Extract contentItemUuids based on JourneyName
  let contentUuids = [];
  const journey = certificationPaths.find(
    (path) => path.JourneyName === journeyName,
  );
  if (journey) {
    journey.Tracks.forEach((track) => {
      track.trackContent.forEach((content) => {
        contentUuids.push(content.contentItemUuid);
      });
    });
  } else {
    logger.error(`Journey with name ${journeyName} not found`);
  }
  return contentUuids;
}

async function fetchAdminUserId(request) {
  // Fetch Admin User ID with retry mechanism
  const maxRetries = 5;
  for (let retries = 0; retries < maxRetries; retries++) {
    try {
      let allUserResponse = await getAllUserApi(request, jwt);
      return reusableFunctions.getAdminUserId(allUserResponse);

      // let allUserResponse = await getAllUserApi(request, jwt);
      // let adminUser = allUserResponse.users.find(
      //   (user) => user.loginName === config.get("Admindata").loginID
      // );
      // if (adminUser) return adminUser.id;
    } catch (error) {
      logger.error(`Attempt ${retries + 1} failed: ${error.message}`);
    }
    logger.info(`Retrying... (Attempt ${retries + 1}/${maxRetries})`);
  }
  throw new Error("Failed to fetch admin user ID after maximum retries.");
}

async function withTimeout(promise, timeout) {
  // Utility for adding timeout to async operations
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Operation timed out")), timeout),
  );
  return Promise.race([promise, timeoutPromise]);
}

// ===================== Test Suite Configuration =====================
test.describe("CertificatePath Data Creation", () => {
  test.beforeAll(
    "Setup: Generate token, fetch admin user and audience data",
    async ({ request }, testInfo) => {
      testInfo.setTimeout(400000);
      jwt = await generateToken(request);
      logger.info("✅ JWT token generated successfully");

      adminUserId = await fetchAdminUserId(request);
      logger.info(`✅ Admin user ID retrieved: ${adminUserId}`);

      auduuid = await getAllAudienceApi("Region", request, jwt);
      logger.info(`✅ Region audience UUID retrieved: ${auduuid}`);

      audUserApiResp = await getAudienceUsersApi(
        request,
        jwt,
        auduuid,
        "Region",
      );
      shuffledaudUserData = reusableFunctions.shuffleDataWithoutDefaultUsers(
        audUserApiResp.users,
        defaultUsers,
      );
      logger.info(
        `✅ Setup completed - ${audUserApiResp.users.length} users retrieved from Region audience`,
      );
    },
  );

  // ===================== ONE-TIME SCRIPT: Journey Creation + Completion =====================
  test.describe("One-Time Script - Serial Execution", () => {
    test.describe.configure({ mode: "serial" }); // ✅ Ensures Completion runs AFTER Journey Creation

    // --------- Journey Creation (All journeys created in parallel using Promise.all) ---------
    test("Create All Journeys in Parallel @onetimescript", async ({
      request,
    }, testInfo) => {
      testInfo.setTimeout(900000); // 15 min timeout for all journeys

      logger.info(`🚀 Creating ${totalData.length} journeys in parallel...`);

      // ✅ PARALLEL: Create all journeys at once using Promise.all
      const journeyCreationPromises = totalData.map(async (element) => {
        try {
          // Create certification path (Journey)
          await createCertificationPathApi(
            request,
            jwt,
            element.JourneyName,
            element.JourneyDescription,
            element.JourneyImage,
            element.proofOfCertificationNeeded,
          );

          // Fetch the journey UUID
          let journeyUUId = await getjourneyId(
            request,
            jwt,
            element.JourneyName,
          );
          logger.info(
            `Journey UUID for ${element.JourneyName}: ${journeyUUId}`,
          );

          // Get subjects associated with the certification path
          let subOfCertificationPathResp =
            await getCertificationPathSubjectsApi(request, jwt, journeyUUId);
          let subUUIDs = getSubjectUuids(
            subOfCertificationPathResp.subjectPairs,
            element.subjects,
          );

          // Get tracks and delete if needed
          let tracksToDelete = await getJourneyInfo(request, jwt, journeyUUId);
          for (const [index, track] of element.Tracks.entries()) {
            await addtrackToCertificateJourneyApi(
              request,
              jwt,
              journeyUUId,
              track.trackContent,
              index,
              track.trackName,
              track.trackDescription,
              track.trackImage,
              track.trackMileStone,
            );
          }
          await deletetrackapi(request, jwt, tracksToDelete.trackId);
          await addAudToJourneyApi(request, jwt, journeyUUId, auduuid);

          // Update subjects for the journey
          await patchSubjectstoCertificationPathApi(
            request,
            jwt,
            journeyUUId,
            subUUIDs.secondaryUuids,
          );
          await publishJourney(request, jwt, journeyUUId, element.JourneyName);

          // Prepare user and content data for mapping
          let userDetails = shuffledaudUserData
            .slice(0, 10)
            .map(({ id, loginName }) => ({ id, loginName }));
          let contentUuids = getAllContentItemUuids(
            totalData,
            element.JourneyName,
          );

          // Store in journeyMap
          journeyMap.set(journeyUUId, {
            journeyName: element.JourneyName,
            users: userDetails,
            contentUuids: contentUuids,
            defaultUsers: element.defaultUsers,
          });

          logger.info(
            `✅ Journey created: ${element.JourneyName} with ${userDetails.length} users`,
          );

          return {
            journeyName: element.JourneyName,
            journeyUUId,
            userCount: userDetails.length,
          };
        } catch (error) {
          logger.error(
            `❌ Failed to create journey ${element.JourneyName}: ${error.message}`,
          );
          return null;
        }
      });

      // Wait for all journeys to be created
      const results = await Promise.all(journeyCreationPromises);
      const successfulJourneys = results.filter((r) => r !== null);

      logger.info(
        `✅ Successfully created ${successfulJourneys.length}/${totalData.length} journeys in parallel`,
      );
      logger.info(`📊 Total journeys in map: ${journeyMap.size}`);
    });

    // --------- Completion and waiver for @onetimescript (Runs AFTER all journey creation completes) ---------
    test("Completion and waiver @onetimescript", async ({
      request,
    }, testInfo) => {
      testInfo.setTimeout(200000);

      // Verify we're using the SHARED journeyMap from journey creation
      let totalUsers = 0;
      journeyMap.forEach((data) => {
        totalUsers += data.users.length;
      });

      logger.info(`📊 COMPLETION TEST (@onetimescript) - USING SHARED DATA:`);
      logger.info(
        `📈 Total journeys: ${journeyMap.size}, Total user assignments: ${totalUsers}`,
      );

      // Log sample users for verification
      const firstThree = Array.from(journeyMap.entries()).slice(0, 3);
      logger.info(`👥 Sample users (first 3 journeys):`);
      firstThree.forEach(([uuid, data]) => {
        logger.info(
          `   ${data.journeyName}: ${data.users
            .map((u) => u.loginName)
            .join(", ")}`,
        );
      });

      // ✅ PARALLEL: Execute all completion API calls at once
      const completionPromises = [];

      for (const [journeyUUId, data] of journeyMap.entries()) {
        if (journeyUUId) {
          const completionPromise = (async () => {
            try {
              let dataForCompletion =
                reusableFunctions.createJsonObjectwithjustUUIDS(
                  data.users.map((u) => u.id),
                  data.contentUuids,
                  reusableFunctions.getPreviousDayFormattedDate(),
                  reusableFunctions.randomSecondsGenerator(),
                );
              await conentCompletionApi(
                request,
                jwt,
                config.get("Environment").orgId,
                adminUserId,
                dataForCompletion,
              );
              logger.info(
                `Completed Journey: ${
                  data.journeyName
                } with Users: ${JSON.stringify(data.users)}`,
              );
            } catch (error) {
              logger.error(
                `Failed to complete journey ${data.journeyName}: ${error.message}`,
              );
            }
          })();
          completionPromises.push(completionPromise);
        } else {
          logger.error(
            `Journey UUID not found for ${data.journeyName} so completion and waiver not done`,
          );
        }
      }

      // Execute all completion API calls in parallel
      await Promise.all(completionPromises);
      logger.info(
        `✅ All ${completionPromises.length} completion API calls executed in parallel`,
      );
      logger.info(
        `📊 COMPLETION TEST COMPLETE - MARKED ${totalUsers} USERS AS COMPLETE`,
      );
      logger.info(`✅ Certification Path Data Creation Tests Completed!`);
    });
  }); // closes describe "One-Time Script - Serial Execution"

  // --------- User Video Interaction for default users (Parallel Execution) ---------
  test("User Video Interaction for default users @practicingobtaining", async ({
    browser,
    request,
  }, testInfo) => {
    testInfo.setTimeout(90000000);
    try {
      journeyMap = new Map();

      // Filter journeys for PRACTICING or OBTAINING and fetch IDs in parallel
      const relevantJourneys = totalData.filter(
        (journey) =>
          journey.Tracks[0].trackMileStone === "PRACTICING" ||
          journey.Tracks[0].trackMileStone === "OBTAINING",
      );

      const journeyPromises = relevantJourneys.map(async (journey) => {
        try {
          let journeyUUId = await getjourneyId(
            request,
            jwt,
            journey.JourneyName,
          );
          logger.info(
            `Journey UUID for ${journey.JourneyName}: ${journeyUUId}`,
          );

          if (journeyUUId) {
            let contentUuids = getAllContentItemUuids(
              totalData,
              journey.JourneyName,
            );
            let shuffledaudUserData =
              reusableFunctions.shuffleDataWithoutDefaultUsers(
                audUserApiResp.users,
                defaultUsers,
              );
            userDetailsforDataScript = shuffledaudUserData
              .slice(0, 10)
              .map(({ id, loginName }) => ({ id, loginName }));

            return {
              journeyUUId,
              journeyName: journey.JourneyName,
              users: userDetailsforDataScript,
              contentUuids: contentUuids,
              defaultUsers: journey.defaultUsers,
            };
          }
          return null;
        } catch (error) {
          logger.error(
            `Failed to fetch journey ${journey.JourneyName}: ${error.message}`,
          );
          return null;
        }
      });

      // Wait for all journey data to be fetched in parallel
      const journeyResults = await Promise.all(journeyPromises);

      // Populate journeyMap with results
      journeyResults.forEach((result) => {
        if (result) {
          journeyMap.set(result.journeyUUId, {
            journeyName: result.journeyName,
            users: result.users,
            contentUuids: result.contentUuids,
            defaultUsers: result.defaultUsers,
          });
          logger.info(`✅ Added journey ${result.journeyName} to Journey Map`);
        }
      });

      logger.info(
        `✅ Successfully fetched ${journeyMap.size} PRACTICING/OBTAINING journeys in parallel`,
      );
    } catch (error) {
      logger.error(
        `❌ Failed to fetch PRACTICING/OBTAINING journey data: ${error.message}`,
      );
    }

    // For practicing and obtaining - with parallel execution
    const MAX_CONCURRENT_PAGES = 3; // Control concurrent browser operations (reduced from 5 for stability)

    for (const [journeyUUId, data] of journeyMap.entries()) {
      if (!journeyUUId) {
        logger.error(`Journey UUID not found for ${data.journeyName}`);
        continue;
      }

      logger.info(
        `🚀 Processing default user video interactions for journey: ${data.journeyName}`,
      );
      const users = data.defaultUsers;

      // Process users in batches for controlled parallelism
      for (let i = 0; i < users.length; i += MAX_CONCURRENT_PAGES) {
        const userBatch = users.slice(i, i + MAX_CONCURRENT_PAGES);

        const userInteractionPromises = userBatch.map(async (user) => {
          const page = await browser.newPage();
          const loginPage = new loginLPUiPage(page);

          try {
            logger.info(
              `Logging in with user: ${user} for Journey: ${data.journeyName}`,
            );
            await loginPage.clickOnVideo(journeyUUId, user);
            logger.info(`✅ Completed video interaction for ${user}`);
          } catch (error) {
            logger.error(
              `❌ Video interaction failed for user "${user}" in journey "${
                data.journeyName
              }": ${error.message || error}`,
            );
          } finally {
            await page.close();
          }
        });

        // Wait for current batch to complete before starting next batch
        await Promise.all(userInteractionPromises);
        logger.info(
          `✅ Completed batch ${Math.floor(i / MAX_CONCURRENT_PAGES) + 1} for ${
            data.journeyName
          }`,
        );
      }

      logger.info(
        `✅ All default users completed for journey: ${data.journeyName}`,
      );
    }
  });
  // --------- Start default certification paths with few users ----------
  test("Start default certification paths with few users @defaultcertpathsdata", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(100000000);

    let shuffledUserData = reusableFunctions.shuffleDataWithoutDefaultUsers(
      audUserApiResp.users,
      defaultUsers,
    );
    let userData = shuffledUserData.slice(0, 5).map((loginName) => loginName);

    const MAX_CONCURRENT_USERS = 2; // Process 2 users in parallel (safer for browser stability)
    logger.info(
      `🚀 Starting parallel processing for ${userData.length} users (${MAX_CONCURRENT_USERS} concurrent)`,
    );

    // Process users in parallel batches
    for (let i = 0; i < userData.length; i += MAX_CONCURRENT_USERS) {
      const batch = userData.slice(i, i + MAX_CONCURRENT_USERS);
      logger.info(
        `📦 Processing batch ${Math.floor(i / MAX_CONCURRENT_USERS) + 1}: ${
          batch.length
        } users`,
      );

      await Promise.all(
        batch.map(async (user) => {
          let userLoginSuccessful = false;
          let page = null;
          let loginPage = null;
          let coursePage = null;

          // Try to login once for this user
          try {
            page = await browser.newPage();
            loginPage = new loginLPUiPage(page);
            coursePage = new courseCompletionLP(page);

            logger.info(`🔐 Logging in with user: ${user.loginName}`);
            await loginPage.openBrowser();
            await loginPage.login(user.loginName, config.get("Admindata").password);
            // await loginPage.skipIntroScreen();
            userLoginSuccessful = true;
            logger.info(`✅ Login successful for user: ${user.loginName}`);
          } catch (error) {
            logger.error(
              `❌ Login failed for user ${user.loginName}: ${
                error.message || error
              }`,
            );
            if (page) await page.close();
            return; // Skip to next user if login fails
          }

          // If login successful, process all courses for this user
          if (userLoginSuccessful) {
            for (const course of courses) {
              try {
                logger.info(
                  `📚 Processing course "${course.certification}" for user ${user.loginName}`,
                );
                let currentStep = `search "${course.certification}"`;
                await withTimeout(
                  (async () => {
                    await coursePage.popupHandlerinHomepage();
                    await coursePage.explorePercipioPopupHandler();
                    await coursePage.searchTheCourse(course.certification);
                    currentStep = `open certification "${course.certification}"`;
                    await coursePage.clickOnCourse(course.certification);
                    currentStep = `module/play "${course.course}"`;
                    await coursePage.clickOnCourseandPlayButton(course.course);
                  })(),
                  180000,
                ).catch((error) => {
                  throw new Error(`[${currentStep}] ${error.message || error}`);
                });
                logger.info(
                  `✅ Successfully started course "${course.course}" for user ${user.loginName}`,
                );
              } catch (error) {
                logger.error(
                  `❌ Failed to access certification path "${
                    course.course
                  }" for user ${user.loginName}: ${error.message || error}`,
                );
              }
            }
          }

          // Close page after processing all courses for this user
          if (page) await page.close();
          logger.info(`🎯 Completed processing for user: ${user.loginName}`);
        }),
      );

      logger.info(
        `✅ Batch ${Math.floor(i / MAX_CONCURRENT_USERS) + 1} completed`,
      );
    }

    logger.info(`🎉 All ${userData.length} users processed successfully`);
  });

  // --------- Data creation for monthly data in certified dashboard (Parallel Journey Fetching) ---------
  test("Data creation for monthly data in certified dashboard @datascript @started", async ({
    request,
  }, testInfo) => {
    testInfo.setTimeout(9000000);
    try {
      journeyMap = new Map(); // Reset SHARED journeyMap
      logger.info(
        `🚀 TEST 1: Starting data creation for ${totalData.length} journeys...`,
      );

      // ✅ PARALLEL: Fetch all journey IDs at once
      const journeyPromises = totalData.map(async (journey) => {
        try {
          let journeyUUId = await getjourneyId(
            request,
            jwt,
            journey.JourneyName,
          );
          logger.info(
            `Journey UUID for ${journey.JourneyName}: ${journeyUUId}`,
          );

          if (journeyUUId) {
            let contentUuids = getAllContentItemUuids(
              totalData,
              journey.JourneyName,
            );
            // ✅ Each journey gets its own shuffled users
            let shuffledaudUserData =
              reusableFunctions.shuffleDataWithoutDefaultUsers(
                audUserApiResp.users,
                defaultUsers,
              );
            let userDetailsforDataScript = shuffledaudUserData
              .slice(0, 10)
              .map(({ id, loginName }) => ({ id, loginName }));

            return {
              journeyUUId,
              journeyName: journey.JourneyName,
              users: userDetailsforDataScript,
              contentUuids: contentUuids,
              defaultUsers: journey.defaultUsers,
            };
          }
          return null;
        } catch (error) {
          logger.error(
            `Failed to fetch journey ${journey.JourneyName}: ${error.message}`,
          );
          return null;
        }
      });

      // Wait for all journey data to be fetched in parallel
      const journeyResults = await Promise.all(journeyPromises);

      // Populate SHARED journeyMap with results
      let totalUsers = 0;
      journeyResults.forEach((result) => {
        if (result) {
          journeyMap.set(result.journeyUUId, {
            journeyName: result.journeyName,
            users: result.users,
            contentUuids: result.contentUuids,
            defaultUsers: result.defaultUsers,
          });
          totalUsers += result.users.length;
        }
      });

      logger.info(
        `✅ Successfully fetched ${journeyMap.size} journeys in parallel`,
      );
      logger.info(
        `JourneyMap: ${JSON.stringify(Object.fromEntries(journeyMap), null, 2)}`,
      );
      logger.info(`📊 TEST 1 COMPLETE - SHARED DATA CREATED:`);
      logger.info(
        `📈 Total journeys: ${journeyMap.size}, Total user assignments: ${totalUsers}`,
      );

      // Log sample users for verification
      const firstThree = Array.from(journeyMap.entries()).slice(0, 3);
      logger.info(`👥 Sample users (first 3 journeys):`);
      firstThree.forEach(([uuid, data]) => {
        logger.info(
          `   ${data.journeyName}: ${data.users
            .map((u) => u.loginName)
            .join(", ")}`,
        );
      });
    } catch (error) {
      logger.error(`Failed to fetch journey data: ${error.message}`);
    }
  });

  // --------- Completion and waiver for @datascript (Uses journeyMap from "Data creation" test above) ---------
  test("Completion and waiver @datascript", async ({ request }, testInfo) => {
    testInfo.setTimeout(200000);

    // Verify we're using the SHARED journeyMap from Test 1
    let totalUsers = 0;
    journeyMap.forEach((data) => {
      totalUsers += data.users.length;
    });

    logger.info(`📊 TEST 2 STARTING - USING SHARED DATA FROM TEST 1:`);
    logger.info(
      `📈 Total journeys: ${journeyMap.size}, Total user assignments: ${totalUsers}`,
    );

    // Log sample users for verification
    const firstThree = Array.from(journeyMap.entries()).slice(0, 3);
    logger.info(`👥 Sample users (first 3 journeys):`);
    firstThree.forEach(([uuid, data]) => {
      logger.info(
        `   ${data.journeyName}: ${data.users
          .map((u) => u.loginName)
          .join(", ")}`,
      );
    });

    // ✅ PARALLEL: Execute all completion API calls at once
    const completionPromises = [];

    for (const [journeyUUId, data] of journeyMap.entries()) {
      if (journeyUUId) {
        const completionPromise = (async () => {
          try {
            let dataForCompletion =
              reusableFunctions.createJsonObjectwithjustUUIDS(
                data.users.map((u) => u.id),
                data.contentUuids,
                reusableFunctions.getPreviousDayFormattedDate(),
                reusableFunctions.randomSecondsGenerator(),
              );
            await conentCompletionApi(
              request,
              jwt,
              config.get("Environment").orgId,
              adminUserId,
              dataForCompletion,
            );
            logger.info(
              `Completed Journey: ${
                data.journeyName
              } with Users: ${JSON.stringify(data.users)}`,
            );
          } catch (error) {
            logger.error(
              `Failed to complete journey ${data.journeyName}: ${error.message}`,
            );
          }
        })();
        completionPromises.push(completionPromise);
      } else {
        logger.error(
          `Journey UUID not found for ${data.journeyName} so completion and waiver not done`,
        );
      }
    }

    // Execute all completion API calls in parallel
    await Promise.all(completionPromises);
    logger.info(
      `✅ All ${completionPromises.length} completion API calls executed in parallel`,
    );
    logger.info(`📊 TEST 2 COMPLETE - MARKED ${totalUsers} USERS AS COMPLETE`);
  });

  // --------- User Video Interaction for all users (Uses SHARED journeyMap, Batched Browser Parallelization) ---------
  test("User Video Interaction for all users  @datascript @started", async ({
    browser,
  }, testInfo) => {
    testInfo.setTimeout(90000000);

    // Verify we're using the SHARED journeyMap from Test 1
    let totalUsers = 0;
    journeyMap.forEach((data) => {
      totalUsers += data.users.length;
    });

    logger.info(`📊 TEST 3 STARTING - USING SHARED DATA FROM TEST 1:`);
    logger.info(
      `📈 Total journeys: ${journeyMap.size}, Total user assignments: ${totalUsers}`,
    );

    // Log sample users for verification
    const firstThree = Array.from(journeyMap.entries()).slice(0, 3);
    logger.info(`👥 Sample users (first 3 journeys):`);
    firstThree.forEach(([uuid, data]) => {
      logger.info(
        `   ${data.journeyName}: ${data.users
          .map((u) => u.loginName)
          .join(", ")}`,
      );
    });

    const MAX_CONCURRENT_PAGES = 5; // Control concurrent browser operations

    // Process journeys one by one, but parallelize users within each journey
    for (const [journeyUUId, data] of journeyMap.entries()) {
      if (!journeyUUId) {
        logger.error(`Journey UUID not found for ${data.journeyName}`);
        continue;
      }

      logger.info(
        `🚀 Processing video interactions for journey: ${data.journeyName}`,
      );
      let users = data.users;

      // ✅ PARALLEL: Process users in batches for controlled parallelism
      for (let i = 0; i < users.length; i += MAX_CONCURRENT_PAGES) {
        const userBatch = users.slice(i, i + MAX_CONCURRENT_PAGES);

        const userInteractionPromises = userBatch.map(async (user) => {
          const page = await browser.newPage();
          const loginPage = new loginLPUiPage(page);

          try {
            logger.info(
              `Logging in with user: ${user.loginName} for Journey Completion: ${data.journeyName}`,
            );
            await loginPage.clickOnVideo(journeyUUId, user.loginName);

            // Upload certificate if journey name matches
            if (data.journeyName === "AWS Certified Developer Learning Path") {
              try {
                logger.info(
                  `Uploading certificate for user: ${user.loginName} in journey: ${data.journeyName}`,
                );
                await loginPage.uploadCertificate();
              } catch (error) {
                logger.error(
                  `Failed to upload certificate for user: ${user.loginName} in journey: ${data.journeyName}. Error: ${error.message}`,
                );
              }
            }

            logger.info(`✅ Completed video interaction for ${user.loginName}`);
          } catch (error) {
            logger.error(
              `❌ Video interaction failed for user "${
                user.loginName
              }" in journey "${data.journeyName}": ${error.message || error}`,
            );
          } finally {
            await page.close();
          }
        });

        // Wait for current batch to complete before starting next batch
        await Promise.all(userInteractionPromises);
        logger.info(
          `✅ Completed batch ${Math.floor(i / MAX_CONCURRENT_PAGES) + 1} for ${
            data.journeyName
          }`,
        );
      }

      logger.info(`✅ All users completed for journey: ${data.journeyName}`);
    }

    logger.info(
      `📊 TEST 3 COMPLETE - VIDEO INTERACTIONS FOR ${totalUsers} USERS DONE`,
    );
    logger.info(
      `✅✅✅ ALL 3 TESTS USED SAME DATA - VERIFICATION COMPLETE! ✅✅✅`,
    );
  });

  test.afterAll(async () => {
    logger.info("✅ Certification Path Data Creation Tests Completed!");
  });
});
