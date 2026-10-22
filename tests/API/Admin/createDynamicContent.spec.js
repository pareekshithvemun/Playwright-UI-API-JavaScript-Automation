import { test } from "@playwright/test";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { createDynamicContentApi } from "../../../helpers/API/apibuilders/createDynamicContentApi.js";
import { saveContainerApi } from "../../../helpers/API/apibuilders/saveContainerApi.js";
import { getAllUserApi } from "../../../helpers/API/apibuilders/getAllUsers.js";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { getAllContentItemsApi } from "../../../helpers/API/apibuilders/getAllContentItemsApi.js";
import { saveQuestionApi } from "../../../helpers/API/apibuilders/saveQuestionApi.js";
import { getContainerViewApi } from "../../../helpers/API/apibuilders/getContainerViewApi.js";
import { addContentToDynamicConApi } from "../../../helpers/API/apibuilders/addContentToDynamicConApi.js";
import { addAudienceToDynamicContentApi } from "../../../helpers/API/apibuilders/addAudienceToDynamicContentApi.js";
import { getAllAudienceApi } from "../../../helpers/API/apibuilders/getallAudience.js";
import { publishDynamicContentApi } from "../../../helpers/API/apibuilders/publishDynamicContent.js";
import { publishContainerApi } from "../../../helpers/API/apibuilders/publishContainerApi.js";
import { urlData } from "../../../helpers/API/url/allUrls.js";
import { apiresponseValidations } from "../../../helpers/API/apibuilders/responseValidation.js";
import { createSubjectWithExistingChannelAndJourneyBody } from "../../../helpers/API/payloads/createSubjectWithExistingChannelAndJourneyPayload.js";
import { headerData } from "../../../helpers/API/headers/allHeaders.js";
import { expect } from "@playwright/test";
import { createLinkedContent } from "../../../helpers/API/apibuilders/createLinkCustomContentApi.js";
import { publishLinkContent } from "../../../helpers/API/apibuilders/publishLinkContent.js";
import { addContentToChannelBody } from "../../../helpers/API/payloads/addContentToChannelpayload.js";
import { getAllChannelsApi } from "../../../helpers/API/apibuilders/getallChannels.js";
import { logger } from "../../../logger.js";
import config from "config";
import { createcustomChannelbody } from "../../../helpers/API/payloads/createChannelpayload.js";

let jwt,
  orgId,
  adminId,
  assetId,
  allUserResponse,
  testData,
  subJectUuid,
  subjectUuidArray = [],
  subjectData,
  containerId,
  areauuid,
  audid,
  dynamicContentTitle,
  dynamicContentDescription,
  dynamicContentImageUrl,
  dynamicContentInstruction,
  respOfContainerViewApi,
  contentForEachAnswer,
  questionsandAnswers,
  channelViewId,
  subuuid;
let fileName = process.env.FileName;
let dynamicContentTestDataFilePath = reusableFunctions.getPath(
  "testData/DynamicContent",
  `${fileName}.json`
);
let dynamicContentSubjectDataPath = reusableFunctions.getPath(
  "testData/DynamicContent",
  `dynamicContentSubjectData.json`
);
subjectData = reusableFunctions.readDatafromJsonFilenotasync(
  dynamicContentSubjectDataPath
);
let contentUUIDs = [];
testData = reusableFunctions.readDatafromJsonFilenotasync(
  dynamicContentTestDataFilePath
);

let customContent = [
  {
    title: "1st Street Office Evacuation Plan",
    contentUrl:
      "https://cdn.bfldr.com/YWP0W9AT/at/jxvjgt3j2qgcpm3zxwpzvw/1st_Street_Office_Evacuation_Plan.pdf?format=pdf",
    desc: "1st Street Office Evacuation Plan",
    imageUrl:
      "https://cdn2.percipio.com/public/us/custom-content/f308bedc-84e3-4fc8-9400-b487893bca93/public/images/saved/efab3972-0daf-4220-bcd0-2147e19c5df4/escape-route.jpg?width=600",
    modality: "READ",
    duration: 924,
  },
  {
    title: "Main Street Office Evacuation Plan",
    contentUrl:
      "https://cdn.bfldr.com/YWP0W9AT/at/msw8hbnh4m63ks56g4xg3tp/Main_Street_Office_Evacuation_Plan.pdf?format=pdf",
    desc: "Main Street Office Evacuation Plan",
    imageUrl:
      "https://cdn2.percipio.com/public/us/custom-content/f308bedc-84e3-4fc8-9400-b487893bca93/public/images/saved/efab3972-0daf-4220-bcd0-2147e19c5df4/escape-route.jpg?width=600",
    modality: "READ",
    duration: 924,
  },
  {
    title: "Broad Street Office Evacuation Plan",
    contentUrl:
      "https://cdn.bfldr.com/YWP0W9AT/at/6kt5xh6zxvwg5wn6gqxzkmxj/Broad_Street_Office_Evacuation_Plan.pdf?format=pdf",
    desc: "Broad Street Office Evacuation Plan",
    imageUrl:
      "https://cdn2.percipio.com/public/us/custom-content/f308bedc-84e3-4fc8-9400-b487893bca93/public/images/saved/efab3972-0daf-4220-bcd0-2147e19c5df4/escape-route.jpg?width=600",
    modality: "READ",
    duration: 924,
  },
];

