import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export interface FooterLink {
  label: string;
  onPress?: () => void;
}

interface FooterAccordionProps {
  title: string;
  links: FooterLink[];
}

const FooterAccordion = ({ title, links }: FooterAccordionProps) => {
  const [open, setOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const progress = useSharedValue(0);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    progress.value = withTiming(next ? 1 : 0, { duration: 220 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: progress.value * contentHeight,
    opacity: progress.value,
  }));

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={toggle}
      >
        <Text style={styles.title}>{title}</Text>
        <Ionicons name={open ? "remove" : "add"} size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <Animated.View style={[styles.animatedBody, animatedStyle]}>
        <View
          style={styles.body}
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        >
          {links.map((link) => (
            <TouchableOpacity
              key={link.label}
              onPress={link.onPress}
              style={styles.linkRow}
            >
              <Text style={styles.linkText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export default FooterAccordion;

const styles = StyleSheet.create({
  wrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#333333",
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#FFFFFF",
  },
  animatedBody: {
    overflow: "hidden",
  },
  body: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 12, // was marginTop — margin on an absolute+measured
    // element isn't included in onLayout height
    gap: 10,
    paddingBottom: 4, // small breathing room so the last item isn't
    // flush against the bottom edge either
  },
  linkRow: {
    paddingVertical: 2,
  },
  linkText: {
    fontSize: 14,
    color: "#CCCCCC",
  },
});
