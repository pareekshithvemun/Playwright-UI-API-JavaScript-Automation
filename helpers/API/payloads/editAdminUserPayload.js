export function editAdminUserPayload(customAttributeId) {
    return {
        "custom_attributes": [
            {
                "custom_attribute_id": customAttributeId,
                "value": [
                    "EMEA"
                ],
                "type_name": "VALUE"
            }
        ]
    }
};