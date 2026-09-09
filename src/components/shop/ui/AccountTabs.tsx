import { Brand } from "@/constants/theme";
import { Href, router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface AccountTabsProps {
  active: "orders" | "profile";
}

/**
 * Shared tab row for the account section (orders.tsx / profile.tsx).
 * These are real routes, not local view-switching state, so tapping a
 * tab navigates rather than just re-rendering — matches this codebase's
 * one-file-per-screen convention rather than folding both into one file.
 */
const AccountTabs = ({ active }: AccountTabsProps) => {
  return (
    <View style={styles.tabRow}>
      <TouchableOpacity onPress={() => router.replace("/orders" as Href)}>
        <Text
          style={[
            styles.tabLabel,
            active === "orders" && styles.tabLabelActive,
          ]}
        >
          Orders
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.replace("/profile" as Href)}>
        <Text
          style={[
            styles.tabLabel,
            active === "profile" && styles.tabLabelActive,
          ]}
        >
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AccountTabs;

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: "row",
    gap: 20,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  tabLabel: {
    fontSize: 14,
    color: Brand.textSecondary,
    paddingBottom: 6,
  },
  tabLabelActive: {
    color: Brand.text,
    fontWeight: "700",
    borderBottomWidth: 2,
    borderBottomColor: Brand.text,
  },
});
