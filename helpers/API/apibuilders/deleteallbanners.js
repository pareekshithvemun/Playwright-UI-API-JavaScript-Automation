
import { headerData } from "../../API/headers/allHeaders.js";
import { urlData } from "../../API/url/allUrls.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";



export async function deleteBannerapi(request,jwt,bannerid) {
  try {
    let headerofdeleteBanner = headerData.deleteBannerHeaders(jwt);
    let respofbannerinfo = await request.delete(
      urlData.deleteBannerUrl(bannerid),
      {
        headers:headerofdeleteBanner,
      }
    );
    expect(respofbannerinfo.status()).toBe(204);
    logger.info(`${bannerid}:banner has been deleted`);
  } catch (error) {
    logger.info(`Unable to delete banner due to error: ${error}`);
  }
       
  }




