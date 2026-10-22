import {
  test,
  generateToken,
  reusableFunctions,
  retireChannelApi,
  getjourneyId,
  logger,
} from "../../../path.js";

let jwt;

const fileName = process.env.FileName;
const certificationpath = reusableFunctions.getPath(
  "testData/certificationPaths",
  `${fileName}.json`
);

const data = reusableFunctions.readDatafromJsonFilenotasync(certificationpath);
const totalData = data?.certificationPaths || [];

test.describe("CertificatePath Retirement - Parallel", () => {
  test.describe.configure({ mode: "parallel" }); // ✅ Enable parallel execution

  test.beforeAll(
    "Get Token Get Admin ID and Get All userApi response",
    async ({ request }, testInfo) => {
      testInfo.setTimeout(40000);
      jwt = await generateToken(request);
      logger.info("✅ Token fetched successfully!");
    }
  );

  totalData.forEach((element) => {
    test(`Retire Journey: ${element.JourneyName}`, async ({
      request,
    }, testInfo) => {
      testInfo.setTimeout(200000);
      let journeyUUId = await getjourneyId(request, jwt, element.JourneyName);
      logger.info(`Journey UUID for ${element.JourneyName}: ${journeyUUId}`);
      await retireChannelApi(request, jwt, journeyUUId);
    });
  });
});
