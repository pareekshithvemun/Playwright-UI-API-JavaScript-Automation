
import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";



export async function deleteStripapi(request,jwt,StripID) {
  try {
    let headerofdeleteStrip = headerData.deleteStripHeaders(jwt);
    let respofStripinfo = await request.delete(
      urlData.deleteStripUrl(StripID),
      {
        headers:headerofdeleteStrip,
      }
    );
    expect(respofStripinfo.status()).toBe(204);
    logger.info(`${StripID}:Strip has been deleted`);
  } catch (error) {
    logger.info(`Unable to delete strip due to error: ${error}`);
  }
       
  }




