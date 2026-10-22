export function contentevalHirePayload({ firstName, lastName, email, password, roleUuid }) {
  return {
    status: "active",
    scheduled_email: { send_email: false, send_at: new Date().toISOString() },
    date: new Date().toISOString(),
    is_lx_studio_accessor: false,
    is_lx_studio_publisher: false,
    first_name: firstName,
    last_name: lastName,
    login_name: email,
    external_id: email,
    email: email,
    password: password,
    must_reset_password: false,
    role_uuid: roleUuid,
    custom_attributes: [
      { custom_attribute_id: "e9bdc3d3-d3a0-4add-a201-eb5099cc2f35", value: ["Health & Safety", "Ethics & Legal"], type_name: "VALUE" },
      { custom_attribute_id: "561cfc64-99e6-4e2f-9359-f8ea64e02497", value: "Yes", type_name: "VALUE" },
      { custom_attribute_id: "af93b1e8-a07d-4d6c-b0d6-05e6d2a3fe6f", value: "Yes", type_name: "VALUE" },
      { custom_attribute_id: "30cab566-70e3-42eb-85ad-10cf1c37d26a", value: ["Business", "Leadership Development", "Frontline Workforce"], type_name: "VALUE" },
      { custom_attribute_id: "be776c76-1073-492b-8789-b1d0b43b1fee", value: ["MITxPRO", "CMD+CTRL", "WintellectNow", "ed_X", "ed_X Exec", "goFLUENT"], type_name: "VALUE" },
      { custom_attribute_id: "9642cd87-962d-425d-9e73-b97c0fb9edd3", value: "Skillsoft", type_name: "VALUE" },
      { custom_attribute_id: "b36eb9e1-9d4a-4a4f-98db-daebc41f5b06", value: ["Sample APAC Safety", "Sample AU Safety", "Sample NZ Legal", "Sample Canada Safety", "Sample UK/EU Legal", "Sample US Safety", "Sample Canada Legal", "Sample UK/EU Safety", "Sample APAC Legal", "Sample AU Legal", "Sample NZ Safety", "Sample NA Legal"], type_name: "VALUE" },
      { custom_attribute_id: "6d6a03c8-684f-4f70-94b2-d73e5c90b2b0", value: "Yes", type_name: "VALUE" },
      { custom_attribute_id: "76357460-58d4-4971-9925-56fc7a23f7ae", value: ["Software Development", "Technology"], type_name: "VALUE" },
    ],
  };
}
