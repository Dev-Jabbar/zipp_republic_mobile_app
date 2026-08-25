import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FloatingWidgetsProps {
  currency?: string;
  onCurrencyPress?: () => void;
  onChatPress?: () => void;
}

const FloatingWidgets = ({
  currency = "NGN",
  onCurrencyPress,
  onChatPress,
}: FloatingWidgetsProps) => {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity style={styles.currencyPill} onPress={onCurrencyPress}>
        <View style={styles.flag}>
          <View style={[styles.flagStripe, { backgroundColor: "#008751" }]} />
          <View style={[styles.flagStripe, { backgroundColor: "#FFFFFF" }]} />
          <View style={[styles.flagStripe, { backgroundColor: "#008751" }]} />
        </View>
        <Text style={styles.currencyText}>{currency}</Text>
        <Ionicons name="chevron-down" size={14} color="#000000" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.chatButton} onPress={onChatPress}>
        <Ionicons name="chatbubble" size={16} color="#000000" />
        <Text style={styles.chatText}>Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FloatingWidgets;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    // Must beat whatever stacking react-native-modal sets internally on the
    // drawers, on both platforms — zIndex for iOS/JS-driven order, elevation
    // for Android's native compositing.
    zIndex: 9999,
    elevation: 9999,
  },
  currencyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  flag: {
    width: 18,
    height: 12,
    flexDirection: "row",
    borderRadius: 2,
    overflow: "hidden",
  },
  flagStripe: {
    flex: 1,
  },
  currencyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  chatText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000000",
  },
});
