import { headerData } from "../../../helpers/API/headers/allHeaders.js";
import { urlData } from "../../../helpers/API/url/allUrls.js";
import { expect, test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { getAllAudienceApi } from "../../../helpers/API/apibuilders/getallAudience.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import {
  createcustomChannelbody,
  getAreaStuff,
  getIdsByAreaAndSubjectNames,
} from "../../../helpers/API/payloads/createChannelpayload.js";
import { addContentToChannelBody } from "../../../helpers/API/payloads/addContentToChannelpayload.js";
import { apiresponseValidations } from "../../../helpers/API/apibuilders/responseValidation.js";
import { getAllChannelsApi } from "../../../helpers/API/apibuilders/getallChannels.js";
import { logger } from "../../../logger.js";
import { resolveAllOrgLinkedContent } from "../../../path.js";

let jwt;
let channelUUids = [];
let channelViewIds = [];
let fileName = process.env.FileName;
let channelDataFilepath = reusableFunctions.getPath(
  "testData/channelTestData",
  `${fileName}.json`
);
let channelData =
  reusableFunctions.readDatafromJsonFilenotasync(channelDataFilepath);
let channels = channelData?.channelsInfo || [];
let linkedContentTestData = channelData?.linkedContentData || [];
let contentUUIDs = {};

test.beforeAll("get Token", async ({ request }, testInfo) => {
  testInfo.setTimeout(50000);
  jwt = await generateToken(request);
  contentUUIDs = await resolveAllOrgLinkedContent(
    request,
    jwt,
    linkedContentTestData
  );
  for (const title of Object.keys(contentUUIDs)) {
    logger.info(`Linked content "${title}" UUID: ${contentUUIDs[title]}`);
  }
});

