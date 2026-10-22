export function updateContentMetadataPayload({
  title,
  description = "",
  skills = "",
  cpExpertiseLevel = "Beginner",
  duration = "10",
  image,
  imageAltText = "",
  contentSource = "Custom",
  preRequisites = "",
}) {
  return {
    title,
    description,
    skills,
    cpExpertiseLevel,
    duration,
    image,
    imageAltText,
    contentSource,
    preRequisites,
  };
}
