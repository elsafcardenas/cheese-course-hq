// Converts between the app's camelCase objects and the database's snake_case columns.
// A few field names are reserved words in SQL, so they get their own column names.

const RENAME: Record<string, string> = {
  order: "sort_order",
  start: "start_date",
  end: "end_date",
};
const UNRENAME = Object.fromEntries(Object.entries(RENAME).map(([a, b]) => [b, a]));

const toSnakeKey = (k: string) => RENAME[k] ?? k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const toCamelKey = (k: string) => UNRENAME[k] ?? k.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

export function toRow(obj: object): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [toSnakeKey(k), v]));
}

export function fromRow<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamelKey(k), v])) as T;
}
