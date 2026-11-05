// Starting strategy goals and campaigns, with their steps. Everything is editable by the admin on
// Marketing → Strategy & campaigns. Dates follow the plan: the team starts on Nov 30, 2026.
import type { Rec } from "@/lib/schema";

type Step = { title: string; owner: string; start?: string | null; end?: string | null; status?: string; subs?: Omit<Step, "subs">[] };
type Init = Omit<Rec, "id"> & { steps?: Step[] };

const LIST: Init[] = [
  {
    name: "Make Instagram reach people again",
    kind: "Strategy goal",
    status: "Planning",
    owner: "Elsa",
    market: "Miami",
    start: "2026-11-30",
    end: "2027-02-26",
    goal: "Median Reel views from about 670 to 2,000 in 3 months, and 4,000 in 6.",
    audience: "Locals in Weston and Pinecrest, office managers who order catering, gift buyers",
    channels: "Instagram Reels, carousels and Stories",
    measure: "Median Reel views and engagement rate (Performance page)",
    steps: [
      {
        title: "Get admin access to every account",
        owner: "Elsa",
        start: "2026-11-30",
        end: "2026-12-04",
        subs: [
          { title: "Instagram and Meta Business Suite (from María)", owner: "María", start: "2026-11-30", end: "2026-12-02" },
          { title: "Linktree and website logins", owner: "María", start: "2026-11-30", end: "2026-12-02" },
          { title: "90-day Instagram insights export saved", owner: "Elsa", start: "2026-12-02", end: "2026-12-04" },
        ],
      },
      {
        title: "New look: brand kit and templates",
        owner: "Luis",
        start: "2026-12-01",
        end: "2026-12-11",
        subs: [
          { title: "One-page brand kit (logo, colours, fonts, photo style)", owner: "Luis", start: "2026-12-01", end: "2026-12-04" },
          { title: "Reel cover and carousel templates", owner: "Luis", start: "2026-12-04", end: "2026-12-09" },
          { title: "Story templates: poll, quiz, holiday hours", owner: "Luis", start: "2026-12-07", end: "2026-12-11" },
        ],
      },
      {
        title: "Weekly rhythm: 4 Reels and 1 carousel",
        owner: "Elsa + Luis",
        start: "2026-12-07",
        end: "2027-02-26",
        subs: [
          { title: "Monday: plan the week in the calendar", owner: "Elsa" },
          { title: "Send the shoot list to both stores", owner: "Elsa" },
          { title: "Friday: check the numbers and pick what to repeat", owner: "Elsa" },
        ],
      },
      { title: "3-month review with Ricardo", owner: "Elsa", start: "2027-02-22", end: "2027-02-26" },
    ],
  },
  {
    name: "Make Google our number one local channel",
    kind: "Strategy goal",
    status: "Planning",
    owner: "Elsa",
    market: "Miami",
    start: "2026-12-01",
    end: "2027-02-26",
    goal: "More calls, directions and website clicks from both Google profiles: +10% in 3 months, +25% in 6.",
    audience: "People searching 'cheese shop near me' and 'catering Weston / Pinecrest'",
    channels: "Google Business Profile (Weston and Pinecrest)",
    measure: "Calls + directions + website clicks; new reviews per month",
    steps: [
      { title: "Claim or get manager access to both profiles", owner: "María", start: "2026-12-01", end: "2026-12-04" },
      {
        title: "Fix the basics",
        owner: "Elsa",
        start: "2026-12-07",
        end: "2026-12-11",
        subs: [
          { title: "Hours, including holiday hours", owner: "Elsa" },
          { title: "Menu and ordering links", owner: "Elsa" },
          { title: "10 new photos per store", owner: "Store manager" },
        ],
      },
      { title: "One Google post a week per store", owner: "Elsa", start: "2026-12-14", end: "2027-02-26" },
      { title: "Answer every review within 48 hours", owner: "Elsa", start: "2026-12-07", end: "2027-02-26" },
    ],
  },
  {
    name: "Holiday catering: boards and platters",
    kind: "Campaign",
    status: "Planning",
    owner: "Elsa",
    market: "Miami",
    start: "2026-12-07",
    end: "2026-12-23",
    goal: "Catering orders from Weston and Pinecrest before the cut-off (date to confirm with Ricardo).",
    audience: "Families hosting, office managers",
    channels: "Instagram, Google posts, email (Square), in store",
    measure: "Catering orders Dec 7–23 vs last year",
    steps: [
      {
        title: "Confirm the offer with Ricardo",
        owner: "Elsa",
        start: "2026-11-30",
        end: "2026-12-02",
        subs: [
          { title: "Platter menu and prices", owner: "Ricardo" },
          { title: "Order cut-off date", owner: "Ricardo" },
          { title: "Pickup times per store", owner: "Store manager" },
        ],
      },
      {
        title: "Creative",
        owner: "Luis",
        start: "2026-12-01",
        end: "2026-12-05",
        subs: [
          { title: "Reel cover", owner: "Luis" },
          { title: "Carousel: what 'serves 10' looks like", owner: "Luis" },
          { title: "Story countdown set", owner: "Luis" },
          { title: "Google post image", owner: "Luis" },
        ],
      },
      {
        title: "Film the platters",
        owner: "Store manager",
        start: "2026-12-02",
        end: "2026-12-06",
        subs: [
          { title: "Platter build, start to finish", owner: "Store manager" },
          { title: "Overhead hero shot", owner: "Store manager" },
        ],
      },
      {
        title: "Publish and promote",
        owner: "Elsa",
        start: "2026-12-07",
        end: "2026-12-23",
        subs: [
          { title: "Instagram posts as in the calendar", owner: "Elsa" },
          { title: "Google post for both stores", owner: "Elsa" },
          { title: "Email to customers (Square)", owner: "Elsa" },
        ],
      },
      { title: "Count orders and note what to repeat", owner: "Elsa", start: "2026-12-24", end: "2026-12-30" },
    ],
  },
  {
    name: "Shop small: Miami's cheese shop since 2000",
    kind: "Campaign",
    status: "Planning",
    owner: "Elsa",
    market: "Miami",
    start: "2026-12-19",
    end: "2026-12-20",
    goal: "Store visits the weekend before Christmas; tell the family story.",
    channels: "Instagram Reel and Stories, in store",
    steps: [
      { title: "Family story video", owner: "Elsa + Luis", start: "2026-12-10", end: "2026-12-16" },
      { title: "In-store moment (tasting or sampling)", owner: "Store manager", start: "2026-12-19", end: "2026-12-20" },
      { title: "Post and Stories on the weekend", owner: "Elsa", start: "2026-12-19", end: "2026-12-20" },
    ],
  },
  {
    name: "Holiday gift guide and gift cards",
    kind: "Campaign",
    status: "Planning",
    owner: "Elsa",
    market: "Miami",
    start: "2026-12-13",
    end: "2026-12-24",
    goal: "Cheese for gifting and gift cards (offer to confirm with Ricardo).",
    channels: "Instagram carousel and Stories, Google post",
    steps: [
      { title: "Confirm the gift card offer", owner: "Ricardo", start: "2026-12-07", end: "2026-12-09" },
      { title: "Gift guide carousel (one gift per budget)", owner: "Luis", start: "2026-12-09", end: "2026-12-12" },
      { title: "Gift card Stories, last 5 days", owner: "Elsa", start: "2026-12-19", end: "2026-12-24" },
    ],
  },
  {
    name: "Build an audience before the Madrid opening",
    kind: "Strategy goal",
    status: "Idea",
    owner: "Elsa",
    market: "Spain",
    start: null,
    end: null,
    goal: "A waitlist and a following in Madrid before the doors open. Dates follow the venue signing.",
    channels: "Instagram (Spain), waitlist, creators",
    steps: [
      { title: "Reserve the Spain accounts (private)", owner: "Elsa" },
      { title: "Waitlist page ready to switch on", owner: "Elsa" },
      { title: "Shortlist Madrid creators (nano and micro first)", owner: "Elsa" },
    ],
  },
  { name: "Pre-opening countdown with Madrid creators", kind: "Campaign", status: "Idea", owner: "Elsa", market: "Spain", start: null, end: null, goal: "Nano and micro first, macro and press once the date is firm." },
  { name: "First 50 to 100 sign-ups gift", kind: "Campaign", status: "Idea", owner: "Elsa", market: "Spain", start: null, end: null, goal: "Only if profit is protected; gift tied to a purchase." },
  { name: "Digital loyalty card launch", kind: "Campaign", status: "Idea", owner: "Elsa", market: "Spain", start: null, end: null, goal: "Every 10 visits a drink or pastry; one stamp a day." },
  { name: "Gift box and catering push", kind: "Campaign", status: "Idea", owner: "Elsa", market: "Spain", start: null, end: null, goal: "Boxes and catering for Madrid offices." },
];

const blankInit = { audience: "", channels: "", measure: "", budget: null, notes: "" };

export const INITIATIVES_SEED: Rec[] = [];
export const STEPS_SEED: Rec[] = [];
let n = 0;
LIST.forEach(({ steps = [], ...init }, i) => {
  const id = `in${String(i + 1).padStart(2, "0")}`;
  INITIATIVES_SEED.push({ id, ...blankInit, ...init });
  steps.forEach((s, j) => {
    const sid = `is${String(++n).padStart(3, "0")}`;
    STEPS_SEED.push({ id: sid, initiative: id, parent: "", title: s.title, owner: s.owner, status: s.status ?? "To do", start: s.start ?? null, end: s.end ?? null, sortOrder: j + 1, notes: "" });
    (s.subs ?? []).forEach((sub, k) => {
      STEPS_SEED.push({ id: `is${String(++n).padStart(3, "0")}`, initiative: id, parent: sid, title: sub.title, owner: sub.owner, status: sub.status ?? "To do", start: sub.start ?? null, end: sub.end ?? null, sortOrder: k + 1, notes: "" });
    });
  });
});
