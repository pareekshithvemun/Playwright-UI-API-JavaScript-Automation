export function getPrimaryJobRolesPayload() {
    return [
        {
            operationName: "primaryJobRolesFromDB",
            variables: {
                locale: "en-US",
                term: "a",
                limit: 50,
                suppressStock: false
            },
            query: `
                query primaryJobRolesFromDB($locale: String!, $term: String!, $limit: Int, $suppressStock: Boolean) {
                    skilzPrimaryJobRoles(
                        locale: $locale
                        term: $term
                        limit: $limit
                        suppressStock: $suppressStock
                    ) {
                        jobRoleName
                        jobRoleUuid
                        __typename
                    }
                }
            `
        }
    ];
}
