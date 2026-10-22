/**
 * Grant XP (completions/waivers) for default users and random users via the completion-and-waivers API.
 *
 * IMPORTANT POINTS
 * - Default users: from defaultUsers.json (by loginName). Random users: shuffled subset of non-default users per run; pool refilled when needed.
 * - Content pool: not built in Setup. Setup loads the content catalog only. The content pool is built in each granting test ("Grant XP for default users" and "Grant XP for random users") via buildFinalContentArray from that catalog (shuffled, by type); courses include first video.
 * - Each user (default and random) gets their own random subset: up to ITEMS_PER_USER (50) items. We copy the pool, shuffle, then take 50 — so every user gets a different random 50.
 * - Completions are sent in batches (CONTENT_BATCH_SIZE = 20). Each batch triggers one completion-and-waiver API call.
 * - Logging: "-> Calling completion-and-waiver API: user <id>, batch X/Y, Z items" is emitted immediately before each completion-and-waiver API call for both default and random users.
 * - Random users: user pool is shuffled before picking each run; same user is not picked again in a run until the pool is refilled (when fewer than userCount remain).
 */

import {
  test,
  generateToken,
  getContentUUIdsApi,
  getAllUserApi,
  conentCompletionApi,
  getvideoIdFromCourseIdApi,
  logger,
  reusableFunctions,
  config,
} from "../../../path.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_USERS_FILE = "defaultUsers.json";
const CONTENT_BATCH_SIZE = 20;
const CONTENT_CATALOG_MAX_ITEMS = 4000;
const MAX_COURSES = 35;
const MAX_ITEMS_PER_TYPE = 50;
const ITEMS_PER_USER = 50;
const RANDOM_USERS_MIN = 10;
const RANDOM_USERS_MAX = 20;
const RANDOM_USERS_PER_RUN_DEFAULT = 15;
const RANDOM_RUNS_DEFAULT = 2;

const CONTENT_TYPES = [
  "Course",
  "Book",
  "Audiobook",
  "Audio Summary",
  "Book Summary",
  "Link",
  "Video",
];

// ---------------------------------------------------------------------------
// Shared state (set in Setup, used in later tests)
// ---------------------------------------------------------------------------

let jwt;
let adminUserId;
let allUserResponse;
let allContentUUIdsApiResponse;
let orgId;
let defaultUserIds = [];
let defaultUserLoginNames = [];
let defaultLoginNamesSet = new Set();
let nonDefaultUsers = [];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.beforeEach("Get authentication token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Setup: load users, content catalog, default user IDs", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(600000);

  allUserResponse = await getAllUserApi(request, jwt);
  adminUserId = reusableFunctions.getAdminUserId(allUserResponse);
  orgId = config.get("Environment").orgId;

  allContentUUIdsApiResponse = await getContentUUIdsApi(
    request,
    jwt,
    orgId,
    adminUserId,
    CONTENT_CATALOG_MAX_ITEMS
  );

  const defaultUsersData = reusableFunctions.readDatafromJsonFilenotasync(
    reusableFunctions.getPath("testData/usersData", DEFAULT_USERS_FILE)
  );
  const defaultLoginNames = (defaultUsersData?.defaultUsersData || []).map(
    (u) => u.loginName
  );
  // Convert to Set for fast lookup (O(1) .has() vs O(n) .includes() when we check each user)
  defaultLoginNamesSet = new Set(defaultLoginNames);

  // One pass: split users into default (IDs only) and non-default (full user objects)
  for (const u of allUserResponse.users) {
    if (defaultLoginNamesSet.has(u.loginName)) {
      defaultUserIds.push(u.id);
    } else {
      nonDefaultUsers.push(u);
    }
  }

  defaultUserLoginNames = allUserResponse.users
    .filter((u) => defaultUserIds.includes(u.id))
    .map((u) => u.loginName);

  logger.info(
    `Setup: ${defaultUserIds.length} default users, ${nonDefaultUsers.length} non-default users, org ${orgId}`
  );
  if (defaultUserIds.length === 0) {
    logger.warn("No default users in org; default-user completion will skip.");
  }
});

