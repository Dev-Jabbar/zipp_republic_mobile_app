import { Brand } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Svg, { Text as SvgText } from "react-native-svg";
const MARQUEE_ITEMS = [
  { label: "PREMIUM LIFESTYLE", variant: "solid" as const },
  { label: "AFFORDABLE LUXURY ", variant: "outline" as const },
];

const SEPARATOR = "*";
const FONT_SIZE = 50;
const ITEM_HEIGHT = 50; // shared height so both text types align on this box

// Hollow/outline text (white fill, dark stroke) using react-native-svg
const OutlineText = ({ text }: { text: string }) => (
  <View style={{ height: ITEM_HEIGHT, justifyContent: "center" }}>
    <Svg height={ITEM_HEIGHT} width={text.length * FONT_SIZE * 0.72}>
      <SvgText
        fill={Brand.white}
        stroke={Brand.text}
        strokeWidth={1}
        fontSize={FONT_SIZE}
        fontWeight="900"
        x="0"
        y={ITEM_HEIGHT / 2 + FONT_SIZE * 0.35} // centers the baseline in ITEM_HEIGHT
      >
        {text}
      </SvgText>
    </Svg>
  </View>
);

const SolidText = ({ text }: { text: string }) => (
  <View style={{ height: ITEM_HEIGHT, justifyContent: "center" }}>
    <Text style={styles.solidText}>{text}</Text>
  </View>
);

const MarqueeGroup = ({ onLayout }: { onLayout?: (w: number) => void }) => (
  <View
    style={styles.row}
    onLayout={
      onLayout ? (e) => onLayout(e.nativeEvent.layout.width) : undefined
    }
  >
    {MARQUEE_ITEMS.map((item, i) => (
      <React.Fragment key={i}>
        <Text style={styles.asterisk}>{SEPARATOR}</Text>
        {item.variant === "solid" ? (
          <SolidText text={item.label} />
        ) : (
          <OutlineText text={item.label} />
        )}
      </React.Fragment>
    ))}
  </View>
);

const Marquee = () => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [groupWidth, setGroupWidth] = useState(0);

  useEffect(() => {
    if (!groupWidth) return;
    translateX.setValue(0);

    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: -groupWidth,
        duration: groupWidth * 20,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [groupWidth]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
        <MarqueeGroup onLayout={setGroupWidth} />
        <MarqueeGroup />
        <MarqueeGroup />
      </Animated.View>
    </View>
  );
};

export default Marquee;

const styles = StyleSheet.create({
  container: {
    height: 200,
    backgroundColor: Brand.white,
    overflow: "hidden",
    justifyContent: "center",
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  asterisk: {
    fontSize: 50,
    color: Brand.text,
    paddingHorizontal: 10,
    marginHorizontal: 35,
    height: ITEM_HEIGHT,
    textAlignVertical: "center",
    lineHeight: ITEM_HEIGHT,
  },
  solidText: {
    fontSize: FONT_SIZE,
    fontWeight: "900",
    color: Brand.black,
    letterSpacing: 0.5,
    lineHeight: ITEM_HEIGHT,
  },
});
