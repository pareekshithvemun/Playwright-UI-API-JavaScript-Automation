export function createUserPayload(
  loginName,
  passWord,
  userRole,
  email,
  fName,
  lName,
  userID,
  jobRole,
  attrUUID1,
  attrValue1,
  attrUUID2,
  attrValue2,
  attrUUID3,
  attrValue3,
  directManager=null
) {
  if (directManager) {
    return {
      login_name: loginName,
      external_id: userID,
      role: userRole,
      direct_manager: directManager,
      approval_manager: directManager,
      email: email,
      password: passWord,
      first_name: fName,
      last_name: lName,
   // job_role: jobRole,
      job_title: jobRole,
      custom_attributes: [
        {
          custom_attribute_id: attrUUID1,
          value: attrValue1,
        },
        {
          custom_attribute_id: attrUUID2,
          value: attrValue2,
        },
        {
          custom_attribute_id: attrUUID3,
          value: attrValue3,
        },
      ],
    };
  } else {
    return {
      login_name: loginName,
      external_id: userID,
      role: userRole,
      email: email,
      password: passWord,
      first_name: fName,
      last_name: lName,
   // job_role: jobRole,
      job_title: jobRole,
      custom_attributes: [
        {
          custom_attribute_id: attrUUID1,
          value: attrValue1,
        },
        {
          custom_attribute_id: attrUUID2,
          value: attrValue2,
        },
        {
          custom_attribute_id: attrUUID3,
          value: attrValue3,
        },
      ],
    };
  }
}
