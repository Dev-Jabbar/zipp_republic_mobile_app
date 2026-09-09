import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface InfoLink {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}

interface ProductInfoLinksProps {
  onMaterialsPress?: () => void;
  onShippingPress?: () => void;
  onCareGuidePress?: () => void;
}

/**
 * These currently don't open anything (no content exists yet for
 * Materials/Shipping/Care Guide — likely a modal or separate screen
 * later). Wired as optional callbacks so the parent screen can hook in
 * real content whenever it's built, without this component changing.
 */
const ProductInfoLinks = ({
  onMaterialsPress,
  onShippingPress,
  onCareGuidePress,
}: ProductInfoLinksProps) => {
  const links: InfoLink[] = [
    { icon: "sparkles-outline", label: "Materials", onPress: onMaterialsPress },
    {
      icon: "cube-outline",
      label: "Shipping & Returns",
      onPress: onShippingPress,
    },
    { icon: "leaf-outline", label: "Care Guide", onPress: onCareGuidePress },
  ];

  return (
    <View style={styles.row}>
      {links.map((link) => (
        <TouchableOpacity
          key={link.label}
          style={styles.link}
          onPress={link.onPress}
          disabled={!link.onPress}
        >
          <Ionicons name={link.icon} size={16} color={Brand.text} />
          <Text style={styles.linkText}>{link.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ProductInfoLinks;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  linkText: {
    fontSize: 13,
    color: Brand.text,
    textDecorationLine: "underline",
  },
});
