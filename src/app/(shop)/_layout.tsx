import AnnouncementBar from "@/components/shop/AnnouncementBar";
import CartDrawer from "@/components/shop/drawers/CartDrawer";
import MenuDrawer from "@/components/shop/drawers/MenuDrawer";
import SearchDrawer from "@/components/shop/drawers/SearchDrawer";
import FloatingWidgets from "@/components/shop/FloatingWidgets";
import Header from "@/components/shop/Header";
import { Brand } from "@/constants/theme";
import { useDrawerManager } from "@/hooks/shops/useDrawerManager";
import { useGoToProduct } from "@/hooks/shops/useGoToProduct";
import { useProductSearch } from "@/hooks/shops/useProductSearch";
import { useHeaderMeasurementStore } from "@/store/useHeaderMeasurementStore";
import { router, Stack } from "expo-router";
import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

const ShopLayout = () => {
  const { activeDrawer, openDrawer, closeDrawer, toggleDrawer } =
    useDrawerManager();

  const headerHeight = useHeaderMeasurementStore((s) => s.headerHeight);
  const setHeaderHeight = useHeaderMeasurementStore((s) => s.setHeaderHeight);

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const { results: searchResults, loading: searchLoading } =
    useProductSearch(searchQuery);
  const goToProduct = useGoToProduct();

  const closeSearch = () => {
    closeDrawer();
    // SearchDrawer clears its own displayed text on close already, but
    // that's just the input's local state — the query living here
    // (which searchResults is derived from) needs clearing too, or
    // reopening the drawer would briefly show stale results before the
    // next keystroke.
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBlock} onLayout={handleHeaderLayout}>
        <AnnouncementBar />
        <Header
          isMenuOpen={activeDrawer === "menu"}
          onMenuPress={() => toggleDrawer("menu")}
          onCartPress={() => openDrawer("cart")}
          onSearchPress={() => openDrawer("search")}
        />
      </View>

      <View style={styles.stackArea}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      <CartDrawer
        visible={activeDrawer === "cart"}
        onClose={closeDrawer}
        topInset={headerHeight}
        onCheckout={() => {
          closeDrawer();
          router.push("/checkout");
        }}
      />

      <SearchDrawer
        visible={activeDrawer === "search"}
        onClose={closeSearch}
        topInset={headerHeight}
        onQueryChange={setSearchQuery}
        results={searchResults.map((p) => ({ id: p.id, label: p.name }))}
        loading={searchLoading}
        onResultPress={(id) => {
          closeSearch();
          goToProduct(id);
        }}
      />

      <MenuDrawer
        visible={activeDrawer === "menu"}
        onClose={closeDrawer}
        topInset={headerHeight}
        onLoginPress={() => {
          router.push("/login");
        }}
      />

      <FloatingWidgets />
    </View>
  );
};

export default ShopLayout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Brand.white,
  },
  headerBlock: {
    zIndex: 50,
    elevation: 50,
  },
  stackArea: {
    flex: 1,
  },
});
