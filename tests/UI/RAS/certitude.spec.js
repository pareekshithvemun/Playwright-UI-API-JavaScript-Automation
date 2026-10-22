import { expect, test } from "@playwright/test";
import { loginLPUiPage } from "../../../pageObjects/loginLPUiPage.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { certitudePage } from "../../../pageObjects/certitude.js";
import { getAllContentItemsApi } from "../../../helpers/API/apibuilders/getAllContentItemsApi.js";
import { createcustomChannelbody } from "../../../helpers/API/payloads/createChannelpayload.js";
import { headerData } from "../../../helpers/API/headers/allHeaders.js";
import { urlData } from "../../../helpers/API/url/allUrls.js";
import { apiresponseValidations } from "../../../helpers/API/apibuilders/responseValidation.js";
import { getAllAudienceApi } from "../../../helpers/API/apibuilders/getallAudience.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { addContentToChannelBody } from "../../../helpers/API/payloads/addContentToChannelpayload.js";
import { getAllChannelsApi } from "../../../helpers/API/apibuilders/getallChannels.js";
import { logger } from "../../../logger.js";
import { config } from "../../../path.js";

let page,
  loginLPUiPageObj,
  certitudePageObj,
  filepathArray = [],
  jwt,
  responseofGetAllchannels,
  channelUuid,
  channelViewId,
  areauuid,
  subuuid,
  getAllCIresp,
  certitudeUuids;

let titleTexts = [
  "Bloodborne Pathogens Awareness Assessment",
  "Annual Code of Conduct Attestation and Disclosure",
  "Conflicts of Interest Disclosure",
];

let commonImageLink =
  "https://cdn2.percipio.com/public/us/custom-content/f308bedc-84e3-4fc8-9400-b487893bca93/public/images/saved/08373413-9f53-46e9-80d4-12b7c1476f30/Certitude.png";

//certitudeData test data
let certitudeData = [
  {
    fileName: "Bloodborn+Pathogeans+Assessment.zip",
    title: "Certitude - Bloodborne Pathogens Awareness Assessment",
    description: "Certitude Assement Example - Bloodborne Pathogens",
  },
  {
    fileName: "Code+of+Conduct+attestation+and+disclosure.zip",
    title: "Certitude - Annual Code of Conduct Attestation and Disclosure",
    description:
      "Certitude Questionnaire Example - Annual Code of Conduct Attestation and Disclosure",
  },
  {
    fileName: "Conflicts+of+Interest.zip",
    title: "Certitude - Conflicts of Interest Disclosure",
    description:
      "Certitude Questionnaire Example - Conflicts of Interest Disclosure",
  },
];
//channel testdata
let channelName = "Certitude Examples";
let channelDescription =
  "This Custom Channel will provide a few different Certitude Examples.";
let channelImage =
  "https://cdn2.percipio.com/public/us/custom-content/f308bedc-84e3-4fc8-9400-b487893bca93/public/images/saved/04656890-c855-44be-8172-b06787d2e034/Certitude.png";

filepathArray = certitudeData.map((file) => ({
  filepath: reusableFunctions.getPath(
    "testData/certitudeTestData",
    file.fileName
  ),
  title: file.title,
  description: file.description,
}));

test.beforeAll("get Token", async ({ request }) => {
  test.setTimeout(100000);
  jwt = await generateToken(request);
});

test.describe("Create certitude corses", () => {
  filepathArray.forEach((data) => {
    test(`Create certitude for ${data.filepath}`, async ({
      browser,
    }, testInfo) => {
      testInfo.setTimeout(1000000);
      page = await browser.newPage();
      loginLPUiPageObj = new loginLPUiPage(page);
      certitudePageObj = new certitudePage(page);

      await certitudePageObj.openCertitudeCreationPage();
      await loginLPUiPageObj.login(
        "kowshik.bikkina@skillsoft.com",
        config.get("Admindata").password
      );
      await certitudePageObj.uploadAndPublishContent(
        data.filepath,
        data.title,
        data.description
      );
    });
  });

  test(`Get Areauuid and Subjectuuid`, async ({ request }, testInfo) => {
    let AreaName = "Onboarding Academy";
    let SubJectName =
      "Content Configuration, Dynamic Content, & Certitude Examples";

    try {
      let resp = await apiresponseValidations.getAreaUUIDfromExcel(
        request,
        urlData.getAreasOfOrgUrl,
        jwt,
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
        jwt,
        AreaName,
        SubJectName
      );
      expect(respofSubdata.resdata.status()).toBe(200);
      subuuid = respofSubdata.uuid;
    } catch (e) {
      logger.info(`Unable to fetch subid due to error ${e}`);
    }
  });

  test("Create Channel for certitude courses", async ({
    request,
  }, testInfo) => {
    testInfo.setTimeout(20000);
    let auduuid = await getAllAudienceApi("Region", request, jwt);
    // create channel
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
    // get channel uuid
    responseofGetAllchannels = await getAllChannelsApi(request, jwt);
    channelUuid = getChannelUuidsByTitles(
      responseofGetAllchannels,
      channelName
    );
    // get channel View ID
    try {
      let headerofchannelInfo = headerData.getChannelInfoHeaders(jwt);
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
    getAllCIresp = await getAllContentItemsApi(request, jwt);
    certitudeUuids = getLinkedContentUuid(getAllCIresp, titleTexts);
    let contentData = getChannelData(certitudeUuids);
    if (contentData && contentData.length > 0) {
      try {
        let headerofaddcontentToChannel = headerData.addContentToChannelHeaders(
          jwt,
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
    // publish channel
    try {
      let headerofcustomChannel =
        headerData.publishChannelorJourneyHeaders(jwt);
      let resofPublishChannelApi = await request.post(
        urlData.publishChannelorJourneyUrl(channelUuid),
        {
          headers: headerofcustomChannel,
        }
      );
      expect(resofPublishChannelApi.status()).toBe(200);
      const resp = await resofPublishChannelApi.json();
      const text = resp["message"];
      logger.info(`${channelName} ${text} and it's ID: ${channelUuid}`);
    } catch (error) {
      logger.info(`Failed to publish Channel due to ${error}`);
    }
  });
});

function getLinkedContentUuid(data, titleTexts) {
  const matchingUuids = [];
  data.forEach((item) => {
    if (
      item.status === 2 &&
      titleTexts.some(
        (title) =>
          item.title && item.title.toLowerCase().includes(title.toLowerCase())
      )
    ) {
      matchingUuids.push(item.linkedContentUuid);
    }
  });

  return matchingUuids;
}

function getChannelData(matchingUuids) {
  return matchingUuids.map((uuid) => ({
    contentItemUuid: uuid,
    contentItemType: "LINKED_CONTENT",
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
