// Starting menu for Miami, taken from the stores' public online ordering pages (Weston and Pinecrest,
// order.online, read Nov 5 2026) and the catering menu on ezCater. Online prices can differ from
// in-store prices, so every item says where its price came from. Food costs are left for Elsa to fill in.

type Item = {
  name: string;
  section: "Menu" | "Catering" | "Retail";
  category: string;
  price: number | null;
  code?: string;
  description?: string;
  serves?: string;
  size?: string;
  availability?: "Weston" | "Pinecrest" | "Both stores";
  source?: string;
};

const W = "Price from the Weston online ordering menu (Nov 2026). Check against Square.";
const P = "Price from the Pinecrest online ordering menu (Nov 2026). Check against Square.";
const EZ = "Price from the ezCater catering menu (Nov 2026).";

const menu = (category: string, list: [string, number | null, string?, string?][], extra: Partial<Item> = {}): Item[] =>
  list.map(([name, price, description, code]) => ({ name, section: "Menu", category, price, description, code, ...extra }));

export const MENU_SEED: Item[] = [
  ...menu(
    "Breakfast",
    [
      ["Euro Breakfast", 15.6, "", "56"],
      ["Two Sunny Side Up Eggs", 15.6],
      ["Eggs & Bacon Sandwich", 18, "Half sandwich also sold: $13.20.", "54"],
      ["Eggs & Prosciutto", 19.2, "", "59"],
      ["Eggs & Smoked Salmon", 19.2, "", "60"],
      ["Eggs & Ham", 18, "", "61"],
      ["Eggs & Spinach", 18, "", "62"],
      ["Croque Monsieur", 19.2],
      ["Croque Madame", 19.2],
      ["Waffle Stack", 16.8],
      ["Egg Waffle Sandwich", 18],
      ["French Toast", 16.8, "", "64"],
      ["Nutella French Toast", 18, "", "65"],
      ["Yogurt Parfait", 14.4, "", "67"],
      ["Fruit Salad", 10.78, "", "68"],
      ["Extra eggs (add-on)", 6],
    ],
    { availability: "Weston", source: W },
  ),
  ...menu(
    "Croissants & toasts",
    [
      ["Croissant", 6],
      ["Croissant with jam", 7.2],
      ["Croissant with Nutella", 9.6],
      ["Prosciutto Croissant", 19.2, "", "50"],
      ["Herb Omelet Croissant", 16.8, "", "52"],
      ["Black Forest Ham Croissant", 16.8, "", "53"],
      ["Egg & Bacon Croissant", 16.8, "", "54"],
      ["Chicken Salad Croissant", 18],
      ["Tuna Salad Croissant", 18],
      ["Smoked Salmon Croissant", 19.2],
      ["Avocado Toast", 16.8],
      ["Green Eggs Avocado Toast", 18],
      ["Sourdough Avocado Toast", 19.2],
      ["Prosciutto, Burrata & Peach Toast", 19.2],
    ],
    { availability: "Weston", source: W },
  ),
  ...menu(
    "Sandwiches",
    [
      ["Italian Caprese", 19.2, "Fresh mozzarella, tomatoes, fresh basil, basil pesto, extra virgin olive oil and balsamic vinegar.", "1"],
      ["Cheddar Melt", 15.6, "Aged English cheddar and sun-dried tomato pesto.", "2"],
      ["Albacore Tuna Melt", 20.4, "Gruyère, shredded carrots, extra virgin olive oil, mayonnaise and greens.", "4"],
      ["Grilled Chicken Breast", 19.2, "Fontina, tomatoes, basil pesto, roasted red onions, rosemary aioli and greens.", "5"],
      ["Mortadella Pistachio (ciabatta)", 21.6, "Fresh mozzarella, mortadella, pistachio, honey, basil pesto and extra virgin olive oil.", "6"],
      ["Prosciutto", 20.4, "Fresh mozzarella, tomatoes, fresh basil, basil pesto, extra virgin olive oil and balsamic vinegar.", "7"],
      ["Turkey", 19.2, "", "9"],
      ["White Meat Chicken Salad", 19.2, "Asiago fresca, diced Granny Smith apples, golden raisins, pine nuts, fresh basil, mayonnaise and greens.", "11"],
      ["Truffle Pâté", 21.6, "Truffle pâté with fresh greens and soft cheese on crusty bread.", "12"],
      ["Black Forest Ham", 19.2, "Brie, raspberry-cranberry relish and greens.", "13"],
      ["Applewood Bacon", 19.2, "Goat gouda, tomatoes, avocado, rosemary aioli and greens.", "14"],
      ["Southwest Chicken", 19.2, "Jalapeño Monterey Jack, roasted red peppers, basil pesto, mayonnaise and greens.", "15"],
      ["Spanish Serrano Ham", 20.4, "Manchego, black olive tapenade, extra virgin olive oil, balsamic vinegar and greens.", "16"],
      ["Roast Beef", 20.4, "", "17"],
      ["Smoked Salmon", 21.6, "Artisanal cream cheese, tomato, red onion, capers, fresh dill, black pepper, lemon juice and greens.", "18"],
      ["Hummus", 18, "", "19"],
    ],
    { source: W },
  ),
  ...menu(
    "Half sandwiches & pairings",
    [
      ["Perfect Pairing: half sandwich + cup of soup", 18, "Any half sandwich with any cup of soup."],
      ["Perfect Pairing: half salad + cup of soup", 18, "Any half salad with any cup of soup."],
      ["Perfect Pairing: half sandwich + half salad", 20.4],
      ["Half Grilled Chicken", 13.2, "", "5.5"],
      ["Half Prosciutto", 13.2, "", "7.5"],
      ["Half Truffle Pâté", 14.4, "", "12.5"],
    ],
    { source: W },
  ),
  ...menu(
    "Salads",
    [
      ["Italian Caprese Salad", 19.2, "Fresh mozzarella, tomatoes, fresh basil, extra virgin olive oil, balsamic vinegar and fresh bread.", "20"],
      ["French Field Greens", 19.2, "Fresh goat cheese, dried cranberries, mustard-shallot vinaigrette and fresh bread.", "21"],
      ["Hummus Salad", 19.2, "Feta, tomatoes, roasted red peppers, red onions, avocado, cucumbers, chickpeas and extra virgin olive oil.", "22"],
      ["English Field Greens", 18, "", "23"],
      ["American Field Greens", 19.2, "Cheddar, tomatoes, avocado, bacon, honey-tarragon vinaigrette and fresh bread.", "24"],
      ["Chicken Caesar", 19.2, "Romaine, Caesar dressing, Parmesan and croutons.", "25"],
      ["Traditional Caesar (no chicken)", 13.8, "Romaine, Caesar dressing, Parmesan and croutons.", "25"],
      ["Classic Greek Salad", 19.2, "Feta, tomatoes, cucumber, red onion, green pepper, Kalamata olives, dolmas and fresh bread.", "26"],
      ["Stuffed Avocado", 21.6, "Feta, tomatoes and greens, with tuna salad or chicken salad.", "27"],
      ["Smoked Salmon Salad", 21.6, "Fresh goat cheese, cucumber, red onions, capers, dill, lemon vinaigrette and fresh bread.", "28"],
      ["White Meat Chicken Salad Plate", 20.4, "Asiago fresca, fresh red grapes, avocado slices, basil and fresh bread.", "29"],
      ["Albacore Tuna Salad Plate", 20.4, "Gruyère, roasted red peppers, cucumbers, tomatoes, lemon and fresh bread.", "30"],
    ],
    { source: W },
  ),
  ...menu(
    "Soups",
    [
      ["Tomato Bisque", 7.2, "Crème fraîche, onions and a hint of basil."],
      ["Mushroom & Brie Bisque", 7.2, "Brie and Swiss, mushrooms, potatoes, onions, shallots and chives in a vegetarian velouté, topped with Amontillado sherry."],
      ["Broccoli & Cheddar", 7.2],
      ["Yukon Gold Potato Cheddar", 7.2, "Cheddar, Yukon Gold potatoes, onion, chives, tomato and smoked bacon in a cheddar sauce."],
    ],
    { source: W },
  ),
  { name: "Butternut Squash Soup", section: "Menu", category: "Soups", price: 8.29, availability: "Pinecrest", source: P },
  ...menu(
    "To share",
    [
      ["Mac & Cheese", 18, "Creamy pasta in cheese sauce, with a side of mixed greens."],
      ["Cheese Fondue", 30, "For two or four, with white or wheat bread."],
      ["Roasted Brie (8 oz)", 21.6, "Warm brie to share, with white or wheat bread."],
      ["Meat Plate", 18, "One of: saucisson sec, serrano, prosciutto or pâté."],
      ["Hummus Plate", 16.8, "With white or wheat bread."],
      ["Spanish Tortilla, quarter", 15.6],
      ["Spanish Tortilla, whole", 31.2],
    ],
    { source: W },
  ),
  ...menu(
    "Cheese courses",
    [
      ["Cheese & Charcuterie Board", 54],
      ["French Countryside", 38.4, "", "50"],
      ["Cow, Sheep & Goat", 38.4, "", "46"],
      ["Cenicienta", 26.4],
      ["First Lady", 26.4],
    ],
    { source: W },
  ),
  ...menu(
    "Cheese courses",
    [
      ["Build your own: one cheese", 12.8, "Your choice of cheese with bread, fruit and accompaniments."],
      ["Build your own: two cheeses", 26.3],
      ["Build your own: three cheeses", 38.3],
    ],
    { source: P },
  ),
  ...menu("Kids & sides", [["Kids Ham & Cheese", 10.8], ["French Fries", 6]], { source: W }),
  ...menu(
    "Desserts",
    [
      ["Torta Santiago", 10.8, "Almond cake with powdered sugar, walnuts and dried cranberries."],
      ["Crème Brûlée", 14.4],
      ["Chocolate Fondue", 21.6],
      ["Vanilla Cheesecake", 16.8],
      ["Manchego Cheesecake", 16.8],
      ["Toasted Brownie", 14.4],
      ["Nutella Brownie with Ice Cream", 16.8],
      ["Nutella Tartine", 10.8],
      ["Alfajor", 7.8],
      ["Brownie", 6],
      ["Cookie", 3.6, "Oatmeal option available."],
    ],
    { source: W },
  ),
  { name: "NY Cheesecake", section: "Menu", category: "Desserts", price: 13.4, availability: "Pinecrest", source: P },
  ...menu(
    "Coffee & tea",
    [
      ["Espresso", 4.8],
      ["Americano", 4.8],
      ["Decaf Americano", 4.8],
      ["Macchiato", 6],
      ["Cappuccino", 6],
      ["Latte", 6],
      ["Mocha Flat White", 7.2],
      ["Cinnamon Flat White", 7.2],
      ["Coconut Macchiato", 9.6],
      ["Iced Coffee", 8.4],
      ["Hot Tea", 6],
      ["Hot Chocolate", 6],
    ],
    { source: W },
  ),
  ...menu(
    "Matcha",
    [
      ["Hot Matcha", 9.6],
      ["Iced Matcha", 9.6],
      ["Lavender Matcha", 9.6],
      ["Strawberry Matcha", 9.6],
      ["Vanilla Matcha", 9.6],
      ["Matcha Lemonade", 9.6],
    ],
    { availability: "Weston", source: W },
  ),
  ...menu(
    "Drinks",
    [
      ["Fresh Orange Juice", 7.2],
      ["Apple Juice", 4.8],
      ["Soda (can)", 3.6],
      ["Acqua Panna", 4.8],
      ["San Pellegrino", 4.8],
      ["San Pellegrino Aranciata", 6],
      ["Lorina Blood Orange", 6],
      ["Lorina Pink Lemonade", 6],
      ["Lorina Lemonade", 6],
      ["Snapple Peach Iced Tea", 6],
      ["Arnold Palmer", 6],
      ["Unsweetened Iced Tea", 6],
    ],
    { source: W },
  ),
  { name: "Orangina", section: "Menu", category: "Drinks", price: 4, availability: "Pinecrest", source: P },

  // Catering
  { name: "Cheese Platter", section: "Catering", category: "Cheese & appetizer platters", price: 98, serves: "Serves 6", description: "Assorted cheeses with accompaniments, grapes and sliced French baguette.", source: EZ },
  { name: "Hummus & Crudité Platter", section: "Catering", category: "Cheese & appetizer platters", price: 45, serves: "Serves 8", description: "Two-layer hummus with feta, marinated olives, roasted red peppers and cornichons, with crostini and crudités.", source: EZ },
  { name: "Crostini Platter", section: "Catering", category: "Cheese & appetizer platters", price: 50, serves: "Serves 10", description: "Basil pesto, sun-dried tomato pesto and black olive tapenade with toasted baguette slices.", source: EZ },
  { name: "Sandwich Platter", section: "Catering", category: "Sandwich platters", price: 70, serves: "Serves 6", description: "An assortment of our sandwiches.", source: EZ },
  { name: "Premium Sandwich Platter", section: "Catering", category: "Sandwich platters", price: 92, serves: "Serves 6", description: "Assorted sandwiches with imported olives.", source: EZ },
  { name: "Croissant Platter", section: "Catering", category: "Breakfast platters", price: 70, serves: "Serves 6", description: "An assortment of filled croissants.", source: EZ },
  { name: "Premium Croissant Platter", section: "Catering", category: "Breakfast platters", price: 90, serves: "Serves 6", description: "Prosciutto & crescenza, stracchino, Cajun smoked ham & cheese, and Black Forest ham & brie.", source: EZ },
  { name: "Croissants with Jam Platter", section: "Catering", category: "Breakfast platters", price: 52.78, source: W },
  { name: "French Field Greens Bowl", section: "Catering", category: "Salad bowls", price: 60, serves: "Serves 10", description: "Field greens with goat cheese, dried cranberries and candied walnuts.", source: EZ },
  { name: "Classic Greek Salad Bowl", section: "Catering", category: "Salad bowls", price: 70, serves: "Serves 10", description: "Feta, tomatoes, cucumber, red onion, green peppers, Kalamata olives and dolmas.", source: EZ },
  { name: "American Field Greens Bowl", section: "Catering", category: "Salad bowls", price: 60, serves: "Serves 10", description: "Field greens with cheddar, tomatoes, avocado and bacon.", source: EZ },
  { name: "Traditional Caesar Bowl", section: "Catering", category: "Salad bowls", price: 60, serves: "Serves 10", description: "Romaine with croutons and Parmesan.", source: EZ },
  { name: "Italian Caprese Bowl", section: "Catering", category: "Salad bowls", price: 70, serves: "Serves 10", description: "Mozzarella, tomatoes and basil.", source: EZ },
  { name: "Smoked Salmon Salad Bowl", section: "Catering", category: "Salad bowls", price: 80, serves: "Serves 10", description: "Goat cheese, cucumber, red onions, capers and dill.", source: EZ },
  { name: "English Field Greens Bowl", section: "Catering", category: "Salad bowls", price: 59.98, serves: "Serves 10", source: W },
  { name: "Soup, individually packed", section: "Catering", category: "Soups", price: 8.99, serves: "1 each", description: "Tomato bisque, broccoli & cheese, Yukon Gold potato, or mushroom & brie bisque.", source: EZ },
  { name: "Dessert Platter", section: "Catering", category: "Dessert platters", price: 42, serves: "Serves 10", description: "Assorted cookies and brownies with caramelized walnuts, dried cranberries, rosemary and powdered sugar.", source: EZ },
  { name: "Torta Santiago, whole", section: "Catering", category: "Dessert platters", price: 42, serves: "Serves 10", description: "Almond cake with powdered sugar, dried cranberries and caramelized walnuts.", source: EZ },
  { name: "Cheesecake, whole", section: "Catering", category: "Dessert platters", price: 87.58, source: W },
  { name: "Fresh Fruit Bowl", section: "Catering", category: "Dessert platters", price: 90, serves: "Serves 10", source: EZ },

  // Retail
  { name: "Cheese cut to order", section: "Retail", category: "Cheese by weight", price: null, size: "per lb", description: "Over 100 cheeses. Add your bestsellers here with their price per pound.", source: "Add prices from the cheese case." },
  { name: "Charcuterie, small", section: "Retail", category: "Charcuterie", price: 4.8, source: W },
  { name: "Charcuterie, medium", section: "Retail", category: "Charcuterie", price: 9.6, source: W },
  { name: "Charcuterie, large", section: "Retail", category: "Charcuterie", price: 16.8, source: W },
  { name: "Accompaniments, small", section: "Retail", category: "Accompaniments", price: 3.6, source: W },
  { name: "Accompaniments, medium", section: "Retail", category: "Accompaniments", price: 4.8, source: W },
  { name: "Accompaniments, large", section: "Retail", category: "Accompaniments", price: 8.4, source: W },
  { name: "Baguette", section: "Retail", category: "Crackers & bread", price: 3.6, source: W },
  { name: "Fig Crackers", section: "Retail", category: "Crackers & bread", price: 10.8, source: W },
  { name: "Lemon Crackers", section: "Retail", category: "Crackers & bread", price: 10.8, source: W },
  { name: "Rosemary Crackers", section: "Retail", category: "Crackers & bread", price: 10.8, source: W },
  { name: "Sea Salt Crackers", section: "Retail", category: "Crackers & bread", price: 10.8, source: W },
  { name: "Fig Spread", section: "Retail", category: "Spreads, jams & honey", price: 10.8, size: "8 oz", source: W },
  { name: "Fig Spread, mini", section: "Retail", category: "Spreads, jams & honey", price: 2.4, size: "1.05 oz", source: W },
  { name: "Calabrian Chili Orange Spread, mini", section: "Retail", category: "Spreads, jams & honey", price: 2.4, size: "1.05 oz", source: W },
  { name: "Savannah Bee Honey, mini", section: "Retail", category: "Spreads, jams & honey", price: 8.4, source: W },
  { name: "Savannah Bee Hot Honey, mini", section: "Retail", category: "Spreads, jams & honey", price: 8.4, source: W },
  { name: "Truffle Olive Oil", section: "Retail", category: "Oils, truffle & salts", price: 21.6, source: W },
  { name: "Black Truffle Sauce", section: "Retail", category: "Oils, truffle & salts", price: 18, source: W },
  { name: "Truffle Sea Salt", section: "Retail", category: "Oils, truffle & salts", price: 18, source: W },
  { name: "Chips", section: "Retail", category: "Chips & snacks", price: 3.6, description: "Jalapeño, mesquite BBQ, salt & vinegar or sea salt.", source: W },
];
