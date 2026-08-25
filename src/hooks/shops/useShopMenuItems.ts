// hooks/shops/useShopMenuItems.ts
import { MenuItem } from "@/components/shop/drawers/MenuDrawer";
import { SHOP_MENU_ITEMS } from "@/constants/menuItems";
import { useGoToCollection } from "./useGoToCollection";

export const useShopMenuItems = (): MenuItem[] => {
  const goToCollection = useGoToCollection();

  return SHOP_MENU_ITEMS.map((item) => ({
    label: item.label,
    onPress: item.slug ? () => goToCollection(item.slug!) : undefined,
    subItems: item.subItems?.map((sub) => ({
      label: sub.label,
      onPress: () => goToCollection(sub.slug),
    })),
  }));
};
