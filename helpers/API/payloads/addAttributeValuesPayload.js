export function addAttributeValuesBody(attributeName,attributeValue) {
    return {
        "name": attributeName,
        "allowImpromptuValueCreation": true,
        "typeName": "VALUE",
        "optionValues": attributeValue,
        "displayLabel": [
            {
                "locale": "en-US",
                "text": attributeName
            }
        ],
        "multipleValuesEnabled": true
    }
  }
  