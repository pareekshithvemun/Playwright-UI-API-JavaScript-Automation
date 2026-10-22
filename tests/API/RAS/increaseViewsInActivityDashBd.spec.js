import {
  actvityDashBoardApi,
  audioBookConsumptioApi,
  audioSummaryConsumptionApi,
  bookConsumptioApi,
  bookSummaryConsumptionApi,
  config,
  courseConsumptionApi,
  generateToken,
  getAllUserApi,
  getContentUUIdsApi,
  getvideoIdFromCourseIdApi,
  linkedContentConsumptioApi,
  logger,
  reusableFunctions,
  test,
  videoConsumptionApi,
} from "../../../path.js";

// Picks catalog content once, then raises view counts per dashboard time filter in parallel.
// Skips Last 7 days / Last 1 month — nested in longer windows; parallel runs would over-boost.
test.describe.configure({ mode: "serial" });

const ACTIVITY_DASHBOARD_FILTERS = [
  { label: "Last 3 months to date", preset: "presetLast3Months" },
  { label: "Last 6 months to date", preset: "presetLast6Months" },
  { label: "Last 9 months to date", preset: "presetLast9Months" },
  { label: "Last 12 months to date", preset: "presetLast12Months" },
];

let jwt;
let jwtTimes;
let adminUserId;
let orgId;
let allUserResponse;
let allContentUUIdsApiresponse;
let bookContentID;
let videoContentID;
let courseContentID;
let audioBookContentID;
let audioSummaryContentID;
let bookSummaryContentID;
let linkedContentContentID;

test.beforeAll("get Token", async ({ request }, testInfo) => {
  testInfo.setTimeout(100000);
  jwt = await generateToken(request);
  jwtTimes = await reusableFunctions.jwtDecoder(jwt);
});

test("GetContentIDs", async ({ request }, testInfo) => {
  testInfo.setTimeout(300000);
  allUserResponse = await getAllUserApi(request, jwt);
  adminUserId = reusableFunctions.getAdminUserId(allUserResponse);

  orgId = config.get("Environment").orgId;
  logger.info(`OrgId:${orgId}`);
  allContentUUIdsApiresponse = await getContentUUIdsApi(
    request,
    jwt,
    orgId,
    adminUserId,
    1000,
  );

  const listingRows =
    allContentUUIdsApiresponse[0].data.dwAllContentListingRows;

  // Pick one asset UUID per content type (used later for consumption calls).
  const contentTypes = [
    "Course",
    "Book",
    "Audiobook",
    "Audio Summary",
    "Book Summary",
    "Link",
    "Video",
  ];

  for (let content of contentTypes) {
    let filteredContent;
    // Skip rows with no duration; course rows also require asset_type to match.
    if (content === "Course") {
      filteredContent = listingRows
        .filter(
          (item) =>
            item.content_type === content && item.asset_type === content,
        )
        .filter((item) => item.estimated_duration_seconds !== null)
        .map(({ asset_uuid, estimated_duration_seconds }) => ({
          asset_uuid,
          estimated_duration_seconds,
        }));
      filteredContent =
        reusableFunctions.removingDuplicateElementsFromArray(filteredContent);
    } else {
      filteredContent = listingRows
          .filter((item) => item.content_type === content)
          .filter((item) => item.estimated_duration_seconds !== null)
          .map(({ asset_uuid, estimated_duration_seconds }) => ({
            asset_uuid,
            estimated_duration_seconds,
          }));
    }
    filteredContent = reusableFunctions.shuffleDataInArray(filteredContent);

    // Dedupe again after shuffle so we still take the first stable pick.
    const filteredContentwithoutDuplicates =
      reusableFunctions.removingDuplicateElementsFromArray(filteredContent);

    try {
      switch (content) {
        case "Book":
          bookContentID = getcontentId(
            content,
            filteredContentwithoutDuplicates,
          ).asset_uuid;
          break;
        case "Course":
          courseContentID = getcontentId(
            content,
            filteredContentwithoutDuplicates,
          ).asset_uuid;
          break;
        case "Audiobook":
          audioBookContentID = getcontentId(
            content,
            filteredContentwithoutDuplicates,
          ).asset_uuid;
          break;
        case "Audio Summary":
          audioSummaryContentID = getcontentId(
            content,
            filteredContentwithoutDuplicates,
          ).asset_uuid;
          break;
        case "Book Summary":
          bookSummaryContentID = getcontentId(
            content,
            filteredContentwithoutDuplicates,
          ).asset_uuid;
          break;
        case "Link":
          linkedContentContentID = getcontentId(
            content,
            filteredContentwithoutDuplicates,
          ).asset_uuid;
          break;
        case "Video":
          linkedContentContentID = getcontentId(
            content,
            filteredContentwithoutDuplicates,
          ).asset_uuid;
          break;
        default:
          break;
      }
    } catch (error) {
      logger.info(
        `Unable to fetch some of the content id and error for same ${error}`,
      );
    }
  }

  // Course video id (needed for course/video consumption APIs).
  if (!isUuidString(courseContentID)) {
    logger.info("Skipping video id lookup: no valid course UUID string");
    return;
  }

  const courseDetailResponse = await getvideoIdFromCourseIdApi(
    request,
    jwt,
    courseContentID,
  );
  const contentItems =
    courseDetailResponse[0]?.data?.courseWithLT?.contentItems;
  if (contentItems) {
    const rawVideoId = contentItems[0].id;
    videoContentID = rawVideoId != null ? String(rawVideoId) : undefined;
    logger.info(
      `Fetched video id ${videoContentID} for course id ${courseContentID}`,
    );
  } else {
    logger.info(`Unable to fetch video Id for courseid:${courseContentID}`);
  }
});

