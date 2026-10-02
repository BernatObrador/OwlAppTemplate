export const opportunityStages = ["Qualified", "Proposal", "Negotiation", "Won", "Lost"];

export function opportunityErrors(values) {
  const errors = {};
  if (typeof values.name !== "string" || !values.name.trim()) errors.name = "Name is required.";
  if (typeof values.customer !== "string" || !values.customer.trim()) errors.customer = "Customer is required.";
  if (values.amount === "" || values.amount == null || !Number.isFinite(Number(values.amount)) || Number(values.amount) < 0) errors.amount = "Enter a non-negative amount.";
  if (!opportunityStages.includes(values.stage)) errors.stage = "Choose a valid stage.";
  return errors;
}
