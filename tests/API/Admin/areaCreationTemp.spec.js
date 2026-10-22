import {
  urlData,
  test,
  generateToken,
  reusableFunctions,
  apiresponseValidations,
  addAudToJourneyApi,
  addIntroToJourney,
  addTrackToJourney,
  createJourney,
  getjourneyId,
  publishJourney,
  getJourneyInfo,
  deletetrackapi,
  getAllAudienceApi,
  logger,
  createLinkedContent,
  publishLinkContent,
} from "../../../path.js";

let jwt;
let subuuid, auduuid, linkContenuuid;
let fileName = process.env.FileName;
let areaDataFilepath = reusableFunctions.getPath(
  "testData/AreaTestData",
  `${fileName}.json`
);
let areaData = reusableFunctions.readDatafromJsonFilenotasync(areaDataFilepath);

test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
  let contentUrl =
    "https://cdn.bfldr.com/YWP0W9AT/at/cq8h8ptgmpm5bnkvpbsxm36/Skillsoft_Lab_Types.pdf?format=pdf&width=2000&height=1125";
  let desc =
    "Skillsoft lab types include Codecademy Projects, Prompting Labs, Practice Labs, Challenge Labs, and Sandbox, with details on their purpose, characteristics, and service providers.";
  let imageUrl =
    "https://cdn2.percipio.com/public/us/custom-content/5cbc7202-4149-4fb3-9363-4ef8ae1a25e7/public/images/saved/9f2b7d2c-62e2-4583-b02a-c14edc2eec49/technology.jpg?width=600";
  linkContenuuid = await createLinkedContent(
    request,
    jwt,
    "Skillsoft Lab Types",
    contentUrl,
    desc,
    imageUrl,
    "READ",
    120
  );
  await publishLinkContent(request, jwt, linkContenuuid);
});

test.describe("area code", async () => {
  test(`Get Subject UUIds`, async ({ request }, testInfo) => {
    testInfo.setTimeout(2000000);
    //get subject id
    try {
      let respofSubdata = await apiresponseValidations.getSubUUIDS(
        request,
        urlData.getAreasOfOrgUrl,
        jwt
      );
      subuuid = respofSubdata.flatMap((item) =>
        item.title === areaData.AreaName
          ? item.subjects
              .filter((subject) =>
                areaData.SubJectNames.includes(subject.title)
              )
              .map((subject) => subject.uuid)
          : []
      );
    } catch (e) {
      logger.info(`Unable to fetch subids due to error ${e}`);
    }

    //create custom Journey
    for (let journey of areaData.CustomJournies) {
      await createJourney(
        request,
        jwt,
        journey.JourneyName,
        subuuid,
        journey.JourneyDescription,
        journey.JourneyImage
      );
      let journeyUUId = await getjourneyId(request, jwt, journey.JourneyName);
      logger.info(`JourneyUUId of ${journey.JourneyName} is ${journeyUUId}`);
      let tracktoBeDeleted = await getJourneyInfo(request, jwt, journeyUUId);
      let trackData = journey.Tracks;
      for (let [index, track] of trackData.entries()) {
        let currentTrackName = track.trackName;
        let currentTrackContent = track.trackContent;
        let currentTrackDescription = track.trackDescription;
        let currentTrackImage = track.trackImage;
        let trackposition = index;
        await addTrackToJourney(
          request,
          jwt,
          journeyUUId,
          currentTrackContent,
          trackposition,
          currentTrackName,
          currentTrackDescription,
          currentTrackImage,
          tracktoBeDeleted.trackBadgeUUID
        );
      }
      // add intro to jouney
      let introData = journey.IntroData;
      let introContent = replaceCustomContentId(
        linkContenuuid,
        introData.introContent,
        introData.introName
      );
      await addIntroToJourney(
        request,
        jwt,
        journeyUUId,
        introContent,
        0,
        introData.introName,
        introData.introImage,
        tracktoBeDeleted.trackBadgeUUID
      );
      //get all user auduuid and map created it to created custom Journey
      auduuid = await getAllAudienceApi("Region", request, jwt);
      await deletetrackapi(request, jwt, tracktoBeDeleted.trackId);
      await addAudToJourneyApi(request, jwt, journeyUUId, auduuid);
      await publishJourney(request, jwt, journeyUUId, journey.JourneyName);
    }
  });
});

function replaceCustomContentId(linkContenuuid, introContent, introName) {
  let foundCustomContent = false;

  for (let element of introContent) {
    if (element.contentItemUuid === "customContent") {
      element.contentItemUuid = linkContenuuid;
      foundCustomContent = true;
      logger.info(`Linked content has been added to track ${introName}`);
      break;
    }
  }

  if (!foundCustomContent) {
    logger.info(`No need to add Linked content to the track ${introName}`);
  }
  logger.info(introContent);
  return introContent;
}