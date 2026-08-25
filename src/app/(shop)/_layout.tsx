import AnnouncementBar from "@/components/shop/AnnouncementBar";
import CartDrawer from "@/components/shop/drawers/CartDrawer";
import MenuDrawer from "@/components/shop/drawers/MenuDrawer";
import SearchDrawer from "@/components/shop/drawers/SearchDrawer";
import FloatingWidgets from "@/components/shop/FloatingWidgets";
import Header from "@/components/shop/Header";
import { Brand } from "@/constants/theme";
import { useDrawerManager } from "@/hooks/shops/useDrawerManager";
import { useHeaderMeasurementStore } from "@/store/useHeaderMeasurementStore";
import { Stack } from "expo-router";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";

const ShopLayout = () => {
  const { activeDrawer, openDrawer, closeDrawer, toggleDrawer } =
    useDrawerManager();

  const headerHeight = useHeaderMeasurementStore((s) => s.headerHeight);
  const setHeaderHeight = useHeaderMeasurementStore((s) => s.setHeaderHeight);

  const handleHeaderLayout = (e: LayoutChangeEvent) => {
    setHeaderHeight(e.nativeEvent.layout.height);
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
          // router.push("/checkout")
        }}
      />

      <SearchDrawer
        visible={activeDrawer === "search"}
        onClose={closeDrawer}
        topInset={headerHeight}
        onSubmit={(query) => {
          // router.push(`/search?q=${encodeURIComponent(query)}`)
        }}
      />

      <MenuDrawer
        visible={activeDrawer === "menu"}
        onClose={closeDrawer}
        topInset={headerHeight}
        onLoginPress={() => {
          // router.push("/login")
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
