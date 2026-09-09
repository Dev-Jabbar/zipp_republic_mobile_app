import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  Linking,
  Share,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

interface ShareRowProps {
  /** Full URL to the product page. Falls back to a placeholder if the
   * real store domain/routing isn't wired up yet — replace once product
   * pages are actually hosted somewhere shareable. */
  productUrl?: string;
  productName?: string;
}

const ShareRow = ({
  productUrl = "https://shopzipprepublic.com",
  productName = "this product",
}: ShareRowProps) => {
  const openShareUrl = (url: string) => Linking.openURL(url).catch(() => {});

  const shareFacebook = () =>
    openShareUrl(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    );

  const shareTwitter = () =>
    openShareUrl(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(productName)}`,
    );

  const sharePinterest = () =>
    openShareUrl(
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}`,
    );

  const shareWhatsapp = () =>
    openShareUrl(
      `https://wa.me/?text=${encodeURIComponent(`${productName} ${productUrl}`)}`,
    );

  // No expo-clipboard dependency yet — falls back to the native Share
  // sheet (which includes a "Copy" option on both iOS/Android) instead
  // of copying directly. Swap for expo-clipboard's setStringAsync if a
  // one-tap silent copy is wanted later.
  const shareGeneric = () =>
    Share.share({
      message: `${productName} ${productUrl}`,
      url: productUrl,
    }).catch(() => {});

  const buttons: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  }[] = [
    { icon: "logo-facebook", onPress: shareFacebook },
    { icon: "logo-twitter", onPress: shareTwitter },
    { icon: "logo-pinterest", onPress: sharePinterest },
    { icon: "logo-whatsapp", onPress: shareWhatsapp },
    { icon: "copy-outline", onPress: shareGeneric },
  ];

  return (
    <View style={styles.row}>
      {buttons.map((btn) => (
        <TouchableOpacity
          key={btn.icon}
          style={styles.btn}
          onPress={btn.onPress}
        >
          <Ionicons name={btn.icon} size={16} color={Brand.text} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default ShareRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 14,
  },
  btn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Brand.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
