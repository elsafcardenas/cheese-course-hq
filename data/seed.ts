// Seed data, copied from the Notion workspace (The Cheese Course HQ) on 2026-11-05.
// Used by demo mode and by `npm run seed` to fill a fresh Supabase database.
import type {
  Asset,
  Campaign,
  Decision,
  Kpi,
  Meeting,
  PlatformRow,
  Post,
  SalesRow,
  Task,
  VideoLog,
} from "@/lib/types";

const KICKOFF = "m01";

type T = Omit<Task, "id" | "store" | "sourceMeeting" | "notes"> & { notes?: string; meeting?: boolean; store?: Task["store"] };
const t = (rows: T[]): Task[] =>
  rows.map((r, i) => ({
    id: `t${String(i + 1).padStart(2, "0")}`,
    title: r.title,
    owner: r.owner,
    market: r.market,
    workstream: r.workstream,
    priority: r.priority,
    status: r.status,
    deadline: r.deadline,
    notes: r.notes ?? "",
    store: r.store ?? null,
    sourceMeeting: r.meeting ? KICKOFF : null,
  }));

export const tasks: Task[] = t([
  // ---- From the Nov 4 meeting ----
  { title: "Review the existing reels and the raw footage in Drive; tag 20 usable clips in the Asset library", owner: "Elsa", market: "Miami", workstream: "Production system", priority: "High", status: "To do", deadline: "2026-11-10", meeting: true, notes: "Raw footage exists: JUAN > Videos para editar > VIDEOS PINECREST (141 clips, 3.2 GB, Aug 2025). No Weston raw footage found." },
  { title: "Send Juan a shoot list, only if a special edit is needed", owner: "Elsa", market: "Miami", workstream: "Production system", priority: "Low", status: "To do", deadline: null, meeting: true, notes: "Juan is the last resort (in Mexico, not fully on the brand). Use the shoot list generator in Toolkit." },
  { title: "Share finished reels with Ricardo for his opinion (weekly, not a gate)", owner: "Elsa", market: "Miami", workstream: "Miami content", priority: "Medium", status: "To do", deadline: "2026-11-13", meeting: true, notes: "He reviews in Calendar > For Ricardo and leaves notes in Ricardo's comments. Posting does not wait for him." },
  { title: "Send Ricardo the Idealista shortlist of Madrid locations", owner: "Elsa", market: "Spain", workstream: "Madrid business", priority: "Medium", status: "To do", deadline: "2026-11-13", meeting: true, notes: "Eloy Gonzalo / Plaza Olavide, Justicia, Salamanca, Goya, Juan Bravo / Velázquez. Centre ruled out until licences are checked." },
  { title: "Reserve TheCheeseCourse.es and the Spain Instagram", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "High", status: "Done", deadline: "2026-11-04", meeting: true, notes: "Done: domain reserved, @thecheesecourse.es created." },
  { title: "Identify a Madrid partner: shortlist of 3 people (trust first, not ideas)", owner: "Elsa", market: "Spain", workstream: "Madrid business", priority: "Medium", status: "To do", deadline: "2026-12-15", meeting: true },
  { title: "Run a concept focus group in Madrid (8 to 10 people)", owner: "Elsa", market: "Spain", workstream: "Madrid business", priority: "Medium", status: "To do", deadline: "2026-12-18", meeting: true, notes: "Test: three lines (dining, to-go, catering), ready-made cheese boards, prices, the one-hour work rule, wine and spritz at night." },
  { title: "Read the 'Dublin' document (Ricardo said he would read it first)", owner: "Ricardo", market: "Spain", workstream: "Madrid business", priority: "Low", status: "Waiting on someone", deadline: null, meeting: true, notes: "The auto-summary assigned this to Elsa, but the transcript shows Ricardo saying it. Ask him what it is." },
  { title: "Send Elsa the voice note about the content", owner: "Ricardo", market: "Miami", workstream: "Miami content", priority: "Low", status: "Waiting on someone", deadline: null, meeting: true },
  { title: "Add Elsa to the cloud Drive", owner: "María", market: "Miami", workstream: "Production system", priority: "Medium", status: "Done", deadline: "2026-11-04", meeting: true },
  // ---- Plan: this week and next ----
  { title: "Miami: get admin access via María (Instagram, Facebook page, Meta Business Suite and ad account, both Google profiles, Linktree, Square, website)", owner: "Elsa", market: "Miami", workstream: "Miami takeover", priority: "High", status: "Waiting on someone", deadline: "2026-11-07", notes: "Ask for admin (not editor) roles, and for every login to move to a company email." },
  { title: "Ask Luana (via María) for a handover: 90-day Instagram insights export, ad account, logins on a company email, posts in progress", owner: "Elsa", market: "Miami", workstream: "Miami takeover", priority: "High", status: "To do", deadline: "2026-11-09", notes: "Get this before she leaves: it is the only organic baseline we will have." },
  { title: "Brief Luis: Miami brand kit inside the current identity, plus Reel cover, carousel and Story templates", owner: "Elsa", market: "Miami", workstream: "Production system", priority: "High", status: "To do", deadline: "2026-11-06", notes: "Brief is ready to copy in Toolkit. Send before 14:00 Madrid (07:00 CDMX)." },
  { title: "Deliver Miami templates v1 (Reel cover, carousel, Story, Google post) in Adobe and Canva", owner: "Luis", market: "Miami", workstream: "Production system", priority: "High", status: "To do", deadline: "2026-11-12" },
  { title: "Edit the first 3 reels for the week of Nov 16 from existing footage", owner: "Elsa", market: "Miami", workstream: "Miami content", priority: "High", status: "To do", deadline: "2026-11-13" },
  { title: "Book a 45-minute call with Ricardo on the decisions list", owner: "Elsa", market: "Both", workstream: "Miami takeover", priority: "High", status: "To do", deadline: "2026-11-09", notes: "Agenda: who films in Miami, account ownership, holiday catering offer and cut-off dates, Square data, website control." },
  { title: "Fix the Instagram profile: bio, highlights, Linktree (add catering, website, gift cards; fix the http link)", owner: "Elsa + Luis", market: "Miami", workstream: "Miami takeover", priority: "High", status: "To do", deadline: "2026-11-16" },
  { title: "Claim both Google Business Profiles; mark the Plantation, Doral and Pembroke listings as closed", owner: "Elsa", market: "Miami", workstream: "Platform expansion", priority: "High", status: "To do", deadline: "2026-11-20" },
  { title: "Revive Facebook: update page info and turn on Instagram auto-share in Meta Business Suite", owner: "Elsa", market: "Miami", workstream: "Platform expansion", priority: "Medium", status: "To do", deadline: "2026-11-20" },
  { title: "TikTok: get access to the Weston account through the store, or open @thecheesecourse", owner: "Elsa", market: "Miami", workstream: "Platform expansion", priority: "Medium", status: "To do", deadline: "2026-12-04" },
  { title: "Website: list the fixes (closed stores, ordering links) and find out who controls the site", owner: "Elsa", market: "Miami", workstream: "Platform expansion", priority: "Medium", status: "To do", deadline: "2026-11-27" },
  { title: "Re-engineering 1: export 12 months of Square item sales for Weston and Pinecrest", owner: "Elsa", market: "Miami", workstream: "Re-engineering", priority: "High", status: "To do", deadline: "2026-11-20", notes: "Once Square is connected in Integrations, this fills itself." },
  { title: "Re-engineering 2: menu engineering matrix (stars, plowhorses, puzzles, dogs)", owner: "Elsa", market: "Miami", workstream: "Re-engineering", priority: "High", status: "To do", deadline: "2026-12-11" },
  { title: "Re-engineering 3: price review against 5 local competitors per store", owner: "Elsa", market: "Miami", workstream: "Re-engineering", priority: "Medium", status: "To do", deadline: "2027-01-15" },
  { title: "Re-engineering 4: cost review (top 10 ingredients by spend, cheese waste)", owner: "Elsa", market: "Miami", workstream: "Re-engineering", priority: "Medium", status: "To do", deadline: "2027-02-12" },
  { title: "Spain: design the grid layout and highlight covers in Dairy Pastel (nothing posted yet)", owner: "Luis", market: "Spain", workstream: "Spain brand prep", priority: "Low", status: "To do", deadline: "2027-01-15" },
  { title: "Spain: build a bank of 24 posts ready for go-live", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "Low", status: "To do", deadline: "2027-03-31" },
  { title: "Take the paid-media flags to the paid meeting", owner: "Elsa", market: "Both", workstream: "Paid (parked)", priority: "Medium", status: "To do", deadline: null, notes: "List on the KPIs tab." },
  { title: "Reconcile ad spend: $3.0K in Luana's report vs $9.0K Facebook ads in the marketing cash flow", owner: "Elsa", market: "Miami", workstream: "Paid (parked)", priority: "Medium", status: "To do", deadline: "2026-11-20" },
  { title: "Update the business plan presentation after the plan is approved", owner: "Elsa", market: "Spain", workstream: "Business plan", priority: "Low", status: "To do", deadline: "2026-12-18" },
  { title: "First monthly Miami report (then the first Friday of each month)", owner: "Elsa", market: "Miami", workstream: "Miami content", priority: "Medium", status: "To do", deadline: "2026-12-04" },
  { title: "Set up the Drive asset library: folders and file naming", owner: "Elsa", market: "Both", workstream: "Production system", priority: "High", status: "To do", deadline: "2026-11-10" },
  { title: "Line up filming in Miami: weekly content hour at each store, or a monthly freelancer (decide with Ricardo)", owner: "Elsa", market: "Miami", workstream: "Production system", priority: "High", status: "To do", deadline: "2026-11-13" },
  { title: "Spain: reserve TikTok and Facebook as @thecheesecourse.es (Instagram done)", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "High", status: "Doing", deadline: "2026-11-07", notes: "Keep all three private or with zero posts until the venue is signed." },
  // ---- For the store managers (they only see their own store's tasks) ----
  { title: "Weston: film this week's shoot list (Toolkit > Shoot list) and upload it on the Assets tab", owner: "Store manager", market: "Miami", workstream: "Production system", priority: "Medium", status: "To do", deadline: "2026-11-18", store: "Weston", notes: "Starts once Ricardo confirms the weekly content hour. 20 to 30 minutes, before the lunch rush." },
  { title: "Pinecrest: film this week's shoot list (Toolkit > Shoot list) and upload it on the Assets tab", owner: "Store manager", market: "Miami", workstream: "Production system", priority: "Medium", status: "To do", deadline: "2026-11-18", store: "Pinecrest", notes: "Starts once Ricardo confirms the weekly content hour. 20 to 30 minutes, before the lunch rush." },
  { title: "Both stores: send Thanksgiving and holiday hours so Google, Instagram and the website match", owner: "Store manager", market: "Miami", workstream: "Platform expansion", priority: "High", status: "To do", deadline: "2026-11-16", store: "Both stores" },
  // ---- Carried over from the old Madrid task list ----
  { title: "Check whether The Cheese Course is registered as a trademark in Spain (OEPM) before go-live", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "Medium", status: "To do", deadline: "2027-01-15" },
  { title: "Confirm final name", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "High", status: "Done", deadline: "2026-11-04", notes: "The Cheese Course, Spain-level brand (TheCheeseCourse.es)." },
  { title: "Confirm the Madrid aesthetic: Dairy Pastel", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "High", status: "Done", deadline: "2026-11-04" },
  { title: "Build creator shortlist by tier", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "Low", status: "Cancelled", deadline: null, notes: "Duplicate of the creators and businesses list task." },
  { title: "Miami: decide per platform whether to refresh the existing account or change it", owner: "Elsa", market: "Miami", workstream: "Platform expansion", priority: "High", status: "Done", deadline: "2026-11-05", notes: "Keep and fix every existing Miami account, nothing is renamed." },
  { title: "Madrid menu: pick items together, using the Miami menu engineering results", owner: "Elsa", market: "Spain", workstream: "Re-engineering", priority: "Medium", status: "To do", deadline: "2027-01-29" },
  { title: "Choose the staple lunch dish and the house pastry for first photos", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "Low", status: "To do", deadline: "2027-02-26" },
  { title: "Prepare the 16-week calendar around the licence, works and date milestones", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "Low", status: "To do", deadline: null, notes: "Starts when the venue is signed." },
  { title: "Design the measurement sheet by time of day and line of business", owner: "Elsa", market: "Spain", workstream: "Madrid business", priority: "Low", status: "To do", deadline: null },
  { title: "Choose loyalty card tool", owner: "Elsa", market: "Spain", workstream: "Madrid business", priority: "Low", status: "To do", deadline: null },
  { title: "Spain: list 40 Madrid creators by tier (nano to macro) and 100 neighbourhood businesses", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "Low", status: "To do", deadline: "2027-03-31" },
  { title: "Review and publish first 2 blog drafts", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "Low", status: "To do", deadline: null, notes: "Hold until the website exists. Remove vermut mentions first." },
  { title: "Request quotes for identity, photography and signage", owner: "Elsa", market: "Spain", workstream: "Madrid business", priority: "Low", status: "To do", deadline: null },
  { title: "Spain: open website, WhatsApp Business, LinkedIn, booking and maps listings at their milestones", owner: "Elsa", market: "Spain", workstream: "Platform expansion", priority: "Low", status: "To do", deadline: null },
  { title: "Build a minimal waitlist and the Quesómetro (unpublished until the venue is signed)", owner: "Elsa", market: "Spain", workstream: "Spain brand prep", priority: "Low", status: "To do", deadline: null },
]);

