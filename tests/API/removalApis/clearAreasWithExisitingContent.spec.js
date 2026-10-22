import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { deleteArea } from "../../../helpers/API/apibuilders/deleteArea.js";
import { urlData } from "../../../helpers/API/url/allUrls.js";
import { test } from "@playwright/test";
import { editSubjectConetent } from "../../../helpers/API/apibuilders/removecontentfromSubjects";
import { apiresponseValidations } from "../../../helpers/API/apibuilders/responseValidation.js";

let jwt;
let areaUUID;
test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});

test("Get areas and subjects UUIDS and then remove all", async ({
  request,
}, testInfo) => {
  testInfo.setTimeout(400000);
  let resdata = await apiresponseValidations.getAreaUUID(
    request,
    urlData.getAreasOfOrgUrl,
    jwt
  );
  let areajsonbody = await resdata.json();
  for (let area of areajsonbody) {
    areaUUID = area.uuid;
    for (let subject of area.subjects) {
      let subUUID = subject.uuid;
      await editSubjectConetent(request, jwt, subUUID, areaUUID);
    }
    await deleteArea(request, jwt, areaUUID);
  }
});
