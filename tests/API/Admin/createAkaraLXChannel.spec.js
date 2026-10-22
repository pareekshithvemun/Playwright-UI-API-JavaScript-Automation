import { expect, test, headerData, urlData, generateToken, getAllAudienceApi, reusableFunctions, createcustomChannelbody, addContentToChannelBody, getLibrariesApi, getSubjectUuidsFromLibraries, logger, createLinkedContent, publishLinkContent, resolveChannelContentNamesToUuids } from "../../../path.js";

let jwt;
let fileName = process.env.FileName;
let channelDataFilepath = reusableFunctions.getPath(
  "testData/channelTestData",
  `${fileName}.json`,
);
let channelData =
  reusableFunctions.readDatafromJsonFilenotasync(channelDataFilepath);
let channels = channelData?.channelsInfo || [];

test.beforeAll("get Token", async ({ request }, testInfo) => {
  testInfo.setTimeout(50000);
  jwt = await generateToken(request);
});

test.describe("Create Akara LX Channel and add content", async () => {
  // Use fetchLibraries GraphQL API once; extract subject UUIDs per channel via getSubjectUuidsFromLibraries
  test("Create all channels in parallel (create → get info → add content → publish)", async ({
    request,
  }, testInfo) => {
    testInfo.setTimeout(120000);
    const auduuid = await getAllAudienceApi("All Users", request, jwt);

    // Call fetchLibraries once (framework API: graphql3 fetchLibraries)
    const librariesResponse = await getLibrariesApi(request, jwt);

    logger.info(`Creating ${channels.length} channel(s) in parallel...`);

    const channelCreationPromises = channels.map(async (channel) => {
      // Create and publish linked content for this channel only (per-channel linkedContentData)
      const channelContentUUIDs = {};
      const linkedContentData = channel.linkedContentData || [];
      for (const contentData of linkedContentData) {
        const customContentUUID = await createLinkedContent(
          request,
          jwt,
          contentData.title,
          contentData.contentUrl,
          contentData.desc,
          contentData.imageUrl,
          contentData.modality,
          contentData.duration,
        );
        logger.info(
          `${channel.channelName}: linked content ${contentData.title} UUID ${customContentUUID}`,
        );
        channelContentUUIDs[contentData.title] = customContentUUID;
        await publishLinkContent(request, jwt, customContentUUID);
      }

      // Extract subject UUIDs from libraries response (area name + subject names)
      const { subjectUuids: subID } = getSubjectUuidsFromLibraries(
        librariesResponse,
        channel.AreaName,
        channel.SubjectName || [],
      );
      logger.info(
        `${channel.channelName}: Area ${channel.AreaName}, subID ${subID}`,
      );

      const channelUuid = reusableFunctions.uuidGenerator();
      const headerofcustomChannel = headerData.customChannelHeaders(
        jwt,
        "application/json",
      );

      // 1. Create channel (channelUuid is the UUID we pass in the URL)
      const resofCreateChannelApi = await request.post(
        urlData.customChannelCreationUrl(channelUuid),
        {
          data: createcustomChannelbody(
            channel.channelName,
            channel.channelDescription,
            subID,
            auduuid,
            channel.channelImage,
          ),
          headers: headerofcustomChannel,
        },
      );
      expect(resofCreateChannelApi.status()).toBe(200);
      const createResp = await resofCreateChannelApi.json();
      logger.info(`${channel.channelName}: ${createResp["message"]}`);

      // 2. Get channel info (channelViewUuid)
      const headerofchannelInfo = headerData.getChannelInfoHeaders(jwt);
      const getChannelInfoRes = await request.get(
        urlData.getChannelInfoUrl(channelUuid),
        { headers: headerofchannelInfo },
      );
      expect(getChannelInfoRes.status()).toBe(200);
      const channelInfo = await getChannelInfoRes.json();
      const channelViewUuid = channelInfo.channelView.channelViewUuid;
      logger.info(`${channel.channelName}: channelViewUuid ${channelViewUuid}`);

      // 3. Add content (resolve names to UUIDs then put)
      const channelContent = channel.channelContent || [];
      if (channelContent.length > 0) {
        const contentData = channelContent.map((item) => ({ ...item }));
        await resolveChannelContentNamesToUuids(
          request,
          jwt,
          contentData,
          channelContentUUIDs,
        );
        const headerofaddcontentToChannel =
          headerData.addContentToChannelHeaders(jwt, "application/json");
        const addContentRes = await request.put(
          urlData.addcontentToChannelUrl(channelViewUuid),
          {
            data: addContentToChannelBody(contentData),
            headers: headerofaddcontentToChannel,
          },
        );
        expect(addContentRes.status()).toBe(200);
        const addResp = await addContentRes.json();
        logger.info(`${channel.channelName}: ${addResp["message"]}`);
      }

      // 4. Publish channel
      const headerofpublish = headerData.publishChannelorJourneyHeaders(jwt);
      const publishRes = await request.post(
        urlData.publishChannelorJourneyUrl(channelUuid),
        { headers: headerofpublish },
      );
      expect(publishRes.status()).toBe(200);
      const publishResp = await publishRes.json();
      logger.info(
        `${channel.channelName}: ${publishResp["message"]} (ID: ${channelUuid})`,
      );

      return { channelName: channel.channelName, channelUuid };
    });

    const results = await Promise.allSettled(channelCreationPromises);
    const successes = results.filter((r) => r.status === "fulfilled");
    const failures = results.filter((r) => r.status === "rejected");

    logger.info(
      `Channel creation summary: ${successes.length} succeeded, ${failures.length} failed`,
    );
    if (failures.length > 0) {
      failures.forEach((f, i) => {
        logger.info(
          `Failed channel ${i + 1}: ${f.reason?.message || f.reason}`,
        );
      });
      expect(failures.length).toBe(0);
    }
  });
});
