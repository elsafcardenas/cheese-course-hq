// Operations data model. Each collection is described once here and that description drives
// the database columns, the forms, the tables, CSV import/export, validation and permissions.
import type { Profile, Role } from "@/lib/types";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "date"
  | "time"
  | "number"
  | "money"
  | "url"
  | "email"
  | "phone"
  | "ref"
  | "checkbox";

export type Field = {
  key: string;
  label: string;
  type: FieldType;
  options?: readonly string[];
  ref?: RecordName;
  required?: boolean;
  /** Show as a column in the table. */
  table?: boolean;
  /** Offer as a filter above the table. */
  filter?: boolean;
  placeholder?: string;
  help?: string;
  /** Spans both columns in the form. */
  wide?: boolean;
  /** Choices that depend on another field (e.g. a menu category depends on its section). */
  optionsBy?: { key: string; map: Record<string, readonly string[]> };
  /** Offer the team's names as suggestions while typing. */
  suggestTeam?: boolean;
  /** Only shown in the form when another field has one of these values. */
  showWhen?: { key: string; in: readonly string[] };
};

export type RecordDef = {
  name: RecordName;
  label: string;
  singular: string;
  titleKey: string;
  subtitleKey?: string;
  fields: Field[];
  read: Role[];
  write: Role[];
  /** Store managers only see rows for their store (or both stores / no store). */
  storeKey?: string;
  /** Store managers may add and edit rows for their own store. */
  managerWrite?: boolean;
  defaults?: Record<string, unknown>;
  sort?: { key: string; dir: "asc" | "desc" };
};

export const OPS_STORES = ["Weston", "Pinecrest", "Both stores"] as const;
export const COST_CENTRES = ["Weston", "Pinecrest", "Both stores", "Corporate"] as const;

const ALL: Role[] = ["admin", "editor", "viewer", "store_manager"];
const OPS_READ: Role[] = ["admin", "viewer", "store_manager"];
const MGMT: Role[] = ["admin", "viewer"];
const ADMIN: Role[] = ["admin"];

export const RECORD_NAMES = [
  "stores",
  "staff",
  "shifts",
  "checklists",
  "checklist_runs",
  "maintenance",
  "catering_orders",
  "suppliers",
  "inventory_items",
  "purchase_orders",
  "waste_log",
  "menu_items",
  "expenses",
  "budget_lines",
  "sales_monthly",
  "reviews",
  "madrid_locations",
  "madrid_milestones",
  "madrid_budget",
  "madrid_contacts",
  "docs",
  "initiatives",
  "initiative_steps",
  "content_reviews",
  "review_comments",
] as const;
export type RecordName = (typeof RECORD_NAMES)[number];

export type Rec = { id: string; [key: string]: unknown };

export const CONTENT_KINDS = ["Graphic", "Video", "Other"] as const;
export const CONTENT_REVIEW_STATUSES = ["Draft", "In review", "Changes requested", "Approved", "Published"] as const;
export const CONTENT_FORMATS: Record<(typeof CONTENT_KINDS)[number], readonly string[]> = {
  Graphic: ["Carousel", "Reel cover", "Story", "Feed photo", "Google post", "Highlight covers", "Template", "Print / in-store", "Other graphic"],
  Video: ["Reel", "TikTok", "Story video", "Ad video", "Other video"],
  Other: ["Caption", "Blog post", "Email", "Website copy", "Menu copy", "Script", "Other"],
};

export const CATERING_STATUSES = ["Enquiry", "Quoted", "Confirmed", "In prep", "Ready", "Picked up", "Cancelled"] as const;
export const MAINT_STATUSES = ["Open", "Scheduled", "Fixed"] as const;
export const PO_STATUSES = ["Draft", "Sent", "Received", "Cancelled"] as const;
export const REVIEW_STATUSES = ["New", "Replied", "Resolved", "Escalated"] as const;
export const LOCATION_STATUSES = ["Shortlisted", "To visit", "Visited", "Negotiating", "Signed", "Rejected"] as const;
export const MILESTONE_STATUSES = ["Not started", "In progress", "Done", "Blocked"] as const;
/** Jobs in the stores. Staff on this list don't sign in to HQ. */
export const STAFF_ROLES = ["Store manager", "Assistant manager", "Server / waiter", "Barista", "Cashier", "Cheesemonger", "Cook", "Kitchen prep", "Dishwasher", "Host", "Catering", "Delivery driver", "Other"] as const;

