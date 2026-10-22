let libraryName;

export function createcustomArea(
  area,
  image,
  createAreaInCustomOrSkillArea,
  description = "It will contain Subjects related to this Area"
) {
  if (createAreaInCustomOrSkillArea) {
    libraryName = "CUSTOM";
  } else {
    libraryName = "SKILL_AREAS";
  }
  const body = {
    title: area,
    description: description,
    imageUrl: image,
    subjectType: "standard",
    localizedMetadataList: [
      {
        title: area,
        description: description,
        languageId: 1,
        imageAltText: "Custom Area",
      },
    ],
    libraryName: libraryName,
    skillActivityDashboard: true,
  };
  return body;
}
//libraryName = "CUSTOM" or "SKILL_AREAS"
