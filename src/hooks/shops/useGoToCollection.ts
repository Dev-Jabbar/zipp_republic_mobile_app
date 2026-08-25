// hooks/shops/useGoToCollection.ts
import { router, usePathname } from "expo-router";

export const useGoToCollection = () => {
  const pathname = usePathname();

  return (slug: string) => {
    const alreadyInCollections = pathname.startsWith("/collections");

    if (alreadyInCollections) {
      router.replace({ pathname: "/collections/[slug]", params: { slug } });
    } else {
      router.push({ pathname: "/collections/[slug]", params: { slug } });
    }
  };
};
