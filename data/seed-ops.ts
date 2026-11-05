// Starting data for the operations side. Only things we actually know are filled in;
// staff, suppliers, stock, catering orders, prices and expenses start empty for real data.
import type { Rec, RecordName } from "@/lib/schema";
import { MENU_SEED } from "./menu-seed";
import { INITIATIVES_SEED, STEPS_SEED } from "./strategy-seed";

const rows = (prefix: string, list: Omit<Rec, "id">[]): Rec[] => list.map((r, i) => ({ id: `${prefix}${String(i + 1).padStart(2, "0")}`, ...r }));

const stores = rows("st", [
  { name: "Weston", status: "Open", address: "", phone: "", email: "", manager: "", hours: "", orderUrl: "https://thecheesecourseweston.square.site", mapsUrl: "", sortOrder: 1, notes: "About 73% of 2026 sales (Jan–Aug)." },
  { name: "Pinecrest", status: "Open", address: "", phone: "", email: "", manager: "", hours: "", orderUrl: "http://thecheesecoursepinecrest.square.site", mapsUrl: "", sortOrder: 2, notes: "Ordering link is http, not https: fix on Linktree." },
  { name: "Plantation", status: "Closed", address: "", phone: "", email: "", manager: "", hours: "", orderUrl: "", mapsUrl: "", sortOrder: 3, notes: "Closed. Mark the Google listing as permanently closed." },
  { name: "Doral", status: "Closed", address: "", phone: "", email: "", manager: "", hours: "", orderUrl: "", mapsUrl: "", sortOrder: 4, notes: "Closed (last sales 2024). Mark the Google listing as permanently closed." },
  { name: "Pembroke", status: "Closed", address: "", phone: "", email: "", manager: "", hours: "", orderUrl: "", mapsUrl: "", sortOrder: 5, notes: "Closed (last sales 2023). Mark the Google listing as permanently closed." },
]);

const STARTER = "Starter template: edit it to match how your stores actually run.";
const checklists = rows("cl", [
  {
    name: "Opening",
    frequency: "Daily (opening)",
    store: "Both stores",
    sortOrder: 1,
    items: [
      "Lights, music and AC on",
      "POS and card reader on; cash float counted",
      "Fridge and cheese case temperatures logged (41°F or below)",
      "Cheese case faced: labels and prices showing",
      "Pastry and grab-and-go case stocked",
      "Coffee machine flushed and first shot dialled in",
      "Today's specials written on the chalkboard",
      "Today's catering pickups checked and prepped",
      "Floor, tables and bathroom checked",
      "Doors open on time",
    ].join("\n"),
    notes: STARTER,
  },
  {
    name: "Closing",
    frequency: "Daily (closing)",
    store: "Both stores",
    sortOrder: 2,
    items: [
      "Cheeses wrapped, labelled and dated",
      "Slicer and boards cleaned and sanitised",
      "Fridge temperatures logged",
      "Waste logged in HQ (what, how much, why)",
      "Coffee machine backflushed",
      "Tomorrow's catering orders checked",
      "Till counted and closed out",
      "Floors, bathroom and trash done",
      "Lights, AC and alarm set",
    ].join("\n"),
  },
  {
    name: "Weekly",
    frequency: "Weekly",
    store: "Both stores",
    sortOrder: 3,
    items: [
      "Stock count of the top items in HQ Inventory",
      "Rotate stock (first in, first out); check dates",
      "Supplier orders placed",
      "Deep clean slicer and display cases",
      "Content hour: film the shoot list and upload to Assets",
      "Reply to new reviews",
    ].join("\n"),
  },
  {
    name: "Monthly",
    frequency: "Monthly",
    store: "Both stores",
    sortOrder: 4,
    items: [
      "Fridge, freezer and coffee machine maintenance check",
      "Pest control visit done",
      "Fire extinguishers and first-aid kit checked",
      "Hours, menu and prices correct on Google, website and Square",
      "Staff schedule for next month shared",
    ].join("\n"),
  },
]);

const menu_items = rows(
  "mi",
  MENU_SEED.map(({ source, availability, ...m }) => ({
    market: "Miami",
    status: "Active",
    availability: availability ?? "Both stores",
    foodCost: null,
    code: "",
    description: "",
    serves: "",
    size: "",
    recipe: "",
    allergens: "",
    ...m,
    notes: source ?? "",
  })),
);

const madrid_locations = rows("ml", [
  { area: "Eloy Gonzalo / Plaza de Olavide (Chamberí)", status: "Shortlisted", sortOrder: 1 },
  { area: "Justicia", status: "Shortlisted", sortOrder: 2 },
  { area: "Salamanca", status: "Shortlisted", sortOrder: 3 },
  { area: "Goya", status: "Shortlisted", sortOrder: 4 },
  { area: "Juan Bravo / Velázquez", status: "Shortlisted", sortOrder: 5 },
  { area: "Centro", status: "Rejected", sortOrder: 6, licence: "On hold until licences are checked (Nov 4 meeting)." },
].map((l) => ({ address: "", link: "", sizeM2: null, rent: null, licence: "", pros: "", cons: "", ...l })));

