export function createAttributePayload(
  attributeName,
  eodallowImpromptuValueCreation,
  attributeType,
  eodmultipleValuesEnabled
) {
  const createAttributebody = {
    name: attributeName,
    allowImpromptuValueCreation: eodallowImpromptuValueCreation,
    typeName: attributeType,
    optionValues: [],
    displayLabel: [
      {
        locale: "en-US",
        text: attributeName
      },
    ],
    multipleValuesEnabled: eodmultipleValuesEnabled
  };
  return createAttributebody;
}