type P = Omit<Post, "id" | "assetUrl" | "dadComments" | "store" | "date" | "unlocksAt" | "footage"> & {
  store?: Post["store"];
  date?: string;
  unlocksAt?: string;
  footage?: string;
};
const p = (prefix: string, rows: P[]): Post[] =>
  rows.map((r, i) => ({
    id: `${prefix}${String(i + 1).padStart(2, "0")}`,
    assetUrl: "",
    dadComments: "",
    store: r.store ?? null,
    date: r.date ?? null,
    unlocksAt: r.unlocksAt ?? null,
    footage: r.footage ?? "",
    ...r,
  }));

export const posts: Post[] = [
  ...p("pm", [
    { title: "Thanksgiving board, built in 30 seconds", market: "Miami", store: "Both stores", date: "2026-11-16", format: "Reel", pillar: "Gifting & catering", platforms: ["Instagram", "Facebook"], owner: "Elsa + Luis", status: "Brief ready", hook: "On screen (0-1.5s): Hosting Thanksgiving? Let the board do the work. Caption: our cheese and charcuterie platter, ready to pick up at Weston or Pinecrest. Order by [cut-off] at the link in bio.", footage: "Drive > Caterings: Cheese Platter Prep; Cheese Platter with meats preparing. Speed-ramp the build, end on the overhead hero shot." },
    { title: "Google post: Thanksgiving platters, order by [date]", market: "Miami", store: "Both stores", date: "2026-11-16", format: "Photo", pillar: "Gifting & catering", platforms: ["Google Business"], owner: "Elsa", status: "Brief ready", hook: "Thanksgiving cheese and charcuterie platters for pick-up. Order by [cut-off]. Button: Order online.", footage: "Drive > Caterings: Cheese Platter and Dessert Platter (1)" },
    { title: "5 cheeses every Thanksgiving table needs", market: "Miami", store: "Both stores", date: "2026-11-17", format: "Carousel", pillar: "Cheese 101", platforms: ["Instagram", "Facebook"], owner: "Luis", status: "Brief ready", hook: "Slide 1: 5 cheeses every Thanksgiving table needs. Slides 2-6: one cheese each (name, origin, milk, how to serve). Slide 7: Ask our cheesemongers in Weston or Pinecrest. Save this for the 26th.", footage: "Drive > CHEESES. Confirm the five are in stock at both stores before design." },
    { title: "Mortadella sandwich, hot off the press", market: "Miami", store: "Both stores", date: "2026-11-18", format: "Reel", pillar: "Menu & food", platforms: ["Instagram", "Facebook"], owner: "Elsa", status: "Brief ready", hook: "On screen: Lunch in 7 seconds. Caption names the sandwich, its cheese, the price and both stores. CTA: order online.", footage: "Drive (root): Mortadella Sandwich. Open on the cut, close-up, natural sound of the knife." },
    { title: "It's 80°F. We're making fondue anyway.", market: "Miami", store: "Both stores", date: "2026-11-19", format: "Reel", pillar: "Menu & food", platforms: ["Instagram", "Facebook"], owner: "Elsa", status: "Brief ready", hook: "Hook text as title. Cheese pull in the first 2 seconds. Caption: what goes in, what you dip, where to get it. Confirm which store serves fondue.", footage: "Drive (root): Cheese fondue prep; Cheese Fondue Veggies. Drive > FONDUE." },
    { title: "Weekend Stories: Brie or gouda? poll + catering link", market: "Miami", store: "Both stores", date: "2026-11-20", format: "Story", pillar: "Community & influencers", platforms: ["Instagram Stories"], owner: "Elsa", status: "Brief ready", hook: "Frame 1: poll Brie or gouda? Frame 2: quiz Which cheese is made from sheep's milk? Frame 3: Thanksgiving platters, link sticker to catering.", footage: "Luis Story template + any cheese close-ups" },
    { title: "POV: your Saturday starts at Pinecrest", market: "Miami", store: "Pinecrest", date: "2026-11-21", format: "Reel", pillar: "Behind the scenes", platforms: ["Instagram", "Facebook"], owner: "Elsa", status: "Brief ready", hook: "On screen: POV: your Saturday starts here. Caption: hours, address, what to order first. Tag the location.", footage: "Drive > JUAN > Videos para editar > VIDEOS PINECREST (141 raw clips)" },
    { title: "48 hours left to order your Thanksgiving board", market: "Miami", store: "Both stores", date: "2026-11-23", format: "Reel", pillar: "Gifting & catering", platforms: ["Instagram", "Facebook"], owner: "Elsa + Luis", status: "Idea", hook: "On screen: 48 hours left to order your Thanksgiving board. Caption: platter options, sizes, pick-up days, cut-off.", footage: "Drive > Caterings: Final envoltura catering; Hummus Platter Prep; Desserts Platters." },
    { title: "Google post: Thanksgiving week hours", market: "Miami", store: "Both stores", date: "2026-11-23", format: "Photo", pillar: "Community & influencers", platforms: ["Google Business"], owner: "Elsa", status: "Idea", hook: "Holiday hours for Weston and Pinecrest. Update special hours on both profiles the same day.", footage: "Drive > Fachadas y Fotos Tiendas (Weston and Pinecrest only)" },
    { title: "How to cut cheese so your board looks catered", market: "Miami", store: "Both stores", date: "2026-11-24", format: "Carousel", pillar: "Cheese 101", platforms: ["Instagram", "Facebook"], owner: "Luis", status: "Idea", hook: "Slide 1: Cut it like a cheesemonger. Slides 2-6: wedge, wheel, log, block, crumbly. Last slide: or let us build it for you.", footage: "Luis illustrations on the carousel template" },
    { title: "Truffle and Parmesan fries: the side nobody shares", market: "Miami", store: "Both stores", date: "2026-11-25", format: "Reel", pillar: "Menu & food", platforms: ["Instagram", "Facebook"], owner: "Elsa", status: "Idea", hook: "On screen: The side nobody shares. Parmesan falling in the first second. Caption: name, price, both stores.", footage: "Drive (root): Truffle & Parmesan Fries (Video) and photos (1)-(4)" },
    { title: "Happy Thanksgiving + holiday hours", market: "Miami", store: "Both stores", date: "2026-11-26", format: "Story", pillar: "Community & influencers", platforms: ["Instagram Stories", "Facebook"], owner: "Elsa", status: "Idea", hook: "Short thank-you from the team + hours for both stores.", footage: "Luis Story template" },
    { title: "Small Business Saturday: Miami's cheese shop since 2000", market: "Miami", store: "Both stores", date: "2026-11-28", format: "Reel", pillar: "Behind the scenes", platforms: ["Instagram", "Facebook", "Google Business"], owner: "Elsa", status: "Idea", hook: "On screen: Since 2000, one cheese at a time. Caption: the family story in 3 lines, both addresses, invite to come in today.", footage: "Drive > Fachadas y Fotos Tiendas (Weston and Pinecrest only) + VIDEOS PINECREST raw" },
    { title: "Holiday gift guide for cheese lovers", market: "Miami", store: "Both stores", date: "2026-11-29", format: "Carousel", pillar: "Gifting & catering", platforms: ["Instagram", "Facebook"], owner: "Luis", status: "Idea", hook: "Slide 1: The gift guide for the cheese lover in your life. Slides: gift card, a cheese trio, a board, an accompaniment. Confirm the offer with Ricardo first.", footage: "Drive > CHEESES, BOARDS, PERFECT PAIRINGS" },
  ]),
  ...p("ps", [
    { title: "Blog: Qué queso con qué vino o spritz", market: "Spain", format: "Blog post", pillar: "Cheese 101", platforms: ["Blog", "Newsletter"], owner: "Elsa", status: "Idea", hook: "", unlocksAt: "Milestone 0 - name and accounts" },
    { title: "How to build a cheese board in 60 seconds", market: "Spain", format: "Reel", pillar: "Cheese 101", platforms: ["Instagram", "TikTok"], owner: "Elsa", status: "Idea", hook: "", unlocksAt: "Milestone 0 - name and accounts" },
    { title: "Why Spain? Our story", market: "Spain", format: "Reel", pillar: "Behind the scenes", platforms: ["Instagram", "TikTok"], owner: "Elsa", status: "Idea", hook: "Diario de apertura #1", unlocksAt: "Milestone 0 - name and accounts" },
    { title: "Which cheese with which wine or spritz", market: "Spain", format: "Carousel", pillar: "Cheese 101", platforms: ["Instagram"], owner: "Elsa + Luis", status: "Idea", hook: "", unlocksAt: "Milestone 0 - name and accounts" },
    { title: "Blog: Cómo hacer una tabla de quesos perfecta", market: "Spain", format: "Blog post", pillar: "Cheese 101", platforms: ["Blog", "Instagram"], owner: "Elsa", status: "Idea", hook: "", unlocksAt: "Milestone 0 - name and accounts" },
    { title: "Meet the cheeses: Cheese of the Week #1", market: "Spain", format: "Carousel", pillar: "Cheese 101", platforms: ["Instagram"], owner: "Elsa + Luis", status: "Idea", hook: "Un queso, una historia", unlocksAt: "Milestone 0 - name and accounts" },
    { title: "Croque monsieur cheese pull", market: "Spain", format: "Reel", pillar: "Menu & food", platforms: ["Instagram", "TikTok"], owner: "Elsa", status: "Idea", hook: "", unlocksAt: "Milestone 2 - licence and firm date" },
    { title: "Butter croissant, cut open", market: "Spain", format: "Reel", pillar: "Menu & food", platforms: ["Instagram", "TikTok"], owner: "Elsa", status: "Idea", hook: "", unlocksAt: "Milestone 2 - licence and firm date" },
    { title: "Gift box teaser", market: "Spain", format: "Reel", pillar: "Gifting & catering", platforms: ["Instagram", "Newsletter"], owner: "Elsa + Luis", status: "Idea", hook: "", unlocksAt: "Milestone 2 - licence and firm date" },
    { title: "Creator countdown announcement", market: "Spain", format: "Story", pillar: "Community & influencers", platforms: ["Instagram Stories"], owner: "Elsa", status: "Idea", hook: "", unlocksAt: "Milestone 2 - licence and firm date" },
    { title: "Behind the counter: first team intro", market: "Spain", format: "Reel", pillar: "Behind the scenes", platforms: ["Instagram", "TikTok"], owner: "Elsa", status: "Idea", hook: "Detrás del mostrador", unlocksAt: "Opening week" },
  ]),
];

