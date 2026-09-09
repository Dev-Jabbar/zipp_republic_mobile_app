import { FaqItem } from "@/constants/mockFaqs";
import { Brand } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface FaqRowProps {
  item: FaqItem;
}

const FaqRow = ({ item }: FaqRowProps) => {
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
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={toggle}
      >
        <Text style={styles.question}>{item.question}</Text>
        <Ionicons name={open ? "remove" : "add"} size={20} color={Brand.text} />
      </TouchableOpacity>

      <Animated.View style={[styles.animatedBody, animatedStyle]}>
        <View
          style={styles.body}
          onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
        >
          <Text style={styles.answer}>{item.answer}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

interface FaqSectionProps {
  faqs: FaqItem[];
  title?: string;
  subtitle?: string;
}

const FaqSection = ({ faqs, title = "F.A.Q.", subtitle }: FaqSectionProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      <View style={styles.list}>
        {faqs.map((item) => (
          <FaqRow key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
};

export default FaqSection;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: Brand.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: Brand.textSecondary,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 24,
  },
  list: {
    marginTop: 24,
  },
  row: {
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: Brand.text,
    marginRight: 12,
  },
  animatedBody: {
    overflow: "hidden",
  },
  body: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
  },
  answer: {
    fontSize: 13,
    lineHeight: 20,
    color: Brand.textSecondary,
  },
});
