// Starting workflows: how recurring work moves between people. Elsa and María can edit them on
// Company → Workflows, and anyone with task rights can press Start to turn one into dated tasks.
import type { Rec } from "@/lib/schema";

type Step = [title: string, who: string, where: string, day: number, how?: string];
type Flow = { name: string; area: string; market: "Miami" | "Spain"; workstream: string; trigger: string; outcome: string; steps: Step[] };

const FLOWS: Flow[] = [
  {
    name: "Post: from idea to published",
    area: "Marketing",
    market: "Miami",
    workstream: "Miami content",
    trigger: "Every week, for each post in the content calendar",
    outcome: "The post is live and its numbers are logged",
    steps: [
      ["Plan the post in the calendar with a brief", "Elsa", "Content calendar", 0, "Pillar, format, hook, caption idea and the date. Monday is planning day."],
      ["Send Luis the design brief", "Elsa", "Toolkit", 0, "Use Toolkit → Brief for Luis so nothing is missing."],
      ["Design the graphic or cover", "Luis", "Outside HQ", 2, "Adobe or Canva, using the brand templates."],
      ["Upload it for review", "Luis", "Review & approval", 2, "Paste the Drive or Canva link, shared as 'anyone with the link'."],
      ["Approve or ask for changes", "Elsa", "Review & approval", 3, "Approving moves the post to Ready to post."],
      ["Edit the Reel (video posts)", "Elsa", "Outside HQ", 3, "Edits or Canva, using existing footage from the Drive and Assets & footage (there's no weekly shoot for now)."],
      ["Schedule and publish", "Elsa", "Content calendar", 4, "Mark the post Scheduled, then Posted."],
      ["Share with Ricardo for his opinion", "Elsa", "Content calendar", 4, "It's an opinion, not an approval step."],
      ["Log views a week later", "Elsa", "Performance", 11, "Add the views to the video log so the median stays current."],
    ],
  },
  {
    name: "Content shoot (only when one is booked)",
    area: "Marketing",
    market: "Miami",
    workstream: "Production system",
    trigger: "Only when a shoot is booked. There's no regular weekly shoot for now.",
    outcome: "The footage is in Assets & footage and tagged",
    steps: [
      ["Agree what to film, where and when", "Elsa", "Content calendar", 0, "Check with Ricardo and María first; for now we work from existing footage."],
      ["Send the shoot list to that store", "Elsa", "Toolkit", 0, "Toolkit → Shoot list."],
      ["Film it", "Store manager", "Outside HQ", 3, "Vertical, natural light, 10–20 seconds per shot, no music."],
      ["Upload the clips", "Store manager", "Assets & footage", 3, "Name the folder by store and date."],
      ["Pick the best clips and tag them", "Elsa", "Assets & footage", 4],
    ],
  },
  {
    name: "Catering order",
    area: "Catering",
    market: "Miami",
    workstream: "Catering",
    trigger: "A customer asks for catering (phone, DM, ezCater or in store)",
    outcome: "The order is picked up, paid and the customer is thanked",
    steps: [
      ["Log the enquiry", "Store manager", "Catering", 0, "Customer, phone, date, pickup time, how many people, what they want."],
      ["Confirm menu, price and pickup with the customer", "María", "Catering", 0, "Use the catering menu prices; 48 hours' notice minimum."],
      ["Take the deposit or full payment", "María", "Catering", 1, "Mark Deposit or Paid in full on the order."],
      ["Prep list the day before", "Store manager", "Catering", 1, "Check stock for every platter; order anything missing."],
      ["Build and hand over the order", "Store manager", "Catering", 2, "Move it to Picked up."],
      ["Thank the customer and ask for a review", "Elsa", "Customers", 3, "Toolkit → Reply templates has the wording."],
    ],
  },
  {
    name: "Review or complaint",
    area: "Customers",
    market: "Miami",
    workstream: "Customers",
    trigger: "A new review on Google or Yelp, or a complaint in store or by message",
    outcome: "Answered within 48 hours and, if needed, put right",
    steps: [
      ["Log it", "Store manager", "Customers", 0, "Platform, store, stars and what they said."],
      ["Reply within 48 hours", "Elsa", "Toolkit", 1, "Use Toolkit → Reply templates; keep it short and kind."],
      ["If it's a complaint, call or message the customer", "María", "Customers", 1, "Offer to make it right; note what was agreed."],
      ["Fix the cause with the store team", "Store manager", "Stores", 3],
      ["Mark it resolved", "María", "Customers", 3],
    ],
  },
  {
    name: "Something broken at a store",
    area: "Operations",
    market: "Miami",
    workstream: "Store operations",
    trigger: "Equipment breaks or something needs repair",
    outcome: "It's fixed and the cost is logged",
    steps: [
      ["Report it with a photo", "Store manager", "Maintenance", 0, "Say how urgent it is and whether it stops service."],
      ["Call the right vendor", "María", "Maintenance", 0, "Vendor contacts live in SOPs & documents."],
      ["Fix it and mark it Fixed", "Store manager", "Maintenance", 2],
      ["Log the cost as an expense", "María", "Finance", 3],
    ],
  },
  {
    name: "Restock from a supplier",
    area: "Operations",
    market: "Miami",
    workstream: "Inventory",
    trigger: "An item drops below its par level",
    outcome: "Stock is back above par and the invoice is logged",
    steps: [
      ["Check what's low and draft the order", "Store manager", "Inventory", 0, "Inventory → Reorder drafts a purchase order."],
      ["Approve the order", "María", "Inventory", 0],
      ["Send it to the supplier", "María", "Inventory", 1],
      ["Receive it and check every line", "Store manager", "Inventory", 3, "Note anything short or damaged on the order."],
      ["Log the invoice", "María", "Finance", 4],
    ],
  },
  {
    name: "New team member",
    area: "Team",
    market: "Miami",
    workstream: "Store operations",
    trigger: "Someone new is hired at a store",
    outcome: "They're on the schedule and trained",
    steps: [
      ["Add them to the team list", "María", "Staff & schedule", 0, "Name, job, store, phone, start date, emergency contact."],
      ["Paperwork and payroll", "María", "Outside HQ", 1],
      ["Put them on the schedule", "Store manager", "Staff & schedule", 2],
      ["First shift: walk through the opening and closing checklists", "Store manager", "Checklists", 3],
      ["Cheese and menu training", "Store manager", "SOPs & documents", 5],
      ["First-week check-in", "María", "Staff & schedule", 7],
    ],
  },
  {
    name: "Monthly numbers and report",
    area: "Finance",
    market: "Miami",
    workstream: "Finance",
    trigger: "The first Friday of every month",
    outcome: "Ricardo has the month's numbers and what's next",
    steps: [
      ["Enter last month's sales for each store", "María", "Finance", 0],
      ["Enter and check last month's expenses", "María", "Finance", 0],
      ["Compare against the budget", "María", "Finance", 1],
      ["Log the marketing numbers for the month", "Elsa", "Performance", 0],
      ["Send Ricardo the monthly report", "Elsa + María", "Decisions & meetings", 2, "Numbers, what worked, what's next, decisions needed."],
    ],
  },
  {
    name: "Menu or price change",
    area: "Menu",
    market: "Miami",
    workstream: "Re-engineering",
    trigger: "A new item, a new price, or an item comes off the menu",
    outcome: "Square, the menus, Google and delivery apps all match",
    steps: [
      ["Update the item and its food cost", "María", "Menu & pricing", 0],
      ["Get Ricardo's OK on the price", "Ricardo", "Decisions & meetings", 1],
      ["Change it in Square and the delivery apps", "María", "Outside HQ", 2, "Square, DoorDash, Uber Eats and ezCater."],
      ["Update printed menus and Google", "Elsa", "Outside HQ", 3],
      ["Tell both store teams", "Store manager", "Stores", 3],
    ],
  },
  {
    name: "Spain content: ready before launch",
    area: "Madrid",
    market: "Spain",
    workstream: "Spain brand prep",
    trigger: "Each piece in the Spain content bank",
    outcome: "The piece is approved and waiting for its milestone",
    steps: [
      ["Write the brief in the content bank", "Elsa", "Content calendar", 0],
      ["Design it", "Luis", "Outside HQ", 3],
      ["Upload it for review", "Luis", "Review & approval", 3],
      ["Approve it and park it until the milestone", "Elsa", "Review & approval", 4],
    ],
  },
];

export const WORKFLOWS_SEED: Rec[] = [];
export const WORKFLOW_STEPS_SEED: Rec[] = [];
FLOWS.forEach((f, i) => {
  const id = `wf${String(i + 1).padStart(2, "0")}`;
  WORKFLOWS_SEED.push({ id, name: f.name, area: f.area, market: f.market, workstream: f.workstream, trigger: f.trigger, outcome: f.outcome, notes: "" });
  f.steps.forEach(([title, who, where, day, how], j) => {
    WORKFLOW_STEPS_SEED.push({ id: `${id}s${j + 1}`, workflow: id, stepNo: j + 1, title, who, where, day, how: how ?? "" });
  });
});