const madrid_milestones = rows("mm", [
  { phase: "1. Concept & partner", title: "Shortlist 3 partner candidates (trust first)", due: "2027-01-08", status: "Not started" },
  { phase: "1. Concept & partner", title: "Concept focus group in Madrid (8–10 people)", due: "2027-01-11", status: "Not started" },
  { phase: "1. Concept & partner", title: "Business plan presentation updated", due: "2027-01-11", status: "Not started" },
  { phase: "2. Location", title: "Idealista shortlist sent to Ricardo", due: "2026-12-07", status: "Not started" },
  { phase: "2. Location", title: "Visit the top locations", due: null, status: "Not started" },
  { phase: "2. Location", title: "Venue signed", due: null, status: "Not started", notes: "Unlocks the public Spain accounts, the website and the waitlist." },
  { phase: "3. Licences & works", title: "Trademark check in Spain (OEPM)", due: "2027-02-08", status: "Not started" },
  { phase: "3. Licences & works", title: "Licence path confirmed for the venue", due: null, status: "Not started" },
  { phase: "3. Licences & works", title: "Quotes for identity, photography and signage", due: null, status: "Not started" },
  { phase: "4. Brand & launch prep", title: "Domain and Spain Instagram reserved", due: "2026-11-04", status: "Done" },
  { phase: "4. Brand & launch prep", title: "Spain TikTok and Facebook reserved", due: "2026-12-01", status: "In progress" },
  { phase: "4. Brand & launch prep", title: "Grid and highlights designed (Dairy Pastel)", due: "2027-02-08", status: "Not started" },
  { phase: "4. Brand & launch prep", title: "Madrid menu chosen from the Miami results", due: "2027-02-22", status: "Not started" },
  { phase: "4. Brand & launch prep", title: "24-post bank ready", due: "2027-04-24", status: "Not started" },
  { phase: "4. Brand & launch prep", title: "Creators and neighbourhood businesses list", due: "2027-04-24", status: "Not started" },
  { phase: "5. Opening", title: "Opening date confirmed", due: null, status: "Not started" },
  { phase: "5. Opening", title: "Loyalty card and waitlist live", due: null, status: "Not started" },
  { phase: "5. Opening", title: "Opening week", due: null, status: "Not started" },
].map((m) => ({ owner: "Elsa", notes: "", ...m })));

const madrid_budget = rows("mb", [
  ["Deposit and first months' rent", "Premises & deposit"],
  ["Works and fit-out", "Works & fit-out"],
  ["Kitchen and counter equipment", "Equipment"],
  ["Licences, lawyer and gestor", "Licences & legal"],
  ["Identity and signage", "Brand & design"],
  ["Photography", "Brand & design"],
  ["Launch campaign and creators", "Marketing & launch"],
  ["Opening stock", "Initial stock"],
  ["Hiring and training", "Staff & training"],
  ["Working capital (first 3 months)", "Working capital"],
].map(([item, category]) => ({ item, category, estimate: null, actual: null, notes: "" })));

const NOTION = (id: string) => `https://www.notion.so/${id}`;
const docs = rows("dc", [
  { title: "Miami marketing plan", category: "Plan", market: "Miami", url: NOTION("40eaf5f2ea778102b821ecd32ef0b3d9") },
  { title: "Spain marketing plan", category: "Plan", market: "Spain", url: NOTION("40eaf5f2ea778115b3fdd41ff61e74a0") },
  { title: "Content system and workflow", category: "Plan", market: "Both", url: NOTION("40faf5f2ea77815ba46ed314ab806d06") },
  { title: "Menu, price and cost re-engineering", category: "Plan", market: "Miami", url: NOTION("40faf5f2ea77815ca5dff2fd3dde8c3d") },
  { title: "Risks and decisions", category: "Plan", market: "Both", url: NOTION("40faf5f2ea7781d8ab46efe19c940ab7") },
  { title: "Shoot list for the stores", category: "Training", market: "Miami", url: NOTION("40faf5f2ea778158ba9afbfb32bcaf4d") },
  { title: "Main Cheese Course Drive", category: "Brand", market: "Both", url: "https://drive.google.com/drive/folders/1Z9mp-m_G9EsX584_07t5hIUv7hWy47WK" },
  { title: "Business plan changes (Madrid)", category: "Plan", market: "Spain", url: NOTION("40faf5f2ea7781e1a318fde9473055da") },
  { title: "Caterings photos and video", category: "Brand", market: "Miami", url: "https://drive.google.com/drive/folders/1vK74XCooei__IgUv93EisjXGSVyf3_7J" },
].map((d) => ({ store: "Both stores", body: "", owner: "Elsa", updatedOn: "2026-11-05", ...d })));

export const OPS_SEED: Partial<Record<RecordName, Rec[]>> = {
  stores,
  checklists,
  menu_items,
  madrid_locations,
  madrid_milestones,
  madrid_budget,
  docs,
  initiatives: INITIATIVES_SEED,
  initiative_steps: STEPS_SEED,
};
