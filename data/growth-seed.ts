// Starting content for Loyalty, Email and SEO & AI search. Miami items are proposals for Elsa,
// María and Ricardo to decide; the Spain loyalty rules are the ones Elsa already decided.
import type { Rec } from "@/lib/schema";

let n = 0;
const id = (p: string) => `${p}${String(++n).padStart(3, "0")}`;

type R = [name: string, kind: string, detail: string, status: string, cost?: number | null];
const rules = (market: "Miami" | "Spain", list: R[]): Rec[] =>
  list.map(([name, kind, detail, status, cost], i) => ({ id: id("lr"), name, kind, detail, status, cost: cost ?? null, sortOrder: i + 1, market }));

export const LOYALTY_RULES_SEED: Rec[] = [
  ...rules("Miami", [
    ["One stamp per visit", "How members earn", "One stamp for any purchase, at most one stamp a day. Members sign up with their phone number at the register.", "Proposal"],
    ["10 stamps = a free coffee or pastry", "Reward", "On the 10th stamp they get a coffee, a cookie or a croissant. The card then starts again.", "Proposal"],
    ["Birthday treat", "Birthday", "A free cookie or brownie in their birthday month, if they gave us the month.", "Idea"],
    ["No welcome gift at first", "Welcome gift", "Start without a sign-up gift to protect the margin; add one later if sign-ups are slow.", "Idea"],
    ["Rewards don't combine with other offers", "Limit or condition", "One reward per visit; catering orders earn one stamp like any other visit.", "Proposal"],
    ["Run it in Square Loyalty", "Tool / setup", "Both stores already use Square registers. Check with María whether Square Loyalty is on our plan and what it costs per month.", "Idea"],
  ]),
  ...rules("Spain", [
    ["Digital card on the phone only", "Tool / setup", "No paper cards.", "Decided"],
    ["One stamp a day", "How members earn", "Any purchase earns a stamp, at most one a day.", "Decided"],
    ["Every 10 visits, a free drink or pastry", "Reward", "", "Decided"],
    ["Small gift for the first 50–100 sign-ups", "Welcome gift", "Only if the numbers show the profit is protected.", "Proposal"],
  ]),
];

type E = [subject: string, sendDate: string | null, audience: string, goal: string, cta: string];
const emails = (market: "Miami" | "Spain", list: E[]): Rec[] =>
  list.map(([subject, sendDate, audience, goal, cta]) => ({
    id: id("em"),
    subject,
    preview: "",
    sendDate,
    status: "Idea",
    audience,
    goal,
    cta,
    link: "",
    sent: null,
    openRate: null,
    clickRate: null,
    orders: null,
    revenue: null,
    notes: "",
    market,
  }));

export const EMAIL_SEED: Rec[] = [
  ...emails("Miami", [
    ["Holiday platters are here (order by [date])", "2026-12-08", "Everyone", "Catering orders for the holidays", "Order your platter"],
    ["The cheese lover's gift guide", "2026-12-14", "Everyone", "Gift cards and cheese gifts", "Shop gifts"],
    ["Last call for holiday orders", "2026-12-19", "Catering customers", "Final catering push before the cut-off", "Order now"],
    ["Thank you for 2026, and what's new in January", "2027-01-06", "Everyone", "Bring people back after the holidays", "See the menu"],
  ]),
  ...emails("Spain", [["You're on the list: The Cheese Course is coming to Madrid", null, "Waitlist (Madrid)", "Welcome new sign-ups and keep them warm until opening", "Follow us on Instagram"]]),
];

type S = [item: string, area: string, why: string, owner: string];
const seo = (market: "Miami" | "Spain", list: S[]): Rec[] =>
  list.map(([item, area, why, owner], i) => ({ id: id("so"), item, area, why, owner, status: "To do", due: null, sortOrder: i + 1, market }));