type PL = Omit<PlatformRow, "id">;
const pl = (rows: PL[]): PlatformRow[] => rows.map((r, i) => ({ id: `pl${String(i + 1).padStart(2, "0")}`, ...r }));

export const platforms: PlatformRow[] = pl([
  { name: "Instagram @thecheesecourse", market: "Miami", order: 1, status: "Revamp in progress", access: "Waiting to obtain", priority: "Now", role: "Discovery", handleUrl: "https://www.instagram.com/thecheesecourse/", opens: "Now: take over from Luana", cadence: "4 Reels + 1 carousel a week; Stories 5 days a week", purpose: "Main channel. 73.1K followers but recent Reels reach under 1% of them: fix hooks, quality and consistency.", checklist: "Admin access; new bio; redo highlights; Linktree fixed; insights export saved" },
  { name: "Google Business Profile: Weston", market: "Miami", order: 2, status: "Not created", access: "Waiting to obtain", priority: "Now", role: "Search", handleUrl: "", opens: "Weeks 1-3", cadence: "1 post a week; 5 new photos a month; answer every review within 48 hours", purpose: "Weston is about 73% of 2026 sales. 'Cheese shop near me' and 'catering Weston' land here first.", checklist: "Claim or get manager access; hours, menu link, ordering link, categories, photos" },
  { name: "Google Business Profile: Pinecrest", market: "Miami", order: 3, status: "Not created", access: "Waiting to obtain", priority: "Now", role: "Search", handleUrl: "", opens: "Weeks 1-3", cadence: "1 post a week; 5 new photos a month; answer every review within 48 hours", purpose: "Local search and reviews for Pinecrest.", checklist: "Same as Weston; also mark Plantation, Doral and Pembroke listings as permanently closed" },
  { name: "Facebook page", market: "Miami", order: 4, status: "Dormant", access: "Waiting to obtain", priority: "Now", role: "Community", handleUrl: "https://www.facebook.com/thecheesecourse", opens: "Weeks 2-4", cadence: "Auto-share every Instagram feed post; events and catering posts", purpose: "13K followers, last public post Sept 2025. Near-zero effort to revive with auto-share.", checklist: "Update intro, website, hours; connect Instagram auto-share in Meta Business Suite" },
  { name: "Linktree and website", market: "Miami", order: 5, status: "Revamp in progress", access: "Waiting to obtain", priority: "Now", role: "Conversion", handleUrl: "https://linktr.ee/TheCheeseCourse", opens: "Weeks 1-3", cadence: "Update with every campaign", purpose: "Linktree has only 3 links (one goes back to Instagram). Website still lists closed stores.", checklist: "Links: Order Weston, Order Pinecrest, Catering, Menu, Gift cards, Directions; UTM tags; fix http link" },
  { name: "TikTok", market: "Miami", order: 6, status: "Not created", access: "Waiting to obtain", priority: "Next (month 2-3)", role: "Discovery", handleUrl: "", opens: "Month 2, once Instagram runs on rhythm", cadence: "3 a week, reusing the Reels", purpose: "Reach new local food lovers. A Weston TikTok exists but nobody has access.", checklist: "Recover or create; same bio and links as Instagram" },
  { name: "Email (Square Marketing)", market: "Miami", order: 7, status: "Not created", access: "Waiting to obtain", priority: "Later", role: "Retention", handleUrl: "", opens: "Month 4", cadence: "2 emails a month", purpose: "Square already holds customer contacts from orders. Owned channel.", checklist: "Check how many opted-in contacts exist per store first" },
  { name: "Yelp", market: "Miami", order: 8, status: "Not created", access: "Waiting to obtain", priority: "Later", role: "Search", handleUrl: "", opens: "Month 3", cadence: "Answer reviews weekly", purpose: "Reputation in US local search.", checklist: "Claim; photos; hours; reply to recent reviews" },
  { name: "Pinterest", market: "Miami", order: 9, status: "Not created", access: "New: nothing to obtain", priority: "Later", role: "Search", handleUrl: "", opens: "Month 5 or later", cadence: "5 pins a week, scheduled", purpose: "Long-life search for cheese boards and party catering ideas.", checklist: "Business account; boards: Cheese boards, Catering, Holidays" },
  { name: "Instagram @thecheesecourse.es", market: "Spain", order: 1, status: "Reserved (private)", access: "Have access", priority: "Before launch", role: "Discovery", handleUrl: "https://www.instagram.com/thecheesecourse.es/", opens: "Created Nov 2026; public when the venue is signed", cadence: "3 Reels + 1 carousel a week after go-live", purpose: "Main discovery channel for food in Madrid.", checklist: "Grid and highlights designed; 24-post bank ready" },
  { name: "TikTok @thecheesecourse.es", market: "Spain", order: 2, status: "Not created", access: "New: nothing to obtain", priority: "Before launch", role: "Discovery", handleUrl: "", opens: "Reserve now; public with Instagram", cadence: "3 a week after go-live", purpose: "Reach; reuses Reels.", checklist: "Reserve the handle" },
  { name: "Facebook page (Spain)", market: "Spain", order: 3, status: "Not created", access: "New: nothing to obtain", priority: "Before launch", role: "Community", handleUrl: "", opens: "Reserve now; empty until the venue is signed", cadence: "Auto-share from Instagram after go-live", purpose: "Reserve the name; later events and catering.", checklist: "Create page The Cheese Course España; username thecheesecourse.es" },
  { name: "Website TheCheeseCourse.es", market: "Spain", order: 4, status: "Reserved (private)", access: "Have access", priority: "Before launch", role: "Conversion", handleUrl: "", opens: "Landing page with waitlist when the venue is signed", cadence: "Always on", purpose: "Waitlist is the pre-launch metric.", checklist: "Landing, waitlist with GDPR consent, Quesómetro" },
  { name: "Newsletter + digital loyalty card", market: "Spain", order: 5, status: "Not created", access: "New: nothing to obtain", priority: "At launch", role: "Retention", handleUrl: "", opens: "Waitlist at venue signed; loyalty card on opening day", cadence: "Weekly before opening", purpose: "Owned audience before opening.", checklist: "Email tool with GDPR consent" },
  { name: "WhatsApp Business", market: "Spain", order: 6, status: "Not created", access: "New: nothing to obtain", priority: "At launch", role: "Conversion", handleUrl: "", opens: "4 weeks before opening", cadence: "Daily specials", purpose: "Catering and box orders; Spain runs on WhatsApp.", checklist: "Business number; catalogue" },
  { name: "Google Business Profile (Madrid)", market: "Spain", order: 7, status: "Not created", access: "New: nothing to obtain", priority: "At launch", role: "Search", handleUrl: "", opens: "When the address and licence are confirmed", cadence: "Weekly post and photos", purpose: "Local search from day one.", checklist: "Verify address" },
  { name: "Booking and maps (TheFork, Apple Maps, TripAdvisor)", market: "Spain", order: 8, status: "Not created", access: "New: nothing to obtain", priority: "At launch", role: "Conversion", handleUrl: "", opens: "Opening week", cadence: "Keep facts identical everywhere", purpose: "Reservations and visitors.", checklist: "Compare booking commissions" },
  { name: "LinkedIn company page", market: "Spain", order: 9, status: "Not created", access: "New: nothing to obtain", priority: "At launch", role: "Conversion", handleUrl: "", opens: "Opening: catering for Madrid offices", cadence: "Twice a month", purpose: "Catering for offices is a lead line of business.", checklist: "Company page; catering menu PDF" },
  { name: "Blog", market: "Spain", order: 10, status: "Not created", access: "New: nothing to obtain", priority: "After launch", role: "Search", handleUrl: "", opens: "With the website", cadence: "1 to 2 posts a week", purpose: "Spanish search: brunch, tabla de quesos, catering.", checklist: "10 drafts already in Notion Blog Tracker" },
  { name: "Pinterest", market: "Spain", order: 11, status: "Not created", access: "New: nothing to obtain", priority: "After launch", role: "Search", handleUrl: "", opens: "After launch", cadence: "Weekly", purpose: "Gift boxes and boards.", checklist: "" },
]);

