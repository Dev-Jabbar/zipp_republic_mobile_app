import { Brand } from "@/constants/theme";
import { useCartStore } from "@/store/useCartStore";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HeaderProps {
  /** Whether the menu drawer is currently open — drives the hamburger <-> X animation. */
  isMenuOpen?: boolean;
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onCartPress?: () => void;
}

const Header = ({
  isMenuOpen = false,
  onMenuPress,
  onSearchPress,
  onCartPress,
}: HeaderProps) => {
  const cartCount = useCartStore((s) => s.getTotalCount());
  const morph = useRef(new Animated.Value(isMenuOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(morph, {
      toValue: isMenuOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isMenuOpen, morph]);

  const menuOpacity = morph.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const closeOpacity = morph;
  const rotate = morph.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onMenuPress} hitSlop={10}>
        <View style={styles.iconStack}>
          <Animated.View
            style={[
              styles.iconLayer,
              { opacity: menuOpacity, transform: [{ rotate }] },
            ]}
          >
            <Ionicons name="menu-outline" size={26} color={Brand.text} />
          </Animated.View>
          <Animated.View style={[styles.iconLayer, { opacity: closeOpacity }]}>
            <Ionicons name="close" size={26} color={Brand.text} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <View style={styles.logoWrapper}>
        <Text style={styles.logoInitials}>ZR</Text>
        <Text style={styles.logoText}>ZIPP{"\n"}REPUBLIC</Text>
      </View>

      <View style={styles.rightIcons}>
        <TouchableOpacity
          onPress={onSearchPress}
          hitSlop={10}
          style={styles.iconSpacing}
        >
          <Ionicons name="search-outline" size={22} color={Brand.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onCartPress} hitSlop={10}>
          <View>
            <Ionicons name="cart" size={22} color={Brand.text} />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  iconStack: {
    width: 26,
    height: 26,
  },
  iconLayer: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoInitials: {
    fontSize: 20,
    fontWeight: "300",
    color: Brand.text,
    letterSpacing: 1,
  },
  logoText: {
    fontSize: 11,
    fontWeight: "600",
    color: Brand.text,
    letterSpacing: 1,
    lineHeight: 13,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconSpacing: {
    marginRight: 16,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#E53935",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: Brand.white,
    fontSize: 9,
    fontWeight: "bold",
  },
});
