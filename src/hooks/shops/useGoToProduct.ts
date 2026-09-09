import { router } from "expo-router";

/** Returns a function that navigates to a product's detail page. */
export const useGoToProduct = () => {
  return (id: string) => {
    router.push({ pathname: "/products/[id]", params: { id } });
  };
};