export const SEO_TASKS_SEED: Rec[] = [
  ...seo("Miami", [
    ["Get owner access to both Google profiles", "Google profiles", "Nothing else on this list can be done without it.", "María"],
    ["Fill in every field on both profiles", "Google profiles", "Categories (cheese shop, café, caterer), hours including holidays, services, menu and ordering links. Complete profiles show up more.", "Elsa"],
    ["Mark Plantation, Doral and Pembroke as permanently closed", "Google profiles", "Closed stores that still show as open send customers to the wrong place.", "Elsa"],
    ["Add new photos to each profile every month", "Google profiles", "Fresh photos help profiles rank and get clicks.", "Store manager"],
    ["Post on each Google profile every week", "Google profiles", "Offers, new items and events show right in search.", "Elsa"],
    ["Claim Apple Business Connect", "Other listings", "Controls what Apple Maps and Siri say about us.", "Elsa"],
    ["Claim Bing Places", "Other listings", "Bing and Microsoft Copilot use it for local answers.", "Elsa"],
    ["Update Yelp and TripAdvisor", "Other listings", "Hours, photos, menu, and the closed stores.", "Elsa"],
    ["Same name, address and phone everywhere", "Other listings", "Search engines and AI tools trust businesses whose details match across sites.", "Elsa"],
    ["One page per store on the website", "Website", "Address, hours, phone, a map and photos, so people searching near each store find the right one.", "Elsa"],
    ["Put the menu on the website as text, not only a PDF or photo", "Website", "Google and AI tools can read text; they mostly can't read a menu photo.", "Elsa"],
    ["A catering page with platters, prices and how to order", "Website", "Catering searches are high value; answer them on one clear page.", "Elsa"],
    ["Clear page titles and descriptions", "Website", "e.g. 'Cheese Shop & Café in Weston, FL | The Cheese Course'. This is what shows in Google results.", "Elsa"],
    ["Add business details in the site's code (structured data)", "Website", "Tells Google and AI tools our address, hours and menu in a format they read directly.", "Elsa"],
    ["Set up Google Search Console and Analytics", "Website", "Shows which searches bring people to the site.", "Elsa"],
    ["Check the site is fast and easy on a phone", "Website", "Most local searches happen on phones.", "Elsa"],
    ["FAQ page answering real customer questions", "Content & FAQs", "Catering notice, delivery, allergies, gift cards, parking. AI tools often quote clear question-and-answer pages.", "Elsa"],
    ["'Our story' page: Miami's cheese shop since 2000", "Content & FAQs", "Gives Google, AI tools and journalists the facts to repeat.", "Elsa"],
    ["Reply to every review within 48 hours", "Reviews", "Replies and fresh reviews both help local ranking.", "Elsa"],
    ["Ask every catering customer for a Google review", "Reviews", "Catering customers are our happiest and most detailed reviewers.", "Store manager"],
    ["Check the AI answers tracker every month", "AI answers", "Ask the questions below in ChatGPT, Google and Perplexity and note whether we're mentioned.", "Elsa"],
    ["Get into local guides and best-of lists", "AI answers", "AI tools build answers from sites like Miami food blogs and best-of lists; being there gets us named.", "Elsa"],
    ["Make 'breakfast & brunch' obvious for Weston", "AI answers", "Nov 6 check: ChatGPT left us out of 'brunch in Weston' (named Little Hen and Café Bastille, on our street). Google category, website text, photos and reviews should all say brunch.", "Elsa"],
    ["Win 'office lunch catering in Weston'", "AI answers", "Nov 6 check: not named for office catering, twice. Needs the catering page with per-person prices, Google 'Catering' service and office reviews.", "Elsa"],
    ["Name the nearby areas on the Pinecrest page", "AI answers", "Nov 6 check: first for 'charcuterie Pinecrest' but missing for 'South Miami'. Mention South Miami, Palmetto Bay and Coral Gables.", "Elsa"],
    ["Confirm the hours and delivery details AI tools repeat", "AI answers", "ChatGPT quotes our hours, phone, '150+ cheeses' and daily delivery from 10am. If any is out of date, fix Google and the website first.", "María"],
  ]),
  ...seo("Spain", [
    ["Reserve the domain and a Spanish website page", "Website", "Ready to publish when the venue is signed.", "Elsa"],
    ["Create the Google profile for Madrid", "Google profiles", "Only once the address is final.", "Elsa"],
    ["Plan the FAQ in Spanish and English", "Content & FAQs", "Madrid customers search in both.", "Elsa"],
  ]),
];

