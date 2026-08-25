import { mockTestimonials } from "@/constants/mockTestimonials";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// How long each testimonial stays on screen before auto-advancing.
const SLIDE_DURATION = 7000;

const DOT_SIZE = 8;
const DOT_RADIUS = 8;
const RING_STROKE_WIDTH = 2;
const RING_RADIUS = DOT_RADIUS + 3;
const RING_SIZE = RING_RADIUS * 2 + RING_STROKE_WIDTH;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

type DotProps = {
  active: boolean;
  progress: Animated.Value;
};

const Dot = ({ active, progress }: DotProps) => {
  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  return (
    <View style={styles.dotWrapper}>
      <View
        style={[
          styles.dotBase,
          active ? styles.dotBaseActive : styles.dotBaseInactive,
        ]}
      />
      {active && (
        <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
          <AnimatedCircle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={RING_RADIUS}
            stroke="#1a1a1a"
            strokeWidth={RING_STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            fill="transparent"
            rotation={-90}
            origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
          />
        </Svg>
      )}
    </View>
  );
};

const Testimonial = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);

  const progress = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const isDragging = useRef(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const goToIndex = useCallback(
    (index: number, animate: boolean) => {
      if (pageWidth === 0) return;
      scrollRef.current?.scrollTo({
        x: index * pageWidth,
        animated: animate,
      });
    },
    [pageWidth],
  );

  // Drives the ring around the active dot, and auto-advances to the next
  // testimonial (looping) once it completes a full circle.
  useEffect(() => {
    if (pageWidth === 0) return;

    progress.setValue(0);
    animationRef.current?.stop();

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: SLIDE_DURATION,
      useNativeDriver: true,
    });

    animationRef.current = animation;

    animation.start(({ finished }) => {
      if (!finished || isDragging.current) return;
      const nextIndex = (activeIndex + 1) % mockTestimonials.length;
      goToIndex(nextIndex, true);
      setActiveIndex(nextIndex);
    });

    return () => animation.stop();
  }, [activeIndex, pageWidth]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setPageWidth(event.nativeEvent.layout.width);
  };

  const handleScrollBeginDrag = () => {
    isDragging.current = true;
    animationRef.current?.stop();
  };

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    isDragging.current = false;
    if (pageWidth === 0) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
    const clamped = Math.max(0, Math.min(index, mockTestimonials.length - 1));
    setActiveIndex(clamped);
  };

  const handleDotPress = (index: number) => {
    animationRef.current?.stop();
    goToIndex(index, true);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://shopzipprepublic.com/cdn/shop/files/Peter-Jazzy.jpg?v=1732248562&width=1080",
        }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.heading}>HERE'S WHAT PEOPLE ARE SAYING:</Text>

        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onLayout={handleLayout}
          onScrollBeginDrag={handleScrollBeginDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={styles.pager}
        >
          {mockTestimonials.map((item) => (
            <View key={item.id} style={[styles.page, { width: pageWidth }]}>
              <Text style={styles.stars}>{"★".repeat(item.rating)}</Text>
              <Text style={styles.quote}>"{item.quote}"</Text>
            </View>
          ))}
        </Animated.ScrollView>

        <View style={styles.dotsRow}>
          {mockTestimonials.map((item, index) => (
            <View key={item.id} onTouchEnd={() => handleDotPress(index)}>
              <Dot active={index === activeIndex} progress={progress} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default Testimonial;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  image: {
    width: "100%",
    aspectRatio: 1.9,
  },
  content: {
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: "center",
  },
  heading: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 3,
    textAlign: "center",
    color: "#1a1a1a",
    paddingHorizontal: 24,
  },
  pager: {
    width: "100%",
    marginTop: 16,
  },
  page: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  stars: {
    fontSize: 18,
    letterSpacing: 4,
    color: "#e8963c",
  },
  quote: {
    marginTop: 16,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    textAlign: "center",
    color: "#1a1a1a",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 12,
  },
  dotWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  dotBase: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    position: "absolute",
  },
  dotBaseActive: {
    backgroundColor: "#1a1a1a",
  },
  dotBaseInactive: {
    backgroundColor: "#d9d9d9",
  },
  ringSvg: {
    position: "absolute",
  },
});