test.describe("Create Channel and add content to it and assign it to SubJect", async () => {
  test("Get Areas and Subjects from Org", async ({ request }, testInfo) => {
    try {
      let resdata = await apiresponseValidations.getAreasAndSubJects(
        request,
        urlData.getAreasOfOrgUrl,
        jwt,
        channels
      );
      expect(resdata.status()).toBe(200);
    } catch (error) {
      testInfo.fail(
        true,
        `Failed to get area or subuuids due to error: ${error}`
      );
    }
  });

  test("Create Channel", async ({ request }, testInfo) => {
    testInfo.setTimeout(20000);
    let subID;
    let auduuid = await getAllAudienceApi("Region", request, jwt);
    let areaData = getAreaStuff();
    for (let channel of channels) {
      subID = getIdsByAreaAndSubjectNames(
        areaData,
        channel.AreaName,
        channel.SubjectName
      );
      logger.info(channel.AreaName);
      logger.info(subID);
      try {
        let uuid = reusableFunctions.uuidGenerator();
        let headerofcustomChannel = headerData.customChannelHeaders(
          jwt,
          "application/json"
        );
        let resofCreateChannelApi = await request.post(
          urlData.customChannelCreationUrl(uuid),
          {
            data: createcustomChannelbody(
              channel.channelName,
              channel.channelDescription,
              subID,
              auduuid,
              channel.channelImage
            ),
            headers: headerofcustomChannel,
          }
        );
        expect(resofCreateChannelApi.status()).toBe(200);
        const resp = await resofCreateChannelApi.json();
        const text = resp["message"];
        logger.info(text);
      } catch (error) {
        logger.info(`Failed to Create Channel due to ${error}`);
      }
    }
  });
  test("Get channels from Org to get channelUuids", async ({ request }) => {
    try {
      let resp = await getAllChannelsApi(request, jwt);
      async function getChannelUuidsByTitles(channelsData) {
        let channelList = [];
        for (let channel of resp.channels) {
          if (channel.status === 0) {
            for (let localization of channel.localizations) {
              for (let data of channelsData) {
                if (data.channelName === localization.title) {
                  channelList.push(channel.channelUuid);
                  break;
                }
              }
            }
          }
        }
        return channelList;
      }
      channelUUids = await getChannelUuidsByTitles(channels);
    } catch (error) {
      logger.info(`Failed to get Channel from Org ${error}`);
    }
  });
  test("Get channel Info with channelUUid", async ({ request }, testInfo) => {
    testInfo.setTimeout(20000);
    for (let channelId of channelUUids) {
      try {
        let headerofchannelInfo = headerData.getChannelInfoHeaders(jwt);
        let resofGetChannelInfoApi = await request.get(
          urlData.getChannelInfoUrl(channelId),
          {
            headers: headerofchannelInfo,
          }
        );
        expect(resofGetChannelInfoApi.status()).toBe(200);
        let resp = await resofGetChannelInfoApi.json();
        let channelViewId = {
          title: resp.title,
          channelViewUuid: resp.channelView.channelViewUuid,
        };
        channelViewIds.push(channelViewId);
        logger.info(
          `channelId:${channelId} and channelViewId:${JSON.stringify(
            channelViewId
          )}`
        );
      } catch (error) {
        logger.info(`Failed to get Channel viewId's due to ${error}`);
      }
    }
  });

  test("Add Content to channel", async ({ request }) => {
    test.setTimeout(20000);
    for (let channelviewId of channelViewIds) {
      let contentData = channels.filter(
        (channel) => channel.channelName === channelviewId.title
      )[0]?.channelContent;
      if (
        containsAllValues(contentData, [
          "Congratulations and Welcome to the Management Team",
          "Tony Robbins on the Psychology and Skills of Exceptional Leaders",
          "Start with why - how great leaders inspire action",
          "New Manager Guide (PDF)",
        ])
      ) {
        contentData = replaceContentId(
          "Congratulations and Welcome to the Management Team",
          contentUUIDs["Congratulations and Welcome to the Management Team"],
          contentData
        );
        contentData = replaceContentId(
          "Tony Robbins on the Psychology and Skills of Exceptional Leaders",
          contentUUIDs[
            "Tony Robbins on the Psychology and Skills of Exceptional Leaders"
          ],
          contentData
        );
        contentData = replaceContentId(
          "Start with why - how great leaders inspire action",
          contentUUIDs["Start with why - how great leaders inspire action"],
          contentData
        );
        contentData = replaceContentId(
          "New Manager Guide (PDF)",
          contentUUIDs["New Manager Guide (PDF)"],
          contentData
        );
      } else if (
        containsAllValues(contentData, [
          "Why being respectful to your coworkers is good for business | Christine Porath",
          "Why the secret to success is setting the right goals | John Doerr | TED",
          "Think Fast, Talk Smart: Communication Techniques",
        ])
      ) {
        contentData = replaceContentId(
          "Why being respectful to your coworkers is good for business | Christine Porath",
          contentUUIDs[
            "Why being respectful to your coworkers is good for business | Christine Porath"
          ],
          contentData
        );
        contentData = replaceContentId(
          "Why the secret to success is setting the right goals | John Doerr | TED",
          contentUUIDs[
            "Why the secret to success is setting the right goals | John Doerr | TED"
          ],
          contentData
        );
        contentData = replaceContentId(
          "Think Fast, Talk Smart: Communication Techniques",
          contentUUIDs["Think Fast, Talk Smart: Communication Techniques"],
          contentData
        );
      } else if (
        containsAllValues(contentData, [
          "Use Case: Utilizing Generative AI in Learning",
          "Improving Your A.I. Chats with Your Data",
          "Using AI For Good: The Ethical and Responsible Usage of Generative AI",
        ])
      ) {
        contentData = replaceContentId(
          "Use Case: Utilizing Generative AI in Learning",
          contentUUIDs["Use Case: Utilizing Generative AI in Learning"],
          contentData
        );
        contentData = replaceContentId(
          "Improving Your A.I. Chats with Your Data",
          contentUUIDs["Improving Your A.I. Chats with Your Data"],
          contentData
        );
        contentData = replaceContentId(
          "Using AI For Good: The Ethical and Responsible Usage of Generative AI",
          contentUUIDs[
            "Using AI For Good: The Ethical and Responsible Usage of Generative AI"
          ],
          contentData
        );
      } else {
        logger.info("Custom Content is Not found in the Test Data");
      }

      try {
        let headerofaddcontentToChannel = headerData.addContentToChannelHeaders(
          jwt,
          "application/json"
        );
        let resofaddContentToChannelApi = await request.put(
          urlData.addcontentToChannelUrl(channelviewId.channelViewUuid),
          {
            data: addContentToChannelBody(contentData),
            headers: headerofaddcontentToChannel,
          }
        );
        expect(resofaddContentToChannelApi.status()).toBe(200);
        const resp = await resofaddContentToChannelApi.json();
        const text = resp["message"];
        logger.info(`${text} for channel ${channelviewId.channelViewUuid}`);
      } catch (error) {
        logger.info(`Failed to add content due to ${error}`);
      }
    }
  });

  test("Publish channel", async ({ request }) => {
    test.setTimeout(20000);
    for (let channel of channelUUids) {
      try {
        let headerofcustomChannel =
          headerData.publishChannelorJourneyHeaders(jwt);
        let resofPublishChannelApi = await request.post(
          urlData.publishChannelorJourneyUrl(channel),
          {
            headers: headerofcustomChannel,
          }
        );
        expect(resofPublishChannelApi.status()).toBe(200);
        const resp = await resofPublishChannelApi.json();
        const text = resp["message"];
        logger.info(`${text} and it's ID: ${channel}`);
      } catch (error) {
        logger.info(`Failed to publish Channel due to ${error}`);
      }
    }
  });
});

function replaceContentId(customContentName, linkContenuuid, contentData) {
  let foundCustomContent = false;

  for (let element of contentData) {
    if (element.contentItemUuid === customContentName) {
      element.contentItemUuid = linkContenuuid;
      foundCustomContent = true;
      logger.info(`Linked content has been added`);
      break;
    }
  }

  if (!foundCustomContent) {
    logger.info(`No need to add Linked content`);
  }
  return contentData;
}

// function containsValue(contentArray, valueToCheck) {
//   return contentArray.some((item) =>
//     Object.values(item).includes(valueToCheck)
//   );
// }

function containsAllValues(contentArray, valuesToCheck) {
  return valuesToCheck.every((valueToCheck) =>
    contentArray.some((item) => Object.values(item).includes(valueToCheck))
  );
}
