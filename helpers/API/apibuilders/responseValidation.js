import { areaAndSubjectdata } from "../../API/response/getAreasResponse.js";
import { expect } from "@playwright/test";
import { logger } from "../../../logger.js";

async function getLicencePoolOfOrganisation(request, url, token) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const response = await request.get(url, { headers });
  return response;
}

async function getValuesofListAttribute(request, url, token) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const response = await request.get(url, { headers });
  return response;
}

/**
 * Normalize areas API response to a flat list of areas (each with title, subjects).
 * Handles: direct array of areas, array of { title, subjects }, or nested { data: { areas: [...] } }.
 */
function normalizeAreasResponse(jsonBody) {
  if (!jsonBody || !Array.isArray(jsonBody)) return [];
  const areas = [];
  for (const item of jsonBody) {
    if (item.data && Array.isArray(item.data.areas)) {
      item.data.areas.forEach((area) => {
        const title = area.title || area.localizedMetadatas?.[0]?.title;
        const subjects = (area.subjects || []).map((sub) => ({
          title: sub.title || sub.localizedMetadatas?.[0]?.title,
          uuid: sub.uuid || sub.id,
        }));
        areas.push({ title, subjects });
      });
    } else if (item.title != null && item.subjects) {
      const subjectList = item.subjects;
      areas.push({
        title: item.title,
        subjects: subjectList.map((sub) => ({
          title: sub.title || sub.name,
          uuid: sub.uuid || sub.id,
        })),
      });
    }
  }
  return areas;
}

async function getAreasAndSubJects(request, Url, token, channels) {
  let areaData = {};
  let resdata;
  try {
    resdata = await getAreaUUID(request, Url, token);
    const jsonBody = await resdata.json();
    const areasList = normalizeAreasResponse(Array.isArray(jsonBody) ? jsonBody : [jsonBody]);

    for (const area of channels) {
      for (const item of areasList) {
        if (item.title === area.AreaName) {
          const subjectsArray = (item.subjects || []).map((subject) => ({
            [subject.title]: subject.uuid,
          }));
          if (subjectsArray.length === 0) {
            logger.info(`${item.title} has no subjects`);
          }
          areaData[item.title] = subjectsArray;
          break;
        }
      }
    }
    logger.info("Areas:");
    logger.info(areaData);
    areaAndSubjectdata.setAreaData(areaData);
  } catch (error) {
    logger.error(`Unable to fetch area data: ${error}`);
  }
  return resdata;
}

async function getAreaUUID(request, Url, token) {
  let resdata;
  const headerData = {
    Authorization: `Bearer ${token}`,
  };
  resdata = await request.get(Url, {
    headers: headerData,
  });
  return resdata;
}

async function getSubUUIDS(request, Url, token) {
  let resdata;
  const headerData = {
    Authorization: `Bearer ${token}`,
  };
  resdata = await request.get(Url, {
    headers: headerData,
  });
  expect(resdata.status()).toBe(200);
  return resdata.json();
}

async function getAreaUUIDfromExcel(request, Url, token, areaName) {
  let areasFromExcelSheet = areaName;
  let areaUUids = [];
  let resdata;
  let jsonBody;
  const headerData = {
    Authorization: `Bearer ${token}`,
  };
  resdata = await request.get(Url, {
    headers: headerData,
  });
  jsonBody = await resdata.json();
  jsonBody.forEach((item) => {
    if (item.title === areasFromExcelSheet) {
      areaUUids.push({
        name: item.title,
        uuid: item.uuid,
      });
    }
  });

  logger.info("Areas:");
  logger.info(areaUUids);
  return { resdata, areaUUids };
}

/**
 * GET /api/ucm/areas — returns area uuid when an area with the same title already exists, else null.
 * Title matching aligns with getAreaUUIDfromExcel (exact string equality after trim).
 */
async function findAreaUuidByTitle(request, Url, token, areaName) {
  const headerData = {
    Authorization: `Bearer ${token}`,
  };
  const resdata = await request.get(Url, {
    headers: headerData,
  });
  if (resdata.status() !== 200) {
    logger.info(
      `findAreaUuidByTitle: GET areas returned ${resdata.status()}, proceeding with create`
    );
    return null;
  }
  const jsonBody = await resdata.json();
  if (!Array.isArray(jsonBody)) {
    return null;
  }
  const want = String(areaName).trim();
  for (const item of jsonBody) {
    if (item && item.title != null && String(item.title).trim() === want) {
      return item.uuid ?? null;
    }
  }
  return null;
}

async function getSubID(request, Url, token, areaName, subName) {
  let resdata;
  let jsonBody;
  const headerData = {
    Authorization: `Bearer ${token}`,
  };
  resdata = await request.get(Url, {
    headers: headerData,
  });
  jsonBody = await resdata.json();

  for (let item of jsonBody) {
    if (item.title === areaName) {
      const subject = item.subjects.find(
        (subject) => subject.title === subName
      );
      if (subject) {
        logger.info(
          `AreaName : ${areaName} and SubName :${subject.title} and subUUID: ${subject.uuid}`
        );
        return { resdata, uuid: subject.uuid, title: subject.title };
      } else {
        logger.error(
          `Subject with title '${subName}' not found in area '${areaName}'.`
        );
        return null;
      }
    }
  }
}

export let apiresponseValidations = {
  getLicencePoolOfOrganisation,
  getValuesofListAttribute,
  getAreasAndSubJects,
  getAreaUUIDfromExcel,
  findAreaUuidByTitle,
  getAreaUUID,
  getSubUUIDS,
  getSubID,
};
