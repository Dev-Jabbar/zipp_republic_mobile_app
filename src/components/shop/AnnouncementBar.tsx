import { Brand } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface AnnouncementMessage {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}

const MESSAGES: AnnouncementMessage[] = [
  { icon: "shirt-outline", text: "ZR Exclusive Designs" },
  { icon: "lock-closed-outline", text: "100% High Quality Materials" },
];

const AnnouncementBar = () => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const contentWidth = useRef(0);

  useEffect(() => {
    const animate = () => {
      scrollX.setValue(0);
      Animated.timing(scrollX, {
        toValue: -contentWidth.current,
        duration: 8000,
        useNativeDriver: true,
      }).start(() => animate());
    };

    const timeout = setTimeout(animate, 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.row, { transform: [{ translateX: scrollX }] }]}
        onLayout={(e) => {
          contentWidth.current = e.nativeEvent.layout.width / 2;
        }}
      >
        {[...MESSAGES, ...MESSAGES].map((item, index) => (
          <View key={index} style={styles.item}>
            <Ionicons name={item.icon} size={14} color={Brand.white} />
            <Text style={styles.text}>{item.text}</Text>
          </View>
        ))}
      </Animated.View>
    </View>
  );
};

export default AnnouncementBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Brand.black,
    height: 32,
    overflow: "hidden",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 48,
    gap: 6,
  },
  text: {
    color: Brand.white,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
