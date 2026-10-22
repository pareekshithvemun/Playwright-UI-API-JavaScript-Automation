import { test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { getContentUUIdsApi } from "../../../helpers/API/apibuilders/getContentUUID.js";
import { getAllUserApi } from "../../../helpers/API/apibuilders/getAllUsers.js";
import { conentCompletionApi } from "../../../helpers/API/apibuilders/conentCompletion.js";
import { getvideoIdFromCourseIdApi } from "../../../helpers/API/apibuilders/getvideoIdFromCourseId.js";
import { logger } from "../../../logger.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import config from "config";

let jwt;
let adminUserId;
let allUserResponse;
let allContentUUIdsApiResponse;
let orgId;
let contentCompletionApiResp;

test.beforeEach("Get authentication token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Get all users, org ID and content in org", async ({ request }, testInfo) => {
  testInfo.setTimeout(600000);
  
  // Get all users and extract admin user ID
  allUserResponse = await getAllUserApi(request, jwt);
  adminUserId = reusableFunctions.getAdminUserId(allUserResponse);
  
  // Get organization ID from config
  orgId = config.get("Environment").orgId;
  logger.info(`OrgId: ${orgId}`);
  
  // Get all content UUIDs for the organization
  allContentUUIdsApiResponse = await getContentUUIdsApi(
    request,
    jwt,
    orgId,
    adminUserId,
    2000
  );
});

test("Populate data in activity dashboard", async ({ request }, testInfo) => {
  testInfo.setTimeout(500000);
  
  const contentArray = [];
  const contentTypes = [
    "Course",
    "Book",
    "Audiobook",
    "Audio Summary",
    "Book Summary",
    "Link",
    "Video",
  ];

  // Process each content type and populate content array
  for (const contentType of contentTypes) {
    let filteredContent = getFilteredContentByType(
      allContentUUIdsApiResponse,
      contentType
    );

    // Special handling for Course content type - includes video IDs
    if (contentType === "Course") {
      filteredContent = processCourseContent(
        request,
        jwt,
        filteredContent
      );
    }

    // Shuffle, remove duplicates, and limit content for each type
    try {
      filteredContent = reusableFunctions.shuffleDataInArray(filteredContent);
      let filteredContentWithoutDuplicates =
        reusableFunctions.removingDuplicateElementsFromArray(filteredContent);

      // Limit content UUIDs for each type (except Course, which already includes videos)
      if (contentType !== "Course") {
        filteredContentWithoutDuplicates = reusableFunctions.limitTheArrayData(
          filteredContentWithoutDuplicates,
          5
        );
      }

      logger.info(`Content type: ${contentType}`);
      logger.info(filteredContentWithoutDuplicates);
      contentArray.push(...filteredContentWithoutDuplicates);
    } catch (error) {
      logger.error(`Unable to fetch data for ${contentType} due to error:`);
      logger.error(error);
    }
  }

  // Remove duplicate content from final array
  const finalContentArray =
    reusableFunctions.removingDuplicateElementsFromArray(contentArray);
  
  const date = reusableFunctions.getPreviousDayFormattedDate();
  
  logger.info("Final content array:");
  logger.info(finalContentArray);
  logger.info(`Total content items: ${finalContentArray.length}`);

  // Populate activity dashboard data multiple times based on environment variable
  const numberOfIterations = parseInt(process.env.numberOfTimesToRunScript) || 0;
  
  for (let i = 0; i <= numberOfIterations; i++) {
    // Shuffle users and limit to 8 users per iteration
    const shuffledUsers = reusableFunctions.shuffleDataInArray(
      allUserResponse.users
    );
    const limitedUserArray = reusableFunctions
      .limitTheArrayData(shuffledUsers, 8)
      .map((user) => user.id);

    // Create JSON object for content completion API
    const dataForContentCompletion = reusableFunctions.createJsonObject(
      limitedUserArray,
      finalContentArray,
      date
    );
    
    logger.info(`Iteration ${i + 1} - Content completion data:`);
    logger.info(dataForContentCompletion);
    logger.info(`Data items count: ${dataForContentCompletion.length}`);

    // Call content completion API
    contentCompletionApiResp = await conentCompletionApi(
      request,
      jwt,
      orgId,
      adminUserId,
      dataForContentCompletion
    );
    logger.info(`Iteration ${i + 1} - API response:`, contentCompletionApiResp);
  }
});

// Get filtered content by content type, excluding items with null duration
function getFilteredContentByType(allContentResponse, contentType) {
  const contentRows = allContentResponse[0]?.data?.dwAllContentListingRows || [];
  
  let filteredContent = contentRows
    .filter((item) => {
      // For Course type, match both content_type and asset_type
      if (contentType === "Course") {
        return item.content_type === contentType && item.asset_type === contentType;
      }
      return item.content_type === contentType;
    })
    .filter((item) => item.estimated_duration_seconds !== null)
    .map(({ asset_uuid, estimated_duration_seconds }) => ({
      asset_uuid,
      estimated_duration_seconds,
    }));

  return filteredContent;
}

// Process course content by fetching video IDs from course IDs
async function processCourseContent(request, jwt, courseContent) {
  // Remove duplicates from course content
  let filteredContent =
    reusableFunctions.removingDuplicateElementsFromArray(courseContent);
  
  const courseArray = [...filteredContent];
  
  // Limit course IDs to get video IDs from only those course IDs
  const limitedCourseArray = reusableFunctions.limitTheArrayData(courseArray, 5);

  // Fetch video IDs for each course
  for (let i = 0; i < limitedCourseArray.length; i++) {
    try {
      const courseId = filteredContent[i].asset_uuid;
      const videoResponse = await getvideoIdFromCourseIdApi(
        request,
        jwt,
        courseId
      );
      
      const contentItems = videoResponse[0]?.data?.courseWithLT?.contentItems;
      
      if (contentItems && contentItems.length > 0) {
        const videoId = contentItems[0].id;
        filteredContent.push({
          asset_uuid: videoId,
          estimated_duration_seconds: 5000,
        });
      } else {
        logger.error(
          `Unable to fetch video ID for course ID: ${courseId}`
        );
      }
    } catch (error) {
      logger.error(
        `Unable to fetch video ID for course ID ${filteredContent[i].asset_uuid}: ${error.message}`
      );
    }
  }

  return filteredContent;
}
