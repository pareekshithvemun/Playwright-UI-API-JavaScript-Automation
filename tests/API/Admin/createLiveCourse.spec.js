import { test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { createLiveCourse } from "../../../helpers/API/apibuilders/createLiveCourseApi.js";
import { getAllLocationsForiltApi } from "../../../helpers/API/apibuilders/getAllLocationsForilt.js";
import { getAllClassroomsForiltApi } from "../../../helpers/API/apibuilders/getAllClassroomsForilt.js";
import { createLocation } from "../../../helpers/API/apibuilders/createLocationApi.js";
import { createClassroom } from "../../../helpers/API/apibuilders/createClassroomApi.js";
import { createLiveClass } from "../../../helpers/API/apibuilders/createLiveClassApi.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { getAllUserApi } from "../../../helpers/API/apibuilders/getAllUsers.js";
import { publishLiveCourse } from "../../../helpers/API/apibuilders/publishLiveCourseApi.js";

let token, iltData, data;

test.describe("Live course", () => {
  test.beforeAll("Generate Admin Token", async ({ request }) => {
    token = await generateToken(request);
    let pathofILTData = "testData/ILT/liveClasses.json";
    data = reusableFunctions.readDatafromJsonFilenotasync(pathofILTData);
    iltData = data.ILTCourses;
  });
  test("Create live course and get uuid", async ({ request }, testInfo) => {
    testInfo.setTimeout(90000);

    for (let i = 0; i < 6; i++) {
      let locationresponse = await getAllLocationsForiltApi(request, token);

      let locationUuid = await fetchLocationUuidByLabel(
        locationresponse,
        iltData[i].location
      );

      if (locationUuid == null) {
        locationUuid = await createLocation(
          request,
          token,
          iltData[i].location
        );
      }

      let classroomresp = await getAllClassroomsForiltApi(request, token);
      let classroomUuid = await fetchClassroomUuidByName(
        classroomresp,
        iltData[i].classroom
      );
      if (classroomUuid == null) {
        classroomUuid = await createClassroom(
          request,
          token,
          iltData[i].classroom,
          locationUuid
        );
      }

      let livecourseuuid = await createLiveCourse(
        request,
        token,
        iltData[i].coursetitle,
        iltData[i].description,
        iltData[i].additionalnotes,
        locationUuid,
        classroomUuid,
        iltData[i].imageUrl
      );
      let randomUUID = reusableFunctions.uuidGenerator();

      for (let j = 0; j < 3; j++) {
        let usersData = await getAllUserApi(request, token);
        let userObj = usersData.users.find(
          (user) => user.loginName === iltData[i].classes[j].instructorid
        );
        let instructorid = userObj.id;
        await createLiveClass(
          request,
          token,
          iltData[i].classes[j].classtitle,
          livecourseuuid,
          iltData[i].classes[j].classtype,
          iltData[i].classes[j].meetingurl,
          iltData[i].classes[j].imageurl,
          instructorid,
          locationUuid,
          classroomUuid,
          randomUUID
        );
        //await createLiveClass(request, token, "Culture and Values Orientation|Class 2", livecourseuuid, "offline", "http://www.teams.com", "https://cdn2.percipio.com/public/c/public/images/LiveCourse-default.png", "afedcc17-c8b0-406e-8ea2-3f23805f4261", locationUuid, classroomUuid, randomUUID)
      }
      // if(iltData[i].state==="publish"){
      //     await publishLiveCourse(request, token,livecourseuuid);
      // }
    }
  });
});

async function fetchLocationUuidByLabel(response, targetLabel) {
  let trimmedTargetLabel = targetLabel.trim();
  for (const item of response.items) {
    if (item.label.trim() === trimmedTargetLabel) {
      return item.locationUuid;
    }
  }
  return null;
}

async function fetchClassroomUuidByName(response, targetName) {
  let trimmedTargetName = targetName.trim();
  for (const item of response.items) {
    if (item.name.trim() === trimmedTargetName) {
      return item.classroomUuid;
    }
  }
  return null;
}