test("Grant XP for default users", async ({ request }, testInfo) => {
  testInfo.setTimeout(500000);
  if (defaultUserIds.length === 0) return;

  const contentPool = await buildFinalContentArray(
    request,
    jwt,
    allContentUUIdsApiResponse
  );
  if (!contentPool.length) return;

  const completionDate = reusableFunctions.getPreviousDayFormattedDate();
  logger.info(
    `[Default users] ${defaultUserIds.length} users, pool ${contentPool.length}, ${ITEMS_PER_USER} items/user`
  );
  logger.info(`[Default users] user IDs: ${JSON.stringify(defaultUserIds)}`);
  logger.info(
    `[Default users] user loginNames: ${JSON.stringify(defaultUserLoginNames)}`
  );

  for (let i = 0; i < defaultUserIds.length; i++) {
    logger.info(
      `[Default users] User ${i + 1}/${
        defaultUserIds.length
      }: granting XP (content completion)`
    );
    await grantXpForUser(
      request,
      jwt,
      orgId,
      adminUserId,
      defaultUserIds[i],
      contentPool,
      completionDate
    );
  }
  logger.info("[Default users] done.");
});

test("Grant XP for random users (new set per run)", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(500000);

  const userCount = getRandomUserCount();
  const runs = getNumberOfRuns();

  const userPool = nonDefaultUsers;

  const contentPool = await buildFinalContentArray(
    request,
    jwt,
    allContentUUIdsApiResponse
  );
  if (!contentPool.length) return;

  const completionDate = reusableFunctions.getPreviousDayFormattedDate();
  logger.info(
    `[Random users] ${runs} run(s), ${userCount} users/run, pool ${contentPool.length} items, ${ITEMS_PER_USER} items/user.`
  );

  let usersAvailable = [...userPool];

  for (let runIndex = 0; runIndex < runs; runIndex++) {
    if (usersAvailable.length < userCount) {
      usersAvailable = [...userPool];
    }

    const shuffled = reusableFunctions.shuffleDataInArray([...usersAvailable]);
    const usersPickedThisRun = reusableFunctions.limitTheArrayData(
      shuffled,
      userCount
    );
    const pickedIds = new Set(usersPickedThisRun.map((u) => u.id));
    usersAvailable = usersAvailable.filter((u) => !pickedIds.has(u.id));

    const pickedLoginNames = usersPickedThisRun.map((u) => u.loginName);
    logger.info(
      `Run ${runIndex + 1}/${runs}: picked user IDs ${JSON.stringify([
        ...pickedIds,
      ])}`
    );
    logger.info(
      `Run ${runIndex + 1}/${runs}: picked user loginNames ${JSON.stringify(
        pickedLoginNames
      )}`
    );

    for (let u = 0; u < usersPickedThisRun.length; u++) {
      logger.info(
        `[Random users] Run ${runIndex + 1}/${runs}, User ${u + 1}/${
          usersPickedThisRun.length
        }: granting XP (content completion)`
      );
      await grantXpForUser(
        request,
        jwt,
        orgId,
        adminUserId,
        usersPickedThisRun[u].id,
        contentPool,
        completionDate
      );
    }
    logger.info(`[Random users] Run ${runIndex + 1}/${runs} done.`);
  }
});

// ---------------------------------------------------------------------------
// Helpers: grant XP for one user
// ---------------------------------------------------------------------------

async function grantXpForUser(
  request,
  jwt,
  orgId,
  adminUserId,
  userId,
  contentPool,
  date
) {
  const contentForUser = getRandomContentSubsetForUser(
    contentPool,
    ITEMS_PER_USER
  );
  const batches = reusableFunctions.getChunks(
    contentForUser,
    CONTENT_BATCH_SIZE
  );

  logger.info(
    `  -> Content completion: ${contentForUser.length} items in ${batches.length} batch(es)`
  );

  for (const batch of batches) {
    const payload = reusableFunctions.createJsonObject([userId], batch, date);
    await conentCompletionApi(request, jwt, orgId, adminUserId, payload);
  }
}

// Each user gets their own random subset (ITEMS_PER_USER = 50): we copy the shared
// contentPool, shuffle that copy, then take up to 50 items. Every call does its own
// shuffle, so each user (default and random) gets a different random 50.
function getRandomContentSubsetForUser(contentPool, maxItems) {
  if (!contentPool?.length) return [];
  const shuffled = reusableFunctions.shuffleDataInArray([...contentPool]);
  return reusableFunctions.limitTheArrayData(shuffled, maxItems);
}