type D = Omit<Decision, "id">;
export const decisions: Decision[] = ([
  { decision: "Two tracks: Miami keeps its current look and feel; the new concept is for Madrid and future openings", date: "2026-11-04", decidedBy: "Ricardo", market: "Both", area: "Brand", status: "Decided", source: "Nov 4 meeting" },
  { decision: "Name stays The Cheese Course; the Spain brand is country-level (TheCheeseCourse.es, @thecheesecourse.es)", date: "2026-11-04", decidedBy: "Elsa and Ricardo", market: "Spain", area: "Brand", status: "Decided", source: "Nov 4 meeting; confirmed Nov 5" },
  { decision: "Madrid aesthetic: Dairy Pastel", date: "2026-11-04", decidedBy: "Elsa", market: "Spain", area: "Brand", status: "Decided", source: "Nov 4 meeting notes" },
  { decision: "No vermut in Madrid; red wine and spritzes yes", date: "2026-11-04", decidedBy: "Elsa and Ricardo", market: "Spain", area: "Menu", status: "Decided", source: "Nov 4 notes; confirmed Nov 5. Replaces the earlier vermut plan." },
  { decision: "Elsa edits the reels herself from existing footage; Juan only for special edits", date: "2026-11-04", decidedBy: "Ricardo", market: "Miami", area: "Team", status: "Decided", source: "Nov 4 meeting" },
  { decision: "No approval gate: Ricardo sees content in a review view and gives his opinion", date: "2026-11-05", decidedBy: "Elsa", market: "Both", area: "Content", status: "Decided", source: "Elsa, Nov 5" },
  { decision: "Spain social stays private until the venue is signed; plan content and layout now; reserve TikTok and Facebook", date: "2026-11-05", decidedBy: "Elsa", market: "Spain", area: "Platforms", status: "Decided", source: "Elsa, Nov 5" },
  { decision: "Miami content is in English only", date: "2026-11-05", decidedBy: "Elsa", market: "Miami", area: "Content", status: "Decided", source: "Elsa, Nov 5" },
  { decision: "Elsa owns all four re-engineering jobs: social media, costs, menu, prices", date: "2026-11-05", decidedBy: "Elsa", market: "Miami", area: "Business", status: "Decided", source: "Elsa, Nov 5" },
  { decision: "Madrid structure: Elsa holds the Madrid franchise, opens one location with a partner, then franchises", date: "2026-11-04", decidedBy: "Ricardo", market: "Spain", area: "Business", status: "Decided", source: "Nov 4 meeting" },
  { decision: "Organic only for now; paid gets its own meeting", date: "2026-11-05", decidedBy: "Elsa and Ricardo", market: "Both", area: "Business", status: "Decided", source: "Elsa's brief" },
  { decision: "Who films in Miami every week (store staff content hour, or a monthly freelancer)?", date: null, decidedBy: "", market: "Miami", area: "Team", status: "Needs Ricardo", source: "Plan, Risks and decisions" },
  { decision: "All accounts owned by the company (company email, Meta Business Portfolio), with Elsa as admin", date: null, decidedBy: "", market: "Both", area: "Platforms", status: "Needs Ricardo", source: "Plan, Risks and decisions" },
  { decision: "Holiday catering offer: menu, prices and order cut-off dates for Thanksgiving and December", date: null, decidedBy: "", market: "Miami", area: "Menu", status: "Needs Ricardo", source: "Plan, 2-week calendar" },
  { decision: "Recommended timeline: Balanced (about 6 months)", date: null, decidedBy: "", market: "Both", area: "Business", status: "Needs Ricardo", source: "Timeline options" },
] as D[]).map((d, i) => ({ id: `d${String(i + 1).padStart(2, "0")}`, ...d }));

