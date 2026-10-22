import { test } from "@playwright/test";
import { getAllAssignmentsApi } from "../../../helpers/API/apibuilders/getallAssignments.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { cancelAssignmentsApi } from "../../../helpers/API/apibuilders/cancelAssignments.js";
import { deleteAssignmentsApi } from "../../../helpers/API/apibuilders/deleteAssignments.js";

let jwt;
test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Remove all Assignments", async ({ request }, testInfo) => {
  testInfo.setTimeout(400000);
  let respOfGetAllAssignments = await getAllAssignmentsApi(request, jwt);
  let inProgressAssignmentIds = respOfGetAllAssignments.data
    .filter((ele) => ele.status === "in_progress")
    .map((ele) => ele.id);
  let indraftAssignmentIds = respOfGetAllAssignments.data
    .filter((ele) => ele.status === "draft")
    .map((ele) => ele.id);

  for (let assignID of inProgressAssignmentIds) {
    await cancelAssignmentsApi(request, jwt, assignID);
  }

  for (let assignID of indraftAssignmentIds) {
    await deleteAssignmentsApi(request, jwt, assignID);
  }
});
