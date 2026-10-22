import { test } from "@playwright/test";
import { getAllStripsApi } from "../../../helpers/API/apibuilders/getallStrips.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { deleteStripapi } from "../../../helpers/API/apibuilders/deleteallStrips.js";
import { logger } from "../../../logger.js";



let jwt;
test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
});


test("Remove all Strips",async({request},testInfo)=>{

  testInfo.setTimeout(400000); 
  let stripDataData= await getAllStripsApi(request,jwt);
  let stripIds=stripDataData.map(item=>item.stripUuid);
  logger.info("StripIDs:");
   logger.info(stripIds);

  for(let stripID of stripIds){
    await deleteStripapi(request,jwt,stripID);
 }
  

})