import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";
import { createClassroomPayload } from "../payloads/createClassroomPayload.js";

export async function createClassroom(request,token,name,locationUuid){
    try {
        let headersOfcreateClassroom = headerData.createClassroomHeaders(token,"application/json");
        let payload = await createClassroomPayload(name,locationUuid);
        let respOfcreateClassroom  = await request.post(urlData.createClassroomUrl, {
          data:payload,
          headers: headersOfcreateClassroom,
        });
        expect(respOfcreateClassroom.status()).toBe(200);
        let resp = await respOfcreateClassroom.json();
        let classroomUuid=resp.classroomUuid
        return classroomUuid;
      } catch (error) {
        logger.error(`Failed to create location ${name} due to error : ${error}`);
      }
}