export const meetings: Meeting[] = [
  {
    id: KICKOFF,
    title: "Kickoff with Ricardo: Madrid opening and content strategy",
    date: "2026-11-04",
    attendees: ["Elsa", "Ricardo", "María"],
    type: "Strategy",
    market: "Both",
    keyDecisions:
      "Two tracks: Miami keeps current look and feel (short term), new concept for Madrid (medium term). Elsa edits reels from existing raw footage; Juan only as last resort; Luis does graphics. Spain gets its own Instagram (Spain-level, TheCheeseCourse.es). Dairy Pastel for Madrid. No vermut; red wine and spritzes yes. Elsa owns the Madrid franchise and needs a partner. Re-engineering order: social media, costs, menu, prices.",
    notes: "Full transcript and Spanish summary in Notion > Meetings > Meeting log.",
  },
];

export const campaigns: Campaign[] = [
  { id: "c01", name: "Thanksgiving catering: boards and platters", market: "Miami", phase: "Seasonal", status: "Planning", start: "2026-11-16", end: "2026-11-25", goal: "Catering orders from Weston and Pinecrest before the cut-off (date to confirm with Ricardo)." },
  { id: "c02", name: "Small Business Saturday: Miami's cheese shop since 2000", market: "Miami", phase: "Seasonal", status: "Planning", start: "2026-11-28", end: "2026-11-28", goal: "Store visits on Nov 28; story of the brand." },
  { id: "c03", name: "Holiday boards and gift cards", market: "Miami", phase: "Seasonal", status: "Planning", start: "2026-11-29", end: "2026-12-24", goal: "Holiday catering, cheese for gifting, gift cards (offer to confirm with Ricardo)." },
  { id: "c04", name: "Pre-opening countdown with Madrid creators", market: "Spain", phase: "Pre-opening", status: "Planning", start: null, end: null, goal: "Nano and micro first, macro and press once the date is firm." },
  { id: "c05", name: "First 50 to 100 sign-ups gift", market: "Spain", phase: "Opening", status: "Planning", start: null, end: null, goal: "Only if profit is protected; gift tied to a purchase." },
  { id: "c06", name: "Digital loyalty card launch", market: "Spain", phase: "Opening", status: "Planning", start: null, end: null, goal: "Every 10 visits a drink or pastry; one stamp a day." },
  { id: "c07", name: "Gift box and catering push", market: "Spain", phase: "Post-opening", status: "Planning", start: null, end: null, goal: "Boxes and catering for Madrid offices." },
];