test("Increase view counts for dashboard filters in parallel", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(10000000);
  // Concurrent per filter in this worker (Playwright parallel workers cannot share setup vars).
  await Promise.all(
    ACTIVITY_DASHBOARD_FILTERS.map((filter) =>
      increaseViewsForFilter(request, filter, jwt, jwtTimes),
    ),
  );
});

// Reads one preset's dashboard rows and fires the matching consumption APIs.
async function increaseViewsForFilter(request, filter, filterJwt, filterJwtTimes) {
  const activityDashboardResponse = await actvityDashBoardApi(
    request,
    filterJwt,
    filter.preset,
  );
  const dashboardRows =
    activityDashboardResponse[0]?.data?.activityDashboard?.data;
  logger.info(`activityContentArrayNumericals for ${filter.label}:`);
  logger.info(dashboardRows);
  logger.info(`bookContentID: ${bookContentID},
    videoContentID: ${videoContentID},
    courseContentID: ${courseContentID},
    audioBookContentID: ${audioBookContentID},
    audioSummaryContentID: ${audioSummaryContentID},
    bookSummaryContentID: ${bookSummaryContentID},
    linkedContentContentID: ${linkedContentContentID}`);
  if (!dashboardRows) {
    logger.info(
      `Unable to fetch data from activity Board for ${filter.label}`,
    );
    return;
  }

  // Match each dashboard row to the right consumption API and repeat calls until counts look right.
  for (const row of dashboardRows) {
    const extraConsumptionCalls =
      reusableFunctions.getViewCountBasedOnCompletionCount(
        row.totalAchievements,
        row.countViews,
      );

    switch (row.assetType) {
      case "AudioBook":
        await handleConsumptionAPI(
          request,
          filterJwt,
          filterJwtTimes,
          audioBookContentID,
          "AUDIOBOOK",
          audioBookConsumptioApi,
          row,
          extraConsumptionCalls,
        );
        break;
      case "Course":
        await handleConsumptionAPI(
          request,
          filterJwt,
          filterJwtTimes,
          courseContentID,
          "COURSE",
          courseConsumptionApi,
          row,
          extraConsumptionCalls,
          videoContentID,
        );
        break;
      case "Video":
        await handleConsumptionAPI(
          request,
          filterJwt,
          filterJwtTimes,
          courseContentID,
          "VIDEO",
          videoConsumptionApi,
          row,
          extraConsumptionCalls,
          videoContentID,
        );
        break;
      case "Audio Summary":
        await handleConsumptionAPI(
          request,
          filterJwt,
          filterJwtTimes,
          audioSummaryContentID,
          "AUDIOBOOK",
          audioSummaryConsumptionApi,
          row,
          extraConsumptionCalls,
        );
        break;
      case "Book Summary":
        await handleConsumptionAPI(
          request,
          filterJwt,
          filterJwtTimes,
          bookSummaryContentID,
          "BOOK",
          bookSummaryConsumptionApi,
          row,
          extraConsumptionCalls,
        );
        break;
      case "Book":
        await handleConsumptionAPI(
          request,
          filterJwt,
          filterJwtTimes,
          bookContentID,
          "BOOK",
          bookConsumptioApi,
          row,
          extraConsumptionCalls,
        );
        break;
      case "Linked Content":
        await handleConsumptionAPI(
          request,
          filterJwt,
          filterJwtTimes,
          linkedContentContentID,
          "LINKED_CONTENT",
          linkedContentConsumptioApi,
          row,
          extraConsumptionCalls,
        );
        break;
      default:
        break;
    }
  }
}

