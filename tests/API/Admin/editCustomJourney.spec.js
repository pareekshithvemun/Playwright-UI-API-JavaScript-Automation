import { test } from "@playwright/test";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { addtrack } from "../../../helpers/API/payloads/addTrackToJourneypayload.js";
import { headerData } from "../../../helpers/API/headers/allHeaders.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { getAllJourniesApi } from "../../../helpers/API/apibuilders/getalljournies.js";
import { getJourneyInfo } from "../../../helpers/API/apibuilders/getJourneyInfo.js";
import { publishJourney } from "../../../helpers/API/apibuilders/publishjourney.js"
import { updateTrack } from "../../../helpers/API/apibuilders/updateTrackContent.js"
import { logger } from "../../../logger.js";



let jwt, allJourneys, allJourneysData, journeyId, allTracks, trackDetails, trackId, JourneyData, data;


test.beforeAll("get Token", async ({ request }) => {
    jwt = await generateToken(request);
    logger.info(jwt);
    logger.info(process.env.NODE_ENV);
    let pathofJourneyData = "testData/JourneyTestData/journeyData.json";
    data = reusableFunctions.readDatafromJsonFilenotasync(pathofJourneyData);
    JourneyData = data.journeyData;
});



test.describe("Edit and publish journey ", () => {
    test("edit track", async ({ request }) => {
        test.setTimeout(1000000);
        for (let journey of JourneyData) {
            allJourneys = await getAllJourniesApi(request, jwt);
            allJourneysData = allJourneys.respofAllJourneyApiData
            journeyId = await getJourneyUuid(allJourneysData, journey.journeyTitle);
            for (let track of journey.trackData) {
                allTracks = await getJourneyInfo(request, jwt, journeyId);
                trackDetails = await getTrackDetails(allTracks.resp, track.trackTitle)
                await updateTrack(request, jwt, trackDetails.id, journeyId, track.contentItems, trackDetails.position, track.trackTitle, trackDetails.description, trackDetails.imageUrl, null)
            }
            await publishJourney(request, jwt, journeyId);
        }

    });
});


function getJourneyUuid(data, title) {
    let channel = data.channels.find(channel => {
        let localization = channel.localizations.find(localization => localization.title === title);
        return localization !== undefined;
    });
    return channel ? channel.channelUuid : null;
}


function getTrackDetails(data, title) {
    for (let i = 0; i < data.channelViews.length; i++) {
        if (data.channelViews[i].title === title) {
            trackDetails = {
                id: data.channelViews[i].id,
                description: data.channelViews[i].description,
                imageUrl: data.channelViews[i].imageUrl,
                position: i
            };
            return trackDetails
        }
    }
    return null; // or return a message like "No matching channel view found"
}