type K = Omit<Kpi, "id" | "sort">;
export const kpis: Kpi[] = ([
  { market: "Miami", platform: "Instagram", metric: "Median Reel views", baseline: "~670 (last 9 Reels)", baselineValue: 672, target3: "2,000", target3Value: 2000, target6: "4,000+", target6Value: 4000, why: "About 5% of 73.1K followers" },
  { market: "Miami", platform: "Instagram", metric: "Engagement rate on views (%)", baseline: "Measure in month 1", baselineValue: null, target3: "2.0%", target3Value: 2, target6: "2.5%", target6Value: 2.5, why: "Food & beverage benchmark on Instagram: 2.0-2.5% (Dash Social 2026)" },
  { market: "Miami", platform: "Instagram", metric: "Feed posts per week", baseline: "~2 (October)", baselineValue: 2, target3: "4-5", target3Value: 4.5, target6: "5", target6Value: 5, why: "Content system rhythm" },
  { market: "Miami", platform: "Instagram", metric: "Link clicks per month", baseline: "Measure in month 1", baselineValue: null, target3: "+25%", target3Value: null, target6: "+50%", target6Value: null, why: "Content turning into action" },
  { market: "Miami", platform: "Instagram", metric: "Followers", baseline: "73,100", baselineValue: 73100, target3: "Track only", target3Value: null, target6: "Track only", target6Value: null, why: "Not a goal on its own" },
  { market: "Miami", platform: "Google (each store)", metric: "Calls + directions + website clicks", baseline: "Month 1", baselineValue: null, target3: "+10%", target3Value: null, target6: "+25%", target6Value: null, why: "Highest-intent channel" },
  { market: "Miami", platform: "Google (each store)", metric: "New reviews per month", baseline: "Month 1", baselineValue: null, target3: "6", target3Value: 6, target6: "8+", target6Value: 8, why: "Reputation" },
  { market: "Miami", platform: "TikTok", metric: "Median views per video", baseline: "Not live", baselineValue: null, target3: "500", target3Value: 500, target6: "1,000", target6Value: 1000, why: "Opens month 2" },
  { market: "Miami", platform: "All", metric: "Catering enquiries per month", baseline: "Month 1", baselineValue: null, target3: "Track", target3Value: null, target6: "+30%", target6Value: null, why: "Business result" },
  { market: "Miami", platform: "All", metric: "Posting consistency (%)", baseline: "Unknown", baselineValue: null, target3: "90%", target3Value: 90, target6: "90%+", target6Value: 90, why: "Posted ÷ planned" },
  { market: "Spain", platform: "Prep", metric: "Posts ready in the bank", baseline: "11 ideas", baselineValue: 0, target3: "12", target3Value: 12, target6: "24", target6Value: 24, why: "Ready to switch on at venue signed" },
  { market: "Spain", platform: "Website", metric: "Waitlist signups", baseline: "Not live", baselineValue: null, target3: "300", target3Value: 300, target6: "700", target6Value: 700, why: "Pitch assumptions, after go-live" },
] as K[]).map((k, i) => ({ id: `k${String(i + 1).padStart(2, "0")}`, sort: i, ...k }));