// ---------------------------------------------------------------------------
// Helpers: config from env
// ---------------------------------------------------------------------------

function getRandomUserCount() {
  const n = parseInt(process.env.RANDOM_USER_COUNT || "", 10);
  if (Number.isNaN(n)) return RANDOM_USERS_PER_RUN_DEFAULT;
  return Math.min(RANDOM_USERS_MAX, Math.max(RANDOM_USERS_MIN, n));
}

function getNumberOfRuns() {
  const n = parseInt(process.env.numberOfTimesToRunScript || "", 10);
  return !Number.isNaN(n) && n > 0 ? n : RANDOM_RUNS_DEFAULT;
}

// ---------------------------------------------------------------------------
// Helpers: build content pool from catalog
// ---------------------------------------------------------------------------

async function buildFinalContentArray(request, jwt, allContentResponse) {
  const catalogRows =
    allContentResponse[0]?.data?.dwAllContentListingRows || [];
  const shuffledRows = reusableFunctions.shuffleDataInArray([...catalogRows]);

  logger.info(
    `[Pool] Building content pool from ${shuffledRows.length} catalog rows (shuffled first)`
  );

  const allItems = [];

  for (const contentType of CONTENT_TYPES) {
    const isCourse = contentType === "Course";

    let itemsOfType = shuffledRows
      .filter(
        (row) =>
          row.content_type === contentType &&
          (!isCourse || row.asset_type === contentType) &&
          row.estimated_duration_seconds != null
      )
      .map((row) => ({
        asset_uuid: row.asset_uuid,
        estimated_duration_seconds: row.estimated_duration_seconds,
      }));

    if (isCourse && itemsOfType.length > 0) {
      const limitedCourses = reusableFunctions.limitTheArrayData(
        itemsOfType,
        MAX_COURSES
      );
      logger.info(
        `[Pool] Processing Course: ${limitedCourses.length} of ${itemsOfType.length} courses (first video per course)`
      );
      itemsOfType = await processCourseContent(request, jwt, limitedCourses);
    }

    if (!itemsOfType?.length) continue;

    const deduped =
      reusableFunctions.removingDuplicateElementsFromArray(
        reusableFunctions.shuffleDataInArray(itemsOfType)
      ) || [];
    if (!deduped.length) continue;

    const limited = isCourse
      ? deduped
      : reusableFunctions.limitTheArrayData(deduped, MAX_ITEMS_PER_TYPE);

    const contentUuids = limited.map((item) => item.asset_uuid);
    logger.info(`[Pool] ${contentType}: ${limited.length} items`);
    logger.info(`[Pool] ${contentType} UUIDs: ${JSON.stringify(contentUuids)}`);
    allItems.push(...limited);
  }

  if (!allItems.length) return [];

  const final =
    reusableFunctions.removingDuplicateElementsFromArray(allItems) || [];
  const allUuids = final.map((item) => item.asset_uuid);
  logger.info(`[Pool] Total: ${final.length} items`);
  logger.info(`[Pool] All UUIDs: ${JSON.stringify(allUuids)}`);
  return final;
}

async function processCourseContent(request, jwt, courseItems) {
  const resultList = [...courseItems];
  const total = resultList.length;
  logger.info(`[Pool] Processing ${total} courses in parallel`);

  const outcomes = await Promise.allSettled(
    resultList.map(async (courseItem) => {
      const res = await getvideoIdFromCourseIdApi(
        request,
        jwt,
        courseItem.asset_uuid
      );
      const firstVideo = res[0]?.data?.courseWithLT?.contentItems?.[0];
      if (firstVideo) {
        return {
          asset_uuid: firstVideo.id,
          estimated_duration_seconds: 5000,
        };
      }
      return null;
    })
  );

  const videos = outcomes
    .filter((o) => o.status === "fulfilled" && o.value != null)
    .map((o) => o.value);
  outcomes
    .filter((o) => o.status === "rejected")
    .forEach((o) =>
      logger.error(`Course failed: ${o.reason?.message ?? o.reason}`)
    );

  logger.info(
    `[Pool] Course progress: ${total}/${total} courses processed (parallel)`
  );
  resultList.push(...videos);
  return resultList;
}
