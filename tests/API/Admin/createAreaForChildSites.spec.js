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
  createLinkedContent,
  publishLinkContent,
  getSkillIdsByNames,
  fetchAllLinkedContentSummaries,
  addSkillsToJourney,
} from "../../../path.js";

// Load test data files
const areaData = reusableFunctions.readJsonFile(
  "testData/childSites/childSiteAreaAndJournies.json",
);
const contentData = reusableFunctions.readJsonFile(
  "testData/childSites/shareContentToSitesData.json",
);

let jwt;
let areauuid, subuuid, auduuid;
let totalData = areaData?.testData || [];

// Map to store content title -> UUID mapping
const contentUuidMap = new Map();

test.beforeAll("Generate JWT and create all content", async ({ request }) => {
  test.setTimeout(300000);
  jwt = await generateToken(request);

  // Fetch existing published content (status: 0=Draft, 2=Published, 3=Retired)
  const existingContent = await fetchAllLinkedContentSummaries(request, jwt);
  const existingMap = new Map(
    existingContent
      .filter((item) => item.status === 2)
      .map((item) => [item.title.toLowerCase(), item.linkedContentUuid]),
  );
  logger.info(`Found ${existingMap.size} existing published content`);

  // Create content if not already published
  for (const content of contentData) {
    const existingUuid = existingMap.get(content.title.toLowerCase());

    if (existingUuid) {
      contentUuidMap.set(content.title, existingUuid);
      logger.info(`EXISTS: "${content.title}" -> ${existingUuid}`);
      continue;
    }

    try {
      const skillIds =
        content.skills?.length > 0
          ? await getSkillIdsByNames(request, jwt, content.skills)
          : [];

      const contentUuid = await createLinkedContent(
        request,
        jwt,
        content.title,
        content.contentUrl,
        content.desc,
        content.imageUrl,
        content.modality,
        content.duration,
        skillIds,
        content.sourceName,
      );
      await publishLinkContent(request, jwt, contentUuid);
      contentUuidMap.set(content.title, contentUuid);
      logger.info(`CREATED: "${content.title}" -> ${contentUuid}`);
    } catch (error) {
      logger.error(`FAILED: "${content.title}" - ${error.message}`);
    }
  }

  logger.info(
    `Total content ready: ${contentUuidMap.size}/${contentData.length}`,
  );
});

