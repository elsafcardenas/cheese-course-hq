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

/** Ready replies. [store], [hours], [link], [name] are filled in by the picker on the page. */
export const REPLIES: { group: string; title: string; text: string }[] = [
  { group: "Google & Yelp reviews", title: "5 stars, short", text: "Thank you, [name]! So glad you enjoyed it. See you next time at [store]." },
  { group: "Google & Yelp reviews", title: "5 stars, mentions a dish", text: "Thank you, [name]! The [item] is one of our favourites too. Thanks for coming to [store], and see you soon." },
  { group: "Google & Yelp reviews", title: "4 stars", text: "Thanks for the kind words, [name]. If anything could have been better, we'd love to hear it: just reply here or ask for the manager next time you're in [store]." },
  { group: "Google & Yelp reviews", title: "Unhappy customer", text: "Hi [name], we're sorry your visit wasn't what it should be. That's not the experience we want for anyone at [store]. Could you email us at [email] so the manager can make it right?" },
  { group: "Google & Yelp reviews", title: "Slow service", text: "Hi [name], thank you for your patience and sorry for the wait. We're looking at how we staff the busy hours at [store] so it doesn't happen again." },
  { group: "Instagram DMs", title: "Hours", text: "Hi! [store] is open [hours]. See you soon 🧀" },
  { group: "Instagram DMs", title: "Catering enquiry", text: "Hi! We'd love to help. Our catering menu is here: [link]. Tell us the date, how many people and the pickup store, and we'll send you options. We ask for 48 hours' notice." },
  { group: "Instagram DMs", title: "Allergies", text: "Thanks for asking! Our kitchen handles dairy, gluten, nuts and eggs, so we can't promise anything is allergen-free. The team at [store] can walk you through each dish." },
  { group: "Instagram DMs", title: "Gift cards", text: "Yes! Gift cards are available in store at Weston and Pinecrest, and online here: [link]." },
  { group: "Instagram DMs", title: "Do you deliver?", text: "Yes, through our online ordering (pickup or delivery): [link]." },
  { group: "Instagram DMs", title: "Sold out / not on the menu", text: "Thanks for asking! That one isn't available right now. We'll post when it's back, so keep an eye on our Stories." },
  { group: "Comments", title: "Someone tags a friend", text: "Bring them in, the first board is the hardest to share 🧀" },
  { group: "Comments", title: "Asks the price", text: "It's $[price] at [store]. Order ahead here: [link]." },
  { group: "Comments", title: "Asks where", text: "We're in Weston and Pinecrest! Both addresses are in our bio." },
  { group: "Influencers & partners", title: "First message to a creator", text: "Hi [name]! We're The Cheese Course, Miami's cheese shop since 2000 (Weston and Pinecrest). We love your food content and would like to invite you for lunch and a cheese board on us. No posting required. If you enjoy it, we'd love to collaborate. Would any day next week work?" },
  { group: "Influencers & partners", title: "Follow-up", text: "Hi [name], just following up on our invite to The Cheese Course. Happy to work around your schedule." },
  { group: "Influencers & partners", title: "Local business partnership", text: "Hi! We're The Cheese Course in [store]. We'd love to do something together with you: a joint giveaway, a board for your next event, or a cross-promotion. Could we chat this week?" },
];

/** Ideas for posts beyond the hooks, by pillar. */
export const POST_IDEAS: Record<Pillar, string[]> = {
  "Menu & food": [
    "One dish, three angles: overhead, side, the first bite",
    "What $15 gets you for lunch",
    "Build a Perfect Pairing: half sandwich + soup, step by step",
    "Soup of the week, poured slowly",
    "The breakfast menu at Weston, in 10 seconds",
    "Staff pick of the week, with why they love it",
  ],
  "Cheese 101": [
    "Cheese of the week: where it's from, how it tastes, what to pair it with",
    "How to build a board for 4 people under $50",
    "Soft vs semi-soft vs hard: one bite each",
    "Wine with cheese: three easy matches",
    "How long cheese keeps in the fridge, and how to wrap it",
    "Mispronounced cheese names, said properly by the team",
  ],
  "Gifting & catering": [
    "Unboxing a platter at an office party",
    "Gift guide: one cheese gift per budget ($20, $50, $100)",
    "What 'serves 10' actually looks like",
    "Holiday order countdown: 7 days, 3 days, last call",
    "Customer's table set with our board (with permission)",
  ],
  "Behind the scenes": [
    "Morning prep, sped up",
    "Delivery day: the cheese arrives",
    "A day in the life of the cheesemonger",
    "How the soup is made",
    "Team favourite sandwich, made by them",
  ],
  "Community & influencers": [
    "Regulars' orders: 'the usual' explained",
    "This or that poll in Stories every Friday",
    "Repost a customer's photo (always ask and credit)",
    "Weston vs Pinecrest: friendly rivalry",
    "Answer a question from the comments on video",
  ],
};

