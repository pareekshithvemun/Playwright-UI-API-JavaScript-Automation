import { test } from "@playwright/test";
import reusableFunctions from "../../../helpers/UI/commonFunctions.js";
import { generateToken } from "../../../helpers/API/token/tokenGenerator.js";
import { logger } from "../../../logger.js";
import { getAllAttributesApi } from "../../../helpers/API/apibuilders/getAllAttributesApi.js";
import { headerData } from "../../../helpers/API/headers/allHeaders.js";
import { urlData } from "../../../helpers/API/url/allUrls.js";
import { createUserPayload } from "../../../helpers/API/payloads/createUserPayload.js";
import { expect } from "@playwright/test";
import { getAllUserApi } from "../../../helpers/API/apibuilders/getAllUsers.js";



let jwt;
let attruuids = [];


test.beforeAll("get jwt Token", async ({ request }) => {
    jwt = await generateToken(request);
    logger.info(jwt);
    logger.info(process.env.NODE_ENV);
});



test.describe("Create default users", () => {
    test("Default User Creation", async ({ request }) => {
        test.setTimeout(1000000);
        //let userdata = new ExcelHelperAndDataGenerator();  
        //excelData=await reusableFunctions.testCreateUser(request,jwt,userdata);

        let pathofattributeData = "testData/attributeValues/attributeData.json";
        let attrNames = reusableFunctions.readDatafromJsonFilenotasync(pathofattributeData);
        for (let att of attrNames.attributeData) {
            let respOfgetAttributeName = await getAllAttributesApi(
                request,
                jwt,
                att.attributeName
            );
            attruuids.push(respOfgetAttributeName.customAttributeUuid);
        }
        console.log(attruuids);
        let pathofuserData = "testData/usersData/defaultUsers.json";
        let defaultUsers = reusableFunctions.readDatafromJsonFilenotasync(pathofuserData);
        let headerofcreatUser = headerData.createUserHeader(jwt, "application/json");
        for (let element of defaultUsers.defaultUsersData) {
            let attrValueofRegion = element.attrValue1;
            console.log
            let attrValueofDepartment = element.attrValue2;
            let attrValueofJobTitle = element.attrValue3;
            let email = generateRandomEmail(element.fName, element.lName)
            let JobRole = attrValueofJobTitle;
            try {
                const response = await request.post(urlData.createUserUrl, {
                    data: createUserPayload(
                        element.loginName,
                        element.passWord,
                        element.userRole,
                        email,
                        element.fName,
                        element.lName,
                        element.userID,
                        JobRole,
                        attruuids[0],
                        attrValueofRegion,
                        attruuids[1],
                        attrValueofDepartment,
                        attruuids[2],
                        attrValueofJobTitle,
                        await getManagerObj(element.manager, jwt, request)

                    ),
                    headers: headerofcreatUser,
                });
                console.log(response);

                expect(response.status()).toBe(200);
                logger.info(`User ${element.loginName} created`);
            } catch (error) {
                logger.error(
                    `Failed to create user ${element.loginName
                    } due to error: ${JSON.stringify(error)}`
                );
            }
        }

    }
    )
});

async function getManagerObj(manager, jwt, request) {
    let managerObj;
    let allUserResponse = await getAllUserApi(request, jwt);

    if (manager && allUserResponse) {
        try {

            managerObj = allUserResponse.users.find(
                (user) => user.loginName === manager
            );
        }
        catch (error) {
            logger.error(error)
            logger.error(`Failed to get managerObj of ${manager} due to error: ${error}`)
        }

        if (managerObj) {
            return managerObj;
        }
        else {
            return null;
        }
    }
    else return null;
}

function generateRandomEmail(firstName, lastName) {
    const randomNumber = Math.floor(Math.random() * 1000);
    const domain = "noemail.com"; // Replace this with your desired domain
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNumber}@${domain}`;
    return email;
}