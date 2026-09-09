import { Brand } from "@/constants/theme";
import { useIsAuthenticated } from "@/hooks/auth/useIsAuthenticated";
import { useShopMenuItems } from "@/hooks/shops/useShopMenuItems";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DrawerShell from "./DrawerShell";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SUBMENU_ANIM_DURATION = 250;

export interface MenuItem {
  label: string;
  subItems?: MenuItem[];
  onPress?: () => void;
}

interface MenuDrawerProps {
  visible: boolean;
  onClose: () => void;
  /** Only used when logged OUT — where "Login" should navigate to. When
   * logged in, the row becomes "My Account" and navigates to /orders
   * instead, so this prop isn't needed in that case. */
  onLoginPress?: () => void;
  /** Optional override — defaults to useShopMenuItems() if not provided. */
  items?: MenuItem[];
  /** Height of the AnnouncementBar + Header block above this drawer, so nav
   * content starts right below it instead of under the hidden top region. */
  topInset?: number;
}

const MenuDrawer = ({
  visible,
  onClose,
  onLoginPress,
  items,
  topInset = 0,
}: MenuDrawerProps) => {
  const insets = useSafeAreaInsets();
  // Always called (rules of hooks) — the prop, when given, just overrides
  // the result rather than replacing the hook call itself.
  const shopMenuItems = useShopMenuItems();
  const menuItems = items ?? shopMenuItems;

  // A guest also has a truthy (anonymous) Firebase user now, so this
  // must check isAuthenticated (!!user && !user.isAnonymous), not raw
  // user truthiness — otherwise a logged-out guest still sees "My
  // Account" here.
  const isAuthenticated = useIsAuthenticated();

  const [activeSubmenu, setActiveSubmenu] = useState<MenuItem | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current; // 0 = root, 1 = submenu

  // Reset back to the root list whenever the drawer fully closes, so
  // reopening it doesn't leave you stuck on a submenu from last time.
  useEffect(() => {
    if (!visible) {
      slideAnim.setValue(0);
      setActiveSubmenu(null);
    }
  }, [visible, slideAnim]);

  const handleItemPress = (item: MenuItem) => {
    if (item.subItems?.length) {
      setActiveSubmenu(item);
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: SUBMENU_ANIM_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      onClose();
      item.onPress?.();
    }
  };

  const goBack = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: SUBMENU_ANIM_DURATION,
      useNativeDriver: true,
    }).start(() => setActiveSubmenu(null));
  };

  // Logged in -> go to the account/orders screen (actual sign-out now
  // lives there, not in the drawer). Logged out -> go to login, same as
  // before.
  const handleAuthRowPress = () => {
    onClose();
    if (isAuthenticated) {
      router.push("/orders" as Href);
    } else {
      onLoginPress?.();
    }
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -SCREEN_WIDTH],
  });

  return (
    <DrawerShell
      visible={visible}
      onClose={onClose}
      direction="up"
      noTopSafeArea
    >
      <Animated.View style={styles.viewport}>
        <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
          {/* Root list */}
          <ScrollView
            style={styles.pane}
            contentContainerStyle={[
              styles.navList,
              { paddingTop: topInset + 12 },
            ]}
          >
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.navRow}
                onPress={() => handleItemPress(item)}
              >
                <Text style={styles.navLabel}>{item.label}</Text>
                {!!item.subItems?.length && (
                  <Ionicons name="arrow-forward" size={18} color={Brand.text} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Submenu list */}
          <ScrollView
            style={styles.pane}
            contentContainerStyle={[
              styles.navList,
              { paddingTop: topInset + 12 },
            ]}
          >
            <TouchableOpacity style={styles.backRow} onPress={goBack}>
              <Ionicons name="arrow-back" size={18} color={Brand.text} />
              <Text style={styles.backLabel}>{activeSubmenu?.label}</Text>
            </TouchableOpacity>

            {activeSubmenu?.subItems?.map((sub) => (
              <TouchableOpacity
                key={sub.label}
                style={styles.navRow}
                onPress={() => {
                  onClose();
                  sub.onPress?.();
                }}
              >
                <Text style={styles.navLabel}>{sub.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </Animated.View>

      <TouchableOpacity
        style={[styles.loginRow, { paddingBottom: insets.bottom + 76 }]}
        onPress={handleAuthRowPress}
      >
        <Ionicons
          name={isAuthenticated ? "person-circle-outline" : "person-outline"}
          size={16}
          color={Brand.text}
        />
        <Text style={styles.loginText}>
          {isAuthenticated ? "My Account" : "Login"}
        </Text>
      </TouchableOpacity>
    </DrawerShell>
  );
};

export default MenuDrawer;

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    overflow: "hidden",
  },
  track: {
    flexDirection: "row",
    width: SCREEN_WIDTH * 2,
    flex: 1,
  },
  pane: {
    width: SCREEN_WIDTH,
  },
  navList: {
    paddingHorizontal: 20,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  navLabel: {
    fontSize: 20,
    color: Brand.text,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingBottom: 16,
  },
  backLabel: {
    fontSize: 14,
    color: Brand.text,
  },
  loginRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  loginText: {
    fontSize: 14,
    color: Brand.text,
  },
});
