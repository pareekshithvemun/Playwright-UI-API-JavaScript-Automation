import { reusableFunctions } from "../../../path.js";

/**
 * Creates child site payload with dynamic license pool distribution
 * @param {Object} siteData - Test data for child site
 * @param {string} parentOrgId - Parent organization ID from config
 * @param {string} peopleSoftId - PeopleSoft ID from parent org API
 * @param {string} domainUuid - Domain UUID from parent org API
 * @param {Array} licensePoolsFromApi - License pools array from getAllLicencePools API
 * @param {number} seatsPerPool - Number of seats to allocate per pool (from test data)
 * @returns {Object} - Complete child site creation payload
 */
export function createChildSitePayload(
  siteData,
  parentOrgId,
  peopleSoftId,
  domainUuid,
  licensePoolsFromApi,
  seatsPerPool
) {
  // Transform ALL license pools from API to payload format with seats from test data
  const licensesDistribution = licensePoolsFromApi.map((pool) => {
    return {
      seats: seatsPerPool,
      setId: pool.id,
      parentLpSetId: pool.id,
      name: pool.name,
      newAllocation: true,
      isChildSiteAutoRenewable: true,
    };
  });

  return {
    peopleSoftId: peopleSoftId,
    salesForceCustId: siteData.salesForceCustId || null,
    orgName: siteData.orgName,
    displayName: siteData.displayName || "",
    domain: siteData.domain,
    brandKey: siteData.brandKey || "default",
    badgingMasterSwitch: siteData.badgingMasterSwitch,
    contractedGB: siteData.contractedGB || "0.0000000000",
    orgType: siteData.orgType || "internal",
    contractValueUSD: siteData.contractValueUSD || 0,
    props: siteData.props,
    contactInfo: null,
    supportInfo: null,
    compliance: siteData.compliance,
    domainUuid: domainUuid,
    parentOrgId: parentOrgId,
    connection: {
      strategy: "username_password",
    },
    admin: siteData.admin,
    adminUserCreated: siteData.adminUserCreated,
    deploymentId: siteData.deploymentId || 50,
    licenses: {
      distributions: licensesDistribution,
    },
  };
}
