import config from "config";
import { expect, test } from "@playwright/test";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { logger } from "../../../logger.js";
import { createContentConfigApi } from "../../../helpers/API/apibuilders/createContentConfigApi.js";
import { getContentConfigExternalIdApi } from "../../../helpers/API/apibuilders/getContentConfigExternalIdApi.js";
import { getContentConfigTopicsApi } from "../../../helpers/API/apibuilders/getContentConfigTopicsApi.js";
import { draftContentConfigApi } from "../../../helpers/API/apibuilders/draftContentConfigApi.js";
import { publishContentConfigApi } from "../../../helpers/API/apibuilders/publishContentConfigApi.js";
import { loginLPUiPage } from "../../../pageObjects/loginLPUiPage.js";
import { createcustomChannelbody } from "../../../helpers/API/payloads/createChannelpayload.js";
import { headerData } from "../../../helpers/API/headers/allHeaders.js";
import { urlData } from "../../../helpers/API/url/allUrls.js";
import { apiresponseValidations } from "../../../helpers/API/apibuilders/responseValidation.js";
import { getAllAudienceApi } from "../../../helpers/API/apibuilders/getallAudience.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { addContentToChannelBody } from "../../../helpers/API/payloads/addContentToChannelpayload.js";
import { getAllChannelsApi } from "../../../helpers/API/apibuilders/getallChannels.js";

let jwt,
  userjwt,
  contentConfigId,
  page,
  loginLPUiPageObj,
  responseofGetAllchannels,
  channelUuid,
  channelViewId,
  areauuid,
  subuuid,
  contentConfigArray = [];
let contentConfigFilepath = reusableFunctions.getPath(
  "testData/contentConfig",
  `${process.env.FileName}.json`
);
let contentConfigData = reusableFunctions.readDatafromJsonFilenotasync(
  contentConfigFilepath
);

test.beforeAll("get Token", async ({ browser, request }) => {
  test.setTimeout(1000000);
  page = await browser.newPage();
  loginLPUiPageObj = new loginLPUiPage(page);
  userjwt = await generateToken(request);
  jwt = await loginLPUiPageObj.gotoContentConfigPage(
    config.get("Admindata").loginID,
    config.get("Admindata").password
  );
});

