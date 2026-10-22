import config from "config";
import { areaAndSubjectdata } from "../response/getAreasResponse.js";
import reusableFunctions from "../../UI/commonFunctions.js";
import {createuserdata} from "../response/createUserresponse.js";
import { logger } from "../../../logger.js";

// Read the flag inside the function. Calling it at import time runs before commonFunctions has finished loading.
function isDynamic() {
  return Boolean(reusableFunctions.toogleDynamic());
}

export function getsubIDs() {
  let subids;
  if (isDynamic()) {
    let subdata = areaAndSubjectdata.getSubjectData();
    subids = subdata[0];
    logger.info(subids);
  } else {
    subids = config.get("CustomChannel").subjectsTowhichThisChannelWillBeMapped;
  }
  return subids;
}



export function getAudIds() {
  let audids;
  if (isDynamic()) {
    if(process.env.Area=="true"){
      audids = config.get("CustomChannel").uuidOfAudienceTowhichThisChannelWillBeMapped;
    }
    else{
      audids=createuserdata.getAudId();
    }
  } else {
     audids =
      config.get("CustomChannel").uuidOfAudienceTowhichThisChannelWillBeMapped;
  }
  return audids;
}

export function getAreaStuff(){
  let areaData=areaAndSubjectdata.getAreaData();
  return areaData;
}

/**
 * Returns subject UUIDs for the given area and subject names from area data (set by getAreasAndSubJects).
 * @param {Object} areaStuff - Area data from getAreaStuff() (area name → array of { subjectTitle: subjectUuid })
 * @param {string} areaName - Channel's area name
 * @param {string[]} subjects - Channel's subject names
 * @returns {string[]} Subject UUIDs
 */
export function getIdsByAreaAndSubjectNames(areaStuff, areaName, subjects) {
  const subjectUuids = [];
  if (!areaStuff || !(areaName in areaStuff)) {
    return subjectUuids;
  }
  for (const subjectEntry of areaStuff[areaName]) {
    const [subjectTitle, subjectUuid] = Object.entries(subjectEntry)[0];
    if (subjects.includes(subjectTitle)) {
      subjectUuids.push(subjectUuid);
    }
  }
  return subjectUuids;
}

export function createcustomChannelbody(channelName,channelDescription,subid=[], audid=[],channelImage) {
  return {
    title: channelName,
    description: channelDescription,
    subjectUuids: subid ,
    locale: "en-US",
    imageUrl: channelImage,
    modifiedCounter: 0,
    audiences: audid,
    sourceName: "SkillSoft",
    languageCode: "en",
    saveFileRequest: null,
  };
}
