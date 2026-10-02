export function formatNumber(value, options = {}, locale = "en-GB") {
  return new Intl.NumberFormat(locale, options).format(Number(value) || 0);
}
export function formatCurrency(value, currency = "EUR", locale = "en-GB") {
  return formatNumber(value, { style: "currency", currency }, locale);
}
export function formatDate(value, locale = "en-GB") {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(locale).format(date);
}