export const videoLog: VideoLog[] = (
  [
    ["Espresso and cookie jar", 5487, "Menu & food", "Most recent. Likely boosted."],
    ["Chalkboard welcome sign", 329, "Community & influencers", ""],
    ["Coffee and cake slice", 586, "Menu & food", ""],
    ["Retail basket of chips", 794, "Behind the scenes", ""],
    ["Eggs and smoked salmon", 1468, "Menu & food", ""],
    ["Brownie", 633, "Menu & food", ""],
    ["Chicken salad sandwich", 632, "Menu & food", ""],
    ["Chalkboard weekly specials", 672, "Community & influencers", ""],
    ["Four soups, overhead", 4275, "Menu & food", "Likely boosted."],
  ] as const
).map(([title, views, pillar, note], i) => ({
  id: `v${String(i + 1).padStart(2, "0")}`,
  platform: "Instagram" as const,
  title,
  postedOn: null,
  views,
  likes: null,
  comments: null,
  saves: null,
  shares: null,
  pillar,
  source: "manual" as const,
  externalId: null,
  note: note ? `${note} Counted from the public profile on Nov 5, 2026 (newest first).` : "Counted from the public profile on Nov 5, 2026 (newest first).",
}));

export const sales: SalesRow[] = [
  ["Weston", "2023", 2784.0], ["Weston", "2024", 2615.2], ["Weston", "2025", 2581.8], ["Weston", "2026 Jan-Aug", 1679.4],
  ["Pinecrest", "2023", 1117.7], ["Pinecrest", "2024", 903.0], ["Pinecrest", "2025", 809.7], ["Pinecrest", "2026 Jan-Aug", 453.4],
  ["Plantation", "2023", 844.4], ["Plantation", "2024", 680.1], ["Plantation", "2025", 590.3], ["Plantation", "2026 Jan-Aug", 178.1],
  ["Doral", "2023", 484.7], ["Doral", "2024", 181.7],
  ["Pembroke", "2023", 333.6],
].map(([store, period, netSalesK]) => ({ store: store as string, period: period as string, netSalesK: netSalesK as number }));