async function handleConsumptionAPI(
  request,
  jwt,
  jwtTimes,
  contentID,
  contentType,
  consumptionApiFunction,
  dashboardRow,
  expectedViewCount,
  videoID = null,
) {
  try {
    if (dashboardRow.assetType === "summary") {
      logger.info(
        "Skipping summary row (aggregated totals, not one consumable asset).",
      );
      return;
    }

    if (!isUuidString(contentID)) {
      logger.info(
        `Skipping ${dashboardRow.assetType}: content UUID is not a valid string`,
      );
      return;
    }

    const needsCourseAndVideo =
      dashboardRow.assetType === "Course" ||
      dashboardRow.assetType === "Video";
    if (needsCourseAndVideo && !isUuidString(videoID)) {
      logger.info(
        `Skipping ${dashboardRow.assetType}: video id is not a valid string`,
      );
      return;
    }

    logger.info(
      `Making view count for content Type:${dashboardRow.assetType} to ${expectedViewCount}`,
    );

    if (expectedViewCount <= 0) {
      logger.info(
        `View count for content Type:${contentType} is already more than expected`,
      );
      return;
    }

    for (let i = 0; i < expectedViewCount; i++) {
      const newUserToken = await refreshUserJWTForViewsCount(
        jwtTimes,
        jwt,
        request,
      );
      jwtTimes = newUserToken.jwtTimes;
      jwt = newUserToken.jwt;
      if (needsCourseAndVideo) {
        await consumptionApiFunction(
          request,
          jwt,
          contentID,
          videoID,
          contentType,
        );
      } else {
        await consumptionApiFunction(request, jwt, contentID, contentType);
      }
    }
  } catch (e) {
    logger.error(
      `Error occured while consuimg one of the content due to error ${e}`,
    );
  }
}

function getcontentId(content, filteredContentArray) {
  const contentMap = {
    Book: filteredContentArray[0],
    Video: filteredContentArray[0],
    Course: filteredContentArray[0],
    Audiobook: filteredContentArray[0],
    "Audio Summary": filteredContentArray[0],
    "Book Summary": filteredContentArray[0],
    Link: filteredContentArray[0],
  };
  return contentMap[content];
}

async function refreshUserJWTForViewsCount(jwtTimes, jwt, request) {
  const currentTime = Math.floor(Date.now() / 1000);
  if (jwtTimes.exp <= currentTime) {
    const newjwt = await generateToken(request);
    const newJwtTimes = await reusableFunctions.jwtDecoder(newjwt);
    logger.info(`new jwt has been generated at ${newJwtTimes.iat}`);
    return { jwt: newjwt, jwtTimes: newJwtTimes };
  } else {
    logger.info(`Still using the old jwt token`);
    return { jwt, jwtTimes };
  }
}

function isUuidString(value) {
  return typeof value === "string" && value.length > 0;
}
