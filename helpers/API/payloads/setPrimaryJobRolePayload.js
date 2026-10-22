export function setPrimaryJobRolePayload(primaryJobRoleUuid) {
    return [
        {
            operationName: "saveUserRoles",
            variables: {
                primaryJobRoleUuid: primaryJobRoleUuid
            },
            query: `
                mutation saveUserRoles($primaryJobRoleUuid: ID, $secondaryJobRoleUuid: ID) {
                    skilz_saveUserRoles(
                        primaryJobRoleUuid: $primaryJobRoleUuid
                        secondaryJobRoleUuid: $secondaryJobRoleUuid
                    )
                }
            `
        }
    ];
}
