import { Product } from "@/types/product";

const NEW_ARRIVAL_WINDOW_DAYS = 14;

export const isNewArrival = (product: Product): boolean => {
  const createdAt = new Date(product.createdAt).getTime();
  const cutoff = Date.now() - NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  return createdAt >= cutoff;
};



export const getCardVariant = (category: string): "portrait" | "landscape" => {
  return category === "slides" ? "landscape" : "portrait";
};
