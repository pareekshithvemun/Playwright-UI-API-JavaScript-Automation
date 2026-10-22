import path from "path";
import XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import config from "config";
import fs from "fs";
import { createUserPayload } from "../../helpers/API/payloads/createUserPayload.js";
import { headerData } from "../../helpers/API/headers/allHeaders.js";
import { urlData } from "../../helpers/API/url/allUrls.js";
import { expect } from "@playwright/test";
import { getAllAttributesApi } from "../../helpers/API/apibuilders/getAllAttributesApi.js";
import { logger } from "../../logger.js";
import jwt from "jsonwebtoken";

let excelData, userUUD;
let attruuids = [];
let pathofattributeData = "testData/attributeValues/attributeData.json";
let attrNames = readDatafromJsonFilenotasync(pathofattributeData);
let userCount = process.env.USERCOUNT || "";
userCount =
  userCount.trim() === "" || isNaN(Number(userCount)) ? "" : userCount;

async function testCreateUser(request, jwt, data, normUserOrAsgnUser = false) {
  let excelData;
  const maxUsersToCreate = Math.min(userCount, 200);
  logger.info(
    `Number of users that will be created in this organization with the current run:${maxUsersToCreate}`,
  );
  await setExcelData(
    await data.dataCreation(maxUsersToCreate, normUserOrAsgnUser),
  );
  excelData = await getExcelData();
  for (let att of attrNames.attributeData) {
    let respOfgetAttributeName = await getAllAttributesApi(
      request,
      jwt,
      att.attributeName,
    );
    attruuids.push(respOfgetAttributeName.customAttributeUuid);
  }

  logger.info(excelData);
  let headerofcreatUser = headerData.createUserHeader(jwt, "application/json");
  for (const element of excelData) {
    let attrValueofRegion = reusableFunctions.getRandomValueFromArray(
      attrNames.attributeData[0].attributeValues,
    );
    let attrValueofDepartment = reusableFunctions.getRandomValueFromArray(
      attrNames.attributeData[1].attributeValues,
    );
    let attrValueofJobTitle = reusableFunctions.getRandomValueFromArray(
      attrNames.attributeData[2].attributeValues,
    );
    let JobRole = attrValueofJobTitle;
    try {
      const response = await request.post(urlData.createUserUrl, {
        data: createUserPayload(
          element.loginName,
          element.passWord,
          element.Userrole,
          element.email,
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
        ),
        headers: headerofcreatUser,
      });

      expect(response.status()).toBe(200);
      logger.info(`User ${element.loginName} created`);
    } catch (error) {
      logger.error(
        `Failed to create user ${
          element.loginName
        } due to error: ${JSON.stringify(error)}`,
      );
    }
  }
  return excelData;
}

async function setTimer(value) {
  return new Promise((resolve) => {
    setTimeout(() => {
      logger.info(`Waited for  ${value} ms`);
      resolve();
    }, value);
  });
}

function findIdByName(name, objectives) {
  for (let objective of objectives) {
    if (objective.name === name) {
      return objective.id;
    }
  }
  return null;
}

async function getEpochTime() {
  const epochTime = Date.now();
  return epochTime;
}

// const basePath =
//   "/Users/KKBIKKINA/Documents/GitHub/Playwright-UI-API-JavaScript-Automation/testData";
// const relativePaths = ["template.csv"];
// const absolutePaths = relativePaths.map((relativePath) =>
//   path.resolve(basePath, relativePath)
// );

async function addElementTotargetElement(absolutePath, targetElement, page) {
  const form = await page.evaluateHandle(() => {
    const form = document.createElement("form");
    form.id = "seleniumDragAndDropInput_form";
    const input = document.createElement("input");
    input.id = "seleniumDragAndDropInput";
    input.type = "file";
    form.appendChild(input);
    return form;
  });
  if (!form) {
    logger.info("Element has not been appended");
    return;
  }

  const targetAndForm = { targetElement, form };
  logger.info(targetAndForm);
  await page.evaluate((form) => {
    logger.info("In first page.evaluate");
    if (form instanceof HTMLElement) {
      logger.info("Element is there and about to append");
      // targetAndForm.targetElement.appendChild(targetAndForm.form);
    }
  }, form);

  // Set the value of the input element to the absolute path of the file to be dropped
  await page.evaluate((absolutePath) => {
    const inputElement = document.querySelector(
      '[id^="seleniumDragAndDropInput"]',
    );
    inputElement.value = absolutePath;
  }, absolutePath);

  // Create a new Event object of type `drop`
  const eve = new Event("drop", { bubbles: true, cancelable: true });
  const files = Array.from(inputElement).map((input) => input.files[0]);
  eve.dataTransfer = { files };
  targetElement.dispatchEvent(eve);
}

async function countObjects(array) {
  let numberOfObjects = 0;
  for (const element of array) {
    if (typeof element === "object") {
      numberOfObjects++;
    }
  }
  return numberOfObjects;
}

async function countIdsInLicencePoolandPrint(obj) {
  logger.info("Licence Pool of Organisation are shown Below:");
  const ids = [];
  const nameAndID = [];
  obj.forEach((element) => {
    logger.info(`ID: ${element.id}, Name: ${element.name}`);

    ids.push(element.id);
    nameAndID.push({ id: element.id, Name: element.name });
  });
  const countOfLicencePool = ids.length;
  return { countOfLicencePool, ids, nameAndID };
}

