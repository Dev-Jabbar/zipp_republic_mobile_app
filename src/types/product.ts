export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  onSale?: boolean;
  category: string; // "tshirts" | "jackets" | "slides" etc — always the real category
  gender?: "men" | "women" | "unisex"; // drives /collections/men, /collections/women
  createdAt: string; // ISO date string — drives "new arrival" status and date sorts
  image?: string;
  colors?: string[]; // e.g. ["red", "black", "gray"] — optional, drives "Available in N colors"
  sizes?: string[]; // e.g. ["S", "M", "L", "XL"] — optional, drives the size selector on the product detail page
  inStock?: boolean; // defaults to true when omitted — set false to test the "In stock" filter
}