/** The three parts of what we sell, each with its own categories (in the order they appear on the menu). */
export const MENU_SECTIONS = ["Menu", "Catering", "Retail"] as const;
export const MENU_CATEGORIES_BY: Record<(typeof MENU_SECTIONS)[number], readonly string[]> = {
  Menu: ["Breakfast", "Croissants & toasts", "Sandwiches", "Half sandwiches & pairings", "Salads", "Soups", "To share", "Cheese courses", "Kids & sides", "Desserts", "Coffee & tea", "Matcha", "Drinks", "Wine & beer"],
  Catering: ["Cheese & appetizer platters", "Sandwich platters", "Breakfast platters", "Salad bowls", "Soups", "Dessert platters", "Extras"],
  Retail: ["Cheese by weight", "Charcuterie", "Accompaniments", "Crackers & bread", "Spreads, jams & honey", "Oils, truffle & salts", "Chips & snacks", "Gifts & boxes"],
};
export const MENU_CATEGORIES = [...new Set(Object.values(MENU_CATEGORIES_BY).flat())];
export const EXPENSE_CATEGORIES = ["Rent", "Payroll", "Food & supplies", "Packaging", "Utilities", "Marketing", "Repairs & maintenance", "Software", "Insurance", "Fees & taxes", "Other"] as const;