async function stringSpliter(str, seperator) {
  let res = str.split(seperator);
  return res;
}

async function parseStringToInt(str) {
  let num = parseInt(str);
  return num;
}

function getPath(frameworkPath, fileName) {
  let filePath;
  try {
    const absolutePath = path.resolve(__dirname, "..");
    const directoryPath = path.dirname(absolutePath);
    filePath = path.join(directoryPath, frameworkPath, fileName); // between path ex: 'Playwright-UI-API-JavaScript-Automation/testData'
  } catch (error) {
    if (error.code == "ENOENT") {
      logger.info("File location is incorrect");
    } else {
      logger.info(error);
    }
  }

  return filePath;
}

/**
 * Parse FileName when the spec requires two comma-separated basenames. For a single basename, read `process.env.FileName` in the spec instead (do not use this helper).
 *
 * @param {string} [value=process.env.FileName]
 * @returns {{ primary: string, secondary: string, all: string[] }}
 * Callers must validate after use: if `FileName` is unset, `primary` and `secondary` are empty strings (not an error from this function).
 */
function splitFileNameEnv(value = process.env.FileName) {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return { primary: "", secondary: "", all: [] };
  }
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    primary: parts[0] || "",
    secondary: parts[1] || "",
    all: parts,
  };
}

function readDataFromExcel(filePath, sheetName) {
  // this convert excel data to object
  const workbook = XLSX.readFile(filePath);
  const worksheet = workbook.Sheets[sheetName];
  const res = XLSX.utils.sheet_to_json(worksheet);
  return res;
}

async function setExcelData(value) {
  excelData = value;
}

async function getExcelData() {
  return excelData;
}

async function setUserUUIDOfAssignment(value) {
  userUUD = value;
}

async function getUserUUIDOfAssignment() {
  return userUUD;
}

async function convertStringToJson(jsonInString) {
  let jsonData;
  try {
    jsonData = JSON.parse(jsonInString);
  } catch (error) {
    logger.error("Error parsing JSON data:", error.message);
  }
  return jsonData;
}

async function checkLicencePoolInOrgorNot(
  licencePoolsArrayFromOrg,
  licepooltoBeAdded,
) {
  const allInOrg = licepooltoBeAdded.every((pool) =>
    licencePoolsArrayFromOrg.some((orgPool) => orgPool === pool),
  );

  return allInOrg;
}

function uuidGenerator() {
  const myUuid = uuidv4();
  return myUuid;
}

function toogleDynamic() {
  return process.env.DYNAMIC !== undefined &&
    process.env.DYNAMIC.toLowerCase() === "false"
    ? false
    : config.get("dynamic");
}

function generateTime(days) {
  const currentTime = new Date();
  const endTime = new Date(currentTime.getTime() + days * 24 * 60 * 60 * 1000);
  const firstDateOfMonth = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    2,
  );
  const lastDateOfMonth = new Date(
    currentTime.getFullYear(),
    currentTime.getMonth() + 1,
    0,
  );

  return {
    firstDateOfMonth: firstDateOfMonth.toISOString(),
    lastDateOfMonth: lastDateOfMonth.toISOString(),
    currentTime: currentTime.toISOString(),
    endTime: endTime.toISOString(),
  };
}

function seperateAllLicepoolIDs(json) {
  let ids = [];
  json.forEach((item) => {
    ids.push(item["id"]);
  });
  return ids;
}

function padZero(number) {
  return number < 10 ? `0${number}` : number;
}

async function adddaystoCurrentDateforUI(startdate, days) {
  const originalDate = new Date(startdate);
  // Add 30 days to the original date
  const newDate = new Date(originalDate);
  newDate.setDate(originalDate.getDate() + days);

  // Format the new date as MM/DD/YYYY
  const formattedDate = `${padZero(newDate.getMonth() + 1)}/${padZero(
    newDate.getDate(),
  )}/${newDate.getFullYear()}`;
  return formattedDate;
}

async function readDatafromJsonFileasync(path) {
  try {
    const data = await fs.promises.readFile(path, "utf8");
    return JSON.parse(data);
  } catch (err) {
    logger.error("Error reading JSON file due to error:", err);
  }
}

function readDatafromJsonFilenotasync(path) {
  try {
    const data = fs.readFileSync(path, "utf8");
    return JSON.parse(data);
  } catch (err) {
    logger.error("Error reading JSON file due to error:", err);
    return null;
  }
}

function readJsonFile(filePath, fileName = null) {
  try {
    let fullPath;

    // If fileName is provided, treat filePath as directory and combine with fileName
    if (fileName) {
      fullPath = getPath(filePath, `${fileName}.json`);
    } else {
      // If filePath already contains the full path or is a relative path
      if (filePath.startsWith("testData/") || filePath.includes("testData")) {
        // Handle relative paths from testData
        const absolutePath = path.resolve(__dirname, "..");
        const directoryPath = path.dirname(absolutePath);
        fullPath = path.join(directoryPath, filePath);
      } else {
        // Use the path as is
        fullPath = filePath;
      }
    }
    // logger.info(`Reading JSON file from: ${fullPath}`);
    // Use the existing readDatafromJsonFilenotasync function
    return readDatafromJsonFilenotasync(fullPath);
  } catch (err) {
    logger.error(`Error reading JSON file from ${filePath}:`, err);
    return null;
  }
}

