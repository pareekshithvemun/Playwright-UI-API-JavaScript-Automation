export function updateUserWithCustomAttributesPayload(
  externalId,
  customAttributeId,
  attributeValue,
) {
  return {
    external_id: externalId,
    date: new Date().toISOString(),
    custom_attributes: [
      {
        custom_attribute_id: customAttributeId,
        value: [attributeValue],
        type_name: "VALUE",
      },
    ],
  };
}