let titleTexts = [
  "1st Street Office Evacuation Plan",
  "Main Street Office Evacuation Plan",
  "Broad Street Office Evacuation Plan",
];

test.beforeAll("get Token", async ({ request }, testInfo) => {
  testInfo.setTimeout(50000);
  jwt = await generateToken(request);
  audid = await getAllAudienceApi("Region", request, jwt);
  allUserResponse = await getAllUserApi(request, jwt);
  adminId = reusableFunctions.getAdminUserId(allUserResponse);


  for (let contentData of customContent) {
    let customContentUUID = await createLinkedContent(
      request,
      jwt,
      contentData.title,
      contentData.contentUrl,
      contentData.desc,
      contentData.imageUrl,
      contentData.modality,
      contentData.duration
    );
    logger.info(`Linked content UUID: ${customContentUUID}`);
    contentUUIDs.push({
      title: contentData.title,
      uuid: customContentUUID,
    });
    await publishLinkContent(request, jwt, customContentUUID);
  }
  logger.info(contentUUIDs);
  testData = replaceOfficeTitlesWithUUID(testData, contentUUIDs);
  logger.info(testData);
});

test("Create Channel for custom content", async ({ request }, testInfo) => {
  testInfo.setTimeout(20000);
  let auduuid = await getAllAudienceApi("Region", request, jwt);
  let AreaName = "Onboarding Academy";
  let SubJectName = "Tools and Resources";
  //get sub uuid
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
          "Office Evacuation Plans",
          "Office Evacuation Plans",
          subuuid,
          auduuid,
          "https://cdn2.percipio.com/public/c/public/images/customChannel.jpg"
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
  let responseofGetAllchannels = await getAllChannelsApi(request, jwt);
  let channelUuid = getChannelUuidsByTitles(
    responseofGetAllchannels,
    "Office Evacuation Plans"
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
  let getAllCIresp = await getAllContentItemsApi(request, jwt);
  let customContentUuids = getLinkedContentUuid(getAllCIresp, titleTexts);
  let contentData = getChannelData(customContentUuids);
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
    let headerofcustomChannel = headerData.publishChannelorJourneyHeaders(jwt);
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

test(`Get Areauuid`, async ({ request }, testInfo) => {
  try {
    let resp = await apiresponseValidations.getAreaUUIDfromExcel(
      request,
      urlData.getAreasOfOrgUrl,
      jwt,
      subjectData.AreaName
    );
    areauuid = resp.areaUUids[0].uuid;
    expect(resp.resdata.status()).toBe(200);
  } catch (e) {
    testInfo.fail(true, `Test failed due to: ${e}`);
  }
});

test(`Create Subject for Dynamic Content`, async ({ request }, testInfo) => {
  testInfo.setTimeout(2000000);
  //create subject
  try {
    subJectUuid = reusableFunctions.uuidGenerator();
    subjectUuidArray.push(subJectUuid);
    let headerofcustomSubject = headerData.customiseSubjHeaders(
      jwt,
      "application/json"
    );
    let res = await request.post(urlData.customSubJectUrl(subJectUuid), {
      data: await createSubjectWithExistingChannelAndJourneyBody(
        subjectData.SubJectName,
        subjectData.Content,
        areauuid,
        subjectData.Description,
        subjectData.subImage
      ),
      headers: headerofcustomSubject,
    });
    expect(res.status()).toBe(200);
  } catch (error) {
    logger.info(`Failed to Create Subject due to ${error}`);
  }
});

test("Create DynamicContent", async ({ request }, testInfo) => {
  testInfo.setTimeout(300000);
  orgId = config.get("Environment").orgId;
  logger.info(`OrgId:${orgId} and adminUserId:${adminId}`);
  for (let eachDynamicContent of testData) {
    // This needs parentheses since it's an assignment, not a declaration.
    ({
      dynamicContentTitle,
      dynamicContentDescription,
      dynamicContentInstruction,
      dynamicContentImageUrl,
      contentForEachAnswer,
      questionsandAnswers,
    } = eachDynamicContent);

    assetId = reusableFunctions.uuidGenerator();
    //create draft dynamicContent
    await createDynamicContentApi(
      request,
      jwt,
      assetId,
      dynamicContentTitle,
      dynamicContentDescription,
      dynamicContentImageUrl,
      subjectUuidArray
    );
    //create container
    let respofsaveContainerApi = await saveContainerApi(
      request,
      jwt,
      orgId,
      adminId,
      assetId,
      dynamicContentTitle,
      dynamicContentDescription,
      dynamicContentInstruction,
      dynamicContentImageUrl
    );
    //get containerId
    containerId = respofsaveContainerApi.containerId;
    //create questions for the above container
    for (let question of questionsandAnswers) {
      let parent = "parent" in question ? question.parent : null;
      respOfContainerViewApi = await getContainerViewApi(
        request,
        jwt,
        containerId,
        orgId
      );
      let parentId = null;
      if (parent) {
        parentId = getIdFromText(
          respOfContainerViewApi.containerHierarchy,
          parent
        );
      }
      let answerStructureObject = createAnswerObject(question.answers);
      await saveQuestionApi(
        request,
        jwt,
        containerId,
        adminId,
        parentId,
        answerStructureObject,
        question.order,
        question.questionText,
        question.selectType,
        question.displayType,
        question.subtype,
        question.locale
      );
    }
    //map content to the each answer
    respOfContainerViewApi = await getContainerViewApi(
      request,
      jwt,
      containerId,
      orgId
    );

    let jsonDataForContentMap = jsonCreationForContentMappingToDynContent(
      contentForEachAnswer,
      respOfContainerViewApi.containerHierarchy.hierarchy
    );

    await addContentToDynamicConApi(
      request,
      jwt,
      containerId,
      orgId,
      adminId,
      jsonDataForContentMap
    );
    //add audience to dynamic Content
    await addAudienceToDynamicContentApi(request, jwt, audid, assetId);
    //publish container
    await publishContainerApi(request, jwt, containerId, orgId, adminId);
    //publish dynamicontent
    await publishDynamicContentApi(request, jwt, assetId, dynamicContentTitle);
  }
});

function createAnswerObject(answers) {
  let jsonArray = [];
  answers.forEach((text, index) => {
    let obj = {
      order: index + 1,
      localizedDefinitions: [
        {
          definition: {
            text: text,
          },
          locale: "en-US",
        },
      ],
    };
    jsonArray.push(obj);
  });
  return jsonArray;
}

function getIdFromText(containerHierarchy, text) {
  function searchInHierarchy(hierarchy) {
    for (let item of hierarchy) {
      if (item.children) {
        for (let child of item.children) {
          if (
            child.definitions &&
            child.definitions[0].definition.text === text
          ) {
            logger.info(`parentid for text ${text} is ${child.id}`);
            return child.id;
          }
          let childId = searchInHierarchy(child.children || []);
          if (childId) return childId;
        }
      }
    }
    return null;
  }
  return searchInHierarchy(containerHierarchy.hierarchy || []);
}

function extractLeafContentData(hierarchy, parentQuestionText = null, locale) {
  let result = [];
  hierarchy.forEach((item) => {
    if (
      (item.subType === "STANDARD" || item.subType === "FILTER") &&
      item.type === "QUESTION"
    ) {
      let definition = item.definitions.find((def) => def.locale === locale);
      parentQuestionText =
        definition?.definition?.text || "No question text found";
    }
    if (item.subType === "LEAF_CONTENT") {
      let id = item.id;
      let definition = item.definitions.find((def) => def.locale === locale);
      let text = definition?.definition?.text || "No text found";
      result.push({ id, text, parentQuestionText });
    }
    if (item.children) {
      result = result.concat(
        extractLeafContentData(item.children, parentQuestionText, locale)
      );
    }
  });

  return result;
}

function jsonCreationForContentMappingToDynContent(
  contentForEachAnswer,
  hierarchy
) {
  let result = [];
  contentForEachAnswer.forEach((entry) => {
    let { question, answer, locale, mappedContent } = entry;
    let leafContentData = extractLeafContentData(hierarchy, null, locale);
    let uniqueAnswerKey = `${answer}_${question}`;
    let matchingLeaf = leafContentData.find(
      (leaf) =>
        `${leaf.text.trim()}_${leaf.parentQuestionText.trim()}` ===
        uniqueAnswerKey.trim()
    );
    if (matchingLeaf) {
      let transformedEntry = {
        answerId: matchingLeaf.id,
        mappedContent: mappedContent,
      };
      result.push(transformedEntry);
    }
  });
  return result;
}

function replaceOfficeTitlesWithUUID(content, contentUUIDs) {
  // Iterate through each dynamic content entry
  content.forEach((item) => {
    // Check if the dynamic content title or mapped content title matches any in the UUID array
    contentUUIDs.forEach((uuidObj) => {
      if (item.contentForEachAnswer) {
        item.contentForEachAnswer.forEach((answer) => {
          answer.mappedContent.forEach((mappedContent) => {
            // Replace the title of mapped content with the UUID if it matches
            if (mappedContent.content[0].contentId === uuidObj.title) {
              mappedContent.content[0].contentId = uuidObj.uuid;
            }
          });
        });
      }
    });
  });

  return content;
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