function responseValidationofUserInterest(resp) {
  let areasData = [];
  resp[1].data.areas.forEach((element) => {
    if (element.type === "STANDARD") {
      let areaInfo = {
        AreaName: element.id,
        Subjects: [],
      };
      element.subjects.forEach((sub) => {
        areaInfo.Subjects.push(sub.id);
      });
      areasData.push(areaInfo);
    }
  });
  return areasData;
}

function createJsonObject(usersArray, contentArray, date) {
  //flatMap is a method that both maps and flattens an array. It applies a provided function to each element of the array and then flattens the result into a new array.
  return usersArray.flatMap((user) =>
    contentArray.map((content) => ({
      learner: user,
      content: content.asset_uuid,
      type: "ADMIN",
      score: "",
      reason: "For testing",
      datetime: date,
      duration: content.estimated_duration_seconds,
    })),
  );
}

function createJsonObjectwithjustUUIDS(
  usersArray,
  contentArray,
  date,
  duration = 4000,
) {
  //flatMap is a method that both maps and flattens an array. It applies a provided function to each element of the array and then flattens the result into a new array.
  return usersArray.flatMap((user) =>
    contentArray.map((content) => ({
      learner: user,
      content: content,
      type: "ADMIN",
      score: "",
      reason: "For testing",
      datetime: date,
      duration: duration,
    })),
  );
}

function randomSecondsGenerator() {
  let numbers = [3600, 7200, 1800, 900, 2700, 4500, 5400, 6300];
  let randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
  return randomNumber;
}

function getcurrentDateAndEndDateForActivtyDashBoard(timegap) {
  // Create a new Date object for the current date
  const currentDate = new Date();
  // Initialize endDate as current date
  let endDate = new Date(currentDate);
  // Calculate the start date based on the number of days provided
  let startDate = new Date(currentDate);
  startDate.setDate(startDate.getDate() - timegap);
  // Format the start date in "YYYY-MM-DD" format
  const formattedStartDate = formatDate(startDate);
  // Format the end date in "YYYY-MM-DD" format
  const formattedEndDate = formatDate(endDate);
  // Return an object containing both dates
  return {
    startDate: formattedStartDate,
    endDate: formattedEndDate,
  };
}

// Matches UI activity-dashboard presets: 7 days = rolling; month presets = 1st of (current month − N).
function getActivityDashboardDateRange(preset) {
  const endDate = new Date();
  const formattedEndDate = formatDate(endDate);
  const monthsBackByPreset = {
    presetLast1Month: 1,
    presetLast3Months: 3,
    presetLast6Months: 6,
    presetLast9Months: 9,
    presetLast12Months: 12,
  };

  if (preset === "presetLast7Days") {
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);
    return {
      startDate: formatDate(startDate),
      endDate: formattedEndDate,
    };
  }

  const monthsBack = monthsBackByPreset[preset];
  if (monthsBack == null) {
    throw new Error(`Unsupported activity dashboard preset: ${preset}`);
  }

  const startDate = new Date(
    endDate.getFullYear(),
    endDate.getMonth() - monthsBack,
    1,
  );
  return {
    startDate: formatDate(startDate),
    endDate: formattedEndDate,
  };
}

// YYYY-MM-DD for API due dates and settings that reject a full timestamp.
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFormattedDate() {
  let today = new Date();
  return formatDate(today);
}