const DRIVE = "https://drive.google.com/drive/folders/";
export const assets: Asset[] = ([
  ["Main Cheese Course Drive", null, `${DRIVE}1Z9mp-m_G9EsX584_07t5hIUv7hWy47WK`, "Shared folder (owner: María). Product folders by dish."],
  ["Raw videos: Pinecrest (141 clips, Aug 2025)", "Pinecrest", `${DRIVE}17gGskKOZqU1qQ_aonGBSwRTgfZbJbMYs`, "Juan's unedited footage. Best source for Behind the scenes."],
  ["Raw photos: Pinecrest", "Pinecrest", `${DRIVE}10Uy4MNtjtRCElbaPaygON3hV-EBCVzSK`, ""],
  ["Raw videos: Plantation (closed store)", null, `${DRIVE}1jfSM80V3JPO8KGtUrSmjYYVhK92mMGKq`, "Product close-ups only; never show the store."],
  ["Caterings", "Both stores", `${DRIVE}1vK74XCooei__IgUv93EisjXGSVyf3_7J`, "Platter prep, wrapping, finished platters (May and Aug 2026 subfolders)."],
  ["Weston: no raw footage yet", "Weston", "", "Send the first shoot list here. Weston is about 73% of 2026 sales."],
] as const).map(([title, store, url, notes], i) => ({
  id: `a${String(i + 1).padStart(2, "0")}`,
  title,
  store: store as Asset["store"],
  kind: url ? ("Drive folder" as const) : ("Link" as const),
  url,
  notes,
  createdAt: "2026-11-05",
}));
