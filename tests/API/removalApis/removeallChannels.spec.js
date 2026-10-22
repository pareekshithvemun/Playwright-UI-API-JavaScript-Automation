import { test} from "@playwright/test"
import { getAllChannelsApi } from "../../../helpers/API/apibuilders/getallChannels.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import {deletechannel} from"../../../helpers/API/apibuilders/deleteChannel.js";
import { retirechannel } from "../../../helpers/API/apibuilders/retireChannel.js";
import { logger } from "../../../logger.js";


let jwt;
test.beforeAll("get Token", async ({ request }) => {
      jwt =await generateToken(request);
  });


test("Remove all channels",async({request},testInfo)=>{
   testInfo.setTimeout(400000); 
   let channelData= await getAllChannelsApi(request,jwt);
   let channelinDraft=channelData.channels.filter(item=>item.status===0 ).map(item=>item.channelUuid);
   let channelinPublishedstateandUnplishedchangesState=channelData.channels.filter(item=>item.status===2||item.status===1).map(item=>item.channelUuid);
   let channelinretiredstate=channelData.channels.filter(item=>item.status===3).map(item=>item.channelUuid);

   logger.info("channelinDraft:");
   logger.info(channelinDraft);
   logger.info("channelinPublishedstateandUnplishedchangesState:");
   logger.info(channelinPublishedstateandUnplishedchangesState);
   logger.info("channelinretiredstate");
   logger.info(channelinretiredstate);

   for(let channelID of channelinDraft){
      await deletechannel(request,jwt,channelID);
   }

   for(let id of channelinPublishedstateandUnplishedchangesState){
      await retirechannel(request,jwt,id);
   }

   logger.info("channelinDraft:");
   logger.info(channelinDraft);
   logger.info("channelinPublishedstateandUnplishedchangesState:");
   logger.info(channelinPublishedstateandUnplishedchangesState);


});



