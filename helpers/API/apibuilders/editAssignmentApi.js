import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import {editAssigmentPayload} from "../../API/payloads/editAssignmentPayload.js";
import { logger } from "../../../logger.js";


export async function editAssignmentApi(request, jwt,assignmentId, Audienuuid,contents,businessObjectiveUuid, description, assignmentname, startdate,dayToCompletion,emailScheduledAt, createdby, assignmentState,category,defaultLocale, useruuid) {
    try {

        let headerofeditAssignment = headerData.editAssignmentHeaders(
          jwt,
          "application/json"
        );
        let resofeditAssignmentsApi = await request.put(urlData.updateAssignmentUrl(assignmentId), {
          data:editAssigmentPayload(Audienuuid,contents,businessObjectiveUuid, description, assignmentname, startdate,dayToCompletion,emailScheduledAt, createdby, assignmentState,category,defaultLocale, useruuid),
          headers: headerofeditAssignment,

        });
        expect(resofeditAssignmentsApi.status()).toBe(200);
        const resp = await resofeditAssignmentsApi.json();
        logger.info(`successfully edited the assignment ${assignmentname}`); 
        return resp;
      } catch (error) {
        logger.error(`Failed to edit assignment:${assignmentname} due to error : ${error}`);
      }
}
 