export interface NavItem {
  label: string;
  slug?: string;
  subItems?: { label: string; slug: string }[];
}

export const SHOP_MENU_ITEMS: NavItem[] = [
  { label: "Men", slug: "men" },
  { label: "Women", slug: "women" },
  { label: "Tshirts", slug: "tshirts" },
  { label: "Jackets & Hoodies", slug: "jackets" },
  {
    label: "Accessories",
    subItems: [
      { label: "Jewelry", slug: "jewelry" },
      { label: "Hats", slug: "hats" },
    ],
  },
  { label: "Slides", slug: "slides" },
];
