import { request, test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { getAllAssignmentsApi } from "../../../helpers/API/apibuilders/getallAssignments.js";
import { editAssignmentApi } from "../../../helpers/API/apibuilders/editAssignmentApi.js";
import { createAssignment } from "../../../helpers/API/apibuilders/assignmentCreation.js";
import { getBusinessObjective } from "../../../helpers/API/apibuilders/getBusinessObjectives.js";
import { getAllUserApi } from "../../../helpers/API/apibuilders/getAllUsers.js";
import { deleteAssignmentsApi } from "../../../helpers/API/apibuilders/deleteAssignments.js";
import { getAllAudienceApi } from "../../../helpers/API/apibuilders/getallAudience.js";
import { logger } from "../../../logger.js";

// Variables for storing the JWT token and API responses
let jwt;
let getAllassignmentsResp, respOfbusinessObjective, respofGetAllUsers;

// File path for the assignment data JSON file
let fileName = process.env.FileName;
let assignmentDataFilepath = reusableFunctions.getPath(
  "testData/AssignmentTestData",
  `${fileName}.json`
);

// Read assignment data from the JSON file
let assignmentData = reusableFunctions.readDatafromJsonFilenotasync(
  assignmentDataFilepath
);
let totalData = assignmentData.contentForAssignment;

// Function to log assignment details
function logAssignmentDetails(assignmentName, assignmentId) {
  logger.info(`${assignmentName} : ${assignmentId}`);
}


// Function to edit an assignment
async function editAssignment(request, jwt, assignment, ele) {
  let assignmentId = assignment.id; // Get assignment ID
  let Audienuuid = assignment.audienceIds; // Audience IDs
  let contents = ele.content; // Content for the assignment
  let businessObjectiveUuid = assignment.businessObjectiveId; // Business Objective ID
  let description = assignment.description; // Description
  let assignmentName = assignment.name; // Assignment name
  let startdate = assignment.startDate; // Start date
  let dayToCompletion = assignment.dayToCompletion; // Days to completion
  let emailScheduledAt = assignment.emailScheduledAt; // Email scheduled time
  let createdby = assignment.authorId; // Creator ID
  let category = assignment.category; // Category
  let defaultLocale = assignment.defaultLocale; // Default locale
  let useruuid = assignment.userIds; // User IDs

  logAssignmentDetails(assignmentName, assignmentId);

  await editAssignmentApi(
    request,
    jwt,
    assignmentId,
    Audienuuid,
    contents,
    businessObjectiveUuid,
    description,
    assignmentName,
    startdate,
    dayToCompletion,
    emailScheduledAt,
    createdby,
    "launch", // State for in-progress assignments
    category,
    defaultLocale,
    useruuid
  );
}

// Function to create a new assignment after deleting the existing one
async function recreateAssignment(request, jwt, ele, assignment) {
  let assignmentId,
    businessObjectiveUuid,
    assignmentName,
    createdby,
    goal,
    audId;
  if (assignment) {
    assignmentId = assignment.id; // Get assignment ID
    businessObjectiveUuid = assignment.businessObjectiveId; // Business Objective ID
    assignmentName = ele.name; // Assignment name
    createdby = assignment.authorId; // Creator ID
    goal = ele.assGoal;
    audId = assignment.audienceIds;
  } else {
    businessObjectiveUuid = await reusableFunctions.findIdByName(
      ele.BusinessObjective,
      respOfbusinessObjective
    );
    assignmentName = ele.name; // Assignment name
    createdby = respofGetAllUsers.users.find((item) =>
      item.loginName.includes(ele.assignedBy)
    )?.id;
    goal = ele.assGoal;
    audId = await getAllAudienceApi("Region", request, jwt);
  }
  if (assignmentId) {
    logAssignmentDetails(assignmentName, assignmentId);
    await deleteAssignmentsApi(request, jwt, assignmentId);
  }
  await createAssignment(
    request,
    jwt,
    ele.content, // Content for the new assignment
    assignmentName,
    businessObjectiveUuid,
    365, // Assuming a fixed value for duration
    "save", // save state put assigments in draft state.
    goal, // Goal for the assignment
    createdby,
    audId // Audience IDs
  );
}

// Before all tests, generate the JWT token
test.beforeAll("Generate Token", async ({ request }) => {
  jwt = await generateToken(request); // Generate the token
});

// Main test case to edit or recreate assignments
test(`Edit Assignment`, async ({ request }, testInfo) => {
  testInfo.setTimeout(4500000); // Set a long timeout for the test
  respOfbusinessObjective = await getBusinessObjective(request, jwt);
  respofGetAllUsers = await getAllUserApi(request, jwt);

  // Fetch all assignments
  getAllassignmentsResp = await getAllAssignmentsApi(request, jwt);

  // Iterate over each assignment data item
  for (let ele of totalData) {
    try {
      // Find the corresponding assignment based on the name
      let assignment = getAllassignmentsResp.data.find(
        (assignment) => assignment.name.trim() === ele.name.trim()
      );

      // Proceed if the assignment exists
      if (assignment) {
        if (assignment.status === "in_progress") {
          await editAssignment(request, jwt, assignment, ele); // Edit if in-progress
        } else if (assignment.status === "draft") {
          await recreateAssignment(request, jwt, ele, assignment); // Create if draft
        }
      } else {
        await recreateAssignment(request, jwt, ele, assignment);
        logger.error(`No assignment found for ${ele.name} so created it`);
      }
    } catch (error) {
      // Log any errors that occur during processing
      logger.error(
        `Failed to process assignment ${ele.name} due to error: ${error}`
      );
    }
  }
});
