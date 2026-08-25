import { Brand } from "@/constants/theme";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect } from "react";
import {
  AppState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface HeroBannerProps {
  onShopMenPress?: () => void;
  onShopWomenPress?: () => void;
}

const HeroBanner = ({ onShopMenPress, onShopWomenPress }: HeroBannerProps) => {
  const player = useVideoPlayer(
    require("@/assets/videos/zipp-hero.mp4"),
    (player) => {
      player.loop = true;
      player.muted = true;
      player.play();
    },
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        player.play();
      }
    });

    return () => subscription.remove();
  }, [player]);

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.image}
        player={player}
        contentFit="cover"
        nativeControls={false}
        pointerEvents="none"
      />
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Text style={styles.label}>N E W D R O P - Z I P P 2 . 0</Text>
        <Text style={styles.title}>LUXURY &{"\n"}LIFESTYLE</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={onShopMenPress}
          >
            <Text style={styles.outlineButtonText}>SHOP MEN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filledButton}
            onPress={onShopWomenPress}
          >
            <Text style={styles.filledButtonText}>SHOP WOMEN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HeroBanner;

const styles = StyleSheet.create({
  container: {
    height: 520,
    justifyContent: "flex-end",
  },
  image: {
    ...StyleSheet.absoluteFill,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Brand.overlay,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    color: Brand.white,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
  },
  title: {
    color: Brand.white,
    fontSize: 34,
    fontWeight: "bold",
    lineHeight: 40,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Brand.white,
    paddingVertical: 14,
    alignItems: "center",
  },
  outlineButtonText: {
    color: Brand.white,
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  filledButton: {
    flex: 1,
    backgroundColor: Brand.white,
    paddingVertical: 14,
    alignItems: "center",
  },
  filledButtonText: {
    color: Brand.black,
    fontWeight: "600",
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