const BASE: Omit<Record<RecordName, RecordDef>, "content_reviews" | "review_comments" | "initiatives" | "initiative_steps"> = {
  stores: {
    name: "stores",
    label: "Stores",
    singular: "Store",
    titleKey: "name",
    subtitleKey: "address",
    read: ALL,
    write: ADMIN,
    storeKey: "name",
    managerWrite: true,
    sort: { key: "sortOrder", dir: "asc" },
    fields: [
      { key: "name", label: "Store", type: "text", required: true, table: true },
      { key: "status", label: "Status", type: "select", options: ["Open", "Closed", "Coming soon"], table: true, filter: true },
      { key: "address", label: "Address", type: "text", wide: true, table: true },
      { key: "phone", label: "Phone", type: "phone", table: true },
      { key: "email", label: "Email", type: "email" },
      { key: "manager", label: "Manager", type: "text", table: true },
      { key: "hours", label: "Opening hours", type: "textarea", placeholder: "Mon–Fri 8–6\nSat 8–4\nSun closed" },
      { key: "orderUrl", label: "Online ordering link", type: "url" },
      { key: "mapsUrl", label: "Google Maps link", type: "url" },
      { key: "sortOrder", label: "Order", type: "number" },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  staff: {
    name: "staff",
    label: "Staff",
    singular: "Team member",
    titleKey: "name",
    subtitleKey: "role",
    read: OPS_READ,
    write: ADMIN,
    storeKey: "store",
    managerWrite: true,
    defaults: { status: "Active", store: "Weston" },
    sort: { key: "name", dir: "asc" },
    fields: [
      { key: "name", label: "Name", type: "text", required: true, table: true },
      { key: "role", label: "Job", type: "select", options: STAFF_ROLES, required: true, table: true, filter: true },
      { key: "store", label: "Store", type: "select", options: OPS_STORES, table: true, filter: true },
      { key: "status", label: "Status", type: "select", options: ["Active", "On leave", "Left"], table: true, filter: true },
      { key: "phone", label: "Phone", type: "phone", table: true },
      { key: "email", label: "Email", type: "email" },
      { key: "startDate", label: "Started", type: "date", table: true },
      { key: "availability", label: "When they can work", type: "text", placeholder: "e.g. Weekdays, mornings only", wide: true },
      { key: "emergencyContact", label: "Emergency contact", type: "text", placeholder: "Name and phone", wide: true },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  shifts: {
    name: "shifts",
    label: "Shifts",
    singular: "Shift",
    titleKey: "date",
    read: OPS_READ,
    write: ADMIN,
    storeKey: "store",
    managerWrite: true,
    sort: { key: "date", dir: "asc" },
    fields: [
      { key: "staffId", label: "Who", type: "ref", ref: "staff", required: true, table: true },
      { key: "store", label: "Store", type: "select", options: ["Weston", "Pinecrest"], required: true, table: true, filter: true },
      { key: "date", label: "Date", type: "date", required: true, table: true },
      { key: "startTime", label: "Start", type: "time", required: true, table: true },
      { key: "endTime", label: "End", type: "time", required: true, table: true },
      { key: "notes", label: "Notes", type: "text" },
    ],
  },
  checklists: {
    name: "checklists",
    label: "Checklists",
    singular: "Checklist",
    titleKey: "name",
    subtitleKey: "frequency",
    read: OPS_READ,
    write: ADMIN,
    storeKey: "store",
    defaults: { store: "Both stores", frequency: "Daily (opening)" },
    sort: { key: "sortOrder", dir: "asc" },
    fields: [
      { key: "name", label: "Checklist", type: "text", required: true, table: true },
      { key: "frequency", label: "When", type: "select", options: ["Daily (opening)", "Daily (closing)", "Weekly", "Monthly"], table: true, filter: true },
      { key: "store", label: "Store", type: "select", options: OPS_STORES, table: true, filter: true },
      { key: "items", label: "Items (one per line)", type: "textarea", wide: true, required: true },
      { key: "sortOrder", label: "Order", type: "number" },
    ],
  },
  checklist_runs: {
    name: "checklist_runs",
    label: "Checklist runs",
    singular: "Checklist run",
    titleKey: "date",
    read: OPS_READ,
    write: ADMIN,
    storeKey: "store",
    managerWrite: true,
    fields: [
      { key: "checklistId", label: "Checklist", type: "ref", ref: "checklists", required: true, table: true },
      { key: "store", label: "Store", type: "select", options: ["Weston", "Pinecrest"], required: true, table: true },
      { key: "date", label: "Date", type: "date", required: true, table: true },
      { key: "done", label: "Done items", type: "text", help: "Comma-separated item numbers" },
      { key: "completedBy", label: "Done by", type: "text", table: true },
      { key: "notes", label: "Notes", type: "textarea" },
    ],
  },
  maintenance: {
    name: "maintenance",
    label: "Maintenance",
    singular: "Issue",
    titleKey: "title",
    subtitleKey: "area",
    read: OPS_READ,
    write: ADMIN,
    storeKey: "store",
    managerWrite: true,
    defaults: { status: "Open", priority: "Medium", area: "Equipment" },
    sort: { key: "reportedOn", dir: "desc" },
    fields: [
      { key: "title", label: "Issue", type: "text", required: true, table: true, wide: true },
      { key: "store", label: "Store", type: "select", options: OPS_STORES, required: true, table: true, filter: true },
      { key: "area", label: "Area", type: "select", options: ["Equipment", "Refrigeration", "Building", "Plumbing", "Electrical", "IT & POS", "Cleaning", "Other"], table: true, filter: true },
      { key: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"], table: true, filter: true },
      { key: "status", label: "Status", type: "select", options: MAINT_STATUSES, table: true, filter: true },
      { key: "reportedOn", label: "Reported", type: "date", table: true },
      { key: "reportedBy", label: "Reported by", type: "text" },
      { key: "vendor", label: "Vendor / technician", type: "text" },
      { key: "cost", label: "Cost", type: "money", table: true },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  catering_orders: {
    name: "catering_orders",
    label: "Catering orders",
    singular: "Order",
    titleKey: "customer",
    subtitleKey: "items",
    read: OPS_READ,
    write: ADMIN,
    storeKey: "store",
    managerWrite: true,
    defaults: { status: "Enquiry", payment: "Unpaid", store: "Weston", source: "Phone" },
    sort: { key: "eventDate", dir: "asc" },
    fields: [
      { key: "customer", label: "Customer", type: "text", required: true, table: true },
      { key: "status", label: "Status", type: "select", options: CATERING_STATUSES, table: true, filter: true },
      { key: "store", label: "Pickup store", type: "select", options: ["Weston", "Pinecrest"], table: true, filter: true },
      { key: "eventDate", label: "Pickup date", type: "date", table: true },
      { key: "pickupTime", label: "Pickup time", type: "time", table: true },
      { key: "guests", label: "Guests", type: "number", table: true },
      { key: "items", label: "What they ordered", type: "textarea", wide: true },
      { key: "total", label: "Order total", type: "money", table: true },
      { key: "deposit", label: "Deposit paid", type: "money" },
      { key: "payment", label: "Payment", type: "select", options: ["Unpaid", "Deposit", "Paid in full", "Refunded"], table: true, filter: true },
      { key: "phone", label: "Phone", type: "phone" },
      { key: "email", label: "Email", type: "email" },
      { key: "source", label: "Came from", type: "select", options: ["Phone", "Website", "Instagram", "Walk-in", "Email", "Repeat customer", "Other"], filter: true },
      { key: "notes", label: "Notes (allergies, delivery, labels…)", type: "textarea", wide: true },
    ],
  },
  suppliers: {
    name: "suppliers",
    label: "Suppliers",
    singular: "Supplier",
    titleKey: "name",
    subtitleKey: "category",
    read: OPS_READ,
    write: ADMIN,
    sort: { key: "name", dir: "asc" },
    fields: [
      { key: "name", label: "Supplier", type: "text", required: true, table: true },
      { key: "category", label: "Category", type: "select", options: ["Cheese", "Charcuterie", "Bakery", "Produce", "Dairy", "Dry goods", "Coffee", "Beverages", "Packaging", "Cleaning", "Other"], table: true, filter: true },
      { key: "contact", label: "Contact person", type: "text", table: true },
      { key: "phone", label: "Phone", type: "phone", table: true },
      { key: "email", label: "Email", type: "email" },
      { key: "orderDays", label: "Order days", type: "text", placeholder: "e.g. Mon & Thu by 2pm", table: true },
      { key: "leadTimeDays", label: "Lead time (days)", type: "number" },
      { key: "minOrder", label: "Minimum order", type: "money" },
      { key: "terms", label: "Payment terms", type: "text", placeholder: "e.g. Net 30" },
      { key: "website", label: "Website / ordering portal", type: "url" },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  inventory_items: {
    name: "inventory_items",
    label: "Inventory",
    singular: "Item",
    titleKey: "name",
    subtitleKey: "category",
    read: OPS_READ,
    write: ADMIN,
    storeKey: "store",
    managerWrite: true,
    defaults: { store: "Weston", unit: "kg" },
    sort: { key: "name", dir: "asc" },
    fields: [
      { key: "name", label: "Item", type: "text", required: true, table: true },
      { key: "category", label: "Category", type: "select", options: ["Cheese", "Charcuterie", "Bread", "Produce", "Dairy", "Dry goods", "Coffee", "Drinks", "Packaging", "Cleaning", "Other"], table: true, filter: true },
      { key: "store", label: "Store", type: "select", options: ["Weston", "Pinecrest"], table: true, filter: true },
      { key: "supplierId", label: "Supplier", type: "ref", ref: "suppliers", table: true },
      { key: "unit", label: "Unit", type: "select", options: ["kg", "lb", "each", "case", "box", "bag", "litre", "gallon", "pack"] },
      { key: "onHand", label: "On hand", type: "number", table: true },
      { key: "par", label: "Par level", type: "number", table: true, help: "Reorder when stock drops below this" },
      { key: "reorderQty", label: "Usual order qty", type: "number" },
      { key: "unitCost", label: "Cost per unit", type: "money", table: true },
      { key: "lastCounted", label: "Last counted", type: "date", table: true },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  purchase_orders: {
    name: "purchase_orders",
    label: "Purchase orders",
    singular: "Purchase order",
    titleKey: "reference",
    subtitleKey: "items",
    read: OPS_READ,
    write: ADMIN,
    storeKey: "store",
    managerWrite: true,
    defaults: { status: "Draft", store: "Weston" },
    sort: { key: "orderDate", dir: "desc" },
    fields: [
      { key: "reference", label: "Reference", type: "text", required: true, table: true },
      { key: "supplierId", label: "Supplier", type: "ref", ref: "suppliers", table: true, filter: true },
      { key: "store", label: "Store", type: "select", options: ["Weston", "Pinecrest"], table: true, filter: true },
      { key: "status", label: "Status", type: "select", options: PO_STATUSES, table: true, filter: true },
      { key: "orderDate", label: "Ordered", type: "date", table: true },
      { key: "expectedDate", label: "Expected", type: "date", table: true },
      { key: "items", label: "Items", type: "textarea", wide: true },
      { key: "total", label: "Total", type: "money", table: true },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  waste_log: {
    name: "waste_log",
    label: "Waste log",
    singular: "Waste entry",
    titleKey: "item",
    subtitleKey: "reason",
    read: OPS_READ,
    write: ADMIN,
    storeKey: "store",
    managerWrite: true,
    defaults: { reason: "Expired", store: "Weston" },
    sort: { key: "date", dir: "desc" },
    fields: [
      { key: "date", label: "Date", type: "date", required: true, table: true },
      { key: "store", label: "Store", type: "select", options: ["Weston", "Pinecrest"], table: true, filter: true },
      { key: "item", label: "Item", type: "text", required: true, table: true },
      { key: "quantity", label: "Quantity", type: "text", placeholder: "e.g. 1.2 kg", table: true },
      { key: "reason", label: "Reason", type: "select", options: ["Expired", "Damaged", "Prep waste", "Unsold", "Quality issue", "Other"], table: true, filter: true },
      { key: "cost", label: "Cost", type: "money", table: true },
      { key: "notes", label: "Notes", type: "text", wide: true },
    ],
  },
  menu_items: {
    name: "menu_items",
    label: "Menu",
    singular: "Menu item",
    titleKey: "name",
    subtitleKey: "category",
    read: ALL,
    write: ADMIN,
    defaults: { status: "Active", availability: "Both stores", market: "Miami", section: "Menu" },
    sort: { key: "name", dir: "asc" },
    fields: [
      { key: "name", label: "Item", type: "text", required: true, table: true },
      { key: "section", label: "Part", type: "select", options: MENU_SECTIONS, required: true, filter: true, help: "Menu = in the café · Catering = platters and orders · Retail = things people take home" },
      { key: "category", label: "Category", type: "select", options: MENU_CATEGORIES, optionsBy: { key: "section", map: MENU_CATEGORIES_BY }, table: true, filter: true },
      { key: "price", label: "Price", type: "money", table: true },
      { key: "foodCost", label: "Food cost per portion", type: "money", table: true, help: "What it costs us to make one. Used to work out the margin." },
      { key: "serves", label: "Serves", type: "text", placeholder: "e.g. Serves 10", showWhen: { key: "section", in: ["Catering"] } },
      { key: "size", label: "Size / unit", type: "text", placeholder: "e.g. 8 oz, per lb, 1 jar", showWhen: { key: "section", in: ["Retail"] } },
      { key: "code", label: "Menu number", type: "text", placeholder: "e.g. 21" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Seasonal", "To confirm", "Idea", "Retired"], table: true, filter: true },
      { key: "availability", label: "Where", type: "select", options: OPS_STORES, filter: true },
      { key: "market", label: "Market", type: "select", options: ["Miami", "Spain"], required: true },
      { key: "description", label: "Description (as on the menu)", type: "textarea", wide: true },
      { key: "recipe", label: "Recipe / build", type: "textarea", wide: true },
      { key: "allergens", label: "Allergens", type: "text", wide: true },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  expenses: {
    name: "expenses",
    label: "Expenses",
    singular: "Expense",
    titleKey: "vendor",
    subtitleKey: "category",
    read: MGMT,
    write: ADMIN,
    defaults: { store: "Both stores", category: "Food & supplies" },
    sort: { key: "date", dir: "desc" },
    fields: [
      { key: "date", label: "Date", type: "date", required: true, table: true },
      { key: "vendor", label: "Paid to", type: "text", required: true, table: true },
      { key: "category", label: "Category", type: "select", options: EXPENSE_CATEGORIES, table: true, filter: true },
      { key: "store", label: "Cost centre", type: "select", options: COST_CENTRES, table: true, filter: true },
      { key: "amount", label: "Amount", type: "money", required: true, table: true },
      { key: "recurring", label: "Monthly recurring", type: "checkbox", table: true },
      { key: "notes", label: "Notes", type: "text", wide: true },
    ],
  },
  budget_lines: {
    name: "budget_lines",
    label: "Budget",
    singular: "Budget line",
    titleKey: "category",
    read: MGMT,
    write: ADMIN,
    defaults: { store: "Both stores" },
    sort: { key: "month", dir: "desc" },
    fields: [
      { key: "month", label: "Month", type: "date", required: true, table: true, help: "Any day in the month" },
      { key: "category", label: "Category", type: "select", options: EXPENSE_CATEGORIES, required: true, table: true, filter: true },
      { key: "store", label: "Cost centre", type: "select", options: COST_CENTRES, table: true, filter: true },
      { key: "amount", label: "Budget", type: "money", required: true, table: true },
    ],
  },
  sales_monthly: {
    name: "sales_monthly",
    label: "Monthly sales",
    singular: "Monthly sales",
    titleKey: "store",
    read: MGMT,
    write: ADMIN,
    sort: { key: "month", dir: "desc" },
    fields: [
      { key: "month", label: "Month", type: "date", required: true, table: true, help: "Any day in the month" },
      { key: "store", label: "Store", type: "select", options: ["Weston", "Pinecrest", "Catering", "Online"], required: true, table: true, filter: true },
      { key: "netSales", label: "Net sales", type: "money", required: true, table: true },
      { key: "orders", label: "Orders", type: "number", table: true },
      { key: "notes", label: "Notes", type: "text" },
    ],
  },
  reviews: {
    name: "reviews",
    label: "Reviews & feedback",
    singular: "Review",
    titleKey: "author",
    subtitleKey: "text",
    read: ALL,
    write: ["admin", "editor"],
    storeKey: "store",
    managerWrite: true,
    defaults: { status: "New", type: "Review", source: "Google", store: "Weston" },
    sort: { key: "date", dir: "desc" },
    fields: [
      { key: "date", label: "Date", type: "date", required: true, table: true },
      { key: "source", label: "Where", type: "select", options: ["Google", "Yelp", "Instagram", "Facebook", "TripAdvisor", "In store", "Email", "Phone"], table: true, filter: true },
      { key: "store", label: "Store", type: "select", options: OPS_STORES, table: true, filter: true },
      { key: "type", label: "Type", type: "select", options: ["Review", "Complaint", "Compliment", "Suggestion", "Question"], table: true, filter: true },
      { key: "rating", label: "Stars (1–5)", type: "number", table: true },
      { key: "author", label: "From", type: "text", table: true },
      { key: "text", label: "What they said", type: "textarea", wide: true, required: true },
      { key: "status", label: "Status", type: "select", options: REVIEW_STATUSES, table: true, filter: true },
      { key: "response", label: "Our reply / action", type: "textarea", wide: true },
    ],
  },
  madrid_locations: {
    name: "madrid_locations",
    label: "Locations",
    singular: "Location",
    titleKey: "area",
    subtitleKey: "address",
    read: MGMT,
    write: ADMIN,
    defaults: { status: "Shortlisted" },
    sort: { key: "sortOrder", dir: "asc" },
    fields: [
      { key: "area", label: "Area", type: "text", required: true, table: true },
      { key: "status", label: "Status", type: "select", options: LOCATION_STATUSES, table: true, filter: true },
      { key: "address", label: "Address or listing", type: "text", wide: true, table: true },
      { key: "link", label: "Idealista link", type: "url" },
      { key: "sizeM2", label: "Size (m²)", type: "number", table: true },
      { key: "rent", label: "Rent per month (€)", type: "number", table: true },
      { key: "licence", label: "Licence notes", type: "textarea", wide: true },
      { key: "pros", label: "Pros", type: "textarea" },
      { key: "cons", label: "Cons", type: "textarea" },
      { key: "sortOrder", label: "Order", type: "number" },
    ],
  },
  madrid_milestones: {
    name: "madrid_milestones",
    label: "Milestones",
    singular: "Milestone",
    titleKey: "title",
    subtitleKey: "phase",
    read: MGMT,
    write: ADMIN,
    defaults: { status: "Not started", owner: "Elsa" },
    sort: { key: "due", dir: "asc" },
    fields: [
      { key: "title", label: "Milestone", type: "text", required: true, table: true, wide: true },
      { key: "phase", label: "Phase", type: "select", options: ["1. Concept & partner", "2. Location", "3. Licences & works", "4. Brand & launch prep", "5. Opening"], table: true, filter: true },
      { key: "due", label: "Target date", type: "date", table: true },
      { key: "status", label: "Status", type: "select", options: MILESTONE_STATUSES, table: true, filter: true },
      { key: "owner", label: "Owner", type: "text", table: true },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  madrid_budget: {
    name: "madrid_budget",
    label: "Opening budget",
    singular: "Budget item",
    titleKey: "item",
    subtitleKey: "category",
    read: MGMT,
    write: ADMIN,
    sort: { key: "category", dir: "asc" },
    fields: [
      { key: "item", label: "Item", type: "text", required: true, table: true },
      { key: "category", label: "Category", type: "select", options: ["Premises & deposit", "Works & fit-out", "Equipment", "Licences & legal", "Brand & design", "Marketing & launch", "Initial stock", "Staff & training", "Working capital", "Other"], table: true, filter: true },
      { key: "estimate", label: "Estimate (€)", type: "number", table: true },
      { key: "actual", label: "Actual (€)", type: "number", table: true },
      { key: "notes", label: "Notes", type: "text", wide: true },
    ],
  },
  madrid_contacts: {
    name: "madrid_contacts",
    label: "Contacts",
    singular: "Contact",
    titleKey: "name",
    subtitleKey: "role",
    read: MGMT,
    write: ADMIN,
    defaults: { status: "To contact" },
    sort: { key: "name", dir: "asc" },
    fields: [
      { key: "name", label: "Name", type: "text", required: true, table: true },
      { key: "role", label: "Role", type: "select", options: ["Partner candidate", "Lawyer", "Gestor", "Architect", "Contractor", "Designer", "Photographer", "Supplier", "Estate agent", "Creator", "Other"], table: true, filter: true },
      { key: "status", label: "Status", type: "select", options: ["To contact", "In talks", "Quoted", "Hired", "Not a fit"], table: true, filter: true },
      { key: "company", label: "Company", type: "text", table: true },
      { key: "phone", label: "Phone", type: "phone" },
      { key: "email", label: "Email", type: "email" },
      { key: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  docs: {
    name: "docs",
    label: "SOPs & documents",
    singular: "Document",
    titleKey: "title",
    subtitleKey: "category",
    read: ALL,
    write: ["admin", "editor"],
    storeKey: "store",
    defaults: { category: "SOP", market: "Miami" },
    sort: { key: "title", dir: "asc" },
    fields: [
      { key: "title", label: "Title", type: "text", required: true, table: true, wide: true },
      { key: "category", label: "Type", type: "select", options: ["SOP", "Recipe", "Training", "Contract", "Licence & permit", "Brand", "Plan", "Other"], table: true, filter: true },
      { key: "market", label: "Market", type: "select", options: ["Miami", "Spain", "Both"], required: true },
      { key: "store", label: "Applies to", type: "select", options: OPS_STORES, table: true, filter: true },
      { key: "url", label: "Link (Drive, Notion, PDF…)", type: "url", wide: true },
      { key: "body", label: "Write it here instead", type: "textarea", wide: true, placeholder: "Steps, one per line" },
      { key: "owner", label: "Owner", type: "text", table: true },
      { key: "updatedOn", label: "Last reviewed", type: "date", table: true },
    ],
  },
};

export const INITIATIVE_KINDS = ["Strategy goal", "Campaign"] as const;
export const INITIATIVE_STATUSES = ["Idea", "Planning", "In progress", "Done", "Paused"] as const;
export const STEP_STATUSES = ["To do", "In progress", "Waiting", "Done"] as const;

// Strategy goals and campaigns, each with steps and substeps. Only admins edit; marketing and Ricardo can see them.
const INITIATIVES: RecordDef = {
  name: "initiatives",
  label: "Strategy & campaigns",
  singular: "Campaign or goal",
  titleKey: "name",
  subtitleKey: "kind",
  read: ["admin", "editor", "viewer"],
  write: ADMIN,
  defaults: { kind: "Campaign", status: "Planning", market: "Miami" },
  sort: { key: "start", dir: "asc" },
  fields: [
    { key: "name", label: "Name", type: "text", required: true, table: true, wide: true },
    { key: "kind", label: "Type", type: "select", options: INITIATIVE_KINDS, required: true, table: true, filter: true, help: "Strategy goal = a big aim for months · Campaign = a push with a start and an end" },
    { key: "status", label: "Status", type: "select", options: INITIATIVE_STATUSES, table: true, filter: true },
    { key: "owner", label: "In charge", type: "text", suggestTeam: true, table: true },
    { key: "start", label: "Starts", type: "date", table: true },
    { key: "end", label: "Ends", type: "date", table: true },
    { key: "market", label: "Market", type: "select", options: ["Miami", "Spain"], required: true },
    { key: "goal", label: "Goal (what success looks like)", type: "textarea", wide: true },
    { key: "audience", label: "Who it's for", type: "text", wide: true },
    { key: "channels", label: "Channels", type: "text", wide: true, placeholder: "e.g. Instagram, Google, email, in store" },
    { key: "measure", label: "How we'll measure it", type: "text", wide: true },
    { key: "budget", label: "Budget", type: "money" },
    { key: "notes", label: "Notes", type: "textarea", wide: true },
  ],
};

const INITIATIVE_STEPS: RecordDef = {
  name: "initiative_steps",
  label: "Steps",
  singular: "Step",
  titleKey: "title",
  subtitleKey: "owner",
  read: ["admin", "editor", "viewer"],
  write: ADMIN,
  defaults: { status: "To do" },
  sort: { key: "sortOrder", dir: "asc" },
  fields: [
    { key: "title", label: "Step", type: "text", required: true, table: true, wide: true },
    { key: "initiative", label: "Campaign or goal", type: "ref", ref: "initiatives", required: true },
    { key: "parent", label: "Part of step", type: "ref", ref: "initiative_steps", help: "Leave empty for a main step; pick a step to make this a substep." },
    { key: "owner", label: "In charge", type: "text", suggestTeam: true, table: true },
    { key: "status", label: "Status", type: "select", options: STEP_STATUSES, table: true },
    { key: "start", label: "Starts", type: "date", table: true },
    { key: "end", label: "Due", type: "date", table: true },
    { key: "sortOrder", label: "Order", type: "number" },
    { key: "notes", label: "Notes", type: "textarea", wide: true },
  ],
};

// Content review lives alongside the rest so it gets the same storage, import and permissions.
const CONTENT_REVIEWS: RecordDef = {
  name: "content_reviews",
  label: "Content review",
  singular: "Piece",
  titleKey: "title",
  subtitleKey: "format",
  read: ["admin", "editor", "viewer"],
  write: ["admin", "editor"],
  defaults: { kind: "Graphic", format: "Carousel", status: "In review", version: 1, market: "Miami", submittedBy: "Luis" },
  sort: { key: "due", dir: "asc" },
  fields: [
    { key: "title", label: "Title", type: "text", required: true, table: true, wide: true },
    { key: "kind", label: "Type", type: "select", options: CONTENT_KINDS, table: true, filter: true },
    { key: "format", label: "Format", type: "select", options: [...new Set(Object.values(CONTENT_FORMATS).flat())], table: true, filter: true },
    { key: "status", label: "Status", type: "select", options: CONTENT_REVIEW_STATUSES, table: true, filter: true },
    { key: "market", label: "Market", type: "select", options: ["Miami", "Spain"], table: true, filter: true },
    { key: "submittedBy", label: "Made by", type: "select", options: ["Luis", "Elsa", "Juan", "Store team", "Other"], table: true, filter: true },
    { key: "due", label: "Needed by", type: "date", table: true },
    { key: "version", label: "Version", type: "number", table: true },
    { key: "previewUrl", label: "Preview (image, video or Drive file link)", type: "url", wide: true },
    { key: "assetUrl", label: "Source file (Canva, Adobe, Drive folder)", type: "url", wide: true },
    { key: "copy", label: "Caption or copy", type: "textarea", wide: true },
    { key: "postId", label: "Calendar post", type: "text", help: "Linked automatically when sent from the Calendar" },
  ],
};
const REVIEW_COMMENTS: RecordDef = {
  name: "review_comments",
  label: "Review comments",
  singular: "Comment",
  titleKey: "body",
  read: ["admin", "editor", "viewer"],
  write: ["admin", "editor", "viewer"],
  sort: { key: "createdAt", dir: "asc" },
  fields: [
    { key: "reviewId", label: "Piece", type: "ref", ref: "content_reviews", required: true },
    { key: "author", label: "From", type: "text", table: true },
    { key: "action", label: "Action", type: "select", options: ["Comment", "Approved", "Changes requested", "New version", "Sent for review"], table: true },
    { key: "body", label: "Comment", type: "textarea", table: true },
    { key: "createdAt", label: "When", type: "text", table: true },
  ],
};

export const SCHEMAS: Record<RecordName, RecordDef> = { ...BASE, content_reviews: CONTENT_REVIEWS, review_comments: REVIEW_COMMENTS, initiatives: INITIATIVES, initiative_steps: INITIATIVE_STEPS };

export const isRecordName = (v: string): v is RecordName => (RECORD_NAMES as readonly string[]).includes(v);

/** Can this role see the collection at all? */
export const canReadRecords = (role: Role | undefined, name: RecordName) => !!role && SCHEMAS[name].read.includes(role);

/** Can this role add or edit rows (store managers: only for their store)? */
/** The data each page shows, so giving someone a page also lets them see what's on it. */
export const PAGE_DATA: Record<string, RecordName[]> = {
  "/ops/stores": ["stores", "staff", "maintenance", "catering_orders", "checklists", "checklist_runs", "inventory_items", "reviews"],
  "/ops/catering": ["catering_orders"],
  "/ops/staff": ["staff", "shifts", "stores"],
  "/ops/checklists": ["checklists", "checklist_runs"],
  "/ops/inventory": ["inventory_items", "purchase_orders", "suppliers", "waste_log"],
  "/ops/maintenance": ["maintenance"],
  "/finance": ["sales_monthly", "expenses", "budget_lines"],
  "/madrid": ["madrid_milestones", "madrid_locations", "madrid_budget", "madrid_contacts"],
  "/customers": ["reviews"],
  "/menu": ["menu_items"],
  "/company/docs": ["docs"],
  "/marketing/review": ["content_reviews", "review_comments"],
  "/marketing/strategy": ["initiatives", "initiative_steps"],
};

/** Paused people see nothing; extra pages an admin switched on bring their data with them (view only). */
export function canReadFor(user: Pick<Profile, "role"> & Partial<Pick<Profile, "status" | "access">>, name: RecordName) {
  if (user.status === "paused") return false;
  if (canReadRecords(user.role, name)) return true;
  return (user.access ?? []).some((k) => (PAGE_DATA[k.slice(k.indexOf(":") + 1)] ?? []).includes(name));
}

export const canWriteRecords = (role: Role | undefined, name: RecordName) =>
  !!role && (SCHEMAS[name].write.includes(role) || (role === "store_manager" && !!SCHEMAS[name].managerWrite));

export function storeVisible(def: RecordDef, row: Rec, store: string | null | undefined) {
  if (!def.storeKey) return true;
  const v = row[def.storeKey];
  return v == null || v === "" || v === "Both stores" || v === store;
}

export function blankRecord(def: RecordDef): Rec {
  const r: Rec = { id: "" };
  for (const f of def.fields) r[f.key] = f.type === "checkbox" ? false : f.type === "number" || f.type === "money" ? null : "";
  return { ...r, ...(def.defaults ?? {}) };
}

export const recordTitle = (def: RecordDef, r: Rec) => String(r[def.titleKey] ?? "") || `Untitled ${def.singular.toLowerCase()}`;