const KW: [string, string][] = [
  ["cheese shop Weston", "Weston"],
  ["cheese shop near me", "Pinecrest"],
  ["charcuterie board Weston", "Weston"],
  ["charcuterie board Pinecrest", "Pinecrest"],
  ["catering Weston FL", "Weston"],
  ["office lunch catering Pinecrest", "Pinecrest"],
  ["cheese platter delivery Miami", "Both stores"],
  ["brunch Weston FL", "Weston"],
  ["gift basket Pinecrest", "Pinecrest"],
  ["fondue Miami", "Both stores"],
];
export const SEO_KEYWORDS_SEED: Rec[] = KW.map(([keyword, store]) => ({ id: id("kw"), keyword, store, page: "", position: null, target: 3, inMapPack: false, checked: null, notes: "", market: "Miami" }));

type Check = { q: string; engine: string; result: string; competitors?: string; fix?: string; checked?: string | null; market: "Miami" | "Spain" };
// Miami checks: Elsa asked these in ChatGPT on Nov 6, 2026.
const CHECKS: Check[] = [
  {
    q: "Cheese shop in Weston Florida",
    engine: "ChatGPT",
    result: "Yes, first",
    competitors: "Meat Town Express (listed as another option)",
    fix: "It quotes our hours (Mon–Wed 9–9, Thu–Sat 9–10, Sun 9–8), phone and '150+ cheeses'. Confirm those are right on Google and the website.",
    checked: "2026-11-06",
    market: "Miami",
  },
  {
    q: "Cheese gift ideas with delivery in south Florida",
    engine: "ChatGPT",
    result: "Yes, first",
    competitors: "Graze Craze (Cooper City)",
    fix: "It says Weston delivers daily from 10am until closing. Confirm that's still true; add a gift page so Pinecrest gets named too.",
    checked: "2026-11-06",
    market: "Miami",
  },
  {
    q: "Nice cafe brunch in Weston",
    engine: "ChatGPT",
    result: "Not mentioned",
    competitors: "Little Hen, Café Bastille Weston (1660 Market St, same street), Eclair Affaire Weston",
    fix: "Say 'breakfast & brunch' clearly: Google profile category and description, the breakfast menu as text on the website, and brunch photos. Ask happy brunch customers for reviews that mention brunch.",
    checked: "2026-11-06",
    market: "Miami",
  },
  {
    q: "Office lunch catering in Weston",
    engine: "ChatGPT",
    result: "Not mentioned",
    competitors: "Offerdahl's Off-The-Grill, Salumeria 104, Mitch's Westside Bagels",
    fix: "A catering page with platters, prices and 'serves 10'; add 'Catering' as a Google service; keep the ezCater listing complete; get office customers to leave reviews.",
    checked: "2026-11-06",
    market: "Miami",
  },
  {
    q: "Best office lunch catering in Weston for 15–30 people, healthy, delivery",
    engine: "ChatGPT",
    result: "Not mentioned",
    competitors: "Fresh Kitchen Weston (best overall), $18–25 per person",
    fix: "Show per-person pricing and healthy options (salad bowls, Greek, caprese) for groups on the catering page.",
    checked: "2026-11-06",
    market: "Miami",
  },
  {
    q: "Charcuterie board in south miami",
    engine: "ChatGPT",
    result: "Not mentioned",
    competitors: "The Board Miami, Antipasti Market, Babette Miami",
    fix: "Pinecrest is next to South Miami but we're not named. Mention South Miami, Palmetto Bay and Coral Gables on the Pinecrest page and Google profile description.",
    checked: "2026-11-06",
    market: "Miami",
  },
  {
    q: "Charcuterie board in Pinecrest",
    engine: "ChatGPT",
    result: "Yes, first",
    competitors: "The Board Miami, Charcuterie Bree",
    fix: "Named 'Best in Pinecrest' with a board at about $55. Keep the price and phone current.",
    checked: "2026-11-06",
    market: "Miami",
  },
  { q: "¿Dónde comer una buena tabla de quesos en Madrid?", engine: "ChatGPT", result: "Not checked", market: "Spain" },
  { q: "Best brunch with cheese in Madrid", engine: "Google AI Overview", result: "Not checked", market: "Spain" },
];
export const AEO_SEED: Rec[] = CHECKS.map((c) => ({ id: id("ai"), question: c.q, engine: c.engine, result: c.result, competitors: c.competitors ?? "", checked: c.checked ?? null, fix: c.fix ?? "", market: c.market }));