test.describe("Child Site Area Creation", async () => {
  test.describe.configure({ mode: "serial" });

  totalData.forEach((element) => {
    test(`Area Creation: ${element.AreaName}`, async ({ request }) => {
      await createArea(
        request,
        jwt,
        element.AreaName,
        element.AreaImage,
        element.AreaDescription,
      );
    });

    test(`Get AreaUUID: ${element.AreaName}`, async ({ request }, testInfo) => {
      try {
        let resp = await apiresponseValidations.getAreaUUIDfromExcel(
          request,
          urlData.getAreasOfOrgUrl,
          jwt,
          element.AreaName,
        );
        areauuid = resp.areaUUids[0].uuid;
        expect(resp.resdata.status()).toBe(200);
        logger.info(`Area UUID for "${element.AreaName}": ${areauuid}`);
      } catch (e) {
        testInfo.fail(true, `Test failed due to: ${e}`);
      }
    });

    test(`Create Subjects and Journeys for: ${element.AreaName}`, async ({
      request,
    }, testInfo) => {
      testInfo.setTimeout(300000); // 5 minutes for large operations

      for (let subject of element.Subjects) {
        // Create subject
        try {
          let uuid = reusableFunctions.uuidGenerator();
          let headerofcustomSubject = headerData.customiseSubjHeaders(
            jwt,
            "application/json",
          );
          let res = await request.post(urlData.customSubJectUrl(uuid), {
            data: await createSubjectWithExistingChannelAndJourneyBody(
              subject.SubJectName,
              subject.Content,
              areauuid,
              subject.Description,
              subject.subImage,
            ),
            headers: headerofcustomSubject,
          });
          const resp = await res.json();
          expect(res.status()).toBe(200);
          logger.info(`Created subject: ${subject.SubJectName}`);
        } catch (error) {
          logger.error(`Failed to create subject: ${error}`);
        }

        // Get subject UUID
        try {
          let respofSubdata = await apiresponseValidations.getSubID(
            request,
            urlData.getAreasOfOrgUrl,
            jwt,
            element.AreaName,
            subject.SubJectName,
          );
          expect(respofSubdata.resdata.status()).toBe(200);
          subuuid = respofSubdata.uuid;
          logger.info(`Subject UUID for "${subject.SubJectName}": ${subuuid}`);
        } catch (e) {
          logger.error(`Unable to fetch subject UUID: ${e}`);
        }

        // Create custom journeys
        if (subject.CustomJournies) {
          for (let journey of subject.CustomJournies) {
            // Fetch skill IDs for journey
            let skillIds = [];
            // Check if badging is enabled (default true)
            let enableBadging = journey.enableBadging !== false;

            // Create journey (skills added later via PATCH)
            await createJourney(
              request,
              jwt,
              journey.JourneyName,
              subuuid,
              journey.JourneyDescription,
              journey.JourneyImage,
              skillIds,
              journey.journeyStyle,
              enableBadging,
            );

            // Get journey UUID
            let journeyUUId = await getjourneyId(
              request,
              jwt,
              journey.JourneyName,
            );
            logger.info(
              `Journey UUID for "${journey.JourneyName}": ${journeyUUId}`,
            );

            // Get journey info for track deletion
            let tracktoBeDeleted = await getJourneyInfo(
              request,
              jwt,
              journeyUUId,
            );

            // Add tracks to journey
            for (let [index, track] of journey.Tracks.entries()) {
              let trackContent = replaceContentTitlesWithUuids(
                track.trackContent,
                track.trackName,
              );
              await addTrackToJourney(
                request,
                jwt,
                journeyUUId,
                trackContent,
                index,
                track.trackName,
                track.trackDescription,
                track.trackImage,
                tracktoBeDeleted.trackBadgeUUID,
                enableBadging,
              );
              logger.info(`Added track: ${track.trackName}`);
            }

            // Add skills to journey via PATCH
            if (journey.SkillsData && journey.SkillsData.length > 0) {
              skillIds = await getSkillIdsByNames(
                request,
                jwt,
                journey.SkillsData,
              );
              logger.info(
                `Skills for journey "${journey.JourneyName}": ${skillIds.length}/${journey.SkillsData.length} resolved`,
              );
            }
            if (skillIds.length > 0) {
              await addSkillsToJourney(request, jwt, journeyUUId, skillIds);
            }

            // Get audience and assign to journey
            auduuid = await getAllAudienceApi("evalAudience", request, jwt);
            await deletetrackapi(request, jwt, tracktoBeDeleted.trackId);
            await addAudToJourneyApi(request, jwt, journeyUUId, auduuid);

            // Publish journey
            await publishJourney(
              request,
              jwt,
              journeyUUId,
              journey.JourneyName,
            );
            logger.info(`Published journey: ${journey.JourneyName}`);
          }
        } else {
          logger.info(
            `No CustomJournies found for subject: ${subject.SubJectName}`,
          );
        }
      }
    });
  });
});

function replaceContentTitlesWithUuids(trackContent, trackName) {
  const updatedContent = trackContent.map((item) => {
    const contentTitle = item.contentItemUuid;

    if (contentUuidMap.has(contentTitle)) {
      const uuid = contentUuidMap.get(contentTitle);
      logger.info(
        `Replaced "${contentTitle}" with UUID: ${uuid} in track "${trackName}"`,
      );
      return {
        ...item,
        contentItemUuid: uuid,
      };
    } else {
      logger.error(
        `Content title "${contentTitle}" not found in content map - make sure it exists in shareContentToSitesData.json`,
      );
      return item;
    }
  });

  return updatedContent;
}
