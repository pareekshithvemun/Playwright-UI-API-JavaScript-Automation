import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { createAssignPayload } from "../../API/payloads/createAssignmentpayload.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";




export async function createAssignment(request, jwt,assignContent, assignName, businessObjectiveID,assignDurtionInDays,assignMentState,assGoal,userID,auduuid,description) {
      try {
        let res = await request.post(urlData.postassignmentcallUrl, {
          data:await createAssignPayload(assignContent, businessObjectiveID, assignName,auduuid,assignDurtionInDays,assignMentState,assGoal,userID,description),
          
          headers: headerData.createAssignmentHeaders(jwt, "application/json"),
        });
        expect(res.status()).toBe(200);
        const resp = await res.json();
        logger.info(`Assignment created — name=${assignName}, id=${resp?.id ?? resp?.assignmentUuid ?? "unknown"}`);
      } catch (error) {
        logger.info(`Assignment ${assignName} is not created due to ${error}`);
      }
    
  
}