/** Story formats that take a minute. */
export const STORY_IDEAS = [
  "Poll: Brie or gouda?",
  "Quiz: Which cheese is from Spain? (Manchego / Gruyère / Brie)",
  "Slider: How much do you love fondue?",
  "Question box: Ask the cheesemonger anything",
  "Countdown sticker: last day to order holiday platters",
  "Link sticker: order online",
  "Today's soup, filmed in 5 seconds",
  "This or that: Weston or Pinecrest?",
  "Behind the counter at opening time",
  "Reshare a customer's tag (always say thank you)",
];

/** Dates worth planning around in Miami. */
export const KEY_DATES: { date: string; name: string; idea: string }[] = [
  { date: "2026-11-26", name: "Thanksgiving", idea: "Platters and cheese boards for the table; order cut-off 3 days before." },
  { date: "2026-11-28", name: "Small Business Saturday", idea: "Shop small: Miami's cheese shop since 2000." },
  { date: "2026-12-04", name: "Hanukkah begins (evening)", idea: "Dessert platters and boards for family gatherings." },
  { date: "2026-12-24", name: "Christmas Eve", idea: "Last-minute boards and gift cards; post holiday hours a week before." },
  { date: "2026-12-31", name: "New Year's Eve", idea: "Fondue night and boards for parties." },
  { date: "2027-01-06", name: "Three Kings Day", idea: "A sweet board or Torta Santiago for the table." },
  { date: "2027-01-20", name: "National Cheese Lovers Day", idea: "Cheese 101 Reel and an in-store tasting." },
  { date: "2027-02-14", name: "Valentine's Day", idea: "Board for two, fondue for two, gift cards." },
  { date: "2027-04-12", name: "National Grilled Cheese Day", idea: "Cheddar melt and tomato bisque, cheese-pull Reel." },
  { date: "2027-05-09", name: "Mother's Day", idea: "Brunch boards and gift boxes." },
  { date: "2027-06-04", name: "National Cheese Day", idea: "Biggest Cheese 101 push of the year." },
  { date: "2027-06-20", name: "Father's Day", idea: "Charcuterie board and a gift card." },
];

/** Image and video sizes for each platform. */
export const SIZES: { platform: string; format: string; size: string }[] = [
  { platform: "Instagram", format: "Reel", size: "1080 × 1920 (9:16); keep text inside the middle 1080 × 1440" },
  { platform: "Instagram", format: "Feed post / carousel", size: "1080 × 1350 (4:5)" },
  { platform: "Instagram", format: "Story", size: "1080 × 1920; leave 250 px clear at top and bottom" },
  { platform: "Instagram", format: "Highlight cover", size: "1080 × 1920, icon centred in a 400 px circle" },
  { platform: "TikTok", format: "Video", size: "1080 × 1920 (9:16)" },
  { platform: "Facebook", format: "Post", size: "1080 × 1350 (4:5) or 1080 × 1080" },
  { platform: "Facebook", format: "Cover", size: "1640 × 856" },
  { platform: "Google Business", format: "Post / update", size: "1200 × 900 (4:3)" },
  { platform: "Google Business", format: "Cover photo", size: "1024 × 576 (16:9)" },
  { platform: "Pinterest", format: "Pin", size: "1000 × 1500 (2:3)" },
  { platform: "Email", format: "Header image", size: "1200 × 600" },
];

/** How we sound. */
export const VOICE = {
  is: ["Warm and neighbourly", "Knows cheese, never snobby", "Short sentences, real words", "A little playful, never silly"],
  isnt: ["Corporate", "Pushy or salesy", "Full of emojis or ALL CAPS", "Fancy words nobody says"],
  say: ["Since 2000", "Cut to order", "Made here every morning", "Come say hi", "Your cheesemonger"],
  avoid: ["Best in the world", "Artisanal (overused)", "Limited time only!!!", "Foodies"],
};
