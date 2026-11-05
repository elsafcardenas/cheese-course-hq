// The approved plan (Notion > Strategy), in a form the Plan tab can draw.
import type { Pillar } from "@/lib/types";

export const TWO_TRACKS = [
  {
    market: "Miami",
    title: "Keep the look, fix the engine",
    points: [
      "Weston and Pinecrest only; the current identity stays.",
      "Better hooks, real footage, 4 to 5 feed posts a week, English only.",
      "Fix every existing account rather than starting new ones.",
      "Menu, price and cost re-engineering run alongside, led by Elsa.",
    ],
  },
  {
    market: "Spain",
    title: "Build quietly, launch at the venue",
    points: [
      "The Cheese Course at country level: TheCheeseCourse.es and @thecheesecourse.es.",
      "Dairy Pastel look. Red wine and spritzes, no vermut.",
      "Accounts reserved and private until the venue is signed.",
      "Grid, highlights and a 24-post bank ready to switch on.",
    ],
  },
] as const;

export type Phase = { name: string; start: string; end: string; track: "Miami" | "Spain" | "Both"; note?: string };

export const TIMELINE_START = "2026-11-01";
export const TIMELINE_END = "2027-05-31";
export const TEAM_START = "2026-11-30";

export const PHASES: Phase[] = [
  { name: "Elsa prep (solo, before the team starts)", start: "2026-11-05", end: "2026-11-29", track: "Both", note: "Team start: Monday Nov 30" },
  { name: "Takeover: access, Luana handover, baseline", start: "2026-11-30", end: "2026-12-24", track: "Miami" },
  { name: "Profile, Linktree and templates v1", start: "2026-11-30", end: "2026-12-14", track: "Miami" },
  { name: "Content rhythm: 4–5 feed posts a week", start: "2026-12-07", end: "2027-05-24", track: "Miami", note: "Starts with December holiday content" },
  { name: "Google profiles claimed, Facebook revived", start: "2026-12-10", end: "2027-01-08", track: "Miami" },
  { name: "Re-engineering 1–2: Square data, menu matrix", start: "2026-12-10", end: "2027-01-04", track: "Miami" },
  { name: "Re-engineering 3–4: prices, then costs", start: "2027-01-07", end: "2027-03-08", track: "Miami" },
  { name: "TikTok live (reusing Reels)", start: "2027-01-28", end: "2027-05-24", track: "Miami" },
  { name: "Yelp claimed", start: "2027-02-25", end: "2027-03-24", track: "Miami" },
  { name: "Email through Square Marketing", start: "2027-03-25", end: "2027-05-24", track: "Miami" },
  { name: "Madrid: locations, partner shortlist, focus group", start: "2026-12-03", end: "2027-01-11", track: "Spain" },
  { name: "Business plan presentation update", start: "2026-12-25", end: "2027-01-11", track: "Spain" },
  { name: "Spain grid and highlights (Dairy Pastel)", start: "2026-12-25", end: "2027-02-08", track: "Spain" },
  { name: "Madrid menu from the Miami results", start: "2027-01-28", end: "2027-02-22", track: "Spain" },
  { name: "Spain 24-post bank, creators and neighbours lists", start: "2027-02-08", end: "2027-04-24", track: "Spain" },
];

export const TIMELINES = [
  { name: "Aggressive", length: "About 3 months", elsa: 24, luis: 14, fit: "Everything at once. Fast, but leaves no room for the re-engineering or Madrid." },
  { name: "Balanced", length: "About 6 months", elsa: 14, luis: 6, fit: "Miami rhythm first, platforms one at a time, Spain prep in the background.", recommended: true },
  { name: "Conservative", length: "9 to 12 months", elsa: 7, luis: 3, fit: "Gentle, but Miami results arrive after the Madrid decisions need them." },
];

export const PILLAR_NOTES: Record<Pillar, string> = {
  "Menu & food": "The food itself: cheese pulls, sandwiches, fondue, specials. Price and store in every caption.",
  "Cheese 101": "Teach one thing: a cheese, a cut, a pairing. The posts people save.",
  "Gifting & catering": "Platters, boards, gift cards, holiday orders. Always with a cut-off date and a link.",
  "Behind the scenes": "The team, the counter, the prep, the family story since 2000.",
  "Community & influencers": "Polls, regulars, neighbours, local creators, holiday hours.",
};

export const WORKFLOW = [
  { who: "Elsa", when: "Monday, Madrid morning (from Nov 30)", what: "Plans the week in Calendar. Every post gets a hook, footage and status Brief ready." },
  { who: "Elsa", when: "Before 14:00 Madrid (07:00 CDMX)", what: "Sends Luis the briefs from Toolkit > Brief for Luis, so they land at the start of his day." },
  { who: "Luis", when: "His day in CDMX", what: "Designs covers, carousels and Stories in the templates; drops finals in Drive; pastes the link in the post; sets Ready to post." },
  { who: "Elsa", when: "Tuesday to Thursday", what: "Edits Reels from Drive footage in Edits or Canva; sets In edit, then Ready to post." },
  { who: "Elsa", when: "Weekly", what: "Schedules in Meta Business Suite for Miami lunch (11:00–12:30 ET) or evening (18:00–20:00 ET) and sets Scheduled. Test and adjust." },
  { who: "Ricardo", when: "Fridays", what: "Looks at Calendar > For Ricardo and leaves comments. His opinion, not an approval step." },
  { who: "Elsa", when: "First Friday of the month", what: "Logs the KPIs, checks the video log median, and sends the monthly report." },
];

const notion = (id: string) => `https://www.notion.so/${id}`;
export const NOTION_LINKS = [
  { title: "HQ home", url: notion("3eaaf5f2ea77811d923ecbe8c5cd69a4") },
  { title: "Miami plan", url: notion("40eaf5f2ea778102b821ecd32ef0b3d9") },
  { title: "Spain plan", url: notion("40eaf5f2ea778115b3fdd41ff61e74a0") },
  { title: "Gap analysis", url: notion("40faf5f2ea7781f0b0a9cd519176425b") },
  { title: "Content audit", url: notion("40faf5f2ea7781fd957fc370b1a32d1e") },
  { title: "Content system", url: notion("40faf5f2ea77815ba46ed314ab806d06") },
  { title: "Shoot list", url: notion("40faf5f2ea778158ba9afbfb32bcaf4d") },
  { title: "Platform expansion", url: notion("40faf5f2ea778155a004e331b272dfeb") },
  { title: "Re-engineering", url: notion("40faf5f2ea77815ca5dff2fd3dde8c3d") },
  { title: "Timeline options", url: notion("40faf5f2ea778170afbcc8172d6e7e9e") },
  { title: "KPIs", url: notion("40faf5f2ea77812ea775d8dab2e0b7bd") },
  { title: "Risks and decisions", url: notion("40faf5f2ea7781d8ab46efe19c940ab7") },
  { title: "Business plan changes", url: notion("40faf5f2ea7781e1a318fde9473055da") },
  { title: "Nov 4 meeting", url: notion("40eaf5f2ea7780da9bc8cfd005accb79") },
];
