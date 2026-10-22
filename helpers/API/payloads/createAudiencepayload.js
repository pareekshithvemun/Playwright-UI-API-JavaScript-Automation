import reusableFunctions from "../../UI/commonFunctions";
export function createAudiencePayload(
  audienceName,
  attUuid,
  attrivalueUUids,
  ownerData
) {
  let randomUUID = reusableFunctions.uuidGenerator();
  return {
    audienceName: audienceName,
    ownerUuids: ownerData,
    audienceAdministratorsUuids: [],
    additionalUserUuids: [],
    channelUuids: [],
    audienceFilters: [
      {
        audienceFilterUuid: randomUUID,
        audienceFilterTypeName: "VALUE",
        customAttributeUuid: attUuid,
        dateValues: null,
        startDate: null,
        endDate: null,
        enumValues: attrivalueUUids,
        userValues: null,
        stringValues: null,
        operator: "equals",
        selected: true,
      },
    ],
    parentAudienceUuid: null,
  };
}