test.describe("Create content config", () => {
  test("Content Config", async ({ request }) => {
    test.setTimeout(1000000);
    for (let data of contentConfigData) {
      contentConfigId = await createContentConfigApi(
        request,
        jwt,
        data.title,
        data.externalCourseId
      );
      console.log(`"configid is":${contentConfigId}`);
      let externalIdresp = await getContentConfigExternalIdApi(
        request,
        jwt,
        contentConfigId
      );
      console.log(`"externalidresp is":${externalIdresp}`);
      let externalId = externalIdresp.externalId;
      console.log(`"externalid is":${externalId}`);
      let contentConfigtopicsresp = await getContentConfigTopicsApi(
        request,
        jwt,
        externalId
      );
      let topics = contentConfigtopicsresp.topics;
      let transformedObject = transformData(topics);
      let finalDataforContentConfig = createDataforDraft(
        transformedObject,
        data.content
      );
      logger.info(`API request topic data: ${finalDataforContentConfig}`)
      let draftResp = await draftContentConfigApi(
        request,
        jwt,
        contentConfigId,
        5000,
        finalDataforContentConfig
      );
      logger.info(draftResp);
      await publishContentConfigApi(request, jwt, draftResp, data.title);
      contentConfigArray.push({ contentItemUuid: externalId });
    }
    logger.info(contentConfigArray);
  });

  test(`Get Areauuid and Subjectuuid`, async ({ request }, testInfo) => {
    let AreaName = "Onboarding Academy";
    let SubJectName =
      "Content Configuration, Dynamic Content, & Certitude Examples";

    try {
      let resp = await apiresponseValidations.getAreaUUIDfromExcel(
        request,
        urlData.getAreasOfOrgUrl,
        userjwt,
        AreaName
      );
      areauuid = resp.areaUUids[0].uuid;
      logger.info(`Areauuid is ${areauuid}`);
      expect(resp.resdata.status()).toBe(200);
    } catch (e) {
      testInfo.fail(true, `Test failed due to: ${e}`);
    }

    try {
      let respofSubdata = await apiresponseValidations.getSubID(
        request,
        urlData.getAreasOfOrgUrl,
        userjwt,
        AreaName,
        SubJectName
      );
      expect(respofSubdata.resdata.status()).toBe(200);
      subuuid = respofSubdata.uuid;
    } catch (e) {
      logger.info(`Unable to fetch subid due to error ${e}`);
    }
  });

  test("Create Channel for content config", async ({ request }, testInfo) => {
    testInfo.setTimeout(20000);
    let channelName = "Content Configuration Examples";
    let channelDescription =
      "This Custom Channel will provide E,S,& H and Legal Compliance Content Configuration Examples.";
    let channelImage =
      "https://cdn2.percipio.com/public/us/custom-content/f308bedc-84e3-4fc8-9400-b487893bca93/public/images/saved/c6e4b5ce-00b5-49b4-9e14-90e5cf7faa91/Content-Configuration-Example.png";
    let auduuid = await getAllAudienceApi("Region", request, userjwt);

    //create channel
    try {
      let uuid = reusableFunctions.uuidGenerator();
      let headerofcustomChannel = headerData.customChannelHeaders(
        userjwt,
        "application/json"
      );
      let resofCreateChannelApi = await request.post(
        urlData.customChannelCreationUrl(uuid),
        {
          data: createcustomChannelbody(
            channelName,
            channelDescription,
            subuuid,
            auduuid,
            channelImage
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
    responseofGetAllchannels = await getAllChannelsApi(request, userjwt);
    //get channel uuid
    channelUuid = getChannelUuidsByTitles(
      responseofGetAllchannels,
      channelName
    );
    //get channelViewId
    try {
      let headerofchannelInfo = headerData.getChannelInfoHeaders(userjwt);
      let resofGetChannelInfoApi = await request.get(
        urlData.getChannelInfoUrl(channelUuid),
        {
          headers: headerofchannelInfo,
        }
      );
      expect(resofGetChannelInfoApi.status()).toBe(200);
      let resp = await resofGetChannelInfoApi.json();
      channelViewId = resp.channelView.channelViewUuid;
    } catch (error) {
      logger.info(`Failed to get Channel viewId's due to ${error}`);
    }

    // add content to channel
    let contentData = transaformChannelData(contentConfigArray);

    if (contentData && contentData.length > 0) {
      try {
        let headerofaddcontentToChannel = headerData.addContentToChannelHeaders(
          userjwt,
          "application/json"
        );
        let resofaddContentToChannelApi = await request.put(
          urlData.addcontentToChannelUrl(channelViewId),
          {
            data: addContentToChannelBody(contentData),
            headers: headerofaddcontentToChannel,
          }
        );
        expect(resofaddContentToChannelApi.status()).toBe(200);
        const resp = await resofaddContentToChannelApi.json();
        const text = resp["message"];
        logger.info(`${text} for channel ${channelViewId}`);
      } catch (error) {
        logger.info(`Failed to add content due to ${error}`);
      }
    }
    //publish channel
    // try {
    //   let headerofcustomChannel =
    //     headerData.publishChannelorJourneyHeaders(userjwt);
    //   let resofPublishChannelApi = await request.post(
    //     urlData.publishChannelorJourneyUrl(channelUuid),
    //     {
    //       headers: headerofcustomChannel,
    //     }
    //   );
    //   expect(resofPublishChannelApi.status()).toBe(200);
    //   const resp = await resofPublishChannelApi.json();
    //   const text = resp["message"];
    //   logger.info(`${channelName} ${text} and it's ID: ${channelUuid}`);
    // } catch (error) {
    //   logger.info(`Failed to publish Channel due to ${error}`);
    // }
  });
});

function transformData(input) {
  return input.map((item) => ({
    id: item.id,
    title: item.title,
    isVisible: true,
    duration: Math.round(item.duration * 60), // Convert hours to seconds
    isUserCreated: false,
    contents: null,
  }));
}

function createDataforDraft(transformedObject, userAddedData) {
  userAddedData.forEach((item) => {
    // Parse the position from the second array
    const position = parseInt(item.position, 10);
    // Insert the `data` object at the specified position
    transformedObject.splice(position, 0, item.data);
  });
  return transformedObject;
}

function transaformChannelData(contentConfigArray) {
  return contentConfigArray.map((item) => ({
    ...item,
    contentItemType: "COURSE",
  }));
}

function getChannelUuidsByTitles(responseofGetAllchannels, channelName) {
  let channelId;
  for (let channel of responseofGetAllchannels.channels) {
    if (channel.status === 0) {
      for (let localization of channel.localizations) {
        if (channelName === localization.title) {
          channelId = channel.channelUuid;
          break;
        }
      }
    }
  }
  return channelId;
}
