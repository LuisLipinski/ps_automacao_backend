export const empresaSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "documentNumber", "razaoSocial", "nomeFantasia", "email", "nomeTitular", "status"],
  properties: {
    id: { type: "string" },
    documentNumber: { type: "string" },
    razaoSocial: { type: "string" },
    nomeFantasia: { type: "string" },
    email: { type: "string" },
    nomeTitular: { type: "string"},
    status: { type: "string" }
  }
};
