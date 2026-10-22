import {
  test,
  reusableFunctions,
  generateToken,
  generateTokenLearner,
  logger,
  getAllUserApi,
  getAspirationJobRolesApi,
  getPrimaryJobRoleApi,
  setAspirationJobRoleApi,
  setPrimaryJobRoleApi,
  roleFocusedSkillsExtractionApi,
  rateSkillApi,
  config,
} from "../../../path.js";

let jwt, allUserApiResp, primaryRoles, UserArray, mappedUsers;
const defaultUsersDataFromJsonFile = reusableFunctions.getPath(
  "testData/usersData",
  `defaultUsers.json`
);
let defaultUsers = reusableFunctions.readDatafromJsonFilenotasync(
  defaultUsersDataFromJsonFile
).defaultUsersData;

test.beforeAll("Prepare Users and Roles", async ({ request }) => {
  jwt = await generateToken(request);
  allUserApiResp = await getAllUserApi(request, jwt);
  logger.info(`All users ${allUserApiResp}`);

  let shuffledUsers = reusableFunctions.shuffleDataWithoutDefaultandSkillsoftUsers(
    allUserApiResp.users, defaultUsers
  );
  UserArray = reusableFunctions.limitTheArrayData(shuffledUsers, 50);
  logger.info(`User array is ${JSON.stringify(UserArray)}`);
  let primaryJobRoleApiResp = await getPrimaryJobRoleApi(request, jwt);
  mappedUsers = await mapUsersToJobRoles(UserArray, primaryJobRoleApiResp);
  logger.info(`Mapped users is ${mappedUsers}`);
});

test.describe("Creating data for each User", () => {
  test.describe.configure({ mode: "parallel" });
  test("Assign primary job role to each user sequentially", async ({
    request,
  }) => {
    test.setTimeout(200000);
    for (let i = 0; i < mappedUsers.length; i++) {
      try {
        const user = mappedUsers[i].loginName;
        logger.info(`Processing user: ${user}`);

        let currentUserToken = await generateTokenLearner(
          request,
          user,
          config.get("Admindata").password
        );

        await setPrimaryJobRoleApi(
          request,
          currentUserToken,
          mappedUsers[i].jobRoleUuid,
          mappedUsers[i].jobRoleName,
          user
        );

        let respofgetAspi = await getAspirationJobRolesApi(
          request,
          currentUserToken,
          mappedUsers[i].jobRoleUuid
        );

        let selectedRole = pickRandomAspirationJobRole(
          respofgetAspi[0].data.skilzSuggestedAspirationalJobroles
        );

        let aspirationRoleUuid = selectedRole?.jobRoleUuid;
        let aspirationRoleName = selectedRole?.jobRoleName;

        if (!aspirationRoleUuid || !aspirationRoleName) {
          logger.error(
            "setAspirationJobRoleApi not hit: Missing role UUID or Name"
          );
        } else {
          await setAspirationJobRoleApi(
            request,
            currentUserToken,
            aspirationRoleUuid,
            aspirationRoleName,
            user
          );
        }

        let curespSKills = await roleFocusedSkillsExtractionApi(
          request,
          currentUserToken,
          mappedUsers[i].jobRoleUuid
        );
        let extractedSkills = extractSkillData(curespSKills);
        logger.info(extractedSkills);
        let ratedCount = 0;
        for (let skill of extractedSkills) {
          if (ratedCount >= 3) break;
          if (skill.selfRating == null) {
            await rateSkillApi(
              request,
              currentUserToken,
              skill.skillId,
              Math.floor(Math.random() * 5) + 1
            );
            ratedCount++;
          }
        }
      } catch (error) {
        logger.error(
          `Error processing user ${mappedUsers[i].loginName}: ${error}`
        );
      }
    }
  });
});

function mapUsersToJobRoles(usersPayload, jobRolesPayload) {
  const jobRoles = jobRolesPayload[0]?.data?.skilzPrimaryJobRoles || [];

  return usersPayload.map((user, index) => {
    const role = jobRoles[index % jobRoles.length]; // cyclic assign

    if (role) {
      return {
        loginName: user.loginName,
        jobRoleName: role.jobRoleName,
        jobRoleUuid: role.jobRoleUuid,
      };
    } else {
      return {
        loginName: user.loginName,
        jobRoleName: "Not Found",
        jobRoleUuid: "Not Found",
      };
    }
  });
}

function extractSkillData(response) {
  if (!Array.isArray(response)) return [];

  return response.flatMap(
    (entry) =>
      entry?.data?.skilzUserFocusSkills?.map((skill) => ({
        skillId: skill.skillId,
        skillName: skill.skillName,
        selfRating: skill.selfRating,
        targetRating: skill.targetRating,
      })) || []
  );
}

function pickRandomAspirationJobRole(similarJobRoles) {
  if (!similarJobRoles || similarJobRoles.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * similarJobRoles.length);
  return similarJobRoles[randomIndex];
}
