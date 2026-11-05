import type { Pillar } from "@/lib/types";

export const HOOKS: Record<Pillar, string[]> = {
  "Menu & food": [
    "Lunch in 7 seconds.",
    "The side nobody shares.",
    "POV: you ordered the [item] at [store].",
    "This is what $[price] gets you in [store].",
    "Rate this cheese pull from 1 to 10.",
    "It's 80°F. We're making fondue anyway.",
  ],
  "Cheese 101": [
    "Three cheeses every board needs.",
    "Stop cutting brie like this.",
    "Cheesemonger tip: take it out of the fridge 30 minutes early.",
    "Soft, semi, hard, blue: build your board in that order.",
    "Cow, goat or sheep? Guess before the end.",
    "Save this for the next time you're stuck at the cheese counter.",
  ],
  "Gifting & catering": [
    "Hosting this weekend? Let the board do the work.",
    "48 hours left to order your [holiday] board.",
    "The gift for the person who has everything.",
    "One platter, twelve people, zero stress.",
    "What a $[price] platter looks like up close.",
    "Order by [date], pick up at [store].",
  ],
  "Behind the scenes": [
    "7 a.m. at [store], before the doors open.",
    "How we build [number] platters before noon.",
    "Since 2000, one cheese at a time.",
    "Meet the person who cuts your cheese.",
    "The 30 seconds nobody sees before your sandwich.",
    "What a Saturday rush looks like from behind the counter.",
  ],
  "Community & influencers": [
    "Brie or gouda? Vote.",
    "Our regulars order this every single week.",
    "Tag the friend who eats all the cheese.",
    "Holiday hours, so you don't drive over for nothing.",
    "Weston or Pinecrest: which one is yours?",
    "You asked, we listened: [new item] is back.",
  ],
};

export const CTAS = {
  order: "Order online: link in bio.",
  catering: "Catering and platters: link in bio.",
  visit: "Come see us today.",
  save: "Save this for your next board.",
  comment: "Tell us in the comments.",
  share: "Send this to the friend who needs it.",
} as const;
export type CtaKey = keyof typeof CTAS;

export const HASHTAGS: { name: string; tags: string[] }[] = [
  { name: "Miami food", tags: ["#miamifood", "#miamieats", "#southfloridafood", "#cheeselover", "#thecheesecourse"] },
  { name: "Weston", tags: ["#westonfl", "#westonflorida", "#browardfood", "#westoneats", "#thecheesecourse"] },
  { name: "Pinecrest", tags: ["#pinecrest", "#pinecrestfl", "#southmiami", "#miamilunch", "#thecheesecourse"] },
  { name: "Catering and boards", tags: ["#miamicatering", "#cheeseboard", "#charcuterieboard", "#grazingplatter", "#partyplatter"] },
  { name: "Cheese 101", tags: ["#cheese101", "#cheesemonger", "#cheesepairing", "#cheeselover", "#cheeseboardideas"] },
  { name: "Holidays", tags: ["#thanksgivingmiami", "#holidayhosting", "#giftideas", "#cheeseboard", "#miamiholidays"] },
  { name: "Spain: Madrid", tags: ["#madrid", "#quesos", "#tabladequesos", "#madridfood", "#thecheesecoursees"] },
];

export const SHOT_RULES = [
  "Vertical (9:16). 4K at 30 fps if the phone allows, otherwise 1080p.",
  "Clean the lens. Natural light, facing the window; no overhead fluorescent.",
  "Hold every shot 5 seconds, steady (lean on the counter or use a small tripod).",
  "Film video, not photos: we can pull stills from video.",
  "Clean counter, no receipts, cables or phones in frame.",
  "Never show the signs or outside of a closed store.",
  "Upload to Drive the same day: Footage > [store] > [date].",
];

export const SHOTS: Record<Pillar, string[]> = {
  "Menu & food": [
    "Hero dish overhead on the counter, then a slow push in",
    "Cheese pull: tear or lift the sandwich slowly, close up",
    "Knife cutting the sandwich in half, natural sound",
    "Hand placing the plate down in front of the camera",
    "Pouring coffee or espresso, side angle",
    "Side of fries with Parmesan falling, slow",
  ],
  "Cheese 101": [
    "Whole wheel or block, then the first cut",
    "Three cheeses side by side, labels visible",
    "Close up of rind and texture, rack focus",
    "Hand slicing a wedge correctly",
    "Pairing: cheese plus honey, fruit or jam going on",
  ],
  "Gifting & catering": [
    "Platter build from empty board to finished, sped up (film the full build)",
    "Overhead hero of the finished platter",
    "Wrapping the platter, tying the bow or adding the label",
    "Handing the order over the counter",
    "Gift card or gift box on the counter, close up",
  ],
  "Behind the scenes": [
    "Opening the doors or turning the lights on in the morning",
    "Team member prepping at the station, over the shoulder",
    "Hands stocking the cheese case",
    "A quick wave or smile from the team (only those who agree to be filmed)",
    "Busy counter at lunch, wide shot",
  ],
  "Community & influencers": [
    "The chalkboard with today's special, handwritten",
    "Regular customers ordering (ask first, film from behind if unsure)",
    "Store entrance with the open sign, Weston or Pinecrest only",
    "Two options side by side for a poll (e.g. brie vs gouda)",
  ],
};

export const LUIS_FORMATS: { name: string; size: string }[] = [
  { name: "Reel cover", size: "1080 × 1920 (safe area 1080 × 1440 in the middle)" },
  { name: "Carousel", size: "1080 × 1350, 4:5" },
  { name: "Story", size: "1080 × 1920" },
  { name: "Google post", size: "1200 × 900, 4:3" },
  { name: "Highlight covers", size: "1080 × 1920, icon centred in a 400 px circle" },
  { name: "Template set", size: "As listed per piece" },
];

export const BRAND_KIT_BRIEF = {
  title: "Miami brand kit and templates v1",
  format: "Template set",
  copy: "",
  refs: "Current Miami identity (keep it). Instagram @thecheesecourse. Examples of the quality bar we want: clean type over real food, one idea per slide, big readable hooks.",
  notes: [
    "1. One-page Miami brand kit inside the current identity: logo files, colours (hex), two fonts, photo style.",
    "2. Reel cover template: hook in large type, readable on the grid crop.",
    "3. Carousel template: cover slide, content slide, last slide with CTA.",
    "4. Story templates: poll, quiz, link sticker, holiday hours.",
    "5. Google Business post template.",
    "Deliver in Adobe and as Canva templates so Elsa can edit text. Put everything in Drive > Brand > Miami.",
  ].join("\n"),
};