// Task due dates and Home performance-cycle dates use today plus this many days.
function addDaysYmd(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

// Missing day in the target month → last day of that month.
function addMonthsYmd(months) {
  const date = new Date();
  const day = date.getDate();
  date.setMonth(date.getMonth() + months);
  if (date.getDate() !== day) {
    date.setDate(0);
  }
  return formatDate(date);
}

/**
 * How many consumption API calls to make so dashboard views end up above totalAchievements
 * for the queried period (each call assumed to add ~one view). Skips when views already
 * exceed achievements.
 * @param {number} totalAchievements - activityDashboard row totalAchievements
 * @param {number} countViews - activityDashboard row countViews
 */
function getViewCountBasedOnCompletionCount(totalAchievements, countViews) {
  if (totalAchievements === 0 || countViews > totalAchievements) {
    return 0;
  }
  const bufferAboveAchievements = 24;
  const shortfall = totalAchievements - countViews;
  if (shortfall > 0) {
    return shortfall + bufferAboveAchievements;
  }
  // countViews === totalAchievements: bump so views move above achievements
  return bufferAboveAchievements;
}

function getPreviousDayFormattedDate() {
  // Get the current date
  const currentDate = new Date();
  // Subtract one day
  currentDate.setDate(currentDate.getDate());
  // Set hours, minutes, seconds, and milliseconds to 0
  currentDate.setHours(0, 0, 0, 0);
  // Format the date as 'YYYY-MM-DDTHH:mm:ss.sssZ'
  const formattedDate = currentDate.toISOString();
  return formattedDate;
}

function limitTheArrayData(array, maxNumber) {
  return array.slice(0, maxNumber);
}

function generateRandomString(length) {
  // Character set for generating the random string
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  // Create an array with the specified length and map each element using the provided function
  const randomArray = Array.from({ length }, () => {
    // Generate a random index within the range of the charset length
    const randomIndex = Math.floor(Math.random() * charset.length);
    // Use the random index to get a character from the charset
    return charset[randomIndex];
  });
  // Join the array elements into a single string and return
  return randomArray.join("");
}

function removingDuplicateElementsFromArray(array) {
  try {
    if (array.length === 0) {
      throw new Error("Array is either not provided or empty.");
    }
    let uniqueArray = [];
    for (let i = 0; i < array.length; i++) {
      let isDuplicate = false;
      for (let j = 0; j < uniqueArray.length; j++) {
        if (array[i].asset_uuid === uniqueArray[j].asset_uuid) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        uniqueArray.push(array[i]);
      }
    }
    return uniqueArray;
  } catch (error) {
    logger.error(`Error: ${error.message}`);
  }
}

function removingDuplicateElementsFromArrayUsingSet(array) {
  // it take 0(n)
  let uniqueSet = new Set(array);
  let uniqueArray = Array.from(uniqueSet);
  return uniqueArray;
}

function shuffleDataInArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomValueFromArray(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  const randomValue = arr[randomIndex];
  return randomValue;
}

async function decideNumberOfQuestionToBeAnsweredCorrectly(
  categoryType,
  totalQuestions,
) {
  let categories = {
    Novice: { min: 0, max: 9 },
    Aspiring: { min: 10, max: 49 },
    Developing: { min: 50, max: 69 },
    Proficient: { min: 70, max: 89 },
    Advanced: { min: 90, max: 100 },
  };
  let result = {};
  for (const category in categories) {
    let { min } = categories[category];
    let correctAnswersNeeded = Math.ceil((min / 100) * totalQuestions);
    result[category] = correctAnswersNeeded;
  }
  logger.info(
    `Number of questions to be answered correctly to fall into ${categoryType} is ${result[categoryType]}`,
  );
  logger.info(result);
  return result[categoryType];
}

async function jwtDecoder(jwtToken) {
  const decoded = jwt.decode(jwtToken);
  const { iat, exp } = decoded;
  return { iat, exp };
}

function getRandomWords(array, count) {
  // Shuffle the array
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }

  // Return a slice of the shuffled array containing the desired number of elements
  return array.slice(0, count);
}

function pickRandomNumberFromArray(array) {
  let randomIndex = Math.floor(Math.random() * array.length);
  let randomNumber = array[randomIndex];
  return randomNumber;
}

