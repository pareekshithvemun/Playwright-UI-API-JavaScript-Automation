import {
  urlData,
  expect,
  test,
  generateToken,
  reusableFunctions,
  createArea,
  apiresponseValidations,
  headerData,
  createSubjectWithExistingChannelAndJourneyBody,
  addAudToJourneyApi,
  addTrackToJourney,
  createJourney,
  getjourneyId,
  publishJourney,
  getJourneyInfo,
  deletetrackapi,
  getAllAudienceApi,
  logger,
  resolveSkillsoftCoachingLinkedContent,
  getSkillIdsByNames,
} from "../../../path.js";

let jwt;
let linkContenuuid;
let fileName = process.env.FileName;
let areaData = reusableFunctions.readJsonFile(
  "testData/AreaTestData",
  fileName
);
let totalData = areaData?.testData || [];

test.beforeAll("get Token", async ({ request }) => {
  jwt = await generateToken(request);
  linkContenuuid = await resolveSkillsoftCoachingLinkedContent(request, jwt);
  logger.info(`Skillsoft Coaching linked content UUID: ${linkContenuuid}`);
});

test.describe("area code", async () => {
  test.describe.configure({ mode: "parallel" });

  totalData.forEach((element) => {
    test.describe(`Area flow: ${element.AreaName}`, () => {
      test.describe.configure({ mode: "serial" });

      let areauuid;

      test(`Area Creation ${element.AreaName}`, async ({ request }) => {
        const existingUuid = await apiresponseValidations.findAreaUuidByTitle(
          request,
          urlData.getAreasOfOrgUrl,
          jwt,
          element.AreaName
        );
        if (existingUuid) {
          logger.info(
            `Area "${element.AreaName}" already exists (uuid=${existingUuid}), skipping create`
          );
          return;
        }
        await createArea(
          request,
          jwt,
          element.AreaName,
          element.AreaImage,
          element.AreaDescription
        );
      });

      test(`Get AreaUUID of ${element.AreaName}`, async ({ request }) => {
        let uuid = await apiresponseValidations.findAreaUuidByTitle(
          request,
          urlData.getAreasOfOrgUrl,
          jwt,
          element.AreaName
        );
        if (!uuid) {
          const resp = await apiresponseValidations.getAreaUUIDfromExcel(
            request,
            urlData.getAreasOfOrgUrl,
            jwt,
            element.AreaName
          );
          expect(resp.resdata.status()).toBe(200);
          const matches = resp.areaUUids;
          if (!matches || matches.length === 0) {
            throw new Error(
              `No area with title "${element.AreaName}" in GET areas response (${urlData.getAreasOfOrgUrl})`
            );
          }
          uuid = matches[0].uuid;
        }
        areauuid = uuid;
        expect(areauuid).toBeTruthy();
        logger.info(`AreaUUID for "${element.AreaName}": ${areauuid}`);
      });

      test(`Create Subject for ${element.AreaName}`, async ({
        request,
      }, testInfo) => {
        testInfo.setTimeout(2000000);
        for (let subject of element.Subjects) {
          let subuuid;
          //create subject
          try {
            let uuid = reusableFunctions.uuidGenerator();
            let headerofcustomSubject = headerData.customiseSubjHeaders(
              jwt,
              "application/json"
            );
            let res = await request.post(urlData.customSubJectUrl(uuid), {
              data: await createSubjectWithExistingChannelAndJourneyBody(
                subject.SubJectName,
                subject.Content,
                areauuid,
                subject.Description,
                subject.subImage
              ),
              headers: headerofcustomSubject,
            });
            const resp = await res.json();
            expect(res.status()).toBe(200);
            const text = resp["message"];
            logger.info(text);
          } catch (error) {
            logger.info(`Failed to Create Subject due to ${error}`);
          }
          //get subject id
          try {
            let respofSubdata = await apiresponseValidations.getSubID(
              request,
              urlData.getAreasOfOrgUrl,
              jwt,
              element.AreaName,
              subject.SubJectName
            );
            expect(respofSubdata.resdata.status()).toBe(200);
            subuuid = respofSubdata.uuid;
          } catch (e) {
            logger.info(`Unable to fetch subid due to error ${e}`);
          }
          //create custom Journey
          if (subject.CustomJournies) {
            for (let journey of subject.CustomJournies) {
              // Fetch skill IDs if SkillsData exists, otherwise use empty array
              let skillIds = [];
              if (journey.SkillsData && journey.SkillsData.length > 0) {
                skillIds = await getSkillIdsByNames(request, jwt, journey.SkillsData);
                logger.info(`Skills for "${journey.JourneyName}": ${skillIds.length}/${journey.SkillsData.length} resolved`);
              }
              
              await createJourney(
                request,
                jwt,
                journey.JourneyName,
                subuuid,
                journey.JourneyDescription,
                journey.JourneyImage,
                skillIds,
                journey.journeyStyle
              );
              let journeyUUId = await getjourneyId(
                request,
                jwt,
                journey.JourneyName
              );
              logger.info(
                `JourneyUUId of ${journey.JourneyName} is ${journeyUUId}`
              );
              let tracktoBeDeleted = await getJourneyInfo(
                request,
                jwt,
                journeyUUId
              );
              let trackData = journey.Tracks;
              for (let [index, track] of trackData.entries()) {
                let currentTrackName = track.trackName;
                let currentTrackContent = track.trackContent;
                currentTrackContent = replaceCustomContentId(
                  linkContenuuid,
                  currentTrackContent,
                  currentTrackName
                );
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
              const auduuid = await getAllAudienceApi("Region", request, jwt);
              await deletetrackapi(request, jwt, tracktoBeDeleted.trackId);
              await addAudToJourneyApi(request, jwt, journeyUUId, auduuid);
              await publishJourney(
                request,
                jwt,
                journeyUUId,
                journey.JourneyName
              );
            }
          } else {
            logger.info(
              `No CustomJournies found in this subject: ${subject.SubJectName}`
            );
          }
        }
      });
    });
  });
});

function replaceCustomContentId(
  linkContenuuid,
  currentTrackContent,
  trackName
) {
  let foundCustomContent = false;

  for (let element of currentTrackContent) {
    if (element.contentItemUuid === "customContent") {
      element.contentItemUuid = linkContenuuid;
      foundCustomContent = true;
      logger.info(`Linked content has been added to track ${trackName}`);
      break;
    }
  }

  if (!foundCustomContent) {
    logger.info(`No need to add Linked content to the track ${trackName}`);
  }
  logger.info(currentTrackContent);
  return currentTrackContent;
}
