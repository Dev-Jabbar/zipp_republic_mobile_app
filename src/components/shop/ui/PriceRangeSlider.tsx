import { Brand } from "@/constants/theme";
import { useRef, useState } from "react";
import { PanResponder, StyleSheet, View } from "react-native";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  onChangeComplete?: (min: number, max: number) => void;
}

const THUMB_SIZE = 20;

const PriceRangeSlider = ({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  onChangeComplete,
}: PriceRangeSliderProps) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const valueMinRef = useRef(valueMin);
  const valueMaxRef = useRef(valueMax);
  valueMinRef.current = valueMin;
  valueMaxRef.current = valueMax;

  // trackWidth is only known after onLayout fires. makeThumbResponder
  // below runs exactly once via useRef(...).current, so any callback
  // inside it that read `trackWidth` directly would close over its
  // first-render value (0) forever. Routing it through a ref keeps drag
  // callbacks reading the current measured width.
  const trackWidthRef = useRef(trackWidth);
  trackWidthRef.current = trackWidth;

  const clamp = (n: number, lo: number, hi: number) =>
    Math.min(Math.max(n, lo), hi);

  const valueToX = (value: number, width: number) => {
    if (width === 0) return 0;
    if (max === min) return 0;
    const ratio = (value - min) / (max - min);
    return ratio * width;
  };

  const xToValue = (x: number, width: number) => {
    if (width === 0) return min;
    if (max === min) return min;
    const ratio = clamp(x / width, 0, 1);
    return Math.round(min + ratio * (max - min));
  };

  const makeThumbResponder = (thumb: "min" | "max") => {
    let startX = 0;

    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const width = trackWidthRef.current;
        startX =
          thumb === "min"
            ? valueToX(valueMinRef.current, width)
            : valueToX(valueMaxRef.current, width);
      },
      onPanResponderMove: (_evt, gesture) => {
        const width = trackWidthRef.current;
        const newX = clamp(startX + gesture.dx, 0, width);
        const newValue = xToValue(newX, width);

        if (thumb === "min") {
          onChange(
            Math.min(newValue, valueMaxRef.current),
            valueMaxRef.current,
          );
        } else {
          onChange(
            valueMinRef.current,
            Math.max(newValue, valueMinRef.current),
          );
        }
      },
      onPanResponderRelease: () => {
        onChangeComplete?.(valueMinRef.current, valueMaxRef.current);
      },
    });
  };

  const minResponder = useRef(makeThumbResponder("min")).current;
  const maxResponder = useRef(makeThumbResponder("max")).current;

  const minX = valueToX(valueMin, trackWidth);
  const maxX = valueToX(valueMax, trackWidth);

  return (
    <View
      style={styles.track}
      onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
    >
      <View style={styles.trackLine} />
      <View
        style={[
          styles.activeLine,
          { left: minX, width: Math.max(maxX - minX, 0) },
        ]}
      />

      <View
        {...minResponder.panHandlers}
        style={[styles.thumb, { left: minX - THUMB_SIZE / 2 }]}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <View style={styles.thumbGrip} />
      </View>

      <View
        {...maxResponder.panHandlers}
        style={[styles.thumb, { left: maxX - THUMB_SIZE / 2 }]}
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
      >
        <View style={styles.thumbGrip} />
      </View>
    </View>
  );
};

export default PriceRangeSlider;

const styles = StyleSheet.create({
  track: {
    height: THUMB_SIZE,
    justifyContent: "center",
  },
  trackLine: {
    height: 2,
    backgroundColor: Brand.border,
    borderRadius: 1,
  },
  activeLine: {
    position: "absolute",
    height: 2,
    backgroundColor: Brand.black,
    borderRadius: 1,
  },
  thumb: {
    position: "absolute",
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Brand.white,
    borderWidth: 1,
    borderColor: Brand.text,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbGrip: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Brand.text,
    opacity: 0.4,
  },
});