function getChunks(array, chunkSize) {
  const totalElements = array.length;
  const result = [];
  for (let i = 0; i < totalElements; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

async function extractContentUUIDsFromAssignments(
  assignFromDataSheet,
  assignmentDataFromApp,
  getSingleAssignmentInfoApi,
  request,
  jwt,
  logger,
) {
  let contentUUIDArray = [];
  for (let assign of assignFromDataSheet) {
    for (let assignment of assignmentDataFromApp) {
      if (
        assignment.name.trim() === assign.trim() &&
        assignment.status === "in_progress"
      ) {
        let singleAssignmentResponse = await getSingleAssignmentInfoApi(
          request,
          jwt,
          assignment.id,
        );
        if (singleAssignmentResponse) {
          singleAssignmentResponse.contents.forEach((content) => {
            contentUUIDArray.push(content.contentItemUuid);
          });
        }
        logger.info(`Assignment ${assignment.name} content has been extracted`);
      }
    }
  }
  return contentUUIDArray;
}

function removeAnsiCodes(str) {
  return str.replace(/\u001b\[[0-9;]*m/g, "");
}

function filterUsersByEmail(data) {
  const allowedDomains = ["noemail.com", "skillsoft.com"];

  const filteredUsers = data.users.filter((user) => {
    const email = user.email || "";
    if (!email) {
      return false;
    }
    return allowedDomains.some((domain) => email.endsWith(domain));
  });
  return {
    users: filteredUsers,
  };
}

async function extractJourneyContentUUIDs(
  journeyFromDataSheet,
  journeyFromApp,
  getJourneyInfo,
  request,
  jwt,
  logger,
) {
  let contentUUIDArray = [];

  for (let ele of journeyFromDataSheet) {
    let alldataOfJourney = journeyFromApp;
    for (let item of alldataOfJourney.channels) {
      if (
        item.status === 2 &&
        item.localizations[0].title === ele.JourneyName
      ) {
        let responseOfSingleJourney = await getJourneyInfo(
          request,
          jwt,
          item.channelUuid,
        );
        let response = responseOfSingleJourney.resp;

        response.channelViews.forEach((channel) => {
          ele.TrackName.forEach((trackName) => {
            if (
              channel.title === trackName &&
              channel.displayTypeName === "TRACK"
            ) {
              channel.contentItems.forEach((content) => {
                contentUUIDArray.push(content.contentItemUuid);
              });
            }
          });
          logger.info(`${channel.title} content has been extracted`);
        });
      }
    }
  }

  return contentUUIDArray;
}

function shuffleDataWithoutDefaultUsers(array, defaultUsersData) {
  const excludedLoginNames = new Set(
    defaultUsersData.map((user) => user.loginName),
  );

  // Create an array to hold the excluded users
  const excludedUsers = [];

  // Filter out users that are in defaultUsersData
  const filteredArray = array.filter((user) => {
    const isExcluded = excludedLoginNames.has(user.loginName);
    if (isExcluded) {
      excludedUsers.push(user.loginName); // Add the excluded user's loginName to the list
    }
    return !isExcluded; // Only keep the user if they're not excluded
  });
  logger.info(`Array Length before filtering: ${array.length}`);
  logger.info(`Filtered Array Length: ${filteredArray.length}`);
  logger.info(`Excluded Users Length: ${excludedUsers.length}`);
  logger.info(`Excluded Users Data: ${excludedUsers}`);

  // Shuffle the filtered array
  for (let i = filteredArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filteredArray[i], filteredArray[j]] = [filteredArray[j], filteredArray[i]];
  }

  return filteredArray;
}

function getAdminUserId(allUserResponse) {
  let adminLogin = config.get("Admindata").loginID.toLowerCase();

  let user = allUserResponse.users.find(
    (u) => u.loginName.toLowerCase() === adminLogin,
  );

  if (user) {
    logger.info(`adminUserId: ${user.id}`);
    return user.id;
  } else {
    logger.error("Unable to find admin data");
    return null;
  }
}

function shuffleDataWithoutDefaultandSkillsoftUsers(array, defaultUsersData) {
  if (!Array.isArray(array) || !Array.isArray(defaultUsersData)) {
    throw new Error("Both parameters must be arrays."); // <== ORIGINAL
  }

  const excludedLoginNames = new Set(
    defaultUsersData.map((user) => user.loginName), // <== ORIGINAL
  );

  const excludedUsers = []; // <== ORIGINAL
  const excludedSkillsoftUsers = []; // <== ADDED: track users with @skillsoft.com email

  const filteredArray = array.filter((user) => {
    const isExcludedByLogin = excludedLoginNames.has(user.loginName); // <== CHANGED: renamed variable
    const isExcludedByEmail =
      typeof user.email === "string" && user.email.endsWith("@skillsoft.com"); // <== ADDED: check for @skillsoft.com email

    if (isExcludedByLogin) {
      excludedUsers.push(user.loginName); // <== ORIGINAL
    }

    if (isExcludedByEmail) {
      excludedSkillsoftUsers.push(user.email); // <== ADDED: collect skillsoft users
    }

    return !isExcludedByLogin && !isExcludedByEmail; // <== CHANGED: filter both conditions
  });

  logger.info(`Array Length before filtering: ${array.length}`); // <== ORIGINAL
  logger.info(`Filtered Array Length: ${filteredArray.length}`); // <== ORIGINAL
  logger.info(`Excluded Users by loginName: ${excludedUsers.length}`); // <== CHANGED: updated label
  logger.info(
    `Excluded Users Data (loginName): ${JSON.stringify(excludedUsers)}`,
  ); // <== CHANGED: updated label
  logger.info(
    `Excluded Users by email (@skillsoft.com): ${excludedSkillsoftUsers.length}`,
  ); // <== ADDED: log email-excluded users count
  logger.info(
    `Excluded Users Data (email): ${JSON.stringify(excludedSkillsoftUsers)}`,
  ); // <== ADDED: log email-excluded users

  // Fisher-Yates Shuffle
  for (let i = filteredArray.length - 1; i > 0; i--) {
    // <== ORIGINAL
    const j = Math.floor(Math.random() * (i + 1)); // <== ORIGINAL
    [filteredArray[i], filteredArray[j]] = [filteredArray[j], filteredArray[i]]; // <== ORIGINAL
  }

  logger.info(
    `Final Shuffled Array Sample: ${JSON.stringify(filteredArray.slice(0, 5))}`,
  ); // <== ADDED: sample shuffled result

  return filteredArray; // <== ORIGINAL
}

function getWorkspaceIdByName(response, nameToFind) {
  if (!response?.data?.listWorkspaces) return null;

  const workspace = response.data.listWorkspaces.find(
    (ws) => ws.name === nameToFind,
  );

  return workspace ? workspace.id : null;
}

function getDefaultWorkspaceId(response) {
  if (!response?.data?.listWorkspaces) return null;

  const workspace = response.data.listWorkspaces.find(
    (ws) =>
      ws.description === "This is a shared workspace for the organization." &&
      ws.isShared === true,
  );

  return workspace ? workspace.id : null;
}

function getProjectIdByName(response, nameToFind) {
  if (!response?.data?.getProjectsInWorkspace?.projects) return null;

  // Trim whitespace and compare case-insensitively for better matching
  const normalizedNameToFind = nameToFind?.trim();
  const project = response.data.getProjectsInWorkspace.projects.find(
    (project) => project.name?.trim() === normalizedNameToFind,
  );

  return project ? project.id : null;
}

/**
 * Filter test data by single or comma-separated names.
 * @param {Array} testDataArray - Full test data array
 * @param {string} filterValue - Env value (e.g. process.env.FileName), single or comma-separated names
 * @param {string} fieldName - Field to match in each item (e.g. 'fileName', 'title', 'testName')
 * @param {string} label - Label for logging (e.g. 'PPT', 'Conversation', 'Assessment')
 * @returns {Array} Filtered array; returns full array if filterValue is empty
 */
function filterTestDataByName(testDataArray, filterValue, fieldName, label) {
  // Return all test data if no filter value provided
  if (!filterValue || !String(filterValue).trim()) {
    return testDataArray || [];
  }

  // Parse comma-separated names and trim whitespace
  const namesArray = String(filterValue)
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  // Return all test data if no valid names found after parsing
  if (namesArray.length === 0) {
    return testDataArray || [];
  }

  // Filter test data by matching the specified field name
  const filtered = (testDataArray || []).filter((data) =>
    namesArray.includes(data[fieldName]),
  );

  // Log results: warning if no matches, info with matched names if found
  if (filtered.length === 0) {
    logger.warn(`No test data found for ${label}(s): ${filterValue}`);
  } else {
    const matchedNames = filtered.map((d) => d[fieldName]).join(", ");
    logger.info(
      `Running tests for ${filtered.length} ${label}(s): ${matchedNames}`,
    );
  }

  return filtered;
}

/**
 * Load test data from JSON file and optionally filter by single or comma-separated names.
 * @param {string} folderPath - Path to folder (e.g. 'testData/LxStudios/PPT')
 * @param {string} fileName - JSON file name without extension (e.g. 'pptTestData')
 * @param {string} filterValue - Env value for filtering, single or comma-separated names
 * @param {string} fieldName - Field to match in each item (e.g. 'fileName', 'title', 'testName')
 * @param {string} label - Label for logging (e.g. 'PPT', 'Conversation', 'Assessment')
 * @returns {Array} Loaded and optionally filtered test data array
 */
function loadAndFilterTestData(
  folderPath,
  fileName,
  filterValue,
  fieldName,
  label,
) {
  const testDataArray = readJsonFile(folderPath, fileName) || [];
  return filterTestDataByName(testDataArray, filterValue, fieldName, label);
}

async function getOrCreateWorkspaceAndProject({
  listWorkspacesApi,
  getProjectsInWorkspaceApi,
  createWorkspaceApi,
  createProjectApi,
  request,
  jwt,
  workspaceName,
  projectName,
}) {
  try {
    let workspaceId, projectId;

    // Check if workspace already exists
    const workspacesResponse = await listWorkspacesApi(request, jwt);
    workspaceId = getWorkspaceIdByName(workspacesResponse, workspaceName);

    if (workspaceId) {
      logger.info(`Found existing workspace with ID: ${workspaceId}`);
    } else {
      // Create new workspace if it doesn't exist
      const workspaceResponse = await createWorkspaceApi(
        request,
        jwt,
        workspaceName,
      );
      workspaceId = workspaceResponse.data.createWorkspace.id;
      logger.info(`Created new workspace with ID: ${workspaceId}`);
    }

    // Check if project already exists in the workspace
    const projectsResponse = await getProjectsInWorkspaceApi(
      request,
      jwt,
      workspaceId,
      1,
      10,
    );
    projectId = getProjectIdByName(projectsResponse, projectName);

    if (projectId) {
      logger.info(`Found existing project with ID: ${projectId}`);
    } else {
      // Create new project if it doesn't exist
      const projectResponse = await createProjectApi(
        request,
        jwt,
        workspaceId,
        projectName,
      );
      projectId = projectResponse.data.createProject.id;
      logger.info(`Created new project with ID: ${projectId}`);
    }

    return {
      workspaceId,
      projectId,
    };
  } catch (error) {
    logger.error(`Error in getOrCreateWorkspaceAndProject: ${error.message}`);
    throw error;
  }
}

async function getDefaultWorkspaceAndProject({
  listWorkspacesApi,
  getProjectsInWorkspaceApi,
  createProjectApi,
  request,
  jwt,
  projectName,
}) {
  const findProject = async (wsId) => {
    const resp = await getProjectsInWorkspaceApi(request, jwt, wsId, 1, 20);
    return getProjectIdByName(resp, projectName);
  };

  try {
    // 1. Find the default shared workspace
    const workspacesResponse = await listWorkspacesApi(request, jwt);
    const defaultWorkspace = workspacesResponse?.data?.listWorkspaces?.find(
      (ws) =>
        ws.description === "This is a shared workspace for the organization." &&
        ws.isShared === true,
    );

    if (!defaultWorkspace) {
      throw new Error("Default shared workspace not found");
    }

    const workspaceId = defaultWorkspace.id;

    // 2. Check if project already exists
    let projectId = await findProject(workspaceId);

    if (!projectId) {
      // Race condition guard: random jitter so parallel workers don't all create at once
      const jitterMs = Math.floor(Math.random() * 4000);
      await new Promise((resolve) => setTimeout(resolve, jitterMs));

      // Re-check — another worker may have created it during the jitter
      projectId = await findProject(workspaceId);

      if (!projectId) {
        try {
          const resp = await createProjectApi(
            request,
            jwt,
            workspaceId,
            projectName,
          );
          projectId = resp.data.createProject.id;
        } catch (createError) {
          // Creation conflict — another worker likely created it; try to reuse
          projectId = await findProject(workspaceId);
          if (!projectId) throw createError;
        }
      }
    }

    if (!projectId) {
      throw new Error(`Could not find or create project '${projectName}'`);
    }

    logger.info(`Using project '${projectName}': ${projectId}`);
    return { workspaceId, projectId };
  } catch (error) {
    logger.error(`getDefaultWorkspaceAndProject failed: ${error.message}`);
    throw error;
  }
}

function filterOrgsBySiteType(orgEntries, siteType) {
  return orgEntries.filter(([url]) => {
    const orgName = url.replace("https://", "").replace(".percipio.com", "");
    const isChildSite = orgName.endsWith("a") || orgName.endsWith("b");
    switch (siteType) {
      case "TriggerInParentSites":
        return !isChildSite;
      case "TriggerInAllChildSites":
        return isChildSite;
      case "TriggerInAllSites":
      default:
        return true;
    }
  });
}

/**
 * Returns org entries `[baseURL, orgId][]` for the given siteType.
 * - TriggerInConfigOrg: ignores orgsData; uses config `Environment.baseURL` + `Environment.orgId` (NODE_ENV → config/*.json).
 * - Otherwise: uses orgsData.urlToOrgIdMap or euOrgs/usOrgs for EU/US siteTypes, then filterOrgsBySiteType.
 */
function getOrgEntriesForSiteType(orgsData, siteType) {
  const s = siteType || "TriggerInAllSites";

  if (s === "TriggerInConfigOrg") {
    const envSection = config.get("Environment");
    const baseURL = envSection?.baseURL;
    const orgId = envSection?.orgId;
    if (!baseURL || !orgId) {
      throw new Error(
        "siteType=TriggerInConfigOrg requires Environment.baseURL and Environment.orgId in the active config (set NODE_ENV to pick config/*.json).",
      );
    }
    logger.info(
      `getOrgEntriesForSiteType: TriggerInConfigOrg — single org ${baseURL}`,
    );
    return [[baseURL, orgId]];
  }

  let map = orgsData.urlToOrgIdMap || {};
  if (s.startsWith("TriggerInEU")) {
    map = orgsData.euOrgs || {};
  } else if (s.startsWith("TriggerInUS")) {
    map = orgsData.usOrgs || {};
  }
  const entries = Object.entries(map);
  const filterType = s.includes("ParentSites")
    ? "TriggerInParentSites"
    : s.includes("ChildSites")
      ? "TriggerInAllChildSites"
      : "TriggerInAllSites";
  return filterOrgsBySiteType(entries, filterType);
}

async function createSingleUser(request, jwt, userData) {
  try {
    // Validate required fields
    if (!userData.email || !userData.firstName || !userData.lastName) {
      throw new Error(
        "Required fields missing: email, firstName, and lastName are required",
      );
    }

    // Build payload with defaults
    const payload = {
      login_name: userData.loginName || userData.email,
      external_id: userData.externalId || uuidGenerator(),
      role: userData.role || "LEARNER",
      email: userData.email,
      password: userData.password || "P@ssw0rd123@",
      first_name: userData.firstName,
      last_name: userData.lastName,
      job_title: userData.jobTitle || "",
      custom_attributes: userData.customAttributes || [],
    };

    // Add optional fields if provided
    if (userData.directManager) {
      payload.direct_manager = userData.directManager;
      payload.approval_manager = userData.directManager;
    }

    const headers = headerData.createUserHeader(jwt, "application/json");

    const response = await request.post(urlData.createUserUrl, {
      data: payload,
      headers: headers,
    });

    if (response.status() === 200) {
      const responseData = await response.json();
      logger.info(
        `✅ User created: ${userData.firstName} ${userData.lastName} (${userData.email})`,
      );
      return {
        success: true,
        user: responseData,
        message: `User ${userData.email} created successfully`,
      };
    } else {
      const errorBody = await response.text();
      logger.error(
        `Failed to create user ${
          userData.email
        }. Status: ${response.status()}, Error: ${errorBody}`,
      );
      return {
        success: false,
        user: null,
        message: `Failed to create user. Status: ${response.status()}`,
      };
    }
  } catch (error) {
    logger.error(`Error creating user ${userData.email}: ${error.message}`);
    throw error;
  }
}

function orgHostname() {
  try {
    return new URL(config.get("Environment").baseURL).hostname;
  } catch {
    return "org";
  }
}

// Extra spaces and capital letters should not stop two names from matching.
function sameName(left, right) {
  const tidy = (value) => String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  return tidy(left) === tidy(right);
}

/** Linked-content summary row: title equality (trim, case-insensitive). */
function linkedContentTitlesMatch(a, b) {
  return (a || "").trim().toLowerCase() === (b || "").trim().toLowerCase();
}

function linkedContentIsRetired(item) {
  return item.retired === true || item.isRetired === true;
}

/** Published (status 2), visible to learners, UUID present, not retired */
function linkedContentIsPublishedAndVisible(item) {
  const statusNum = Number(item.status);
  const published = statusNum === 2 || item.status === 2;
  const visible = item.visibleToLearners === true;
  return (
    published &&
    visible &&
    !!item.linkedContentUuid &&
    !linkedContentIsRetired(item)
  );
}

function getIsoDateOffsetFromBase(baseDateIso, dayOffset) {
  const date = new Date(baseDateIso);
  date.setDate(date.getDate() + dayOffset);
  date.setHours(12, 0, 0, 0);
  return date.toISOString();
}

function getDueDateFromAssignment(assignmentInfo, daysToComplete) {
  if (assignmentInfo?.dueDate) {
    return assignmentInfo.dueDate;
  }
  if (assignmentInfo?.fixedDueDate) {
    return assignmentInfo.fixedDueDate;
  }
  const startDate = assignmentInfo?.startDate;
  if (startDate && daysToComplete != null) {
    return getIsoDateOffsetFromBase(startDate, Number(daysToComplete));
  }
  return null;
}

function hasDueDatePassed(dueDateIso) {
  const dueEnd = new Date(dueDateIso);
  dueEnd.setHours(23, 59, 59, 999);
  return new Date() > dueEnd;
}

function hasMinimumWaitElapsedAfterStart(startDateIso, minimumDays) {
  const earliest = new Date(startDateIso);
  earliest.setDate(earliest.getDate() + minimumDays);
  earliest.setHours(0, 0, 0, 0);
  return new Date() >= earliest;
}

function pickLearnersFromUsers(users, userCount) {
  const usersFromAudience = users || [];
  const usersWithAllowedEmail = filterUsersByEmail({
    users: usersFromAudience,
  }).users;

  const eligibleLearners = [];
  for (let user of usersWithAllowedEmail) {
    const isLearner = user.role === "learner";
    const hasIdAndLogin = user.id && user.loginName;
    if (isLearner && hasIdAndLogin) {
      eligibleLearners.push(user);
    }
  }

  if (eligibleLearners.length < userCount) {
    throw new Error(
      `Need ${userCount} learners (allowed email + learner role); found ${eligibleLearners.length}`,
    );
  }

  const shuffledLearners = shuffleDataInArray([...eligibleLearners]);
  return shuffledLearners.slice(0, userCount);
}

function splitArrayIntoThreeSlices(items, firstCount, secondCount) {
  return {
    firstSlice: items.slice(0, firstCount),
    secondSlice: items.slice(firstCount, firstCount + secondCount),
    thirdSlice: items.slice(firstCount + secondCount),
  };
}

function logUsersWithLoginNameAndId(users, label) {
  logger.info(`${label}:`);
  for (let user of users) {
    logger.info(`  loginName=${user.loginName} | id=${user.id}`);
  }
}

const reusableFunctions = {
  setTimer,
  addElementTotargetElement,
  countObjects,
  countIdsInLicencePoolandPrint,
  checkLicencePoolInOrgorNot,
  getPath,
  getChunks,
  stringSpliter,
  parseStringToInt,
  testCreateUser,
  readDataFromExcel,
  setExcelData,
  removeAnsiCodes,
  setUserUUIDOfAssignment,
  getUserUUIDOfAssignment,
  getExcelData,
  convertStringToJson,
  uuidGenerator,
  toogleDynamic,
  generateTime,
  seperateAllLicepoolIDs,
  getPreviousDayFormattedDate,
  createJsonObject,
  adddaystoCurrentDateforUI,
  getEpochTime,
  readDatafromJsonFileasync,
  readDatafromJsonFilenotasync,
  readJsonFile,
  generateRandomString,
  responseValidationofUserInterest,
  limitTheArrayData,
  getViewCountBasedOnCompletionCount,
  getcurrentDateAndEndDateForActivtyDashBoard,
  getActivityDashboardDateRange,
  shuffleDataInArray,
  decideNumberOfQuestionToBeAnsweredCorrectly,
  removingDuplicateElementsFromArray,
  removingDuplicateElementsFromArrayUsingSet,
  createJsonObjectwithjustUUIDS,
  jwtDecoder,
  getRandomValueFromArray,
  getAdminUserId,
  getRandomWords,
  pickRandomNumberFromArray,
  extractContentUUIDsFromAssignments,
  extractJourneyContentUUIDs,
  findIdByName,
  filterUsersByEmail,
  getFormattedDate,
  formatDate,
  addDaysYmd,
  addMonthsYmd,
  randomSecondsGenerator,
  shuffleDataWithoutDefaultUsers,
  shuffleDataWithoutDefaultandSkillsoftUsers,
  getWorkspaceIdByName,
  getProjectIdByName,
  filterTestDataByName,
  loadAndFilterTestData,
  linkedContentIsPublishedAndVisible,
  linkedContentIsRetired,
  linkedContentTitlesMatch,
  splitFileNameEnv,
  getIsoDateOffsetFromBase,
  getDueDateFromAssignment,
  hasDueDatePassed,
  hasMinimumWaitElapsedAfterStart,
  pickLearnersFromUsers,
  splitArrayIntoThreeSlices,
  logUsersWithLoginNameAndId,
  getOrCreateWorkspaceAndProject,
  getDefaultWorkspaceAndProject,
  filterOrgsBySiteType,
  createSingleUser,
  getOrgEntriesForSiteType,
  orgHostname,
  sameName,
};

export default reusableFunctions;
