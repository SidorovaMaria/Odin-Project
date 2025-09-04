import {
  SourdoughToast,
  beefRamenImage,
  FigsGrapes,
  FrenchToast,
  Pizza,
  AvocadoToast,
  Bolognese,
  Sauted,
  Soup,
  Salad,
  Clams,
  chefAya,
  chefElena,
  chefJonas,
  chefRafael,
} from "./images";

export const aboutMainText =
  "Experience culinary artistry where Nordic ingredients meet innovative techniques. We are proud to create unforgettable dining experiences that celebrate the purity of seasonal flavors and the beauty of nature's bounty.";
export const aboutUs = [
  "At Noma, dining is more than a meal—it’s an exploration of flavor, craft, and place. Our kitchen draws inspiration from the rhythm of the seasons, bringing fresh ingredients and bold ideas to the table. Every dish is rooted in respect for nature and designed to surprise, delight, and nourish.",
  "We believe food is a story best told through texture, aroma, and taste. From the first bite to the last, each plate celebrates simplicity and imagination, transforming the familiar into something unforgettable. Our team of chefs and hosts works with passion and precision, so every guest feels at home in an atmosphere of warmth and discovery.",
  "Noma is not just a restaurant—it’s a gathering space for those who appreciate authenticity, creativity, and the joy of sharing a table.",
];

export const menuItems = [
  {
    id: "charred-sourdough-wild-mushrooms-rocket",
    name: "Charred Sourdough, Wild Mushrooms & Rocket",
    description:
      "Peppery rocket over smoky, grill-marked bread piled with juicy mushrooms; a flicker of fresh chili heat to finish.",
    image: SourdoughToast,
    alt: "Charred sourdough topped with wild mushrooms, rocket, and red chiles.",
  },
  {
    id: "sauteed-vegetables-lemon-chicken",
    name: "Sautéed Vegetables with Lemon & Chicken",
    description:
      "Skillet-seared seasonal vegetables with tender chicken pieces, brightened with fresh lemon and herbs.",
    image: Sauted,
    alt: "Sautéed vegetables with chicken pieces and a lemon slice.",
  },

  {
    id: "beef-ramen-soft-egg-greens",
    name: "Beef Ramen with Soft Egg & Greens",
    description:
      "Deep, beefy broth cradling springy egg noodles, tender slices of beef, a jammy egg, and a bright tangle of greens.",
    image: beefRamenImage,
    alt: "Bowl of beef ramen with soft egg, noodles, and greens.",
  },
  {
    id: "figs-grapes-charcuterie-black-truffle",
    name: "Figs & Grapes Charcuterie with Black Truffle Sauce",
    description:
      "Ripe figs and grapes alongside artisan cheese, briny olives, and delicate cured meats, served with a sultry black-truffle dip.",
    image: FigsGrapes,
    alt: "Charcuterie with figs, grapes, cheese, olives, and truffle sauce.",
  },
  {
    id: "pineapple-cured-meat-pizza",
    name: "Wood-Fired Pineapple & Cured Meat Pizza",
    description:
      "Charred crust, molten cheese, sweet pineapple, and peppery rocket, finished with a lick of spicy chili dressing.",

    image: Pizza,
    alt: "Wood-fired pizza with pineapple, cured meat, rocket, and chili oil.",
  },
  {
    id: "roasted-pumpkin-soup-mint-celery",
    name: "Roasted Pumpkin Soup with Mint & Celery",
    description:
      "Silky roasted pumpkin blended smooth, lifted with mint and celery, finished with a warm sprinkle of chili flakes.",

    image: Soup,
    alt: "Bowl of pumpkin soup topped with mint, celery, and chili flakes.",
  },
  {
    id: "signature-ragu-bolognese-spaghetti",
    name: "Signature Ragù Bolognese with Spaghetti",
    description:
      "A slow-simmered, deeply savory ragù clinging to al dente spaghetti—comforting, classic, and unapologetically rich.",

    image: Bolognese,
    alt: "Plate of spaghetti coated in ragù Bolognese.",
  },
  {
    id: "spinach-avocado-pomegranate-pumpkin-seed-salad",
    name: "Spinach, Avocado & Pomegranate Salad",
    description:
      "Leafy spinach with creamy avocado, crunchy pumpkin seeds, and ruby pomegranate, tossed in a turmeric-citrus dressing.",
    image: Salad,
    alt: "Spinach and avocado salad with pomegranate seeds and pumpkin seeds, dusted with turmeric.",
  },
  {
    id: "poached-eggs-spinach-avocado-toast",
    name: "Poached Eggs on Spinach & Avocado Toast",
    description:
      "Golden-yolk eggs settle into soft spinach and creamy avocado over crisp sourdough; hearty roast chicken on the side.",
    image: AvocadoToast,
    alt: "Poached eggs on spinach and avocado toast with roast chicken.",
  },
  {
    id: "french-toast-blueberry-maple-banana",
    name: "Blueberry–Maple French Toast with Banana",
    description:
      "Thick-cut, custardy French toast under a cascade of blueberry–maple syrup, ripe banana coins, and a snowfall of powdered sugar.",
    image: FrenchToast,
    alt: "French toast topped with blueberries, maple syrup, banana, and powdered sugar.",
  },
  {
    id: "white-wine-clams-dill",
    name: "White Wine Clams with Dill",
    description:
      "Steam-opened clams in a clean, aromatic white-wine broth with dill and soft herbs; perfect for dipping.",
    image: Clams,
    alt: "Clams in a white wine broth with dill and greens.",
  },
];

export const ourPeople = [
  {
    name: "Chef Elena Marković",
    position: "Executive Chef & Fermentation Specialist",
    bio: "Leads the kitchen with refined Nordic-inspired fermentation and seasonal creativity.",
    avatar: chefElena,
  },
  {
    name: "Chef Rafael Dominguez",
    position: "Grill & Fire Master",
    bio: "Crafts elegant wood-fired dishes with balance of smoke and tenderness.",
    avatar: chefRafael,
  },
  {
    name: "Chef Aya Tanaka",
    position: "Seafood & Plating Artist",
    bio: "Brings purity and artistry to seafood, inspired by Japanese kaiseki traditions.",
    avatar: chefAya,
  },
  {
    name: "Chef Jonas Bergström",
    position: "Pastry & Dessert Innovator",
    bio: "Creates botanical-inspired desserts with precision and imagination.",
    avatar: chefJonas,
  },
];
